/**
 * Generate ID ngắn dùng cho OrderItem (client-side)
 * Firestore sẽ dùng auto-ID cho documents
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
