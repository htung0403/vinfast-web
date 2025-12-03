import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import bcrypt from 'bcryptjs';

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
  const samplePath = path.resolve(process.cwd(), 'sample-data', 'employees.sample.json');
  if (!fs.existsSync(samplePath)) {
    console.error('Sample file not found at', samplePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(samplePath, 'utf8');
  const json = JSON.parse(raw);
  const employees = json.employees || {};

  console.log(`Found ${Object.keys(employees).length} employees in sample file. Importing to Firebase...`);

  // Default plaintext password for all sample users
  const defaultPlain = '123456';
  const defaultHash = bcrypt.hashSync(defaultPlain, 10);

  for (const [key, values] of Object.entries(employees)) {
    // Map legacy/sample keys into the canonical DB shape you requested
    const mapped = {
      id: key,
      TVBH: values.TVBH || values['TVBH'] || values['Họ Và Tên'] || values.name || '',
      user: values.user || values.username || '',
      pass: defaultHash,
      soDienThoai: values.soDienThoai || values.phone || values.phoneNumber || '',
      mail: values.mail || values.Mail || values.email || '',
      sinhNhat: values.sinhNhat || values['Sinh Nhật'] || values.birthday || values.birthdate || '',
      ngayVaoLam: values.ngayVaoLam || values['Ngày vào làm'] || values.startDate || values.createdAt || '',
      chucVu: values.chucVu || values['Chức Vị'] || values.position || '',
      phongBan: values.phongBan || values['Phòng Ban'] || values.department || '',
      tinhTrang: values.tinhTrang || values['tình trạng'] || values.status || 'active',
      quyen: values.quyen || values['Quyền'] || values.role || 'user',
      zalo: values.zalo || values.Zalo || '',
      tiktok: values.tiktok || values.TikTok || '',
      facebook: values.facebook || values.Facebook || '',
      fanpage: values.fanpage || '',
      web: values.web || '',
    };

    const empRef = ref(db, `employees/${key}`);
    await set(empRef, mapped);
    console.log(`Imported employee ${key} (${mapped.TVBH || mapped.user || ''})`);
  }

  console.log('Import complete. All sample employees have password set to 123456 (hashed in DB).');
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
