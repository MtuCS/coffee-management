import React, { useState, useEffect } from 'react';
import { ViewState, User, Order, OrderItem, Category, Product, Table, Area, Shift, TableStatus } from '@/src/shared/types';
import { CATEGORIES, PRODUCTS, INITIAL_TABLES, USERS } from '@/src/shared/constants';

// Features
import { TableMap } from '@/src/features/pos/components/TableMap';
import { OrderPanel } from '@/src/features/pos/components/OrderPanel';
import { PaymentModal } from '@/src/features/pos/components/PaymentModal';
import { AdminDashboard } from '@/src/features/admin/components/AdminDashboard';
import { LoginPage } from '@/src/features/auth/LoginPage';

// Auth
import { useAuth } from '@/src/app/providers/AuthProvider';

// Firebase repos
import * as menuRepo from '@/src/services/firebase/firestore/menu.repo';
import * as tablesRepo from '@/src/services/firebase/firestore/tables.repo';
import * as ordersRepo from '@/src/services/firebase/firestore/orders.repo';
import * as shiftsRepo from '@/src/services/firebase/firestore/shifts.repo';
import * as usersRepo from '@/src/services/firebase/firestore/users.repo';

// Domain logic
import { createNewOrder, addItemToOrder } from '@/src/domain/orders/order.logic';
import { calcSubtotal } from '@/src/shared/utils/money';

