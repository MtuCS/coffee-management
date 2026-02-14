/**
 * Format số tiền theo locale VN hoặc USD
 */
export const formatMoney = (amount: number, currency: string = 'USD'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Tính subtotal cho danh sách OrderItem
 */
export const calcSubtotal = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
