import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

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

async function main() {
  const samplePath = path.resolve(process.cwd(), 'sample-data', 'hopdong.sample.json');
  if (!fs.existsSync(samplePath)) {
    console.error('Sample file not found at', samplePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(samplePath, 'utf8');
  const json = JSON.parse(raw);
  const contracts = json.contracts || {};

  console.log(`Found ${Object.keys(contracts).length} contracts in sample file. Importing to Firebase...`);

  for (const [key, value] of Object.entries(contracts)) {
    const contractRef = ref(db, `contracts/${key}`);
    await set(contractRef, value);
    console.log(`Imported contract ${key}`);
  }

  console.log('Import complete.');
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
