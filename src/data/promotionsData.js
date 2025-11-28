// Promotions data management
// This file exports a function to get promotions from Firebase
// and can be used by components that need the promotions list

import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Load promotions from Firebase
 * @returns {Promise<Array>} Array of promotions with structure: { id, name, createdAt, createdBy }
 */
export const loadPromotionsFromFirebase = async () => {
  try {
    const promotionsRef = ref(database, "promotions");
    const snapshot = await get(promotionsRef);
    const data = snapshot.exists() ? snapshot.val() : {};
    
    // Convert to array with firebase key
    const promotionsList = Object.entries(data || {}).map(([key, value]) => ({
      id: key,
      ...value,
    })).sort((a, b) => {
      // Sort by createdAt descending (newest first)
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    
    return promotionsList;
  } catch (err) {
    console.error("Error loading promotions from Firebase:", err);
    return [];
  }
};

/**
 * Get promotion names as a simple array (for backward compatibility)
 * @returns {Promise<Array<string>>} Array of promotion names
 */
export const getPromotionNames = async () => {
  const promotions = await loadPromotionsFromFirebase();
  return promotions.map(p => p.name || '').filter(Boolean);
};

/**
 * Default/hardcoded promotions (fallback if Firebase is empty)
 * These are used as initial values or fallback
 */
export const defaultPromotions = [
  "Chính sách MLTTVN 3: Giảm 4% Tiền mặt",
  "Miễn phí sạc tới 30/06/2027",
  "Chính Sách Sài Gòn Xanh: Ví VinClub 35.000.000 vnđ",
  "Thu cũ đổi mới xe xăng VinFast: 50.000.000 vnđ"
];

