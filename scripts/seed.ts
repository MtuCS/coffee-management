/**
 * Firebase Seed Script
 * Run once to import sample data into Firestore.
 *
 * Usage:  npx tsx scripts/seed.ts
 *     or: npm run seed
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

// ─── Firebase Config ───
const firebaseConfig = {
  apiKey: 'AIzaSyBQHGybQgH8dUz9vmp6M-hPZ18UJPmRsCU',
  authDomain: 'coffee-management-a9dd5.firebaseapp.com',
  projectId: 'coffee-management-a9dd5',
  storageBucket: 'coffee-management-a9dd5.firebasestorage.app',
  messagingSenderId: '220547016418',
  appId: '1:220547016418:web:82270723380716ed63a0bb',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Seed Data ───

const CATEGORIES = [
  { name: 'Coffee', icon: 'coffee' },
  { name: 'Tea', icon: 'emoji_food_beverage' },
  { name: 'Smoothies', icon: 'blender' },
  { name: 'Bakery', icon: 'bakery_dining' },
  { name: 'Brunch', icon: 'brunch_dining' },
];

const PRODUCTS = [
  { name: 'Caffè Latte', price: 4.5, description: 'Steamed milk and a thin layer of foam.', image: 'https://picsum.photos/400/300?random=1', categoryName: 'Coffee' },
  { name: 'Double Espresso', price: 3.2, description: 'Rich and bold double shot.', image: 'https://picsum.photos/400/300?random=2', categoryName: 'Coffee' },
  { name: 'Iced Americano', price: 3.9, description: 'Chilled espresso over pure water.', image: 'https://picsum.photos/400/300?random=3', categoryName: 'Coffee' },
  { name: 'Cappuccino', price: 4.75, description: 'Balanced espresso, steamed milk, and foam.', image: 'https://picsum.photos/400/300?random=4', categoryName: 'Coffee' },
  { name: 'Earl Grey Tea', price: 3.5, description: 'Black tea flavored with oil of bergamot.', image: 'https://picsum.photos/400/300?random=5', categoryName: 'Tea' },
  { name: 'Berry Smoothie', price: 5.5, description: 'Mixed berries with yogurt.', image: 'https://picsum.photos/400/300?random=6', categoryName: 'Smoothies' },
  { name: 'Croissant', price: 3.0, description: 'Buttery, flaky pastry.', image: 'https://picsum.photos/400/300?random=7', categoryName: 'Bakery' },
  { name: 'Avocado Toast', price: 8.5, description: 'Sourdough toast with smashed avocado.', image: 'https://picsum.photos/400/300?random=8', categoryName: 'Brunch' },
];

const AREAS = [
  { name: 'Main Floor' },
  { name: 'Garden' },
  { name: 'Mezzanine' },
];

const TABLES = [
  { name: '01', area: 'Main Floor' },
  { name: '02', area: 'Main Floor' },
  { name: '03', area: 'Main Floor' },
  { name: '04', area: 'Main Floor' },
  { name: '05', area: 'Garden' },
  { name: '06', area: 'Garden' },
  { name: '07', area: 'Mezzanine' },
  { name: '08', area: 'Mezzanine' },
];

// ─── Helpers ───

async function clearCollection(colName: string) {
  const snapshot = await getDocs(collection(db, colName));
  if (!snapshot.empty) {
    console.log(`   🗑️  Deleting ${snapshot.size} existing docs in "${colName}"...`);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, colName, d.id));
    }
  }
}

// ─── Main ───

async function seed() {
  console.log('🌱 Starting seed (overwrite mode)...\n');

  // 1. Categories
  const catMap: Record<string, string> = {};
  console.log('📁 Seeding categories...');
  await clearCollection('categories');
  for (const cat of CATEGORIES) {
    const docRef = await addDoc(collection(db, 'categories'), cat);
    catMap[cat.name] = docRef.id;
    console.log(`   ✅ ${cat.name} → ${docRef.id}`);
  }

  // 2. Products (lowercase collection name!)
  console.log('\n📁 Seeding products...');
  await clearCollection('products');
  for (const prod of PRODUCTS) {
    const categoryId = catMap[prod.categoryName] || '';
    const { categoryName, ...data } = prod;
    const docRef = await addDoc(collection(db, 'products'), {
      ...data,
      category: categoryId,
    });
    console.log(`   ✅ ${prod.name} (cat: ${prod.categoryName} → ${categoryId}) → ${docRef.id}`);
  }

  // 3. Areas
  const areaMap: Record<string, string> = {};
  console.log('\n📁 Seeding areas...');
  await clearCollection('areas');
  for (const area of AREAS) {
    const docRef = await addDoc(collection(db, 'areas'), area);
    areaMap[area.name] = docRef.id;
    console.log(`   ✅ ${area.name} → ${docRef.id}`);
  }

  // 4. Tables
  console.log('\n📁 Seeding tables...');
  await clearCollection('tables');
  for (const table of TABLES) {
    const areaId = areaMap[table.area] || '';
    const docRef = await addDoc(collection(db, 'tables'), {
      name: table.name,
      areaId,
      area: table.area,
      status: 'AVAILABLE',
      currentOrderId: null,
    });
    console.log(`   ✅ Table ${table.name} (${table.area} → ${areaId}) → ${docRef.id}`);
  }

  // 5. Clear old orders & shifts (reset trạng thái)
  console.log('\n📁 Clearing old orders...');
  await clearCollection('orders');
  console.log('   ✅ Orders cleared');

  console.log('\n📁 Clearing old shifts...');
  await clearCollection('shifts');
  console.log('   ✅ Shifts cleared');

  // 6. Admin user
  const userUid = 'onJMFrAZheWuWFlsu6cgWY37ikq2';
  console.log('\n📁 Updating admin user...');
  await setDoc(doc(db, 'users', userUid), {
    name: 'Admin',
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=13ec6d&color=fff',
  }, { merge: true });
  console.log(`   ✅ User ${userUid} updated (name: Admin, role: ADMIN)`);

  console.log('\n✨ Seed completed!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
