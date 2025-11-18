import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase/config";
import { X, Edit, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { carPriceData, uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';
import { provinces } from '../data/provincesData';

export default function EditHopDongDaXuatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
        };

        setContract(mapped);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600">Đang tải dữ liệu hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-5 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between relative">
            <button
              onClick={() => navigate("/hop-dong-da-xuat")}
              className="text-white hover:text-gray-200 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <h2 className="text-2xl lg:text-3xl font-bold text-white absolute left-1/2 transform -translate-x-1/2">
              Chỉnh sửa hợp đồng đã xuất
            </h2>
            <div className="w-24 sm:w-32"></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          {/* Form Sections */}
          <div className="p-6 lg:p-8 space-y-8">
            {/* Section 1: Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Export Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày XHD
                  </label>
                  <input
                    type="date"
                    value={(contract.ngayXhd || "").slice(0, 10)}
                    onChange={(e) => handleChange("ngayXhd", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                  />
                </div>

                {/* TVBH */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TVBH
                  </label>
                  <select
                    value={contract.tvbh || ""}
                    onChange={(e) => handleChange("tvbh", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VSO
                  </label>
                  <input
                    type="text"
                    value={contract.vso || ""}
                    onChange={(e) => handleChange("vso", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="VSO"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Thông tin khách hàng */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Customer Name */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contract.tenKh || ""}
                    onChange={(e) => handleChange("tenKh", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Tên khách hàng"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contract.soDienThoai || ""}
                    onChange={(e) => handleChange("soDienThoai", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Số điện thoại"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contract.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Email"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={contract.diaChi || ""}
                    onChange={(e) => handleChange("diaChi", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Địa chỉ"
                  />
                </div>

                {/* CCCD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    value={contract.cccd || ""}
                    onChange={(e) => handleChange("cccd", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="CCCD"
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày cấp
                  </label>
                  <input
                    type="date"
                    value={(contract.ngayCap || "").slice(0, 10)}
                    onChange={(e) => handleChange("ngayCap", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                  />
                </div>

                {/* Issue Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nơi cấp
                  </label>
                  <select
                    value={contract.noiCap || ""}
                    onChange={(e) => handleChange("noiCap", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white"
                  >
                    <option value="">Chọn nơi cấp</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing contracts) */}
                    {contract.noiCap && !provinces.includes(contract.noiCap) && (
                      <option value={contract.noiCap}>
                        {contract.noiCap} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Thông tin xe */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Thông tin xe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Model (Dòng xe) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dòng xe
                  </label>
                  <select
                    value={contract.dongXe || ""}
                    onChange={(e) => handleChange("dongXe", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên Bản
                  </label>
                  <select
                    value={contract.phienBan || ""}
                    onChange={(e) => handleChange("phienBan", e.target.value)}
                    disabled={!contract.dongXe}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngoại Thất
                  </label>
                  <select
                    value={contract.ngoaiThat || ""}
                    onChange={(e) => handleChange("ngoaiThat", e.target.value)}
                    disabled={!contract.dongXe || !contract.phienBan}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội Thất
                  </label>
                  <select
                    value={contract.noiThat || ""}
                    onChange={(e) => handleChange("noiThat", e.target.value)}
                    disabled={!contract.dongXe || !contract.phienBan}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Khung
                  </label>
                  <input
                    type="text"
                    value={contract.soKhung || ""}
                    onChange={(e) => handleChange("soKhung", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Số khung"
                  />
                </div>

                {/* Engine Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Máy
                  </label>
                  <input
                    type="text"
                    value={contract.soMay || ""}
                    onChange={(e) => handleChange("soMay", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Số máy"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Thông tin thanh toán */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Thông tin thanh toán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* List Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá Niêm Yết
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giaNiemYet)}
                    onChange={(e) => handleCurrencyChange("giaNiemYet", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Nhập giá niêm yết"
                  />
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá Giảm
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giaGiam)}
                    onChange={(e) => handleCurrencyChange("giaGiam", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Nhập giá giảm"
                  />
                </div>

                {/* Contract Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá Hợp Đồng
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(contract.giaHopDong)}
                    onChange={(e) => handleCurrencyChange("giaHopDong", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Nhập giá hợp đồng"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình Trạng
                  </label>
                  <input
                    type="text"
                    value={contract.tinhTrang || ""}
                    onChange={(e) => handleChange("tinhTrang", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    placeholder="Tình trạng"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required fields note */}
          <div className="px-6 lg:px-8 pt-4 pb-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="text-red-500 font-semibold">*</span> Các trường bắt buộc
            </p>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-gray-200">
            <button
              onClick={() => navigate("/hop-dong-da-xuat")}
              className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              aria-label="Hủy"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Lưu thay đổi"
            >
              <Edit className="w-5 h-5" />
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

