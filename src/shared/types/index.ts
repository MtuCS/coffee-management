// ─── Enums ───

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  PAYMENT_REQUESTED = 'PAYMENT_REQUESTED',
}

// ─── Domain Interfaces ───

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // category ID
  image: string;
  description: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  isPaid: boolean;
}

export interface Order {
  id: string;
  tableId: string | null; // null nếu mang đi
  items: OrderItem[];
  status: 'OPEN' | 'CLOSED';
  createdAt: Date;
  type: OrderType;
  totalAmount: number;
  paidAmount: number;
}

export interface Table {
  id: string;
  name: string;
  areaId: string; // tham chiếu Area ID
  area: string;   // tên area (để hiển thị, denormalized)
  status: TableStatus;
  currentOrderId: string | null;
}

export interface Area {
  id: string;
  name: string;
}

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface Shift {
  id: string;
  shiftType: ShiftType;
  shiftName: string;
  date: string;       // 'YYYY-MM-DD'
  startTime: Date;
  endTime: Date;
  totalRevenue: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  avatar: string;
}

// ─── App State Types ───

export type ViewState = 'TABLES' | 'POS' | 'PAYMENT' | 'ADMIN' | 'LOGIN';
