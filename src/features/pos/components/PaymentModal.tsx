import React, { useMemo, useRef, useState } from 'react';
import { Order, OrderItem } from '@/src/shared/types';
import { calcSubtotal, formatMoney } from '@/src/shared/utils/money';

interface PaymentModalProps {
  order: Order;
  onProcessPayment: (itemsToPay: OrderItem[]) => void | Promise<unknown>;
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
  const [isPrinting, setIsPrinting] = useState(false);

  // Use ref for print time to avoid state timing issues (setState may not flush before print dialog)
  const printPaidAtRef = useRef<Date | null>(null);

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

  const handlePayAndPrint = async () => {
    const now = new Date();
    printPaidAtRef.current = now;

    // IMPORTANT: Print while modal is still mounted (before Firestore closes order & unmounts this component)
    setIsPrinting(true);
    try {
      // Let DOM update at least one frame before opening print dialog
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      window.print();
      await onProcessPayment(rightItems);
    } finally {
      setIsPrinting(false);
    }
  };

  const payTotal = calcSubtotal(rightItems);
  const remainingTotal = calcSubtotal(leftItems);

  // For display in receipt header
  const orderCreatedText = useMemo(() => {
    if (order.createdAt instanceof Date) {
      const t = order.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const d = order.createdAt.toLocaleDateString('vi-VN');
      return `${t} ${d}`;
    }
    return String(order.createdAt);
  }, [order.createdAt]);

  const paidAtText = useMemo(() => {
    const d = printPaidAtRef.current ?? new Date();
    const t = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN');
    return `${t} ${date}`;
  }, [isPrinting]); // re-evaluate once printing state toggles

  return (
    <div className="min-h-screen bg-bg-light text-gray-800 font-sans flex flex-col">
      {/* ── Print CSS (Fix: no blank 2nd page + no gray background) ── */}
      <style>{`
        /* Default: receipt hidden on screen */
        #print-receipt { display: none; }

        @media print {
          /* Paper settings */
          @page { size: 80mm auto; margin: 0; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: #fff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* IMPORTANT: hide the whole app UI (display none, not visibility hidden) */
          #app-screen { display: none !important; }

          /* Only show receipt */
          #print-receipt {
            display: block !important;
            position: fixed; /* detach from the previous layout */
            left: 0;
            top: 0;
            width: 80mm;
            background: #fff !important;
            padding: 4mm;
          }

          /* Avoid any inherited backgrounds */
          #print-receipt, #print-receipt * {
            background: transparent !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* ── APP UI (will be hidden on print) ── */}
      <div id="app-screen" className="min-h-screen bg-bg-light text-gray-800 font-sans flex flex-col">
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
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                {leftItems.length} còn lại
              </span>
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
              <button
                onClick={clearAllPay}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase"
              >
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
              <div className="flex gap-3">
                <button
                  onClick={() => onProcessPayment(rightItems)}
                  disabled={rightItems.length === 0}
                  className="flex-1 bg-primary hover:bg-green-400 text-white font-black text-sm md:text-base py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons text-base">check_circle</span>
                  Xác nhận thanh toán
                </button>
                <button
                  onClick={handlePayAndPrint}
                  disabled={rightItems.length === 0 || isPrinting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm md:text-base py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons text-base">print</span>
                  {isPrinting ? 'Đang xử lý...' : 'Thanh toán & In bill'}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ── PRINT RECEIPT (Only visible during printing) ── */}
      <div id="print-receipt">
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            width: '72mm', // safer than 100%/maxWidth for POS 80mm
            margin: 0,
            color: '#000',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '1px' }}>RIN COFFEE</div>
            <div style={{ fontSize: '11px', marginTop: '4px', lineHeight: '1.5' }}>
              Thôn 1B, xã Krông Păk,
              <br />
              tỉnh Đăk Lắk
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

          {/* Order info */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bàn:</span>
              <span style={{ fontWeight: 700 }}>{tableName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Order:</span>
              <span style={{ fontWeight: 700 }}>#{order.id.slice(-6)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Giờ vào:</span>
              <span>{orderCreatedText}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Thanh toán:</span>
              <span>{paidAtText}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

          {/* Items */}
          <div style={{ marginBottom: '6px' }}>
            {rightItems.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '4px' }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px', fontSize: '12px' }}>
                  <span>x{item.quantity}</span>
                  <span>{formatMoney(item.price * item.quantity)}</span>
                </div>
                {item.note && (
                  <div style={{ paddingLeft: '8px', fontSize: '11px', fontStyle: 'italic', color: '#555' }}>
                    ({item.note})
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #000', margin: '8px 0' }} />

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '15px', marginBottom: '8px' }}>
            <span>TỔNG CỘNG</span>
            <span>{formatMoney(payTotal)}</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.8' }}>
            <div>
              📶 WiFi: <strong>rincamon</strong>
            </div>
            <div style={{ marginTop: '6px', fontStyle: 'italic' }}>Xin cám ơn, hẹn gặp lại quý khách!</div>
          </div>
        </div>
      </div>
    </div>
  );
};