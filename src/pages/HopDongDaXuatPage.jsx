import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import { ref, get, remove } from "firebase/database";
import { database } from "../firebase/config";
import { ArrowLeft, X, Trash2, Edit, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';

export default function HopDongDaXuatPage() {
  const navigate = useNavigate();
  const [userTeam, setUserTeam] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userEmail, setUserEmail] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    products: [], // will hold unique "Dòng xe" values
    markets: [], // repurposed to hold status values
    searchText: "",
  });

  const [availableFilters, setAvailableFilters] = useState({
    products: [], // unique models (dongXe)
    markets: [], // status values
  });

  const [quickSelectValue, setQuickSelectValue] = useState("");

  // States from HopDongDaXuat component
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printContract, setPrintContract] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const team = localStorage.getItem("userTeam") || "";
    const role = localStorage.getItem("userRole") || "user";
    const email = localStorage.getItem("userEmail") || "";
    setUserTeam(team);
    setUserRole(role);
    setUserEmail(email);

    // populate filters by scanning exported contracts in Firebase
    const fetchFiltersFromDB = async () => {
      try {
        // Try exportedContracts first
        let contractsRef = ref(database, "exportedContracts");
        let snapshot = await get(contractsRef);
        let data = snapshot.exists() ? snapshot.val() : {};

        // If no exportedContracts, try to filter from contracts with status "xuất"
        if (!snapshot.exists() || Object.keys(data).length === 0) {
          contractsRef = ref(database, "contracts");
          snapshot = await get(contractsRef);
          const allContracts = snapshot.exists() ? snapshot.val() : {};

          data = {};
          Object.entries(allContracts || {}).forEach(([key, contract]) => {
            const status = contract.trangThai || contract.status || "";
            if (
              status.toLowerCase() === "xuất" ||
              status.toLowerCase() === "đã xuất"
            ) {
              data[key] = contract;
            }
          });
        }

        const contracts = Object.values(data || {});

        const models = [
          ...new Set(
            contracts
              .map((c) => c.dongXe || c["Dòng xe"] || c.model)
              .filter(Boolean)
          ),
        ].sort();
        const statuses = [
          ...new Set(
            contracts
              .map(
                (c) => c.tinhTrang || c["Tình Trạng"] || c.status || c.trangThai
              )
              .filter(Boolean)
          ),
        ].sort();

        setAvailableFilters((prev) => ({
          ...prev,
          products: models,
          markets: statuses,
        }));
      } catch (err) {
        console.error(
          "Error loading filter options from Firebase exported contracts",
          err
        );
      }
    };

    fetchFiltersFromDB();
  }, []);

  // Helper function to map color code to name
  const getColorName = (colorCode, isExterior = true) => {
    if (!colorCode) return colorCode || "-";
    const colorList = isExterior ? uniqueNgoaiThatColors : uniqueNoiThatColors;
    const found = colorList.find(
      (color) => color.code === colorCode || color.name.toLowerCase() === colorCode.toLowerCase()
    );
    return found ? found.name : colorCode; // Return name if found, otherwise return original value
  };

  // Fetch exported contracts from Firebase
  useEffect(() => {
    const mapContract = (c) => ({
      id: c.id || "",
      stt: c.stt || "",
      ngayXhd: c["ngày xhd"] || "",
      tvbh: c.tvbh || "",
      vso: c.VSO || "",
      tenKh: c["Tên Kh"] || "",
      soDienThoai: c["Số Điện Thoại"] || "",
      email: c.Email || "",
      diaChi: c["Địa Chỉ"] || "",
      cccd: c.CCCD || "",
      ngayCap: c["Ngày Cấp"] || "",
      noiCap: c["Nơi Cấp"] || "",
      dongXe: c["Dòng xe"] || "",
      phienBan: c["Phiên Bản"] || "",
      ngoaiThat: c["Ngoại Thất"] || "",
      noiThat: c["Nội Thất"] || "",
      giaNiemYet: c["Giá Niêm Yết"] || "",
      giaGiam: c["Giá Giảm"] || "",
      giaHopDong: c["Giá Hợp Đồng"] || "",
      soKhung: c["Số Khung"] || "",
      soMay: c["Số Máy"] || "",
      tinhTrang: c["Tình Trạng"] || "",
    });

    const loadFromFirebase = async () => {
      try {
        // Only load from exportedContracts path
        const contractsRef = ref(database, "exportedContracts");
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const mapped = Object.entries(data || {}).map(([key, c], idx) => {
          const base = mapContract(c || {});
          return { ...base, firebaseKey: key };
        });

        setLoading(false);
        setContracts(mapped);
        setFilteredContracts(mapped);
      } catch (err) {
        console.error("Error loading exported contracts from Firebase:", err);
        toast.error("Lỗi khi tải dữ liệu hợp đồng đã xuất từ Firebase");
        setLoading(false);
        setContracts([]);
        setFilteredContracts([]);
      }
    };

    loadFromFirebase();
  }, [userRole]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...contracts];

    // Apply product/model filter (Dòng xe)
    if (filters.products && filters.products.length > 0) {
      filtered = filtered.filter((contract) =>
        filters.products.includes(contract.dongXe)
      );
    }

    // Apply status filter
    if (filters.markets && filters.markets.length > 0) {
      filtered = filtered.filter((contract) =>
        filters.markets.includes(contract.tinhTrang)
      );
    }

    // Apply search filter: search across all fields
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter((contract) => {
        return Object.values(contract).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "object") {
            try {
              return JSON.stringify(val).toLowerCase().includes(searchLower);
            } catch (e) {
              return false;
            }
          }
          return String(val).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply date range filter (ngayXhd - export date)
    try {
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      if (end && filters.endDate && filters.endDate.length === 10) {
        end.setHours(23, 59, 59, 999);
      }

      if (start || end) {
        filtered = filtered.filter((contract) => {
          const raw = contract.ngayXhd;
          if (!raw) return false;
          const d = new Date(raw);
          if (isNaN(d)) return false;
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });
      }
    } catch (e) {
      console.warn("Error parsing date filters:", e);
    }

    setFilteredContracts(filtered);
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [
    contracts,
    userRole,
    filters.searchText,
    filters.products,
    filters.markets,
    filters.startDate,
    filters.endDate,
  ]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (Array.isArray(value)) return { ...prev, [filterType]: value };
      if (Array.isArray(prev[filterType])) {
        const newValues = prev[filterType].includes(value)
          ? prev[filterType].filter((v) => v !== value)
          : [...prev[filterType], value];
        return { ...prev, [filterType]: newValues };
      }
      return { ...prev, [filterType]: value };
    });
  };

  const handleQuickDateSelect = (e) => {
    const value = e.target.value;
    setQuickSelectValue(value);
    if (!value) return;

    const today = new Date();

    // helper: get start of week (Monday) and end of week (Sunday)
    const getWeekRange = (refDate) => {
      const d = new Date(refDate);
      const day = d.getDay(); // 0 (Sun) - 6 (Sat)
      // calculate Monday of current week
      const mondayDiff = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + mondayDiff);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday, end: sunday };
    };

    let startDate = null;
    let endDate = null;

    if (value === "today") {
      startDate = new Date(today);
      endDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (value === "yesterday") {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      startDate = new Date(d);
      endDate = new Date(d);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (value === "this-week") {
      const range = getWeekRange(today);
      startDate = range.start;
      endDate = range.end;
    } else if (value === "last-week") {
      const range = getWeekRange(today);
      range.start.setDate(range.start.getDate() - 7);
      range.end.setDate(range.end.getDate() - 7);
      startDate = range.start;
      endDate = range.end;
    } else if (value === "next-week") {
      const range = getWeekRange(today);
      range.start.setDate(range.start.getDate() + 7);
      range.end.setDate(range.end.getDate() + 7);
      startDate = range.start;
      endDate = range.end;
    } else if (value.startsWith("month-")) {
      // month-N (1-12) -> use current year
      const parts = value.split("-");
      const m = parseInt(parts[1], 10);
      if (!Number.isNaN(m) && m >= 1 && m <= 12) {
        const year = today.getFullYear();
        startDate = new Date(year, m - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(year, m, 0);
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (value.startsWith("q")) {
      // quarters q1..q4
      const q = parseInt(value.slice(1), 10);
      if (!Number.isNaN(q) && q >= 1 && q <= 4) {
        const year = today.getFullYear();
        const startMonth = (q - 1) * 3; // 0-based
        startDate = new Date(year, startMonth, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(year, startMonth + 3, 0);
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (value === "this-month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    setFilters((prev) => ({
      ...prev,
      startDate: startDate ? startDate.toISOString().split("T")[0] : "",
      endDate: endDate ? endDate.toISOString().split("T")[0] : "",
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      products: [],
      markets: [],
      searchText: "",
    });
    setQuickSelectValue("");
  };

  const hasActiveFilters = () => {
    return (
      filters.searchText ||
      filters.startDate ||
      filters.endDate ||
      (filters.products && filters.products.length > 0) ||
      (filters.markets && filters.markets.length > 0)
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "-";
    const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Check if contract has missing required fields
  const hasMissingData = (contract) => {
    if (!contract) return true;
    
    // Helper function to check if a value is missing
    const isEmpty = (value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === "" || trimmed === "-" || trimmed === "null" || trimmed === "undefined";
      }
      if (typeof value === 'number') {
        return isNaN(value);
      }
      return false;
    };
    
    // Check required fields (using mapped field names)
    const checks = [
      // Tên KH
      isEmpty(contract.tenKh),
      // Số điện thoại
      isEmpty(contract.soDienThoai),
      // Email
      isEmpty(contract.email),
      // Địa chỉ
      isEmpty(contract.diaChi),
      // CCCD
      isEmpty(contract.cccd),
      // Dòng xe
      isEmpty(contract.dongXe),
      // Giá hợp đồng
      isEmpty(contract.giaHopDong),
      // Ngày XHD
      isEmpty(contract.ngayXhd),
      // Số khung
      isEmpty(contract.soKhung),
      // Số máy
      isEmpty(contract.soMay),
    ];
    
    return checks.some(check => check);
  };

  // Open delete confirmation modal
  const openDeleteConfirm = (contract) => {
    setDeletingContract(contract);
  };

  // Close delete confirmation modal
  const closeDeleteConfirm = () => {
    setDeletingContract(null);
  };

  // Delete contract from Firebase
  const handleDeleteContract = async () => {
    if (!deletingContract) return;

    try {
      let keyToRemove = deletingContract.firebaseKey;
      if (!keyToRemove) {
        const found = contracts.find((c) => c.id === deletingContract.id);
        if (found && found.firebaseKey) keyToRemove = found.firebaseKey;
      }

      if (keyToRemove) {
        const contractRef = ref(database, `exportedContracts/${keyToRemove}`);
        await remove(contractRef);
        setContracts((prev) =>
          prev.filter((contract) => contract.firebaseKey !== keyToRemove)
        );
        setFilteredContracts((prev) =>
          prev.filter((contract) => contract.firebaseKey !== keyToRemove)
        );
      }

      closeDeleteConfirm();
      toast.success("Xóa hợp đồng thành công!");
    } catch (err) {
      console.error("Error deleting contract:", err);
      toast.error("Lỗi khi xóa hợp đồng");
    }
  };

  return (
    <div className="mx-auto px-8 py-8 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <FilterPanel
          activeTab={"hopdongdaxuat"}
          filters={filters}
          handleFilterChange={handleFilterChange}
          quickSelectValue={quickSelectValue}
          handleQuickDateSelect={handleQuickDateSelect}
          availableFilters={availableFilters}
          userRole={userRole}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
        />

        <div className="lg:col-span-5">
          {/* Header with Back Button and Title */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/menu")}
              className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <h2 className="text-2xl font-bold text-primary-700">Hợp đồng đã xuất</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-secondary-600">Đang tải dữ liệu hợp đồng đã xuất...</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Statistics */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-secondary-600">
                  Tổng số:{" "}
                  <span className="font-semibold text-primary-600">
                    {filteredContracts.length}
                  </span>{" "}
                  hợp đồng
                  {filteredContracts.length > itemsPerPage && (
                    <span className="ml-2">
                      | Trang {currentPage}/{totalPages}
                      <span className="ml-2 text-sm">
                        (Hiển thị {startIndex + 1}-
                        {Math.min(endIndex, filteredContracts.length)})
                      </span>
                    </span>
                  )}
                </p>
              </div>

              {/* Contracts Table */}
              {filteredContracts.length === 0 ? (
                <div className="text-center py-8 bg-secondary-50 rounded-lg">
                  <p className="text-secondary-600">Không có dữ liệu hợp đồng đã xuất</p>
                </div>
              ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                  <table className="min-w-full divide-y divide-secondary-100">
                    <thead className="bg-primary-400">
                      <tr>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          STT
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Ngày XHD
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          TVBH
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          VSO
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Tên KH
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Số Điện Thoại
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Email
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Địa Chỉ
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          CCCD
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Ngày Cấp
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Nơi Cấp
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Dòng xe
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Phiên Bản
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Ngoại Thất
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Nội Thất
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Giá Niêm Yết
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Giá Giảm
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Giá Hợp Đồng
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Số Khung
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Số Máy
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                          Tình Trạng
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400 sticky right-0 z-30 bg-primary-400">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-neutral-white divide-y divide-secondary-100">
                      {currentContracts.map((contract, index) => {
                        const isMissingData = hasMissingData(contract);
                        return (
                        <tr
                          key={contract.firebaseKey || contract.id}
                          className={`hover:bg-secondary-50 ${isMissingData ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-black border border-secondary-400">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.ngayXhd || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.tvbh || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.vso || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.tenKh || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.soDienThoai || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.email || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.diaChi || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.cccd || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.ngayCap || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.noiCap || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.dongXe || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.phienBan || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {getColorName(contract.ngoaiThat || contract["Ngoại Thất"] || contract.exterior, true)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {getColorName(contract.noiThat || contract["Nội Thất"] || contract.interior, false)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {formatCurrency(contract.giaNiemYet)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {formatCurrency(contract.giaGiam)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {formatCurrency(contract.giaHopDong)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.soKhung || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.soMay || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                            {contract.tinhTrang || "-"}
                          </td>
                          {/* Actions column - sticky to right */}
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400 sticky right-0 z-20 bg-primary-200">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/hop-dong-da-xuat/edit/${contract.firebaseKey || contract.id}`)}
                                className="px-3 py-1 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors flex items-center gap-2 text-sm"
                                aria-label={`Sửa hợp đồng ${contract.tenKh || contract.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(contract)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                                aria-label={`Xóa hợp đồng ${contract.tenKh || contract.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {/* Print / Giấy xác nhận button */}
                              <button
                                onClick={() => {
                                  if (isMissingData) {
                                    toast.warning("Vui lòng điền đầy đủ thông tin hợp đồng trước khi in!");
                                    return;
                                  }
                                  const printData = {
                                    id: contract.id,
                                    stt: startIndex + index + 1,
                                    createdAt: contract.ngayXhd,
                                    TVBH: contract.tvbh,
                                    vso: contract.vso,
                                    customerName: contract.tenKh,
                                    phone: contract.soDienThoai,
                                    email: contract.email,
                                    Email: contract.email,
                                    address: contract.diaChi,
                                    cccd: contract.cccd,
                                    issueDate: contract.ngayCap,
                                    issuePlace: contract.noiCap,
                                    model: contract.dongXe,
                                    variant: contract.phienBan,
                                    exterior: contract.ngoaiThat,
                                    interior: contract.noiThat,
                                    contractPrice: contract.giaHopDong,
                                    deposit: contract.giaGiam,
                                    payment: "",
                                    bank: "",
                                    status: contract.tinhTrang,
                                    soKhung: contract.soKhung,
                                    soMay: contract.soMay,
                                    "Số Khung": contract.soKhung,
                                    "Số Máy": contract.soMay,
                                    chassisNumber: contract.soKhung,
                                    engineNumber: contract.soMay,
                                    representativeName: contract.tvbh,
                                  };
                                  setPrintContract(printData);
                                  setIsPrintModalOpen(true);
                                }}
                                disabled={isMissingData}
                                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-2 text-sm ${
                                  isMissingData
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                                title={isMissingData ? "Vui lòng điền đầy đủ thông tin hợp đồng trước khi in" : `Chọn mẫu in ${contract.tenKh || contract.id}`}
                                aria-label={isMissingData ? "Không thể in - thiếu dữ liệu" : `Chọn mẫu in ${contract.tenKh || contract.id}`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 9V2h12v7M6 18h12v4H6v-4zM6 14h12v4H6v-4z"
                                  ></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-secondary-700 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-secondary-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-secondary-700 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deletingContract && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 rounded-t-lg">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Xác nhận xóa hợp đồng</span>
                      </h3>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        Bạn có chắc chắn muốn xóa hợp đồng này không?
                      </p>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold text-gray-700">Tên KH:</span>{" "}
                          <span className="text-gray-900">
                            {deletingContract.tenKh || "-"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-gray-700">
                            Số điện thoại:
                          </span>{" "}
                          <span className="text-gray-900">
                            {deletingContract.soDienThoai || "-"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-gray-700">Dòng xe:</span>{" "}
                          <span className="text-gray-900">
                            {deletingContract.dongXe || "-"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-gray-700">VSO:</span>{" "}
                          <span className="text-gray-900">
                            {deletingContract.vso || "-"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-gray-700">Ngày XHD:</span>{" "}
                          <span className="text-gray-900">
                            {deletingContract.ngayXhd || "-"}
                          </span>
                        </p>
                      </div>

                      <p className="text-red-600 font-medium text-sm mt-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Hành động này không thể hoàn tác!</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
                      <button
                        onClick={closeDeleteConfirm}
                        className="px-5 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        aria-label="Hủy"
                      >
                        <X className="w-4 h-4" />
                        <span>Hủy</span>
                      </button>
                      <button
                        onClick={handleDeleteContract}
                        className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        aria-label="Xóa hợp đồng"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa hợp đồng</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Print Selection Modal */}
              {isPrintModalOpen && printContract && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-bold">Chọn mẫu in</h3>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-sm text-secondary-600">
                        Chọn mẫu in cho hợp đồng:{" "}
                        <span className="font-semibold">
                          {printContract.customerName || printContract.id}
                        </span>
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => {
                            setIsPrintModalOpen(false);
                            navigate("/giay-xac-nhan", { state: printContract });
                            setPrintContract(null);
                          }}
                          className="w-full px-4 py-2 bg-secondary-500 text-white rounded-md"
                        >
                          Giấy xác nhận
                        </button>

                        <button
                          onClick={() => {
                            setIsPrintModalOpen(false);
                            navigate("/giay-xac-nhan-thong-tin", {
                              state: printContract,
                            });
                            setPrintContract(null);
                          }}
                          className="w-full px-4 py-2 bg-secondary-500 text-white rounded-md"
                        >
                          Giấy xác nhận thông tin
                        </button>
                        <button
                          onClick={() => {
                            setIsPrintModalOpen(false);
                            navigate("/giay-de-nghi-thanh-toan", {
                              state: printContract,
                            });
                            setPrintContract(null);
                          }}
                          className="w-full px-4 py-2 bg-secondary-500 text-white rounded-md"
                        >
                          Giấy đề nghị thanh toán
                        </button>
                        <button
                          onClick={() => {
                            setIsPrintModalOpen(false);
                            navigate("/giay-xac-nhan-tang-bao-hiem", {
                              state: printContract,
                            });
                            setPrintContract(null);
                          }}
                          className="w-full px-4 py-2 bg-secondary-500 text-white rounded-md"
                        >
                          Giấy xác nhận tặng bảo hiểm
                        </button>
                        <button
                          onClick={() => {
                            setIsPrintModalOpen(false);
                            setPrintContract(null);
                          }}
                          className="w-full px-4 py-2 border border-secondary-200 rounded-md"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
