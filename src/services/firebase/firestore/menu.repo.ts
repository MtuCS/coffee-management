import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Category, Product } from '@/src/shared/types';

// ─── Collections ───
const categoriesRef = collection(db, 'categories');
const productsRef = collection(db, 'products');

// ─── Categories ───

export const subscribeCategories = (
  callback: (categories: Category[]) => void
): Unsubscribe => {
  const q = query(categoriesRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const categories: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
    callback(categories);
  });
};

export const addCategory = async (data: Omit<Category, 'id'>): Promise<string> => {
  const docRef = await addDoc(categoriesRef, data);
  return docRef.id;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<void> => {
  const { id: _id, ...updateData } = data as Category;
  await updateDoc(doc(db, 'categories', id), updateData);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'categories', id));
};

// ─── Products ───

export const subscribeProducts = (
  callback: (products: Product[]) => void
): Unsubscribe => {
  const q = query(productsRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    callback(products);
  });
};

export const addProduct = async (data: Omit<Product, 'id'>): Promise<string> => {
  const docRef = await addDoc(productsRef, data);
  return docRef.id;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
  const { id: _id, ...updateData } = data as Product;
  await updateDoc(doc(db, 'products', id), updateData);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
};
