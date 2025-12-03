import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

// Firebase web config (matches src/firebase/config.js)
const firebaseConfig = {
  apiKey: "AIzaSyB_vAEz_pxfNWKtrgUbt4sgoj0CfaGQSas",
  authDomain: "vinfast-d5bd8.firebaseapp.com",
  projectId: "vinfast-d5bd8",
  databaseURL: "https://vinfast-d5bd8-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "vinfast-d5bd8.firebasestorage.app",
  messagingSenderId: "629544926555",
  appId: "1:629544926555:web:edcbfc14cc02dc6b832e7e",
  measurementId: "G-BWFGVBRLR5",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Default promotions from promotionsData.js
const defaultPromotions = [
  "Chính sách MLTTVN 3: Giảm 4% Tiền mặt",
  "Miễn phí sạc tới 30/06/2027",
  "Chính Sách Sài Gòn Xanh: Ví VinClub 35.000.000 vnđ",
  "Thu cũ đổi mới xe xăng VinFast: 50.000.000 vnđ"
];

async function main() {
  console.log(`Importing ${defaultPromotions.length} promotions to Firebase...`);

  const promotionsRef = ref(db, "promotions");
  const now = new Date().toISOString();

  for (const promotionName of defaultPromotions) {
    try {
      const newPromotionRef = push(promotionsRef);
      const promotionData = {
        name: promotionName,
        createdAt: now,
        createdBy: "system-import",
      };
      
      await set(newPromotionRef, promotionData);
      console.log(`✓ Imported: ${promotionName}`);
    } catch (err) {
      console.error(`✗ Failed to import "${promotionName}":`, err.message);
    }
  }

  console.log('\nImport complete!');
  console.log(`Successfully imported ${defaultPromotions.length} promotions to Firebase.`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});

