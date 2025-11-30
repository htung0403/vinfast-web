import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase/config";
import { X, Edit, ArrowLeft, Image } from "lucide-react";
import { toast } from "react-toastify";
import { carPriceData, uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';
import { uploadImageToCloudinary } from '../config/cloudinary';

export default function EditHopDongDaXuatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for employees list
  const [employees, setEmployees] = useState([]);

  // List of issue places (nơi cấp)
  const issuePlaces = [
    "Bộ Công An",
    "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"
  ];

  // State for image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [depositImage, setDepositImage] = useState("");
  const [counterpartImage, setCounterpartImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImageType, setUploadingImageType] = useState(null); // 'deposit' or 'counterpart'
  const hasOpenedImageModalRef = useRef(false); // Track if we've already opened the modal

  // Load employees from Firebase
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesRef = ref(database, 'employees');
        const snapshot = await get(employeesRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeesList = Object.values(data)
            .map((emp) => ({
              id: emp.id || '',
              TVBH: emp.TVBH || emp['TVBH'] || '',
            }))
            .filter((emp) => emp.TVBH) // Only include employees with TVBH
            .sort((a, b) => a.TVBH.localeCompare(b.TVBH)); // Sort by name
          
          setEmployees(employeesList);
        }
      } catch (err) {
        console.error('Error loading employees:', err);
      }
    };

    loadEmployees();
  }, []);

  const [contract, setContract] = useState({
    id: "",
    stt: "",
    ngayXhd: "",
    tvbh: "",
    vso: "",
    tenKh: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
    cccd: "",
    ngayCap: "",
    noiCap: "",
    dongXe: "",
    phienBan: "",
    ngoaiThat: "",
    noiThat: "",
    giaNiemYet: "",
    giaGiam: "",
    giaHopDong: "",
    soKhung: "",
    soMay: "",
    tinhTrang: "",
    nganHang: "",
    quaTang: "",
    quaTangKhac: "",
    giamGia: "",
  });

  // Load contract data
  useEffect(() => {
    const loadContract = async () => {
      try {
        const contractsRef = ref(database, "exportedContracts");
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        // Find contract by firebaseKey (id from params)
        const contractData = data[id];
        if (!contractData) {
          toast.error("Không tìm thấy hợp đồng!");
          navigate("/hop-dong-da-xuat");
          return;
        }

        // Helper to map color name to code for dropdown compatibility
        const mapExteriorColor = (colorValue) => {
          if (!colorValue) return "";
          // Check if it's already a code
          const foundByCode = uniqueNgoaiThatColors.find(c => c.code === colorValue);
          if (foundByCode) return colorValue;
          // Check if it's a name
          const foundByName = uniqueNgoaiThatColors.find(
            c => c.name.toLowerCase() === colorValue.toLowerCase()
          );
          return foundByName ? foundByName.code : colorValue;
        };

        const mapInteriorColor = (colorValue) => {
          if (!colorValue) return "";
          // Check if it's already a code
          const foundByCode = uniqueNoiThatColors.find(c => c.code === colorValue);
          if (foundByCode) return colorValue;
          // Check if it's a name
          const foundByName = uniqueNoiThatColors.find(
            c => c.name.toLowerCase() === colorValue.toLowerCase()
          );
          return foundByName ? foundByName.code : colorValue;
        };

        // Map contract data
        const mapped = {
          id: contractData.id || "",
          stt: contractData.stt || "",
          ngayXhd: contractData.ngayXhd || contractData["ngày xhd"] || contractData.exportDate || "",
          tvbh: contractData.tvbh || contractData.TVBH || "",
          vso: contractData.vso || contractData.VSO || "",
          tenKh: contractData.tenKh || contractData["Tên Kh"] || contractData.customerName || "",
          soDienThoai: contractData.soDienThoai || contractData["Số Điện Thoại"] || contractData.phone || "",
          email: contractData.email || contractData.Email || "",
          diaChi: contractData.diaChi || contractData["Địa Chỉ"] || contractData.address || "",
          cccd: contractData.cccd || contractData.CCCD || "",
          ngayCap: contractData.ngayCap || contractData["Ngày Cấp"] || contractData.issueDate || "",
          noiCap: contractData.noiCap || contractData["Nơi Cấp"] || contractData.issuePlace || "",
          dongXe: contractData.dongXe || contractData["Dòng xe"] || contractData.model || "",
          phienBan: contractData.phienBan || contractData["Phiên Bản"] || contractData.variant || "",
          ngoaiThat: mapExteriorColor(contractData.ngoaiThat || contractData["Ngoại Thất"] || contractData.exterior || ""),
          noiThat: mapInteriorColor(contractData.noiThat || contractData["Nội Thất"] || contractData.interior || ""),
          giaNiemYet: contractData.giaNiemYet || contractData["Giá Niêm Yết"] || contractData.listPrice || "",
          giaGiam: contractData.giaGiam || contractData["Giá Giảm"] || contractData.discountPrice || "",
          giaHopDong: contractData.giaHopDong || contractData["Giá Hợp Đồng"] || contractData.contractPrice || "",
          soKhung: contractData.soKhung || contractData["Số Khung"] || contractData.chassisNumber || "",
          soMay: contractData.soMay || contractData["Số Máy"] || contractData.engineNumber || "",
          tinhTrang: contractData.tinhTrang || contractData["Tình Trạng"] || contractData.status || "",
          nganHang: contractData.nganHang || contractData["ngân hàng"] || contractData.bank || "",
          quaTang: contractData.quaTang || contractData["Quà tặng"] || contractData["quà tặng"] || "",
          quaTangKhac: contractData.quaTangKhac || contractData["Quà tặng khác"] || contractData["quà tặng khác"] || "",
          giamGia: contractData.giamGia || contractData["Giảm giá"] || contractData["giảm giá"] || "",
        };

        setContract(mapped);
        
        // Load images if they exist
        setDepositImage(contractData.depositImage || contractData["Ảnh chụp hình đặt cọc"] || "");
        setCounterpartImage(contractData.counterpartImage || contractData["Ảnh chụp đối ứng"] || "");
        setLoading(false);
      } catch (err) {
        console.error("Error loading contract:", err);
        toast.error("Lỗi khi tải dữ liệu hợp đồng");
        setLoading(false);
        navigate("/hop-dong-da-xuat");
      }
    };

    if (id) {
      loadContract();
    }
  }, [id, navigate]);

  // Reset ref when id changes (new contract loaded)
  useEffect(() => {
    hasOpenedImageModalRef.current = false;
  }, [id]);

  // Auto-open image modal if navigated from list page with flag (only once)
  useEffect(() => {
    if (location.state?.openImageModal && !loading && !hasOpenedImageModalRef.current) {
      hasOpenedImageModalRef.current = true;
      setIsImageModalOpen(true);
      // Clear the state to prevent reopening on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, loading, navigate, location.pathname]);

  // Get unique car models from carPriceData
  const carModels = useMemo(() => {
    const uniqueModels = new Set();
    carPriceData.forEach((car) => {
      if (car.model) uniqueModels.add(car.model);
    });
    return Array.from(uniqueModels).sort();
  }, []);

  // Get available trims (variants) for selected model
  const availableTrims = useMemo(() => {
    if (!contract.dongXe) return [];
    const trims = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.dongXe && car.trim) {
        trims.add(car.trim);
      }
    });
    return Array.from(trims).sort();
  }, [contract.dongXe]);

  // Get available exterior colors for selected model and trim
  const availableExteriorColors = useMemo(() => {
    if (!contract.dongXe || !contract.phienBan) return [];
    const colorCodes = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.dongXe && car.trim === contract.phienBan && car.exterior_color) {
        colorCodes.add(car.exterior_color);
      }
    });
    return uniqueNgoaiThatColors.filter((color) => colorCodes.has(color.code));
  }, [contract.dongXe, contract.phienBan]);

  // Get available interior colors for selected model and trim
  const availableInteriorColors = useMemo(() => {
    if (!contract.dongXe || !contract.phienBan) return [];
    const colorCodes = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.dongXe && car.trim === contract.phienBan && car.interior_color) {
        colorCodes.add(car.interior_color);
      }
    });
    return uniqueNoiThatColors.filter((color) => colorCodes.has(color.code));
  }, [contract.dongXe, contract.phienBan]);

  // Helper function to map color code to name (for display)
  const mapColorCodeToName = (colorCode, isExterior = true) => {
    if (!colorCode) return '';
    const colorList = isExterior ? uniqueNgoaiThatColors : uniqueNoiThatColors;
    const found = colorList.find(
      (color) => color.code === colorCode
    );
    return found ? found.name : colorCode; // Return name if found, otherwise return original value
  };

  // Format currency for display (add thousand separators)
  const formatCurrency = (value) => {
    if (!value) return '';
    // Remove all non-digit characters
    const numericValue = String(value).replace(/\D/g, '');
    if (!numericValue) return '';
    // Format with thousand separators
    return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
  };

  // Parse currency from formatted string (remove thousand separators)
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove all non-digit characters
    return String(value).replace(/\D/g, '');
  };

  // Handle form input change
  const handleChange = (field, value) => {
    setContract((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when model changes
      if (field === 'dongXe') {
        updated.phienBan = '';
        updated.ngoaiThat = '';
        updated.noiThat = '';
      }

      // Reset dependent fields when variant changes
      if (field === 'phienBan') {
        updated.ngoaiThat = '';
        updated.noiThat = '';
      }

      // Reset dependent fields when exterior changes
      if (field === 'ngoaiThat') {
        updated.noiThat = '';
      }

      return updated;
    });
  };

  // Handle currency input change (format on display, store raw number)
  const handleCurrencyChange = (field, value) => {
    // Parse the input to get raw number
    const rawValue = parseCurrency(value);
    // Update state with raw number
    handleChange(field, rawValue);
  };

  // Handle image file upload to Cloudinary
  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Check file size (max 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 10MB");
      return;
    }

    try {
      setUploadingImage(true);
      setUploadingImageType(imageType);
      
      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      
      // Update the corresponding image state
      if (imageType === 'deposit') {
        setDepositImage(imageUrl);
      } else if (imageType === 'counterpart') {
        setCounterpartImage(imageUrl);
      }
      
      toast.success("Upload ảnh thành công!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
      setUploadingImageType(null);
      // Reset file input
      e.target.value = '';
    }
  };

  // Open image modal
  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // Save images
  const handleSaveImages = async () => {
    try {
      const contractRef = ref(database, `exportedContracts/${id}`);
      await update(contractRef, {
        "Ảnh chụp hình đặt cọc": depositImage || "",
        "Ảnh chụp đối ứng": counterpartImage || "",
        depositImage: depositImage || "",
        counterpartImage: counterpartImage || "",
      });
      toast.success("Lưu ảnh thành công!");
      closeImageModal();
    } catch (err) {
      console.error("Error saving images:", err);
      toast.error("Lỗi khi lưu ảnh");
    }
  };

  // Save contract
  const handleSave = async () => {
    try {
      setSaving(true);

      const contractRef = ref(database, `exportedContracts/${id}`);
      const safeValue = (val) => val !== undefined && val !== null ? val : "";

      await update(contractRef, {
        id: safeValue(contract.id),
        stt: safeValue(contract.stt),
        ngayXhd: safeValue(contract.ngayXhd),
        tvbh: safeValue(contract.tvbh),
        vso: safeValue(contract.vso),
        "Tên Kh": safeValue(contract.tenKh),
        "Số Điện Thoại": safeValue(contract.soDienThoai),
        Email: safeValue(contract.email),
        "Địa Chỉ": safeValue(contract.diaChi),
        CCCD: safeValue(contract.cccd),
        "Ngày Cấp": safeValue(contract.ngayCap),
        "Nơi Cấp": safeValue(contract.noiCap),
        "Dòng xe": safeValue(contract.dongXe),
        "Phiên Bản": safeValue(contract.phienBan),
        "Ngoại Thất": safeValue(contract.ngoaiThat),
        "Nội Thất": safeValue(contract.noiThat),
        "Giá Niêm Yết": safeValue(contract.giaNiemYet),
        "Giá Giảm": safeValue(contract.giaGiam),
        "Giá Hợp Đồng": safeValue(contract.giaHopDong),
        "Số Khung": safeValue(contract.soKhung),
        "Số Máy": safeValue(contract.soMay),
        "Tình Trạng": safeValue(contract.tinhTrang),
        "ngân hàng": safeValue(contract.nganHang),
        "quà tặng theo xe": safeValue(contract.quaTang),
        "Quà tặng": safeValue(contract.quaTang),
        "Quà tặng khác": safeValue(contract.quaTangKhac),
        "quà tặng khác": safeValue(contract.quaTangKhac),
        "giảm giá theo xe": safeValue(contract.giamGia),
        "Giảm giá": safeValue(contract.giamGia),
        quaTang: safeValue(contract.quaTang),
        quaTangKhac: safeValue(contract.quaTangKhac),
        giamGia: safeValue(contract.giamGia),
        "Ảnh chụp hình đặt cọc": safeValue(depositImage),
        "Ảnh chụp đối ứng": safeValue(counterpartImage),
        depositImage: safeValue(depositImage),
        counterpartImage: safeValue(counterpartImage),
      });

      toast.success("Cập nhật hợp đồng thành công!");
      navigate("/hop-dong-da-xuat");
    } catch (err) {
      console.error("Error updating contract:", err);
      toast.error("Lỗi khi cập nhật hợp đồng");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-secondary-600">Đang tải dữ liệu hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-4 sm:px-6 py-4 sm:py-5 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between relative">
            <button
              onClick={() => navigate("/hop-dong-da-xuat")}
              className="text-white hover:text-gray-200 transition-colors flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg hover:bg-white/10 z-10"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <h2 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white absolute left-1/2 transform -translate-x-1/2 text-center px-2 truncate max-w-[calc(100%-8rem)] sm:max-w-none">
              Chỉnh sửa hợp đồng đã xuất
            </h2>
            <div className="w-16 sm:w-24 md:w-32"></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          {/* Form Sections */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Section 1: Thông tin cơ bản */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Export Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngày XHD
                  </label>
                  <input
                    type="date"
                    value={(contract.ngayXhd || "").slice(0, 10)}
                    onChange={(e) => handleChange("ngayXhd", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                  />
                </div>

                {/* TVBH */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    TVBH
                  </label>
                  <select
                    value={contract.tvbh || ""}
                    onChange={(e) => handleChange("tvbh", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white"
                  >
                    <option value="">Chọn TVBH</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.TVBH}>
                        {emp.TVBH}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.tvbh && !employees.find(e => e.TVBH === contract.tvbh) && (
                      <option value={contract.tvbh}>
                        {contract.tvbh} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                {/* VSO */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    VSO
                  </label>
                  <input
                    type="text"
                    value={contract.vso || ""}
                    onChange={(e) => handleChange("vso", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="VSO"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Thông tin khách hàng */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {/* Customer Name */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contract.tenKh || ""}
                    onChange={(e) => handleChange("tenKh", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Tên khách hàng"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contract.soDienThoai || ""}
                    onChange={(e) => handleChange("soDienThoai", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Số điện thoại"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contract.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Email"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Địa chỉ lấy theo VNeid
                  </label>
                  <input
                    type="text"
                    value={contract.diaChi || ""}
                    onChange={(e) => handleChange("diaChi", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Địa chỉ lấy theo VNeid"
                  />
                </div>

                {/* CCCD */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    value={contract.cccd || ""}
                    onChange={(e) => handleChange("cccd", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="CCCD"
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngày cấp
                  </label>
                  <input
                    type="date"
                    value={(contract.ngayCap || "").slice(0, 10)}
                    onChange={(e) => handleChange("ngayCap", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                  />
                </div>

                {/* Issue Place */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nơi cấp
                  </label>
                  <select
                    value={contract.noiCap || ""}
                    onChange={(e) => handleChange("noiCap", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white"
                  >
                    <option value="">Chọn nơi cấp</option>
                    {issuePlaces.map((place) => (
                      <option key={place} value={place}>
                        {place}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.noiCap && !issuePlaces.includes(contract.noiCap) && (
                      <option value={contract.noiCap}>
                        {contract.noiCap} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Thông tin xe */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                Thông tin xe
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {/* Model (Dòng xe) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Dòng xe
                  </label>
                  <select
                    value={contract.dongXe || ""}
                    onChange={(e) => handleChange("dongXe", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white"
                  >
                    <option value="">Chọn dòng xe</option>
                    {carModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.dongXe && !carModels.includes(contract.dongXe) && (
                      <option value={contract.dongXe}>
                        {contract.dongXe} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                {/* Variant */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phiên Bản
                  </label>
                  <select
                    value={contract.phienBan || ""}
                    onChange={(e) => handleChange("phienBan", e.target.value)}
                    disabled={!contract.dongXe}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn phiên bản</option>
                    {availableTrims.map((trim) => (
                      <option key={trim} value={trim}>
                        {trim}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.phienBan && !availableTrims.includes(contract.phienBan) && (
                      <option value={contract.phienBan}>
                        {contract.phienBan} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                {/* Exterior */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngoại Thất
                  </label>
                  <select
                    value={contract.ngoaiThat || ""}
                    onChange={(e) => handleChange("ngoaiThat", e.target.value)}
                    disabled={!contract.dongXe || !contract.phienBan}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn màu ngoại thất</option>
                    {availableExteriorColors.map((color) => (
                      <option key={color.code} value={color.code}>
                        {color.name}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.ngoaiThat && !availableExteriorColors.find(c => c.code === contract.ngoaiThat) && (
                      <option value={contract.ngoaiThat}>
                        {mapColorCodeToName(contract.ngoaiThat, true)} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                {/* Interior */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nội Thất
                  </label>
                  <select
                    value={contract.noiThat || ""}
                    onChange={(e) => handleChange("noiThat", e.target.value)}
                    disabled={!contract.dongXe || !contract.phienBan}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn màu nội thất</option>
                    {availableInteriorColors.map((color) => (
                      <option key={color.code} value={color.code}>
                        {color.name}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.noiThat && !availableInteriorColors.find(c => c.code === contract.noiThat) && (
                      <option value={contract.noiThat}>
                        {mapColorCodeToName(contract.noiThat, false)} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                {/* Chassis Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số Khung
                  </label>
                  <input
                    type="text"
                    value={contract.soKhung || ""}
                    onChange={(e) => handleChange("soKhung", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Số khung"
                  />
                </div>

                {/* Engine Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số Máy
                  </label>
                  <input
                    type="text"
                    value={contract.soMay || ""}
                    onChange={(e) => handleChange("soMay", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Số máy"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Thông tin thanh toán */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                Thông tin thanh toán
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {/* List Price */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Giá Niêm Yết
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giaNiemYet)}
                    onChange={(e) => handleCurrencyChange("giaNiemYet", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Nhập giá niêm yết"
                  />
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Giá Giảm
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giaGiam)}
                    onChange={(e) => handleCurrencyChange("giaGiam", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Nhập giá giảm"
                  />
                </div>

                {/* Contract Price */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Giá Hợp Đồng
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giaHopDong)}
                    onChange={(e) => handleCurrencyChange("giaHopDong", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Nhập giá hợp đồng"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tình Trạng
                  </label>
                  <input
                    type="text"
                    value={contract.tinhTrang || ""}
                    onChange={(e) => handleChange("tinhTrang", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Tình trạng"
                  />
                </div>

                {/* Bank */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngân hàng
                  </label>
                  <input
                    type="text"
                    value={contract.nganHang || ""}
                    onChange={(e) => handleChange("nganHang", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Ngân hàng"
                  />
                </div>

                {/* Quà tặng theo xe */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Quà tặng theo xe
                  </label>
                  <input
                    type="text"
                    value={contract.quaTang || ""}
                    onChange={(e) => handleChange("quaTang", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Áo trùm, bao tay lái, sáp thơm, bình chữa cháy."
                  />
                </div>

                {/* Quà tặng khác */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Quà tặng khác
                  </label>
                  <input
                    type="text"
                    value={contract.quaTangKhac || ""}
                    onChange={(e) => handleChange("quaTangKhac", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Bảo Hiểm Vật Chất Kinh Doanh, Cam, Film, Sàn"
                  />
                </div>

                {/* Bên A đồng ý giảm cho Bên B số tiền */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Bên A đồng ý giảm cho Bên B số tiền
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giamGia)}
                    onChange={(e) => handleCurrencyChange("giamGia", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Nhập số tiền giảm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required fields note */}
          <div className="px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-3 sm:pb-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              <span className="text-red-500 font-semibold">*</span> Các trường bắt buộc
            </p>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4 border-t border-gray-200">
            <button
              onClick={() => navigate("/hop-dong-da-xuat")}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
              aria-label="Hủy"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              aria-label="Lưu thay đổi"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[calc(100vh-2rem)] overflow-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">
                  Quản lý ảnh
                </h3>
                <button
                  onClick={closeImageModal}
                  className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Deposit Image */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Ảnh chụp hình đặt cọc
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={depositImage}
                    onChange={(e) => setDepositImage(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Nhập URL ảnh hoặc upload file"
                  />
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg transition-colors text-xs sm:text-sm text-center ${
                      uploadingImage && uploadingImageType === 'deposit' 
                        ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:bg-gray-50'
                    }`}>
                      <span className="text-gray-700">
                        {uploadingImage && uploadingImageType === 'deposit' 
                          ? 'Đang upload...' 
                          : 'Chọn file ảnh'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'deposit')}
                        className="hidden"
                        disabled={uploadingImage && uploadingImageType === 'deposit'}
                      />
                    </label>
                    {depositImage && !(uploadingImage && uploadingImageType === 'deposit') && (
                      <button
                        onClick={() => setDepositImage("")}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  {depositImage && (
                    <div className="mt-2">
                      <img
                        src={depositImage}
                        alt="Ảnh chụp hình đặt cọc"
                        className="max-w-full h-auto max-h-48 sm:max-h-64 rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          toast.error("Không thể tải ảnh. Vui lòng kiểm tra lại URL hoặc file.");
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Counterpart Image */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Ảnh chụp đối ứng
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={counterpartImage}
                    onChange={(e) => setCounterpartImage(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm"
                    placeholder="Nhập URL ảnh hoặc upload file"
                  />
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg transition-colors text-xs sm:text-sm text-center ${
                      uploadingImage && uploadingImageType === 'counterpart' 
                        ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:bg-gray-50'
                    }`}>
                      <span className="text-gray-700">
                        {uploadingImage && uploadingImageType === 'counterpart' 
                          ? 'Đang upload...' 
                          : 'Chọn file ảnh'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'counterpart')}
                        className="hidden"
                        disabled={uploadingImage && uploadingImageType === 'counterpart'}
                      />
                    </label>
                    {counterpartImage && !(uploadingImage && uploadingImageType === 'counterpart') && (
                      <button
                        onClick={() => setCounterpartImage("")}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  {counterpartImage && (
                    <div className="mt-2">
                      <img
                        src={counterpartImage}
                        alt="Ảnh chụp đối ứng"
                        className="max-w-full h-auto max-h-48 sm:max-h-64 rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          toast.error("Không thể tải ảnh. Vui lòng kiểm tra lại URL hoặc file.");
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-4 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={closeImageModal}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
                aria-label="Hủy"
              >
                <X className="w-4 h-4" />
                <span>Hủy</span>
              </button>
              <button
                onClick={handleSaveImages}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
                aria-label="Lưu ảnh"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Lưu ảnh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

