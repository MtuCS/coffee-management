import { Category, Product, Table, TableStatus, User, Area } from '@/src/shared/types';

// ─── Seed data — sẽ chỉ dùng khi chưa kết nối Firebase hoặc seed Firestore ───

export const SEED_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Coffee', icon: 'coffee' },
  { name: 'Tea', icon: 'emoji_food_beverage' },
  { name: 'Smoothies', icon: 'blender' },
  { name: 'Bakery', icon: 'bakery_dining' },
  { name: 'Brunch', icon: 'brunch_dining' },
];

export const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Caffè Latte', price: 4.5, category: 'coffee', description: 'Steamed milk and a thin layer of foam.', image: 'https://picsum.photos/400/300?random=1' },
  { name: 'Double Espresso', price: 3.2, category: 'coffee', description: 'Rich and bold double shot.', image: 'https://picsum.photos/400/300?random=2' },
  { name: 'Iced Americano', price: 3.9, category: 'coffee', description: 'Chilled espresso over pure water.', image: 'https://picsum.photos/400/300?random=3' },
  { name: 'Cappuccino', price: 4.75, category: 'coffee', description: 'Balanced espresso, steamed milk, and foam.', image: 'https://picsum.photos/400/300?random=4' },
  { name: 'Earl Grey Tea', price: 3.5, category: 'tea', description: 'Black tea flavored with oil of bergamot.', image: 'https://picsum.photos/400/300?random=5' },
  { name: 'Berry Smoothie', price: 5.5, category: 'smoothies', description: 'Mixed berries with yogurt.', image: 'https://picsum.photos/400/300?random=6' },
  { name: 'Croissant', price: 3.0, category: 'bakery', description: 'Buttery, flaky pastry.', image: 'https://picsum.photos/400/300?random=7' },
  { name: 'Avocado Toast', price: 8.5, category: 'brunch', description: 'Sourdough toast with smashed avocado.', image: 'https://picsum.photos/400/300?random=8' },
];

export const SEED_AREAS: Omit<Area, 'id'>[] = [
  { name: 'Main Floor' },
  { name: 'Garden' },
  { name: 'Mezzanine' },
];

export const SEED_TABLES: Omit<Table, 'id'>[] = [
  { name: '01', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '02', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '03', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '04', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '05', areaId: '', area: 'Garden', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '06', areaId: '', area: 'Garden', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '07', areaId: '', area: 'Mezzanine', status: TableStatus.AVAILABLE, currentOrderId: null },
  { name: '08', areaId: '', area: 'Mezzanine', status: TableStatus.AVAILABLE, currentOrderId: null },
];

// ─── Fallback constants khi chưa có Firebase ───

export const CATEGORIES: Category[] = [
  { id: 'coffee', name: 'Coffee', icon: 'coffee' },
  { id: 'tea', name: 'Tea', icon: 'emoji_food_beverage' },
  { id: 'smoothies', name: 'Smoothies', icon: 'blender' },
  { id: 'bakery', name: 'Bakery', icon: 'bakery_dining' },
  { id: 'brunch', name: 'Brunch', icon: 'brunch_dining' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Caffè Latte', price: 4.5, category: 'coffee', description: 'Steamed milk and a thin layer of foam.', image: 'https://picsum.photos/400/300?random=1' },
  { id: 'p2', name: 'Double Espresso', price: 3.2, category: 'coffee', description: 'Rich and bold double shot.', image: 'https://picsum.photos/400/300?random=2' },
  { id: 'p3', name: 'Iced Americano', price: 3.9, category: 'coffee', description: 'Chilled espresso over pure water.', image: 'https://picsum.photos/400/300?random=3' },
  { id: 'p4', name: 'Cappuccino', price: 4.75, category: 'coffee', description: 'Balanced espresso, steamed milk, and foam.', image: 'https://picsum.photos/400/300?random=4' },
  { id: 'p5', name: 'Earl Grey Tea', price: 3.5, category: 'tea', description: 'Black tea flavored with oil of bergamot.', image: 'https://picsum.photos/400/300?random=5' },
  { id: 'p6', name: 'Berry Smoothie', price: 5.5, category: 'smoothies', description: 'Mixed berries with yogurt.', image: 'https://picsum.photos/400/300?random=6' },
  { id: 'p7', name: 'Croissant', price: 3.0, category: 'bakery', description: 'Buttery, flaky pastry.', image: 'https://picsum.photos/400/300?random=7' },
  { id: 'p8', name: 'Avocado Toast', price: 8.5, category: 'brunch', description: 'Sourdough toast with smashed avocado.', image: 'https://picsum.photos/400/300?random=8' },
];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', name: '01', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't2', name: '02', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't3', name: '03', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't4', name: '04', areaId: '', area: 'Main Floor', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't5', name: '05', areaId: '', area: 'Garden', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't6', name: '06', areaId: '', area: 'Garden', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't7', name: '07', areaId: '', area: 'Mezzanine', status: TableStatus.AVAILABLE, currentOrderId: null },
  { id: 't8', name: '08', areaId: '', area: 'Mezzanine', status: TableStatus.AVAILABLE, currentOrderId: null },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Robert Chen', role: 'ADMIN', avatar: 'https://picsum.photos/100/100?random=10' },
  { id: 'u2', name: 'Maria Staff', role: 'STAFF', avatar: 'https://picsum.photos/100/100?random=11' },
];
