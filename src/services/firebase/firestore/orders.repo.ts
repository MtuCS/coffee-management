import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  getDocs,
  writeBatch,
  Timestamp,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Order, OrderItem, TableStatus } from '@/src/shared/types';
import { getOrCreateEveningShift } from './shifts.repo';

// ─── Collection ───
const ordersRef = collection(db, 'orders');

// ─── Helpers: Firestore ↔ App conversion ───

const toFirestoreOrder = (order: Omit<Order, 'id'>) => ({
  ...order,
  createdAt: Timestamp.fromDate(order.createdAt instanceof Date ? order.createdAt : new Date()),
});

const fromFirestoreOrder = (id: string, data: Record<string, unknown>): Order => ({
  ...data,
  id,
  createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
} as Order);

// ─── Subscriptions ───

/**
 * Subscribe tất cả orders đang mở (OPEN)
 */
export const subscribeActiveOrders = (
  callback: (orders: Record<string, Order>) => void
): Unsubscribe => {
  const q = query(ordersRef, where('status', '==', 'OPEN'));
  return onSnapshot(q, (snapshot) => {
    const ordersMap: Record<string, Order> = {};
    snapshot.docs.forEach((docSnap) => {
      const order = fromFirestoreOrder(docSnap.id, docSnap.data());
      ordersMap[order.id] = order;
    });
    callback(ordersMap);
  }, (error: FirestoreError) => {
    console.error('[subscribeActiveOrders] Error:', error.message);
  });
};

/**
 * Subscribe tất cả orders (cho báo cáo)
 */
export const subscribeAllOrders = (
  callback: (orders: Order[]) => void
): Unsubscribe => {
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((docSnap) =>
      fromFirestoreOrder(docSnap.id, docSnap.data())
    );
    callback(orders);
  }, (error: FirestoreError) => {
    console.error('[subscribeAllOrders] Error:', error.message);
  });
};

// ─── CRUD ───

export const createOrder = async (data: Omit<Order, 'id'>): Promise<string> => {
  const datePrefix = new Date().toISOString().slice(0, 10); // e.g. "2026-02-27"
  const randomSuffix = Math.random().toString(36).substring(2, 9); // 7 random chars
  const customId = `${datePrefix}_${randomSuffix}`;
  const docRef = doc(ordersRef, customId);
  await setDoc(docRef, toFirestoreOrder(data));
  return customId;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  await deleteDoc(doc(db, 'orders', orderId));
};

export const updateOrderItems = async (
  orderId: string,
  items: OrderItem[],
  totalAmount: number
): Promise<void> => {
  await updateDoc(doc(db, 'orders', orderId), { items, totalAmount });
};

/**
 * Xử lý thanh toán (atomic transaction)
 * - Cập nhật items đã thanh toán
 * - Cập nhật paidAmount + status
 * - Cộng revenue vào shift
 */
export const processPayment = async (
  orderId: string,
  paidItemIds: string[],
  payAmount: number,
  shiftId: string
): Promise<boolean> => {
  let allPaid = false;

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, 'orders', orderId);
    const shiftRef = doc(db, 'shifts', shiftId);
    const orderSnap = await transaction.get(orderRef);
    const shiftSnap = await transaction.get(shiftRef);

    if (!orderSnap.exists() || !shiftSnap.exists()) {
      throw new Error('Order or Shift not found');
    }

    const orderData = orderSnap.data();
    const shiftData = shiftSnap.data();

    // Mark items as paid
    const updatedItems = (orderData.items as OrderItem[]).map((item) => {
      if (paidItemIds.includes(item.id)) {
        return { ...item, isPaid: true };
      }
      return item;
    });

    allPaid = updatedItems.every((i) => i.isPaid);

    transaction.update(orderRef, {
      items: updatedItems,
      paidAmount: (orderData.paidAmount || 0) + payAmount,
      status: allPaid ? 'CLOSED' : 'OPEN',
    });

    transaction.update(shiftRef, {
      totalRevenue: (shiftData.totalRevenue || 0) + payAmount,
    });
  });

  return allPaid;
};

export const closeOrder = async (orderId: string): Promise<void> => {
  await updateDoc(doc(db, 'orders', orderId), { status: 'CLOSED' });
};

/**
 * Đóng ca tối: Tự động thanh toán tất cả các order còn mở (chưa thanh toán)
 * - Đánh dấu tất cả items là isPaid: true
 * - Cập nhật paidAmount = totalAmount
 * - Đổi status thành CLOSED
 * - Ghi nhận doanh thu vào ca tối của ngày đó
 * - Reset bàn về AVAILABLE
 */
export const closeEveningShiftOpenOrders = async (dateKey: string): Promise<number> => {
  // Lấy tất cả orders đang mở
  const q = query(ordersRef, where('status', '==', 'OPEN'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('[closeEveningShiftOpenOrders] Không có order nào cần đóng');
    return 0;
  }

  // Lấy hoặc tạo shift ca tối cho ngày đó
  const eveningShift = await getOrCreateEveningShift(dateKey);
  const shiftRef = doc(db, 'shifts', eveningShift.id);

  // Tính tổng số tiền cần ghi nhận (chỉ tính phần chưa thanh toán)
  let totalUnpaidAmount = 0;
  const ordersToClose: { orderId: string; tableId: string | null; unpaidAmount: number; items: OrderItem[] }[] = [];

  snapshot.docs.forEach((docSnap) => {
    const order = fromFirestoreOrder(docSnap.id, docSnap.data());
    const unpaidAmount = order.totalAmount - order.paidAmount;
    if (unpaidAmount > 0) {
      totalUnpaidAmount += unpaidAmount;
    }
    ordersToClose.push({
      orderId: order.id,
      tableId: order.tableId,
      unpaidAmount,
      items: order.items,
    });
  });

  // Sử dụng batch để cập nhật atomic
  const batch = writeBatch(db);

  // Cập nhật từng order
  ordersToClose.forEach(({ orderId, items, unpaidAmount }) => {
    const orderRef = doc(db, 'orders', orderId);
    // Đánh dấu tất cả items là đã thanh toán
    const updatedItems = items.map((item) => ({ ...item, isPaid: true }));
    const orderData = snapshot.docs.find((d) => d.id === orderId)?.data();
    batch.update(orderRef, {
      items: updatedItems,
      paidAmount: (orderData?.totalAmount as number) || 0,
      status: 'CLOSED',
    });
  });

  // Cập nhật dữ liệu shift - cộng thêm doanh thu
  batch.update(shiftRef, {
    totalRevenue: eveningShift.totalRevenue + totalUnpaidAmount,
  });

  // Reset các bàn về trạng thái trống
  const tableIds = ordersToClose
    .map((o) => o.tableId)
    .filter((id): id is string => id !== null);
  
  const uniqueTableIds = [...new Set(tableIds)];
  uniqueTableIds.forEach((tableId) => {
    const tableRef = doc(db, 'tables', tableId);
    batch.update(tableRef, {
      status: TableStatus.AVAILABLE,
      currentOrderId: null,
    });
  });

  // Commit batch
  await batch.commit();

  console.log(`[đóng ca tối] Đã đóng ${ordersToClose.length} orders, ghi nhận ${totalUnpaidAmount}đ vào ca tối ngày ${dateKey}`);
  return ordersToClose.length;
};
