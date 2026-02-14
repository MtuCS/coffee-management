import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  Timestamp,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Order, OrderItem } from '@/src/shared/types';

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
  const docRef = await addDoc(ordersRef, toFirestoreOrder(data));
  return docRef.id;
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
