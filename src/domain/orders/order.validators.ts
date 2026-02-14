/**
 * Validation cho Order input
 */
import { OrderItem } from '@/src/shared/types';

export const validateOrderItems = (items: OrderItem[]): string | null => {
  if (items.length === 0) {
    return 'Order phải có ít nhất 1 món.';
  }
  for (const item of items) {
    if (item.quantity <= 0) {
      return `Món "${item.name}" có số lượng không hợp lệ.`;
    }
    if (item.price < 0) {
      return `Món "${item.name}" có giá không hợp lệ.`;
    }
  }
  return null;
};

export const validatePayment = (items: OrderItem[]): string | null => {
  if (items.length === 0) {
    return 'Chưa chọn món để thanh toán.';
  }
  return null;
};
