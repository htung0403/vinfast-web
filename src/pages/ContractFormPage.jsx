import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ref, update, push, get, set, remove } from 'firebase/database';
import { database } from '../firebase/config';
import { X, Check, ArrowLeft, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { carPriceData, uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';
import { getAllBranches, getBranchByShowroomName } from '../data/branchData';
import { loadPromotionsFromFirebase, defaultPromotions } from '../data/promotionsData';

export default function ContractFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const contractData = location.state?.contract || null;
  const mode = location.state?.mode || (contractData ? 'edit' : 'create'); // 'create', 'edit', or 'details'
  const isEditMode = mode === 'edit';
  const isDetailsMode = mode === 'details';
  const isCreateMode = mode === 'create';

  // Get all branches for showroom dropdown
  const branches = getAllBranches();

  // List of issue places (nơi cấp)
  const issuePlaces = [
    "Bộ Công An",
    "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"
  ];

  // State for employees list
  const [employees, setEmployees] = useState([]);

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

  // List of available promotions - loaded from Firebase
  const [availablePromotions, setAvailablePromotions] = useState(defaultPromotions);

  // Load promotions from Firebase on component mount
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const promotionsList = await loadPromotionsFromFirebase();
        if (promotionsList && promotionsList.length > 0) {
          // Use promotions from Firebase, extract names
          const promotionNames = promotionsList.map(p => p.name || '').filter(Boolean);
          setAvailablePromotions(promotionNames);
        }
        // If Firebase is empty, use defaultPromotions (already set in useState)
      } catch (err) {
        console.error('Error loading promotions:', err);
        // Keep defaultPromotions if loading fails
      }
    };
    loadPromotions();
  }, []);

  const [contract, setContract] = useState({
    id: null,
    createdAt: new Date().toISOString().split("T")[0],
    tvbh: "",
    showroom: "",
    vso: "",
    customerName: "",
    phone: "",
    email: "",
    address: "",
    cccd: "",
    issueDate: "",
    issuePlace: "",
    model: "",
    variant: "",
    exterior: "",
    interior: "",
    contractPrice: "",
    deposit: "",
    payment: "",
    bank: "",
    uuDai: [],
    quaTang: "",
    quaTangKhac: "",
    giamGia: "",
    status: "mới",
  });

  // State for dropdown visibility
  const [isUuDaiDropdownOpen, setIsUuDaiDropdownOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState('down'); // 'down' or 'up'

  useEffect(() => {
    if (contractData) {
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

      // Helper to map showroom name to branch full name
      const mapShowroom = (showroomValue) => {
        if (!showroomValue) return "";
        // Try to find branch by showroom name
        const foundBranch = getBranchByShowroomName(showroomValue);
        if (foundBranch) {
          return foundBranch.name; // Use full name for form
        }
        // If not found, check if it matches any branch shortName or name
        const exactMatch = branches.find(
          (branch) =>
            branch.shortName.toLowerCase() === showroomValue.toLowerCase() ||
            branch.name.toLowerCase() === showroomValue.toLowerCase()
        );
        return exactMatch ? exactMatch.name : showroomValue; // Return original if no match
      };

      // Helper to parse uuDai (can be array, string, or comma-separated string)
      const parseUuDai = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          // Try to parse as JSON array first
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {
            // Not JSON, treat as comma-separated string or single value
            if (value.includes(',')) {
              return value.split(',').map(v => v.trim()).filter(Boolean);
            }
            // Return as single item array if it's a single string value
            return [value];
          }
        }
        return [];
      };

      // Map contract data for editing
      setContract({
        id: contractData.id || null,
        createdAt: contractData.createdAt || contractData.createdDate || new Date().toISOString().split("T")[0],
        tvbh: contractData.tvbh || contractData.TVBH || "",
        showroom: mapShowroom(contractData.showroom || ""),
        vso: contractData.vso || "",
        customerName: contractData.customerName || contractData["Tên KH"] || "",
        phone: contractData.phone || "",
        email: contractData.email || "",
        address: contractData.address || "",
        cccd: contractData.cccd || "",
        issueDate: contractData.issueDate || contractData.ngayCap || "",
        issuePlace: contractData.issuePlace || contractData.noiCap || "",
        model: contractData.model || contractData.dongXe || "",
        variant: contractData.variant || contractData.phienBan || "",
        exterior: mapExteriorColor(contractData.exterior || contractData.ngoaiThat || ""),
        interior: mapInteriorColor(contractData.interior || contractData.noiThat || ""),
        contractPrice: contractData.contractPrice || contractData.giaHD || "",
        deposit: contractData.deposit || contractData.soTienCoc || "",
        payment: contractData.payment || contractData.thanhToan || "",
        bank: contractData.bank || contractData.nganHang || "",
        uuDai: parseUuDai(contractData.uuDai || contractData["Ưu đãi"] || contractData["ưu đãi"] || ""),
        quaTang: contractData.quaTang || contractData["Quà tặng"] || contractData["quà tặng"] || "",
        quaTangKhac: contractData.quaTangKhac || contractData["Quà tặng khác"] || contractData["quà tặng khác"] || "",
        giamGia: contractData.giamGia || contractData["Giảm giá"] || contractData["giảm giá"] || "",
        status: contractData.status || contractData.trangThai || "mới",
      });
    }
  }, [contractData]);

  // Close dropdown when clicking outside
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUuDaiDropdownOpen(false);
      }
    };

    if (isUuDaiDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Calculate dropdown direction based on available space
      if (dropdownButtonRef.current) {
        const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const estimatedDropdownHeight = 240; // max-h-60 = 240px
        
        // Show dropdown above if not enough space below but enough space above
        if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
          setDropdownDirection('up');
        } else {
          setDropdownDirection('down');
        }
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUuDaiDropdownOpen]);

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
    if (!contract.model) return [];
    const trims = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.model && car.trim) {
        trims.add(car.trim);
      }
    });
    return Array.from(trims).sort();
  }, [contract.model]);

  // Get available exterior colors for selected model and trim
  const availableExteriorColors = useMemo(() => {
    if (!contract.model || !contract.variant) return [];
    const colorCodes = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.model && car.trim === contract.variant && car.exterior_color) {
        colorCodes.add(car.exterior_color);
      }
    });
    return uniqueNgoaiThatColors.filter((color) => colorCodes.has(color.code));
  }, [contract.model, contract.variant]);

  // Get available interior colors for selected model and trim
  const availableInteriorColors = useMemo(() => {
    if (!contract.model || !contract.variant) return [];
    const colorCodes = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.model && car.trim === contract.variant && car.interior_color) {
        colorCodes.add(car.interior_color);
      }
    });
    return uniqueNoiThatColors.filter((color) => colorCodes.has(color.code));
  }, [contract.model, contract.variant]);

  // Helper function to map color name to code
  const mapColorNameToCode = (colorName, isExterior = true) => {
    if (!colorName) return '';
    const colorList = isExterior ? uniqueNgoaiThatColors : uniqueNoiThatColors;
    const found = colorList.find(
      (color) => color.name.toLowerCase() === colorName.toLowerCase()
    );
    return found ? found.code : colorName; // Return code if found, otherwise return original value
  };

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

  const handleInputChange = (field, value) => {
    setContract((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when model changes (but keep contractPrice)
      if (field === 'model') {
        updated.variant = '';
        updated.exterior = '';
        updated.interior = '';
      }

      // Reset dependent fields when variant changes (but keep contractPrice)
      if (field === 'variant') {
        updated.exterior = '';
        updated.interior = '';
      }

      // Reset dependent fields when exterior changes (but keep contractPrice)
      if (field === 'exterior') {
        updated.interior = '';
      }

      return updated;
    });
  };

  // Handle currency input change (format on display, store raw number)
  const handleCurrencyChange = (field, value) => {
    // Parse the input to get raw number
    const rawValue = parseCurrency(value);
    // Update state with raw number
    handleInputChange(field, rawValue);
  };

  // Handle promotion checkbox toggle
  const handlePromotionToggle = (promotion) => {
    setContract((prev) => {
      const currentPromotions = prev.uuDai || [];
      const isSelected = currentPromotions.includes(promotion);
      const updatedPromotions = isSelected
        ? currentPromotions.filter((p) => p !== promotion)
        : [...currentPromotions, promotion];
      return {
        ...prev,
        uuDai: updatedPromotions,
      };
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!contract.customerName || !contract.phone || !contract.email) {
      toast.error("Vui lòng điền tên khách hàng, số điện thoại và email!");
      return;
    }

    try {
      const safeValue = (val) => val !== undefined && val !== null ? val : "";

      if (isEditMode && contractData.firebaseKey) {
        // Get old status to check if we need to sync with exportedContracts
        const oldStatus = contractData.status || contractData.trangThai || "";
        const newStatus = safeValue(contract.status) || "mới";
        const oldStatusLower = oldStatus.toLowerCase();
        const newStatusLower = newStatus.toLowerCase();

        // Update existing contract
        const contractRef = ref(database, `contracts/${contractData.firebaseKey}`);
        await update(contractRef, {
          id: contract.id || "",
          createdDate: contract.createdAt || contract.createdDate || "",
          tvbh: safeValue(contract.tvbh),
          showroom: safeValue(contract.showroom),
          vso: safeValue(contract.vso),
          customerName: safeValue(contract.customerName),
          phone: safeValue(contract.phone),
          email: safeValue(contract.email),
          address: safeValue(contract.address),
          cccd: safeValue(contract.cccd),
          ngayCap: safeValue(contract.issueDate),
          noiCap: safeValue(contract.issuePlace),
          dongXe: safeValue(contract.model),
          phienBan: safeValue(contract.variant),
          ngoaiThat: safeValue(contract.exterior),
          noiThat: safeValue(contract.interior),
          giaHD: safeValue(contract.contractPrice),
          soTienCoc: safeValue(contract.deposit),
          thanhToan: safeValue(contract.payment),
          nganHang: safeValue(contract.bank),
          uuDai: Array.isArray(contract.uuDai) ? contract.uuDai : [],
          quaTang: safeValue(contract.quaTang),
          quaTangKhac: safeValue(contract.quaTangKhac),
          giamGia: safeValue(contract.giamGia),
          trangThai: newStatus,
        });

        // Sync with exportedContracts based on status change
        const exportKey = contractData.firebaseKey;
        const exportedContractRef = ref(database, `exportedContracts/${exportKey}`);

        // If changing from non-"xuất" to "xuất": add to exportedContracts
        if (oldStatusLower !== "xuất" && newStatusLower === "xuất") {
          // Get current date/time in format YYYY-MM-DD
          const now = new Date();
          const ngayXhd = now.toISOString().split("T")[0];

          // Map contract data to exported format (matching HopDongDaXuat format)
          const exportedData = {
            id: safeValue(contract.id),
            stt: safeValue(contractData.stt),
            "ngày xhd": ngayXhd, // Export date - now
            tvbh: safeValue(contract.tvbh),
            VSO: safeValue(contract.vso),
            "Tên Kh": safeValue(contract.customerName),
            "Số Điện Thoại": safeValue(contract.phone),
            Email: safeValue(contract.email || ""),
            "Địa Chỉ": safeValue(contract.address || ""),
            CCCD: safeValue(contract.cccd),
            "Ngày Cấp": safeValue(contract.issueDate),
            "Nơi Cấp": safeValue(contract.issuePlace),
            "Dòng xe": safeValue(contract.model),
            "Phiên Bản": safeValue(contract.variant),
            "Ngoại Thất": safeValue(contract.exterior),
            "Nội Thất": safeValue(contract.interior),
            "Giá Niêm Yết": safeValue(contract.contractPrice),
            "Giá Giảm": safeValue(contract.deposit),
            "Giá Hợp Đồng": safeValue(contract.contractPrice),
            "Số Khung": safeValue(contractData.soKhung || contractData.chassisNumber || contractData["Số Khung"] || ""),
            "Số Máy": safeValue(contractData.soMay || contractData.engineNumber || contractData["Số Máy"] || ""),
            "Tình Trạng": safeValue(contractData.tinhTrangXe || contractData.vehicleStatus || contractData["Tình Trạng Xe"] || ""),
            "ngân hàng": safeValue(contract.bank || ""),
            "ưu đãi": (() => {
              const uuDaiValue = contract.uuDai || "";
              if (Array.isArray(uuDaiValue)) {
                return uuDaiValue.length > 0 ? uuDaiValue.join(", ") : "";
              }
              return safeValue(uuDaiValue);
            })(),
            "Quà tặng": safeValue(contract.quaTang),
            "Quà tặng khác": safeValue(contract.quaTangKhac),
            "Giảm giá": safeValue(contract.giamGia),
            quaTang: safeValue(contract.quaTang),
            quaTangKhac: safeValue(contract.quaTangKhac),
            giamGia: safeValue(contract.giamGia),
          };

          await set(exportedContractRef, exportedData);
        }
        // If changing from "xuất" to non-"xuất": remove from exportedContracts
        else if (oldStatusLower === "xuất" && newStatusLower !== "xuất") {
          await remove(exportedContractRef);
        }

        toast.success("Cập nhật hợp đồng thành công!");
      } else {
        // Create new contract
        const id = `local-${Date.now()}`;
        const contractsRef = ref(database, "contracts");
        const newRef = await push(contractsRef, {
          id: id || "",
          createdDate: contract.createdAt || "",
          tvbh: safeValue(contract.tvbh),
          showroom: safeValue(contract.showroom),
          vso: safeValue(contract.vso),
          customerName: safeValue(contract.customerName),
          phone: safeValue(contract.phone),
          email: safeValue(contract.email),
          address: safeValue(contract.address),
          cccd: safeValue(contract.cccd),
          ngayCap: safeValue(contract.issueDate),
          noiCap: safeValue(contract.issuePlace),
          dongXe: safeValue(contract.model),
          phienBan: safeValue(contract.variant),
          ngoaiThat: safeValue(contract.exterior),
          noiThat: safeValue(contract.interior),
          giaHD: safeValue(contract.contractPrice),
          soTienCoc: safeValue(contract.deposit),
          thanhToan: safeValue(contract.payment),
          nganHang: safeValue(contract.bank),
          uuDai: Array.isArray(contract.uuDai) ? contract.uuDai : [],
          quaTang: safeValue(contract.quaTang),
          quaTangKhac: safeValue(contract.quaTangKhac),
          giamGia: safeValue(contract.giamGia),
          trangThai: safeValue(contract.status) || "mới",
        });

        // If new contract status is "xuất", also add to exportedContracts
        const newStatus = safeValue(contract.status) || "mới";
        if (newStatus.toLowerCase() === "xuất") {
          const exportKey = newRef.key;
          if (exportKey) {
            // Get current date/time in format YYYY-MM-DD
            const now = new Date();
            const ngayXhd = now.toISOString().split("T")[0];

            // Map contract data to exported format
            const exportedData = {
              id: id || "",
              stt: "",
              "ngày xhd": ngayXhd,
              tvbh: safeValue(contract.tvbh),
              VSO: safeValue(contract.vso),
              "Tên Kh": safeValue(contract.customerName),
              "Số Điện Thoại": safeValue(contract.phone),
              Email: safeValue(contract.email || ""),
              "Địa Chỉ": safeValue(contract.address || ""),
              CCCD: safeValue(contract.cccd),
              "Ngày Cấp": safeValue(contract.issueDate),
              "Nơi Cấp": safeValue(contract.issuePlace),
              "Dòng xe": safeValue(contract.model),
              "Phiên Bản": safeValue(contract.variant),
              "Ngoại Thất": safeValue(contract.exterior),
              "Nội Thất": safeValue(contract.interior),
              "Giá Niêm Yết": safeValue(contract.contractPrice),
              "Giá Giảm": safeValue(contract.deposit),
              "Giá Hợp Đồng": safeValue(contract.contractPrice),
              "Số Khung": "",
              "Số Máy": "",
              "Tình Trạng": "",
              "ngân hàng": safeValue(contract.bank || ""),
              "ưu đãi": (() => {
                const uuDaiValue = contract.uuDai || "";
                if (Array.isArray(uuDaiValue)) {
                  return uuDaiValue.length > 0 ? uuDaiValue.join(", ") : "";
                }
                return safeValue(uuDaiValue);
              })(),
              "Quà tặng": safeValue(contract.quaTang),
              "Quà tặng khác": safeValue(contract.quaTangKhac),
              "Giảm giá": safeValue(contract.giamGia),
              quaTang: safeValue(contract.quaTang),
              quaTangKhac: safeValue(contract.quaTangKhac),
              giamGia: safeValue(contract.giamGia),
            };

            const exportedContractRef = ref(database, `exportedContracts/${exportKey}`);
            await set(exportedContractRef, exportedData);
          }
        }

        toast.success("Thêm hợp đồng thành công!");
      }

      // Navigate back to contracts page with reload flag
      setTimeout(() => {
        navigate("/hop-dong", { state: { reload: true } });
      }, 500);
    } catch (err) {
      console.error("Error saving contract:", err);
      toast.error("Đã xảy ra lỗi khi lưu hợp đồng: " + err.message);
    }
  };

  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-4 sm:px-6 py-4 sm:py-5 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between relative">
          <button
              onClick={() => navigate(isDetailsMode ? "/dashboard" : "/hop-dong")}
              className="text-white hover:text-gray-200 transition-colors flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg hover:bg-white/10 z-10"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <h2 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white absolute left-1/2 transform -translate-x-1/2 px-2 text-center">
              {isDetailsMode 
                ? "Chi tiết hợp đồng" 
                : isEditMode 
                ? "Chỉnh sửa thông tin hợp đồng" 
                : "Thêm hợp đồng mới"}
            </h2>
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
                {/* Created Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngày tạo
                  </label>
                  <input
                    type="date"
                    value={(contract.createdAt || "").slice(0, 10)}
                    onChange={(e) => handleInputChange("createdAt", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* TVBH */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    TVBH
                  </label>
                  <select
                    value={contract.tvbh || ""}
                    onChange={(e) => handleInputChange("tvbh", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                {/* Showroom */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Showroom
                  </label>
                  <select
                    value={contract.showroom || ""}
                    onChange={(e) => handleInputChange("showroom", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn showroom</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.showroom && !branches.find(b => b.name === contract.showroom) && (
                      <option value={contract.showroom}>
                        {contract.showroom} (giá trị hiện tại)
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
                    onChange={(e) => handleInputChange("vso", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    value={contract.customerName || ""}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    value={contract.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Số điện thoại"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contract.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Email"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={contract.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Địa chỉ"
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
                    onChange={(e) => handleInputChange("cccd", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    value={(contract.issueDate || "").slice(0, 10)}
                    onChange={(e) => handleInputChange("issueDate", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Issue Place */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nơi cấp
                  </label>
                  <select
                    value={contract.issuePlace || ""}
                    onChange={(e) => handleInputChange("issuePlace", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn nơi cấp</option>
                    {issuePlaces.map((place) => (
                      <option key={place} value={place}>
                        {place}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.issuePlace && !issuePlaces.includes(contract.issuePlace) && (
                      <option value={contract.issuePlace}>
                        {contract.issuePlace} (giá trị hiện tại)
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
                    value={contract.model || ""}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn dòng xe</option>
                    {carModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.model && !carModels.includes(contract.model) && (
                      <option value={contract.model}>
                        {contract.model} (giá trị hiện tại)
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
                    value={contract.variant || ""}
                    onChange={(e) => handleInputChange("variant", e.target.value)}
                    disabled={isDetailsMode || !contract.model}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn phiên bản</option>
                    {availableTrims.map((trim) => (
                      <option key={trim} value={trim}>
                        {trim}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.variant && !availableTrims.includes(contract.variant) && (
                      <option value={contract.variant}>
                        {contract.variant} (giá trị hiện tại)
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
                    value={contract.exterior || ""}
                    onChange={(e) => handleInputChange("exterior", e.target.value)}
                    disabled={isDetailsMode || !contract.model || !contract.variant}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn màu ngoại thất</option>
                    {availableExteriorColors.map((color) => (
                      <option key={color.code} value={color.code}>
                        {color.name}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.exterior && !availableExteriorColors.find(c => c.code === contract.exterior) && (
                      <option value={contract.exterior}>
                        {mapColorCodeToName(contract.exterior, true)} (giá trị hiện tại)
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
                    value={contract.interior || ""}
                    onChange={(e) => handleInputChange("interior", e.target.value)}
                    disabled={isDetailsMode || !contract.model || !contract.variant}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn màu nội thất</option>
                    {availableInteriorColors.map((color) => (
                      <option key={color.code} value={color.code}>
                        {color.name}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.interior && !availableInteriorColors.find(c => c.code === contract.interior) && (
                      <option value={contract.interior}>
                        {mapColorCodeToName(contract.interior, false)} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Thông tin thanh toán */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                Thông tin thanh toán
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">

                {/* Contract Price */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Giá hợp đồng
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.contractPrice)}
                    onChange={(e) => handleCurrencyChange("contractPrice", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nhập giá hợp đồng"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số tiền cọc
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.deposit)}
                    onChange={(e) => handleCurrencyChange("deposit", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nhập số tiền cọc"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phương thức thanh toán
                  </label>
                  <input
                    type="text"
                    value={contract.payment || ""}
                    onChange={(e) => handleInputChange("payment", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Phương thức thanh toán"
                  />
                </div>

                {/* Bank */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngân hàng
                  </label>
                  <input
                    type="text"
                    value={contract.bank || ""}
                    onChange={(e) => handleInputChange("bank", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nhập tên ngân hàng"
                  />
                </div>

                {/* Uu Dai - Dropdown with checkboxes */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ưu đãi
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      ref={dropdownButtonRef}
                      type="button"
                      onClick={() => !isDetailsMode && setIsUuDaiDropdownOpen(!isUuDaiDropdownOpen)}
                      disabled={isDetailsMode}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <span className="text-left flex-1 truncate">
                        {contract.uuDai && contract.uuDai.length > 0
                          ? `${contract.uuDai.length} ưu đãi đã chọn`
                          : "Chọn ưu đãi"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                          isUuDaiDropdownOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isUuDaiDropdownOpen && !isDetailsMode && (
                      <div
                        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                          dropdownDirection === 'up'
                            ? 'bottom-full mb-1'
                            : 'top-full mt-1'
                        }`}
                      >
                        {availablePromotions.map((promotion) => {
                          const isSelected = contract.uuDai && contract.uuDai.includes(promotion);
                          return (
                            <label
                              key={promotion}
                              className="flex items-start px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePromotionToggle(promotion)}
                                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 flex-1 break-words">
                                {promotion}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Display selected promotions */}
                  {contract.uuDai && contract.uuDai.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {contract.uuDai.map((promotion) => (
                        <div
                          key={promotion}
                          className="text-xs text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-200 break-words"
                        >
                          {promotion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quà tặng theo xe */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Quà tặng theo xe
                  </label>
                  <input
                    type="text"
                    value={contract.quaTang || ""}
                    onChange={(e) => handleInputChange("quaTang", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    onChange={(e) => handleInputChange("quaTangKhac", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nhập số tiền giảm"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={contract.status || ""}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    disabled={isDetailsMode}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-xs sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="mới">mới</option>
                    <option value="hoàn">hoàn</option>
                    <option value="hủy">hủy</option>
                    <option value="xuất">xuất</option>
                    <option value="chuyển tên">chuyển tên</option>
                  </select>
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
              onClick={() => navigate(isDetailsMode ? "/dashboard" : "/hop-dong")}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
              aria-label={isDetailsMode ? "Quay lại" : "Hủy"}
            >
              <X className="w-4 h-4" />
              <span>{isDetailsMode ? "Quay lại" : "Hủy"}</span>
            </button>
            {!isDetailsMode && (
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
                aria-label={isEditMode ? "Lưu thay đổi" : "Thêm hợp đồng"}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{isEditMode ? "Lưu thay đổi" : "Thêm hợp đồng"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

