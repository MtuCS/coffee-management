import React, { useState } from 'react';
import { Order, OrderItem } from '@/src/shared/types';
import { calcSubtotal, formatMoney } from '@/src/shared/utils/money';

interface PaymentModalProps {
  order: Order;
  onProcessPayment: (itemsToPay: OrderItem[]) => void;
  onBack: () => void;
  tableName: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  onProcessPayment,
  onBack,
  tableName,
}) => {
  const [leftItems, setLeftItems] = useState<OrderItem[]>(order.items.filter((i) => !i.isPaid));
  const [rightItems, setRightItems] = useState<OrderItem[]>([]);

  const moveToPay = (itemIndex: number) => {
    const item = leftItems[itemIndex];
    const newLeft = [...leftItems];
    newLeft.splice(itemIndex, 1);
    setLeftItems(newLeft);
    setRightItems([...rightItems, item]);
  };

  const moveToOrder = (itemIndex: number) => {
    const item = rightItems[itemIndex];
    const newRight = [...rightItems];
    newRight.splice(itemIndex, 1);
    setRightItems(newRight);
    setLeftItems([...leftItems, item]);
  };

  const moveAllToPay = () => {
    setRightItems([...rightItems, ...leftItems]);
    setLeftItems([]);
  };

  const clearAllPay = () => {
    setLeftItems([...leftItems, ...rightItems]);
    setRightItems([]);
  };

  const payTotal = calcSubtotal(rightItems);
  const remainingTotal = calcSubtotal(leftItems);

  return (
    <div className="min-h-screen bg-bg-light text-gray-800 font-sans flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-primary/20 px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-icons text-secondary">arrow_back</span>
          </button>
          <div>
            <h1 className="text-base md:text-xl font-bold tracking-tight">Thanh toán - {tableName}</h1>
            <p className="text-xs md:text-sm text-gray-500">Order #{order.id.slice(-4)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Còn lại</p>
          <p className="text-base md:text-xl font-bold text-gray-800">{formatMoney(remainingTotal)}</p>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 md:h-[calc(100vh-88px)] overflow-y-auto md:overflow-hidden">
        {/* Left: Unpaid Items */}
        <section className="flex flex-col min-h-[280px] md:h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold flex items-center gap-2 text-gray-700">
              <span className="material-icons text-gray-400">receipt_long</span>
              Món chưa thanh toán 
            </h2>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{leftItems.length} còn lại</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {leftItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => moveToPay(idx)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary hover:bg-primary/5 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.quantity}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.note && <p className="text-xs text-gray-400 italic">{item.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">{formatMoney(item.price * item.quantity)}</span>
                  <span className="material-icons text-gray-300 group-hover:text-primary">chevron_right</span>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={moveAllToPay}
              disabled={leftItems.length === 0}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-icons">sync_alt</span>
              Thanh toán tất cả
            </button>
          </div>
        </section>

        {/* Right: Items to Pay */}
        <section className="flex flex-col min-h-[280px] md:h-full bg-white rounded-xl border-2 border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
          <div className="p-4 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-primary">
              <span className="material-icons">shopping_cart_checkout</span>
              Items to Pay
            </h2>
            <button onClick={clearAllPay} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase">
              Clear All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {rightItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <span className="material-icons text-5xl mb-2">touch_app</span>
                <p className="text-sm">Chọn món từ bảng bên trái để thanh toán</p>
              </div>
            ) : (
              rightItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => moveToOrder(idx)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 group text-left relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                      <span className="material-icons text-xs group-hover:hidden">check</span>
                      <span className="material-icons text-xs hidden group-hover:block">close</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-bold text-gray-800">{formatMoney(item.price * item.quantity)}</div>
                </button>
              ))
            )}
          </div>
          <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <span className="text-base md:text-lg font-bold text-gray-800">Tổng thanh toán</span>
              <span className="text-xl md:text-3xl font-black text-primary">{formatMoney(payTotal)}</span>
            </div>
            <button
              onClick={() => onProcessPayment(rightItems)}
              disabled={rightItems.length === 0}
              className="w-full bg-primary hover:bg-green-400 text-white font-black text-base md:text-xl py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons">check_circle</span>
                Xác nhận thanh toán
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
