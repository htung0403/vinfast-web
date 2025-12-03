/**
 * Script để tạo user admin vào Firebase Realtime Database
 * Chạy: node create_admin.js
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import bcrypt from 'bcryptjs';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_vAEz_pxfNWKtrgUbt4sgoj0CfaGQSas",
  authDomain: "vinfast-d5bd8.firebaseapp.com",
  databaseURL: "https://vinfast-d5bd8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vinfast-d5bd8",
  storageBucket: "vinfast-d5bd8.firebasestorage.app",
  messagingSenderId: "629544926555",
  appId: "1:629544926555:web:edcbfc14cc02dc6b832e7e",
  measurementId: "G-BWFGVBRLR5"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Admin user - sử dụng UID cố định để dễ quản lý
const ADMIN_UID = 'admin-001';
const adminUser = {
  username: 'admin',
  password: '123456',
  email: 'admin@vinfast.com',
  name: 'Administrator',
  role: 'admin',
  id_ns: 'admin001',
  department: 'Admin',
  position: 'Admin',
  team: 'Admin',
  branch: 'Hà Nội'
};

async function createAdmin() {
  console.log('='.repeat(60));
  console.log('👑 Tạo User Admin');
  console.log('='.repeat(60));
  console.log();

  try {
    // Hash mật khẩu
    console.log('🔐 Đang hash mật khẩu...');
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminUser.password, salt);

    // Bước 1: Tạo user record trong users
    console.log('📝 Đang tạo admin user trong users...');
    const usersRef = ref(database, `employees/${ADMIN_UID}`);
    const userData = {
      username: adminUser.username,
      password: hashedPassword,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      id_ns: adminUser.id_ns,
      department: adminUser.department,
      position: adminUser.position,
      team: adminUser.team,
      branch: adminUser.branch,
      createdAt: new Date().toISOString(),
      createdBy: 'auto-script'
    };

    await set(usersRef, userData);
    console.log('✅ Đã tạo record trong users');

    // Bước 2: Tạo user record trong human_resources
    console.log('📝 Đang tạo admin user trong human_resources...');
    const hrRef = ref(database, `human_resources/${ADMIN_UID}`);
    const hrData = {
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      Team: adminUser.team,
      'Thị trường': adminUser.branch,
      'Ngày vào làm': new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'auto-script'
    };

    await set(hrRef, hrData);
    console.log('✅ Đã tạo record trong human_resources');

    console.log('\n✅ Đã tạo admin user thành công!\n');
    console.log('📋 Thông tin đăng nhập:');
    console.log('-'.repeat(60));
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Name:     ${adminUser.name}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`User ID:  ${ADMIN_UID}`);
    console.log('-'.repeat(60));
    console.log('\n⚠️  LƯU Ý: Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');

    // Liệt kê tất cả users
    await listAllUsers();
    await listHumanResources();

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }

  process.exit(0);
}



// Chạy script
createAdmin();
