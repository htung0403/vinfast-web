/**
 * Dữ liệu các chi nhánh VinFast Đông Sài Gòn
 * Sử dụng trong các giấy tờ: Giấy Đề Nghị Thanh Toán, Giấy Xác Nhận, v.v.
 */

export const branches = [
  {
    id: 1,
    name: "VinFast Đông Sài Gòn-Thủ Đức",
    shortName: "Thủ Đức",
    address: "391 Võ Nguyên Giáp, An Phú, Thành Phố Thủ Đức, Thành Phố Hồ Chí Minh",
    taxCode: "0316801817",
    bankName: "VP Bank",
    bankAccount: "275582875",
    bankBranch: "Chi Nhánh Sài Gòn",
    representativeName: "Nguyễn Thành Trai",
    position: "Tổng Giám Đốc",
  },
  {
    id: 2,
    name: "VinFast Đông Sài Gòn-Chi Nhánh Trường Chinh",
    shortName: "Trường Chinh",
    address: "682A Trường Chinh, Phường 15, Quận Tân Binh, Thành Phố Hồ Chí Minh",
    taxCode: "0316801817-002",
    bankName: "VP Bank",
    bankAccount: "288999",
    bankBranch: "Chi Nhánh Đông Sài Gòn",
    representativeName: "Nguyễn Thành Trai",
    position: "Tổng Giám Đốc",
  },
  {
    id: 3,
    name: "VinFast Đông Sài Gòn- Chi Nhánh Âu Cơ",
    shortName: "Âu Cơ",
    address: "616 Âu Cơ, Phường 10, Quận Tân Bình, Thành Phố Hồ Chí Minh",
    taxCode: "0316801817-003",
    bankName: "VP Bank",
    bankAccount: "390009078",
    bankBranch: "Chi Nhánh Sài Gòn",
    representativeName: "Nguyễn Thành Trai",
    position: "Tổng Giám Đốc",
  },
];

/**
 * Tìm chi nhánh theo ID
 * @param {number} id - ID của chi nhánh
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchById = (id) => {
  return branches.find((branch) => branch.id === id) || null;
};

/**
 * Tìm chi nhánh theo tên (không phân biệt hoa thường)
 * @param {string} name - Tên chi nhánh (có thể là tên đầy đủ hoặc tên ngắn)
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchByName = (name) => {
  if (!name) return null;
  const searchName = name.toLowerCase().trim();
  return (
    branches.find(
      (branch) =>
        branch.name.toLowerCase().includes(searchName) ||
        branch.shortName.toLowerCase().includes(searchName)
    ) || null
  );
};

/**
 * Tìm chi nhánh theo tên showroom (hỗ trợ các tên thường dùng)
 * @param {string} showroomName - Tên showroom (ví dụ: "Chi Nhánh Trường Chinh", "TRƯỜNG CHINH", "Trường Chinh")
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchByShowroomName = (showroomName) => {
  if (!showroomName) return null;
  const searchName = showroomName.toLowerCase().trim();
  
  // Mapping các tên thường dùng
  const nameMapping = {
    "thủ đức": 1,
    "thu duc": 1,
    "trường chinh": 2,
    "truong chinh": 2,
    "trường chính": 2,
    "truong chinh": 2,
    "chi nhánh trường chinh": 2,
    "chi nhanh truong chinh": 2,
    "âu cơ": 3,
    "au co": 3,
    "chi nhánh âu cơ": 3,
    "chi nhanh au co": 3,
  };

  // Kiểm tra mapping trước
  const mappedId = nameMapping[searchName];
  if (mappedId) {
    return getBranchById(mappedId);
  }

  // Tìm theo tên
  return getBranchByName(showroomName);
};

/**
 * Lấy chi nhánh mặc định (Chi Nhánh Trường Chinh)
 * @returns {Object} Thông tin chi nhánh mặc định
 */
export const getDefaultBranch = () => {
  return getBranchById(2); // Chi Nhánh Trường Chinh
};

/**
 * Lấy danh sách tất cả chi nhánh
 * @returns {Array} Danh sách các chi nhánh
 */
export const getAllBranches = () => {
  return branches;
};

export default {
  branches,
  getBranchById,
  getBranchByName,
  getBranchByShowroomName,
  getDefaultBranch,
  getAllBranches,
};

