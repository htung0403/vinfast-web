// Calculator Data - Full version with images
// Import VF3 images
import vf3InfinityBlanc from '../assets/vinfast_images/vf3/Infinity Blanc.png';
import vf3CrimsonRed from '../assets/vinfast_images/vf3/Crimson Red.png';
import vf3ZenithGrey from '../assets/vinfast_images/vf3/Zenith Grey.png';
import vf3SummerYellow from '../assets/vinfast_images/vf3/Summer Yellow Body - Infinity Blanc Roof.png';
import vf3SkyBlue from '../assets/vinfast_images/vf3/Sky Blue - Infinity Blanc Roof.png';
import vf3RosePink from '../assets/vinfast_images/vf3/Rose Pink Body - Infinity Blanc Roof.png';
import vf3UrbanMint from '../assets/vinfast_images/vf3/Urban Mint.png';

// Map VF3 image paths to imports
const vf3ImageMap = {
  'vinfast_images/vf3/Infinity Blanc.png': vf3InfinityBlanc,
  'vinfast_images/vf3/Crimson Red.png': vf3CrimsonRed,
  'vinfast_images/vf3/Zenith Grey.png': vf3ZenithGrey,
  'vinfast_images/vf3/Summer Yellow Body - Infinity Blanc Roof.png': vf3SummerYellow,
  'vinfast_images/vf3/Sky Blue - Infinity Blanc Roof.png': vf3SkyBlue,
  'vinfast_images/vf3/Rose Pink Body - Infinity Blanc Roof.png': vf3RosePink,
  'vinfast_images/vf3/Urban Mint.png': vf3UrbanMint,
};

// Helper function to get image URL (handles both local imports and remote URLs)
export const getCarImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's a local path (starts with vinfast_images), return the imported image
  if (imagePath.startsWith('vinfast_images/vf3/')) {
    return vf3ImageMap[imagePath] || null;
  }
  // Otherwise, it's a remote URL
  return imagePath;
};

// Phí đường bộ
export const phi_duong_bo = [
  { loai: "ca_nhan", gia_tri: 1560000 },
  { loai: "cong_ty", gia_tri: 2160000 }
];

// Phí cấp biển số
export const phi_cap_bien_so = [
  { khu_vuc: "ho_chi_minh", ten_khu_vuc: "TP. Hồ Chí Minh", gia_tri: 20000000 },
  { khu_vuc: "tinh_khac", ten_khu_vuc: "Tỉnh thành khác", gia_tri: 1000000 },
];

// Phí kiểm định
export const phi_kiem_dinh = 140000;

// Chi phí dịch vụ đăng ký
export const chi_phi_dich_vu_dang_ky = 3000000;

// Lãi suất vay hàng năm
export const lai_suat_vay_hang_nam = 0.085;

// Ưu đãi VinClub
export const uu_dai_vin_club = [
  { hang: "gold", ten_hang: "Gold", ty_le: 0.005 },
  { hang: "platinum", ten_hang: "Platinum", ty_le: 0.01 },
  { hang: "diamond", ten_hang: "Diamond", ty_le: 0.015 }
];

// Hỗ trợ đổi xe xăng sang xe điện
export const ho_tro_doi_xe = [
  { dong_xe: "vf_3", gia_tri: 5000000 },
  { dong_xe: "vf_5", gia_tri: 10000000 },
  { dong_xe: "vf_6", gia_tri: 15000000 },
  { dong_xe: "vf_7", gia_tri: 50000000 },
  { dong_xe: "vf_8", gia_tri: 70000000 },
  { dong_xe: "vf_9", gia_tri: 100000000 },
];

// Giá trị đặt cọc
export const gia_tri_dat_coc = [
  { dong_xe: "vf_3", gia_tri: 15000000 },
  { dong_xe: "vf_5", gia_tri: 20000000 },
  { dong_xe: "vf_6", gia_tri: 30000000 },
  { dong_xe: "vf_7", gia_tri: 50000000 },
  { dong_xe: "vf_8", gia_tri: 50000000 },
  { dong_xe: "vf_9", gia_tri: 50000000 },
];

