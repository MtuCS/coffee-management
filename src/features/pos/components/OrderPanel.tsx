import React, { useState, useEffect } from 'react';
import { Product, Order, OrderItem, Category, Table } from '@/src/shared/types';
import { addItemToOrder, updateItemQuantity, updateItemNote } from '@/src/domain/orders/order.logic';
import { calcSubtotal } from '@/src/shared/utils/money';

interface OrderPanelProps {
  table: Table | null;
  currentOrder: Order | null;
  onUpdateOrder: (items: OrderItem[]) => void;
  onBack: () => void;
  onPayment: () => void;
  onMoveTable?: () => void;
  categories: Category[];
  products: Product[];
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  table,
  currentOrder,
  onUpdateOrder,
  onBack,
  onPayment,
  onMoveTable,
  categories,
  products,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [localItems, setLocalItems] = useState<OrderItem[]>(currentOrder?.items || []);

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

  return (
    <div className="flex h-screen bg-bg-light overflow-hidden">
      {/* Left Main Content */}
      <main className="flex-1 flex flex-col h-full border-r border-gray-200">
        {/* Header */}
        <header className="bg-white p-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {table ? `Order - Table ${table.name}` : 'Takeaway Order'}
            </h1>
          </div>
          <div className="relative w-1/3">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <nav className="w-24 bg-white border-r border-gray-200 flex flex-col py-4 gap-2 overflow-y-auto">
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
          <div className="flex-1 overflow-y-auto p-6 bg-bg-light">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleAddItem(product)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                    <button className="mt-auto w-full py-2 bg-gray-50 hover:bg-primary hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white">
                      <span className="material-icons text-base">add</span>
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Right Order Panel */}
      <aside className="w-96 bg-white flex flex-col border-l border-gray-200 shadow-xl z-20">
        {/* Order Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            {table ? table.name : 'Walk-in'}
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Order #{currentOrder?.id.slice(-4) || 'New'}
          </p>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {localItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <span className="material-icons text-6xl mb-2">add_shopping_cart</span>
              <p>No items added yet</p>
            </div>
          ) : (
            localItems.map((item, idx) => (
              <div key={idx} className="space-y-2 pb-4 border-b border-dashed border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
                    placeholder="Add items notes..."
                    value={item.note || ''}
                    onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                    className="w-full pl-7 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all text-gray-600"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-2xl font-black text-primary">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {table && (
              <button
                onClick={onMoveTable}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                <span className="material-icons text-sm">shuffle</span>
                Move Items
              </button>
            )}
            <div></div>
          </div>

          <button
            onClick={onPayment}
            disabled={localItems.length === 0}
            className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PROCEED TO PAYMENT
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
