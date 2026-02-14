/**
 * Domain logic cho Order: tính tiền, split bill, merge orders
 */
import { Order, OrderItem, OrderType } from '@/src/shared/types';
import { calcSubtotal } from '@/src/shared/utils/money';
import { generateId } from '@/src/shared/utils/id';

/**
 * Tính tổng tiền của order (subtotal, không thuế)
 */
export const calcOrderTotal = (items: OrderItem[]): number => {
  return calcSubtotal(items.filter((i) => !i.isPaid));
};

/**
 * Tính tổng toàn bộ (bao gồm cả đã trả)
 */
export const calcOrderGrandTotal = (items: OrderItem[]): number => {
  return calcSubtotal(items);
};

/**
 * Tạo order mới cho bàn
 */
export const createNewOrder = (tableId: string): Omit<Order, 'id'> => ({
  tableId,
  items: [],
  status: 'OPEN',
  createdAt: new Date(),
  type: OrderType.DINE_IN,
  totalAmount: 0,
  paidAmount: 0,
});

/**
 * Tạo order mang đi
 */
export const createTakeawayOrder = (): Omit<Order, 'id'> => ({
  tableId: null,
  items: [],
  status: 'OPEN',
  createdAt: new Date(),
  type: OrderType.TAKEAWAY,
  totalAmount: 0,
  paidAmount: 0,
});

/**
 * Thêm sản phẩm vào order — nếu đã có thì tăng quantity
 */
export const addItemToOrder = (
  currentItems: OrderItem[],
  productId: string,
  name: string,
  price: number
): OrderItem[] => {
  const existing = currentItems.find(
    (item) => item.productId === productId && !item.isPaid
  );
  if (existing) {
    return currentItems.map((item) =>
      item.id === existing.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  return [
    ...currentItems,
    {
      id: generateId(),
      productId,
      name,
      price,
      quantity: 1,
      isPaid: false,
    },
  ];
};

/**
 * Cập nhật quantity của item, xóa nếu quantity = 0
 */
export const updateItemQuantity = (
  items: OrderItem[],
  itemId: string,
  delta: number
): OrderItem[] => {
  return items
    .map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    )
    .filter((item) => item.quantity > 0);
};

/**
 * Cập nhật ghi chú của item
 */
export const updateItemNote = (
  items: OrderItem[],
  itemId: string,
  note: string
): OrderItem[] => {
  return items.map((item) =>
    item.id === itemId ? { ...item, note } : item
  );
};

/**
 * Split bill: tách các items đã chọn thanh toán
 * Trả về { paidItems, remainingItems, payAmount, allPaid }
 */
export const splitBill = (
  allItems: OrderItem[],
  itemIdsToPay: string[]
): {
  updatedItems: OrderItem[];
  payAmount: number;
  allPaid: boolean;
} => {
  const updatedItems = allItems.map((item) => {
    if (itemIdsToPay.includes(item.id)) {
      return { ...item, isPaid: true };
    }
    return item;
  });

  const payAmount = calcSubtotal(
    allItems.filter((item) => itemIdsToPay.includes(item.id))
  );
  const allPaid = updatedItems.every((i) => i.isPaid);

  return { updatedItems, payAmount, allPaid };
};

/**
 * Gộp orders từ nhiều bàn thành 1
 */
export const mergeOrders = (orders: Order[]): OrderItem[] => {
  const mergedItems: OrderItem[] = [];
  for (const order of orders) {
    for (const item of order.items) {
      if (item.isPaid) continue;
      const existing = mergedItems.find((m) => m.productId === item.productId && !m.isPaid);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedItems.push({ ...item, id: generateId() });
      }
    }
  }
  return mergedItems;
};
