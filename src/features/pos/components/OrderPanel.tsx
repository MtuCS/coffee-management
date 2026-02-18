import React, { useState, useEffect } from 'react';
import { Product, Order, OrderItem, Category, Table } from '@/src/shared/types';
import { addItemToOrder, updateItemQuantity, updateItemNote } from '@/src/domain/orders/order.logic';
import { calcSubtotal, formatMoney } from '@/src/shared/utils/money';

interface OrderPanelProps {
  table: Table | null;
  currentOrder: Order | null;
  onUpdateOrder: (items: OrderItem[]) => void;
  onBack: () => void;
  onPayment: () => void;
  onSaveAndBack: () => void;
  onCancelNewOrder: () => void;
  onMoveTable?: () => void;
  categories: Category[];
  products: Product[];
  isNewOrder: boolean;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  table,
  currentOrder,
  onUpdateOrder,
  onBack,
  onPayment,
  onSaveAndBack,
  onCancelNewOrder,
  onMoveTable,
  categories,
  products,
  isNewOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [localItems, setLocalItems] = useState<OrderItem[]>(currentOrder?.items || []);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (currentOrder) {
      setLocalItems(currentOrder.items);
    } else {
      setLocalItems([]);
    }
  }, [currentOrder]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (product: Product) => {
    const updatedItems = addItemToOrder(localItems, product.id, product.name, product.price);
    setLocalItems(updatedItems);
    onUpdateOrder(updatedItems);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const updatedItems = updateItemQuantity(localItems, itemId, delta);
    setLocalItems(updatedItems);
    onUpdateOrder(updatedItems);
  };

  const handleUpdateNote = (itemId: string, note: string) => {
    const updatedItems = updateItemNote(localItems, itemId, note);
    setLocalItems(updatedItems);
    onUpdateOrder(updatedItems);
  };

  const subtotal = calcSubtotal(localItems);
  const itemCount = localItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleBack = () => {
    if (isNewOrder && localItems.length === 0) {
      setShowLeaveConfirm(true);
    } else {
      onBack();
    }
  };

  /* ───── Shared sub-components ───── */

  const renderOrderItems = () => (
    <>
      {localItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-300 py-8">
          <span className="material-icons text-5xl md:text-6xl mb-2">add_shopping_cart</span>
          <p className="text-sm">Chưa có món nào</p>
        </div>
      ) : (
        localItems.map((item, idx) => (
          <div key={idx} className="space-y-2 pb-3 md:pb-4 border-b border-dashed border-gray-100 last:border-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{formatMoney(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, -1); }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-500"
                >
                  <span className="material-icons text-xs">remove</span>
                </button>
                <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, 1); }}
                  className="w-6 h-6 flex items-center justify-center bg-primary text-white rounded transition-colors shadow-sm"
                >
                  <span className="material-icons text-xs">add</span>
                </button>
              </div>
            </div>
            <div className="relative group">
              <span className="material-icons absolute left-2 top-2 text-xs text-gray-400">edit_note</span>
              <input
                type="text"
                placeholder="Ghi chú..."
                value={item.note || ''}
                onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                className="w-full pl-7 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all text-gray-600"
              />
            </div>
          </div>
        ))
      )}
    </>
  );

  const renderFooter = () => (
    <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <span className="text-base md:text-lg font-bold text-gray-800">Tổng cộng</span>
        <span className="text-xl md:text-2xl font-black text-primary">{formatMoney(subtotal)}</span>
      </div>

      {!isNewOrder && table && (
        <div className="mb-3">
          <button
            onClick={onMoveTable}
            className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors w-full md:w-auto md:px-6"
          >
            <span className="material-icons text-sm">shuffle</span>
            Chuyển bàn
          </button>
        </div>
      )}

      {isNewOrder ? (
        <button
          onClick={() => {
            onUpdateOrder(localItems);
            onSaveAndBack();
          }}
          disabled={localItems.length === 0}
          className="w-full py-3.5 md:py-4 bg-blue-500 text-white rounded-xl font-black text-base md:text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-icons">save</span>
          LƯU TẠM
        </button>
      ) : (
        <button
          onClick={onPayment}
          disabled={localItems.length === 0}
          className="w-full py-3.5 md:py-4 bg-primary text-white rounded-xl font-black text-base md:text-lg shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          THANH TOÁN
          <span className="material-icons">arrow_forward</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg-light overflow-hidden">
      {/* Left Main Content */}
      <main className="flex-1 flex flex-col h-full min-h-0">
        {/* Header */}
        <header className="bg-white p-3 md:p-4 border-b border-gray-200 flex items-center gap-3 shadow-sm z-10">
          <button onClick={handleBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
            <span className="material-icons">arrow_back</span>
          </button>
          <h1 className="text-base md:text-xl font-bold text-gray-800 truncate">
            {table ? `Order - Bàn ${table.name}` : 'Takeaway Order'}
          </h1>
          <div className="relative flex-1 max-w-xs ml-auto">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Tìm món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Mobile: Horizontal Category Bar */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto flex-shrink-0">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="material-icons text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Desktop: Vertical Categories Sidebar */}
          <nav className="hidden md:flex w-24 bg-white border-r border-gray-200 flex-col py-4 gap-2 overflow-y-auto flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-1 p-2 transition-all border-l-4 ${
                  selectedCategory === cat.id
                    ? 'border-primary bg-gray-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1 shadow-sm transition-colors ${
                    selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  <span className="material-icons">{cat.icon}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedCategory === cat.id ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </nav>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-bg-light pb-24 md:pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleAddItem(product)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="h-28 md:h-40 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold shadow-sm">
                      {formatMoney(product.price)}
                    </div>
                  </div>
                  <div className="p-2.5 md:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-800 text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-2 md:mb-4 line-clamp-2 hidden sm:block">{product.description}</p>
                    <button className="mt-auto w-full py-1.5 md:py-2 bg-gray-50 hover:bg-primary hover:text-white rounded-lg font-bold text-xs md:text-sm transition-colors flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white">
                      <span className="material-icons text-sm">add</span>
                      <span className="hidden sm:inline">Thêm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Desktop: Right Order Panel */}
      <aside className="hidden md:flex w-96 bg-white flex-col border-l border-gray-200 shadow-xl z-20">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            {table ? `Bàn ${table.name}` : 'Walk-in'}
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Order #{currentOrder?.id.slice(-4) || 'New'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {renderOrderItems()}
        </div>
        {renderFooter()}
      </aside>

      {/* Mobile: Floating Cart Button */}
      {!showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-4 right-4 z-40 bg-primary text-white rounded-full shadow-xl flex items-center gap-2 px-5 py-3.5 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-icons">shopping_cart</span>
          {itemCount > 0 && (
            <>
              <span className="font-black text-sm">{itemCount}</span>
              <span className="text-xs opacity-80">|</span>
              <span className="font-bold text-sm">{formatMoney(subtotal)}</span>
            </>
          )}
          {itemCount === 0 && <span className="font-bold text-sm">Giỏ hàng</span>}
        </button>
      )}

      {/* Mobile: Bottom Drawer Cart */}
      {showCart && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          {/* Drawer */}
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
            {/* Drag handle + header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2"></div>
                <h2 className="text-lg font-bold text-gray-800">
                  {table ? `Bàn ${table.name}` : 'Walk-in'}
                </h2>
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <span className="material-icons text-gray-500">close</span>
              </button>
            </div>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {renderOrderItems()}
            </div>
            {/* Footer */}
            {renderFooter()}
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-full mx-auto mb-4">
              <span className="material-icons text-yellow-500 text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Rời khỏi bàn?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Bạn chưa chọn món nào. Order sẽ bị hủy và bàn sẽ trở về trạng thái trống.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Tiếp tục order
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onCancelNewOrder();
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
              >
                Rời đi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