// Quy đổi 2 năm BHVC
export const quy_doi_2_nam_bhvc = [
  { dong_xe: "vf_3", gia_tri: 0 },
  { dong_xe: "vf_5", gia_tri: 0 },
  { dong_xe: "vf_6", gia_tri: 0 },
  { dong_xe: "vf_7", gia_tri: 0 },
  { dong_xe: "vf_8", gia_tri: 0 },
  { dong_xe: "vf_9", gia_tri: 0 },
];

// Thông tin kỹ thuật xe
export const thong_tin_ky_thuat_xe = [
  {
    dong_xe: "vf_3",
    so_cho: 4,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0165,
    ty_le_bhvc_ca_nhan: 0.0165,
  },
  {
    dong_xe: "vf_5",
    so_cho: 5,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.0121,
  },
  {
    dong_xe: "vf_6",
    so_cho: 5,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "vf_7",
    so_cho: 5,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "vf_8",
    so_cho: 5,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "vf_9",
    so_cho: 7,
    phi_tnds_ca_nhan: 950000,
    phi_tnds_kinh_doanh: 1200000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "minio",
    so_cho: 4,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "herio",
    so_cho: 5,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "nerio",
    so_cho: 5,
    phi_tnds_ca_nhan: 530000,
    phi_tnds_kinh_doanh: 850000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "limo",
    so_cho: 7,
    phi_tnds_ca_nhan: 950000,
    phi_tnds_kinh_doanh: 1200000,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.01,
  },
  {
    dong_xe: "ec",
    so_cho: 2,
    phi_tnds_ca_nhan: 500700,
    phi_tnds_kinh_doanh: 1056300,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.015,
  },
  {
    dong_xe: "ec_nang_cao",
    so_cho: 2,
    phi_tnds_ca_nhan: 500700,
    phi_tnds_kinh_doanh: 1056300,
    ty_le_bhvc_kinh_doanh: 0.0145,
    ty_le_bhvc_ca_nhan: 0.015,
  },
];

// Danh sách xe
export const danh_sach_xe = [
  { dong_xe: "vf_3", ten_hien_thi: "VF 3" },
  { dong_xe: "vf_5", ten_hien_thi: "VF 5" },
  { dong_xe: "vf_6", ten_hien_thi: "VF 6" },
  { dong_xe: "vf_7", ten_hien_thi: "VF 7" },
  { dong_xe: "vf_8", ten_hien_thi: "VF 8" },
  { dong_xe: "vf_9", ten_hien_thi: "VF 9" },
];

