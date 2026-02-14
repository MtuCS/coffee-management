/**
 * Custom hook điều phối logic cho màn POS
 * Tập trung business logic, tách khỏi UI components
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Order,
  OrderItem,
  Table,
  TableStatus,
  Shift,
  Category,
  Product,
  Area,
} from '@/src/shared/types';
import {
  subscribeTables,
  updateTable,
  subscribeAreas,
} from '@/src/services/firebase/firestore/tables.repo';
import {
  subscribeActiveOrders,
  createOrder,
  updateOrderItems,
  processPayment,
} from '@/src/services/firebase/firestore/orders.repo';
import {
  subscribeCategories,
  subscribeProducts,
} from '@/src/services/firebase/firestore/menu.repo';
import {
  subscribeCurrentShift,
  subscribeShifts,
  openShift,
  closeShift,
} from '@/src/services/firebase/firestore/shifts.repo';
import {
  createNewOrder,
  calcOrderGrandTotal,
} from '@/src/domain/orders/order.logic';
import { calcSubtotal } from '@/src/shared/utils/money';

export const usePos = () => {
  // ─── State ───
  const [tables, setTables] = useState<Table[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Realtime Subscriptions ───
  useEffect(() => {
    const unsubscribers = [
      subscribeTables((data) => { setTables(data); setLoading(false); }),
      subscribeAreas((data) => setAreas(data)),
      subscribeCategories((data) => setCategories(data)),
      subscribeProducts((data) => setProducts(data)),
      subscribeActiveOrders((data) => setOrders(data)),
      subscribeCurrentShift((data) => setCurrentShift(data)),
      subscribeShifts((data) => setAllShifts(data)),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  // ─── Derived ───
  const activeTable = activeTableId ? tables.find((t) => t.id === activeTableId) || null : null;
  const activeOrder = activeTable?.currentOrderId ? orders[activeTable.currentOrderId] || null : null;
  const areaNames = areas.map((a) => a.name);

  // ─── Shift Actions ───
  const handleToggleShift = useCallback(async (openerName: string) => {
    if (currentShift) {
      await closeShift(currentShift.id);
    } else {
      await openShift(openerName);
    }
  }, [currentShift]);

  // ─── Table Click ───
  const handleTableClick = useCallback(async (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    setActiveTableId(tableId);

    if (table.status === TableStatus.AVAILABLE) {
      const orderData = createNewOrder(tableId);
      const newOrderId = await createOrder(orderData);
      await updateTable(tableId, {
        status: TableStatus.OCCUPIED,
        currentOrderId: newOrderId,
      });
    }
  }, [tables]);

  // ─── Update Order Items ───
  const handleUpdateOrder = useCallback(async (items: OrderItem[]) => {
    if (!activeTable?.currentOrderId) return;
    const totalAmount = calcSubtotal(items);
    await updateOrderItems(activeTable.currentOrderId, items, totalAmount);
  }, [activeTable]);

  // ─── Process Payment ───
  const handleProcessPayment = useCallback(async (itemsToPay: OrderItem[]) => {
    if (!activeTable?.currentOrderId || !currentShift) return;

    const payAmount = calcSubtotal(itemsToPay);
    const paidItemIds = itemsToPay.map((i) => i.id);

    const allPaid = await processPayment(
      activeTable.currentOrderId,
      paidItemIds,
      payAmount,
      currentShift.id
    );

    if (allPaid) {
      await updateTable(activeTable.id, {
        status: TableStatus.AVAILABLE,
        currentOrderId: null,
      });
      setActiveTableId(null);
    }

    return allPaid;
  }, [activeTable, currentShift]);

  return {
    // State
    tables,
    areas,
    areaNames,
    categories,
    products,
    orders,
    currentShift,
    allShifts,
    activeTableId,
    activeTable,
    activeOrder,
    loading,
    // Actions
    setActiveTableId,
    handleToggleShift,
    handleTableClick,
    handleUpdateOrder,
    handleProcessPayment,
  };
};