const App: React.FC = () => {
  const { currentUser, loading: authLoading, login, signOut } = useAuth();

  // ─── View State ───
  const [view, setView] = useState<ViewState>('TABLES');
  const [loginError, setLoginError] = useState<string | null>(null);

  // ─── Domain Data State ───
  // Khi chưa có Firebase config, dùng fallback data từ constants
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [areas, setAreas] = useState<Area[]>([
    { id: 'a1', name: 'Main Floor' },
    { id: 'a2', name: 'Garden' },
    { id: 'a3', name: 'Mezzanine' },
  ]);
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  // Active context
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  // ─── Firebase Realtime Subscriptions ───
  useEffect(() => {
    // Chỉ subscribe khi user đã đăng nhập
    if (!currentUser) return;

    const unsubscribers = [
      tablesRepo.subscribeTables((data) => setTables(data)),
      tablesRepo.subscribeAreas((data) => setAreas(data)),
      menuRepo.subscribeCategories((data) => setCategories(data)),
      menuRepo.subscribeProducts((data) => setProducts(data)),
      ordersRepo.subscribeActiveOrders((data) => setOrders(data)),
      shiftsRepo.subscribeCurrentShift((data) => setCurrentShift(data)),
      shiftsRepo.subscribeShifts((data) => setShifts(data)),
      usersRepo.subscribeUsers((data) => setUsers(data)),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [currentUser]);

  // ─── Derived ───
  const activeTable = activeTableId ? tables.find((t) => t.id === activeTableId) || null : null;
  const activeOrder = activeTable?.currentOrderId ? orders[activeTable.currentOrderId] || null : null;
  const areaNames = areas.map((a) => a.name);

  // ─── Auth Actions ───
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginError(null);
      await login(email, password);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // ─── Shift Actions ───
  const handleToggleShift = async () => {
    if (!currentUser) return;
    if (currentShift) {
      await shiftsRepo.closeShift(currentShift.id);
    } else {
      await shiftsRepo.openShift(currentUser.name);
    }
  };

  // ─── Table Click ───
  const handleTableClick = async (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    setActiveTableId(tableId);

    if (table.status === TableStatus.AVAILABLE) {
      const orderData = createNewOrder(tableId);
      const newOrderId = await ordersRepo.createOrder(orderData);
      await tablesRepo.updateTable(tableId, {
        status: TableStatus.OCCUPIED,
        currentOrderId: newOrderId,
      });
    }

    setView('POS');
  };

  // ─── Order Management ───
  const handleUpdateOrder = async (items: OrderItem[]) => {
    if (!activeTable?.currentOrderId) return;
    const totalAmount = calcSubtotal(items);
    await ordersRepo.updateOrderItems(activeTable.currentOrderId, items, totalAmount);
  };

  // ─── Payment ───
  const handleProcessPayment = async (itemsToPay: OrderItem[]) => {
    if (!activeTable?.currentOrderId || !currentShift) return;

    const payAmount = calcSubtotal(itemsToPay);
    const paidItemIds = itemsToPay.map((i) => i.id);

    const allPaid = await ordersRepo.processPayment(
      activeTable.currentOrderId,
      paidItemIds,
      payAmount,
      currentShift.id
    );

    if (allPaid) {
      await tablesRepo.updateTable(activeTable.id, {
        status: TableStatus.AVAILABLE,
        currentOrderId: null,
      });
      setView('TABLES');
      setActiveTableId(null);
    } else {
      setView('POS');
    }
  };

  const handleMoveTable = () => {
    alert('Select a target table to move items to. (Coming soon)');
  };

  // ─── CRUD Handlers (delegating to Firebase repos) ───
  const handleSaveCategory = async (cat: Category) => {
    if (cat.id) {
      await menuRepo.updateCategory(cat.id, cat);
    } else {
      await menuRepo.addCategory({ name: cat.name, icon: cat.icon });
    }
  };
  const handleDeleteCategory = async (id: string) => await menuRepo.deleteCategory(id);

  const handleSaveProduct = async (prod: Product) => {
    if (prod.id) {
      await menuRepo.updateProduct(prod.id, prod);
    } else {
      const { id: _id, ...data } = prod;
      await menuRepo.addProduct(data);
    }
  };
  const handleDeleteProduct = async (id: string) => await menuRepo.deleteProduct(id);

  const handleSaveArea = async (area: Area) => {
    if (area.id) {
      await tablesRepo.updateArea(area.id, area.name);
    } else {
      await tablesRepo.addArea(area.name);
    }
  };
  const handleDeleteArea = async (id: string) => await tablesRepo.deleteArea(id);

  const handleSaveTable = async (table: Table) => {
    if (table.id) {
      await tablesRepo.updateTable(table.id, table);
    } else {
      const { id: _id, ...data } = table;
      await tablesRepo.addTable(data);
    }
  };
  const handleDeleteTable = async (id: string) => await tablesRepo.deleteTable(id);

  const handleSaveUser = async (user: User) => {
    if (user.id) {
      await usersRepo.updateUser(user.id, user);
    } else {
      // Tạo user mới — cần có UID từ Firebase Auth
      // Tạm thời dùng generated ID
      const uid = `u_${Date.now()}`;
      const { id: _id, ...data } = user;
      await usersRepo.addUser(uid, data);
    }
  };
  const handleDeleteUser = async (id: string) => await usersRepo.deleteUser(id);

  // ─── Render Logic ───

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 animate-pulse">
            <span className="material-icons text-primary text-3xl">coffee</span>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  // Admin view
  if (view === 'ADMIN') {
    if (currentUser.role !== 'ADMIN') {
      setView('TABLES');
      return null;
    }
    return (
      <AdminDashboard
        shifts={shifts}
        orders={Object.values(orders)}
        onBack={() => setView('TABLES')}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        areas={areas}
        onSaveArea={handleSaveArea}
        onDeleteArea={handleDeleteArea}
        tables={tables}
        onSaveTable={handleSaveTable}
        onDeleteTable={handleDeleteTable}
        users={users}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  // Payment view
  if (view === 'PAYMENT' && activeOrder) {
    return (
      <PaymentModal
        order={activeOrder}
        tableName={activeTable?.name || 'Unknown'}
        onBack={() => setView('POS')}
        onProcessPayment={handleProcessPayment}
      />
    );
  }

  // POS view
  if (view === 'POS') {
    return (
      <OrderPanel
        table={activeTable}
        currentOrder={activeOrder}
        onUpdateOrder={handleUpdateOrder}
        onBack={() => setView('TABLES')}
        onPayment={() => setView('PAYMENT')}
        onMoveTable={handleMoveTable}
        categories={categories}
        products={products}
      />
    );
  }

  // Default: Tables view
  return (
    <div className="relative h-screen bg-bg-light">
      <TableMap
        tables={tables}
        areas={areaNames}
        orders={orders}
        onTableClick={handleTableClick}
        onCloseShift={handleToggleShift}
        userRole={currentUser.role}
        isShiftOpen={!!currentShift}
      />

      {/* User info & Logout */}
      <div className="fixed bottom-4 left-4 z-50 flex gap-2 items-center">
        <div className="bg-white px-3 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2">
          <img
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`}
            alt=""
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs font-bold text-gray-700">{currentUser.name}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            currentUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {currentUser.role}
          </span>
        </div>
        <button
          onClick={signOut}
          className="bg-white px-3 py-2 rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
          title="Logout"
        >
          <span className="material-icons text-sm">logout</span>
        </button>
      </div>

      {/* Admin Access Button */}
      {currentUser.role === 'ADMIN' && (
        <button
          onClick={() => setView('ADMIN')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-50 border-2 border-primary"
          title="Admin Dashboard"
        >
          <span className="material-icons">settings</span>
        </button>
      )}
    </div>
  );
};

export default App;