// Dữ liệu giá xe với car_image_url đầy đủ
export const carPriceData = [
  { model: "VF 3", trim: "Base", exterior_color: "CE18", interior_color: "black", price_vnd: 299000000, car_image_url: "vinfast_images/vf3/Infinity Blanc.png" },
  { model: "VF 3", trim: "Base", exterior_color: "CE1M", interior_color: "black", price_vnd: 299000000, car_image_url: "vinfast_images/vf3/Crimson Red.png" },
  { model: "VF 3", trim: "Base", exterior_color: "CE1V", interior_color: "black", price_vnd: 299000000, car_image_url: "vinfast_images/vf3/Zenith Grey.png" },
  { model: "VF 3", trim: "Base", exterior_color: "181U", interior_color: "black", price_vnd: 307000000, car_image_url: "vinfast_images/vf3/Summer Yellow Body - Infinity Blanc Roof.png" },
  { model: "VF 3", trim: "Base", exterior_color: "181Y", interior_color: "black", price_vnd: 307000000, car_image_url: "vinfast_images/vf3/Sky Blue - Infinity Blanc Roof.png" },
  { model: "VF 3", trim: "Base", exterior_color: "1821", interior_color: "black", price_vnd: 307000000, car_image_url: "vinfast_images/vf3/Rose Pink Body - Infinity Blanc Roof.png" },
  { model: "VF 3", trim: "Base", exterior_color: "CE1W", interior_color: "black", price_vnd: 307000000, car_image_url: "vinfast_images/vf3/Urban Mint.png" },
  { model: "VF 5", trim: "Plus", exterior_color: "CE18", interior_color: "black", price_vnd: 529000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw15a07f69/images/VF5/GA12V/CE18.webp" },
  { model: "VF 5", trim: "Plus", exterior_color: "CE1M", interior_color: "black", price_vnd: 529000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw3ceb9d0f/images/VF5/GA12V/CE1M.webp" },
  { model: "VF 5", trim: "Plus", exterior_color: "CE1V", interior_color: "black", price_vnd: 529000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw571c8451/images/VF5/GA12V/CE1V.webp" },
  { model: "VF 5", trim: "Plus", exterior_color: "181U", interior_color: "black", price_vnd: 537000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf62f0986/images/VF5/GA12V/111U.webp" },
  { model: "VF 5", trim: "Plus", exterior_color: "181Y", interior_color: "black", price_vnd: 537000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw6a8286c7/images/VF5/GA12V/181Y.webp" },
  { model: "VF 5", trim: "Plus", exterior_color: "1821", interior_color: "black", price_vnd: 537000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwfa8dfe57/images/VF5/GA12V/CE1W.webp" },
  { model: "VF 6", trim: "Eco", exterior_color: "CE18", interior_color: "black", price_vnd: 689000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw66b28186/images/VF6/JB12V/CE18.webp" },
  { model: "VF 6", trim: "Eco", exterior_color: "CE1M", interior_color: "black", price_vnd: 689000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb1100c8f/images/VF6/JB12V/CE1M.webp" },
  { model: "VF 6", trim: "Eco", exterior_color: "CE1V", interior_color: "black", price_vnd: 689000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1a6f13c2/images/VF6/JB12V/CE1V.webp" },
  { model: "VF 6", trim: "Eco", exterior_color: "CE1U", interior_color: "black", price_vnd: 689000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf17afb72/images/VF6/JB12V/CE1W.webp" },
  { model: "VF 6", trim: "Eco", exterior_color: "181U", interior_color: "black", price_vnd: 697000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw93093fe2/images/VF6/JB12V/CE11.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE18", interior_color: "black", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw66b28186/images/VF6/JB12V/CE18.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1M", interior_color: "black", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb1100c8f/images/VF6/JB12V/CE1M.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1V", interior_color: "black", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1a6f13c2/images/VF6/JB12V/CE1V.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1U", interior_color: "black", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf17afb72/images/VF6/JB12V/CE1W.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "181U", interior_color: "black", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw93093fe2/images/VF6/JB12V/CE11.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE18", interior_color: "brown", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw66b28186/images/VF6/JB12V/CE18.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1M", interior_color: "brown", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb1100c8f/images/VF6/JB12V/CE1M.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1V", interior_color: "brown", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1a6f13c2/images/VF6/JB12V/CE1V.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1U", interior_color: "brown", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf17afb72/images/VF6/JB12V/CE1W.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "181U", interior_color: "brown", price_vnd: 757000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw93093fe2/images/VF6/JB12V/CE11.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1U", interior_color: "beige", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf17afb72/images/VF6/JB12V/CE1W.webp" },
  { model: "VF 6", trim: "Plus", exterior_color: "CE1M", interior_color: "beige", price_vnd: 749000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb1100c8f/images/VF6/JB12V/CE1M.webp" },
  { model: "VF 7", trim: "Eco", exterior_color: "CE18", interior_color: "black", price_vnd: 799000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4880850d/images/VF7/GC12V/CE18.webp" },
  { model: "VF 7", trim: "Eco", exterior_color: "CE1M", interior_color: "black", price_vnd: 799000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwe99d5f22/images/VF7/GC12V/CE1M.webp" },
  { model: "VF 7", trim: "Eco", exterior_color: "CE1V", interior_color: "black", price_vnd: 799000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4486ff28/images/VF7/GC12V/CE1V.webp" },
  { model: "VF 7", trim: "Eco", exterior_color: "CE1U", interior_color: "black", price_vnd: 799000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwebf3fab6/images/VF7/GC12V/CE1W.webp" },
  { model: "VF 7", trim: "Eco", exterior_color: "181U", interior_color: "black", price_vnd: 799000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw06ef2b07/images/VF7/GC12V/CE11.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE18", interior_color: "black", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4880850d/images/VF7/GC12V/CE18.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE1M", interior_color: "black", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwe99d5f22/images/VF7/GC12V/CE1M.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE1V", interior_color: "black", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4486ff28/images/VF7/GC12V/CE1V.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE1U", interior_color: "black", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwebf3fab6/images/VF7/GC12V/CE1W.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "181U", interior_color: "black", price_vnd: 961000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw06ef2b07/images/VF7/GC12V/CE11.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE18", interior_color: "black", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4880850d/images/VF7/GC12V/CE18.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE1M", interior_color: "black", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwe99d5f22/images/VF7/GC12V/CE1M.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE1V", interior_color: "black", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4486ff28/images/VF7/GC12V/CE1V.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE1U", interior_color: "black", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwebf3fab6/images/VF7/GC12V/CE1W.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "181U", interior_color: "black", price_vnd: 1021000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw06ef2b07/images/VF7/GC12V/CE11.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE18", interior_color: "brown", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4880850d/images/VF7/GC12V/CE18.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE1V", interior_color: "brown", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4486ff28/images/VF7/GC12V/CE1V.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "CE1U", interior_color: "brown", price_vnd: 949000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwebf3fab6/images/VF7/GC12V/CE1W.webp" },
  { model: "VF 7", trim: "Plus-1 Cầu", exterior_color: "181U", interior_color: "brown", price_vnd: 961000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw06ef2b07/images/VF7/GC12V/CE11.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE18", interior_color: "brown", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4880850d/images/VF7/GC12V/CE18.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE1V", interior_color: "brown", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4486ff28/images/VF7/GC12V/CE1V.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "CE1U", interior_color: "brown", price_vnd: 999000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwebf3fab6/images/VF7/GC12V/CE1W.webp" },
  { model: "VF 7", trim: "Plus-2 Cầu", exterior_color: "181U", interior_color: "brown", price_vnd: 1021000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw06ef2b07/images/VF7/GC12V/CE11.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "CE18", interior_color: "black", price_vnd: 1019000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwafc3ac80/images/VF8/ND31V/CE18.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "CE1M", interior_color: "black", price_vnd: 1019000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw65f5fd6d/images/VF8/ND31V/CE1M.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "CE1V", interior_color: "black", price_vnd: 1019000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "CE1U", interior_color: "black", price_vnd: 1019000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "1117", interior_color: "black", price_vnd: 1019000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "181M", interior_color: "black", price_vnd: 1031000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwa349f493/images/VF8/ND31V/171V.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "182I", interior_color: "black", price_vnd: 1031000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf71b68ce/images/VF8/ND31V/1V18.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "182K", interior_color: "black", price_vnd: 1031000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5ab1cf86/images/VF8/ND31V/2911.webp" },
  { model: "VF 8", trim: "Eco", exterior_color: "1P2K", interior_color: "black", price_vnd: 1031000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19366c63/images/VF8/ND31V/2927.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE18", interior_color: "black", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwafc3ac80/images/VF8/ND31V/CE18.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE1M", interior_color: "black", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw65f5fd6d/images/VF8/ND31V/CE1M.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE1V", interior_color: "black", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE1U", interior_color: "black", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "1117", interior_color: "black", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "181M", interior_color: "black", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwa349f493/images/VF8/ND31V/171V.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "182I", interior_color: "black", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf71b68ce/images/VF8/ND31V/1V18.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "182K", interior_color: "black", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5ab1cf86/images/VF8/ND31V/2911.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "1P2K", interior_color: "black", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19366c63/images/VF8/ND31V/2927.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE18", interior_color: "brown", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwafc3ac80/images/VF8/ND31V/CE18.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE1M", interior_color: "brown", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw65f5fd6d/images/VF8/ND31V/CE1M.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE1V", interior_color: "brown", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "CE1U", interior_color: "brown", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "1117", interior_color: "brown", price_vnd: 1199000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19321e63/images/VF8/ND31V/CE11.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "181M", interior_color: "brown", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwa349f493/images/VF8/ND31V/171V.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "182I", interior_color: "brown", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf71b68ce/images/VF8/ND31V/1V18.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "182K", interior_color: "brown", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5ab1cf86/images/VF8/ND31V/2911.webp" },
  { model: "VF 8", trim: "Plus", exterior_color: "1P2K", interior_color: "brown", price_vnd: 1211000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw19366c63/images/VF8/ND31V/2927.webp" },
  { model: "VF 9", trim: "Eco", exterior_color: "CE1M", interior_color: "black", price_vnd: 1499000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1cc6342e/images/VF9/NE3NV/CE1M.webp" },
  { model: "VF 9", trim: "Eco", exterior_color: "CE1V", interior_color: "black", price_vnd: 1499000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw24a20061/images/VF9/NE3NV/CE1V.webp" },
  { model: "VF 9", trim: "Eco", exterior_color: "CE1U", interior_color: "black", price_vnd: 1499000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9386fa1c/images/VF9/NE3NV/CE17.webp" },
  { model: "VF 9", trim: "Eco", exterior_color: "181U", interior_color: "black", price_vnd: 1499000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Eco", exterior_color: "1117", interior_color: "black", price_vnd: 1511000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Eco", exterior_color: "1U11", interior_color: "black", price_vnd: 1511000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dweca0851a/images/VF9/NE3NV/CE22.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE18", interior_color: "black", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd1845889/images/VF9/NE3NV/CE18.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE1M", interior_color: "black", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1cc6342e/images/VF9/NE3NV/CE1M.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE1V", interior_color: "black", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw24a20061/images/VF9/NE3NV/CE1V.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE1U", interior_color: "black", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9386fa1c/images/VF9/NE3NV/CE17.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "181U", interior_color: "black", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "1117", interior_color: "black", price_vnd: 1711000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "1U11", interior_color: "black", price_vnd: 1711000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dweca0851a/images/VF9/NE3NV/CE22.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE18", interior_color: "brown", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd1845889/images/VF9/NE3NV/CE18.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE1M", interior_color: "brown", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1cc6342e/images/VF9/NE3NV/CE1M.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE1V", interior_color: "brown", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw24a20061/images/VF9/NE3NV/CE1V.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "CE1U", interior_color: "brown", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9386fa1c/images/VF9/NE3NV/CE17.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "181U", interior_color: "brown", price_vnd: 1699000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "1117", interior_color: "brown", price_vnd: 1711000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus", exterior_color: "1U11", interior_color: "brown", price_vnd: 1711000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dweca0851a/images/VF9/NE3NV/CE22.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE18", interior_color: "black", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd1845889/images/VF9/NE3NV/CE18.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE1M", interior_color: "black", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1cc6342e/images/VF9/NE3NV/CE1M.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE1V", interior_color: "black", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw24a20061/images/VF9/NE3NV/CE1V.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE1U", interior_color: "black", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9386fa1c/images/VF9/NE3NV/CE17.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "181U", interior_color: "black", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "1117", interior_color: "black", price_vnd: 1743000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "1U11", interior_color: "black", price_vnd: 1743000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dweca0851a/images/VF9/NE3NV/CE22.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE18", interior_color: "brown", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd1845889/images/VF9/NE3NV/CE18.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE1M", interior_color: "brown", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw1cc6342e/images/VF9/NE3NV/CE1M.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE1V", interior_color: "brown", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw24a20061/images/VF9/NE3NV/CE1V.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "CE1U", interior_color: "brown", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9386fa1c/images/VF9/NE3NV/CE17.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "181U", interior_color: "brown", price_vnd: 1731000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "1117", interior_color: "brown", price_vnd: 1743000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "1U11", interior_color: "brown", price_vnd: 1743000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dweca0851a/images/VF9/NE3NV/CE22.webp" },
  { model: "VF 9", trim: "Plus-6 Chỗ", exterior_color: "1117", interior_color: "beige", price_vnd: 1743000000, car_image_url: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f28c7cd/images/VF9/NE3NV/CE11.webp" },
];

// Màu ngoại thất với icon URLs từ shop.vinfastauto.com
export const uniqueNgoaiThatColors = [
  { code: "CE18", name: "Trắng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw301d5100/images/deposit/exterior/CE18.webp" },
  { code: "CE1M", name: "Đỏ", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw2082ad33/images/deposit/exterior/CE1M.webp" },
  { code: "CE1V", name: "Xám", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb6055fb1/images/deposit/exterior/CE1V.webp" },
  { code: "181U", name: "Xanh Lá Nhạt", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw501ea74b/images/deposit/exterior/181U.webp" },
  { code: "181Y", name: "Xanh Nóc Trắng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd21e2648/images/deposit/exterior/181Y.webp" },
  { code: "1821", name: "Vàng Nóc Trắng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw27ac3178/images/deposit/exterior/1821.webp" },
  { code: "CE1W", name: "Hồng Nóc Trắng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw7b58dad2/images/deposit/exterior/CE1W.webp" },
  { code: "CE1U", name: "Đen", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwc9b013f0/images/deposit/exterior/CE1U.webp" },
  { code: "CE11", name: "Nâu", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf37040d4/images/deposit/exterior/CE11.webp" },
  { code: "CE17", name: "Be", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw28c4ad7c/images/deposit/exterior/CE17.webp" },
  { code: "1117", name: "Xanh Lá Đậm", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwee4df7b2/images/deposit/exterior/1117.webp" },
  { code: "181M", name: "Đỏ nóc Đồng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd44dfddd/images/deposit/exterior/181M.webp" },
  { code: "182I", name: "Đen Nóc Đồng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw45a6f569/images/deposit/exterior/182I.webp" },
  { code: "182K", name: "Trắng Nóc Xám", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4aaf29c5/images/deposit/exterior/182K.webp" },
  { code: "1P2K", name: "Xám Nóc Bạc", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwe33018bd/images/deposit/exterior/1P2K.webp" },
  { code: "1U11", name: "Bạc", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9f8344b4/images/deposit/exterior/1U11.webp" },
  { code: "1U2I", name: "Đen Nóc Vàng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw3ffea806/images/deposit/exterior/1U2I.webp" },
  { code: "CE2I", name: "Đỏ Nóc Trắng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0833b90f/images/deposit/exterior/CE2I.webp" },
  { code: "CE2K", name: "Bạc Nóc Đen", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwc356da37/images/deposit/exterior/CE2K.webp" },
  { code: "111U", name: "Xanh Lá Cây", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwe1117c5e/images/deposit/exterior/111U.webp" },
  { code: "171V", name: "Hồng Tím", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwec479253/images/deposit/exterior/171V.webp" },
  { code: "1V18", name: "Hồng Nóc Xanh", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dweeb8f089/images/deposit/exterior/1V18.webp" },
  { code: "2911", name: "Xanh Lá Cây Nóc Trắng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb5ed246f/images/deposit/exterior/2911.webp" },
  { code: "2927", name: "Xanh Lá Cây Nóc Vàng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwe1cc46f0/images/deposit/exterior/2927.webp" },
  { code: "CE22", name: "Vàng", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw67b9e4f6/images/deposit/exterior/CE22.webp" }
];

// Màu nội thất với icon URLs từ shop.vinfastauto.com
export const uniqueNoiThatColors = [
  { code: 'black', name: "Đen", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9a153245/images/deposit/interior/CI11.webp" },
  { code: 'brown', name: "Nâu", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw65203801/images/deposit/interior/CI12.webp" },
  { code: 'beige', name: "Be", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf0048a4b/images/deposit/interior/CI13.webp" },
  { code: 'gray', name: "Xám", icon: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw33eb76b4/images/deposit/interior/CI1M.webp" }
];

// Helper functions
export const getDataByKey = (array, key, value) => {
  return array.find((item) => item[key] === value) || null;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
};

