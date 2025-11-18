import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import { ref, get, update, remove, push, set } from 'firebase/database';
import { database } from '../firebase/config';
import { X, Trash2, Plus, Check, AlertTriangle, Edit, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';
import { getBranchByShowroomName, getAllBranches } from '../data/branchData';

export default function HopDongPage() {
  const [userTeam, setUserTeam] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [userEmail, setUserEmail] = useState('');

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    products: [], // will hold unique "Dòng xe" values from sample
    markets: [], // repurposed to hold payment methods from sample
    searchText: '',
  });

  const [availableFilters, setAvailableFilters] = useState({
    products: [], // unique models (dongXe)
    markets: [], // payment methods
  });

  const [quickSelectValue, setQuickSelectValue] = useState('');

  // Contract management states
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [deletingContract, setDeletingContract] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printContract, setPrintContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContracts, setSelectedContracts] = useState(new Set());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to map color code to name
  const getColorName = (colorCode, isExterior = true) => {
    if (!colorCode) return colorCode || "-";
    const colorList = isExterior ? uniqueNgoaiThatColors : uniqueNoiThatColors;
    const found = colorList.find(
      (color) => color.code === colorCode || color.name.toLowerCase() === colorCode.toLowerCase()
    );
    return found ? found.name : colorCode; // Return name if found, otherwise return original value
  };

  // Helper function to get shortName from showroom (full name)
  const getShowroomShortName = (showroomValue) => {
    if (!showroomValue) return showroomValue || "-";
    // Try to find branch by showroom name
    const foundBranch = getBranchByShowroomName(showroomValue);
    if (foundBranch) {
      return foundBranch.shortName;
    }
    // If not found, check if it matches any branch name
    const branches = getAllBranches();
    const exactMatch = branches.find(
      (branch) =>
        branch.name.toLowerCase() === showroomValue.toLowerCase() ||
        branch.shortName.toLowerCase() === showroomValue.toLowerCase()
    );
    return exactMatch ? exactMatch.shortName : showroomValue; // Return shortName if found, otherwise return original value
  };

  useEffect(() => {
    const team = localStorage.getItem('userTeam') || '';
    const role = localStorage.getItem('userRole') || 'user';
    const email = localStorage.getItem('userEmail') || '';
    setUserTeam(team);
    setUserRole(role);
    setUserEmail(email);

    // populate filters by scanning existing contracts in Firebase
    const fetchFiltersFromDB = async () => {
      try {
        const contractsRef = ref(database, 'contracts');
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};
        const contracts = Object.values(data || {});

        const models = [
          ...new Set(contracts.map((c) => c.dongXe || c.model).filter(Boolean)),
        ].sort();
        const paymentMethods = [
          ...new Set(contracts.map((c) => c.thanhToan || c.payment).filter(Boolean)),
        ].sort();

        setAvailableFilters((prev) => ({ ...prev, products: models, markets: paymentMethods }));
      } catch (err) {
        console.error('Error loading filter options from Firebase contracts', err);
      }
    };

    fetchFiltersFromDB();
  }, []);

  // Load contracts from Firebase
  useEffect(() => {
    const mapSample = (c) => ({
      id: c.id,
      stt: c.stt,
      createdAt: c.createdDate || c.createdAt,
      TVBH: c.tvbh || c.TVBH,
      showroom: c.showroom,
      vso: c.vso,
      customerName: c.customerName || c["Tên KH"],
      phone: c.phone,
      email: c.email,
      address: c.address,
      cccd: c.cccd,
      issueDate: c.ngayCap || c.issueDate,
      issuePlace: c.noiCap || c.issuePlace,
      model: c.dongXe || c["Dòng xe"],
      variant: c.phienBan || c["Phiên Bản"],
      exterior: c.ngoaiThat || c["Ngoại Thất"],
      interior: c.noiThat || c["Nội Thất"],
      contractPrice: c.giaHD || c["Giá HD"],
      deposit: c.soTienCoc || c["Số tiền cọc"],
      payment: c.thanhToan || c["thanh toán"],
      bank: c.nganHang || c["ngân hàng"],
      status: c.trangThai || c.status,
    });
    
    const loadFromFirebase = async () => {
      try {
        const contractsRef = ref(database, "contracts");
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const mapped = Object.entries(data || {}).map(([key, c], idx) => {
          const base = mapSample(c || {});
          return { ...base, firebaseKey: key };
        });

        setLoading(false);
        setContracts(mapped);
        setFilteredContracts(mapped);
      } catch (err) {
        console.error("Error loading contracts from Firebase:", err);
        toast.error("Lỗi khi tải dữ liệu hợp đồng từ Firebase");
        setLoading(false);
        setContracts([]);
        setFilteredContracts([]);
      }
    };

    loadFromFirebase();
  }, [userRole]);

  // Reload contracts when returning from form page
  useEffect(() => {
    if (location.pathname === '/hop-dong' && location.state?.reload) {
      const mapSample = (c) => ({
        id: c.id,
        stt: c.stt,
        createdAt: c.createdDate || c.createdAt,
        TVBH: c.tvbh || c.TVBH,
        showroom: c.showroom,
        vso: c.vso,
        customerName: c.customerName || c["Tên KH"],
        phone: c.phone,
        email: c.email,
        address: c.address,
        cccd: c.cccd,
        issueDate: c.ngayCap || c.issueDate,
        issuePlace: c.noiCap || c.issuePlace,
        model: c.dongXe || c["Dòng xe"],
        variant: c.phienBan || c["Phiên Bản"],
        exterior: c.ngoaiThat || c["Ngoại Thất"],
        interior: c.noiThat || c["Nội Thất"],
        contractPrice: c.giaHD || c["Giá HD"],
        deposit: c.soTienCoc || c["Số tiền cọc"],
        payment: c.thanhToan || c["thanh toán"],
        bank: c.nganHang || c["ngân hàng"],
        status: c.trangThai || c.status,
      });

      const loadFromFirebase = async () => {
        try {
          const contractsRef = ref(database, "contracts");
          const snapshot = await get(contractsRef);
          const data = snapshot.exists() ? snapshot.val() : {};

          const mapped = Object.entries(data || {}).map(([key, c], idx) => {
            const base = mapSample(c || {});
            return { ...base, firebaseKey: key };
          });

          setContracts(mapped);
          setFilteredContracts(mapped);
        } catch (err) {
          console.error("Error reloading contracts:", err);
        }
      };
      loadFromFirebase();
    }
  }, [location]);

  // Apply filters to contracts
  useEffect(() => {
    let filtered = [...contracts];

    // Apply product/model filter (Dòng xe)
    if (filters.products && filters.products.length > 0) {
      filtered = filtered.filter((contract) =>
        filters.products.includes(contract.model || contract.dongXe || contract.model)
      );
    }

    // Apply payment method filter
    if (filters.markets && filters.markets.length > 0) {
      filtered = filtered.filter((contract) =>
        filters.markets.includes(contract.payment || contract.thanhToan)
      );
    }

    // Apply search filter: search across all fields in the row (global table search)
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

    // Apply date range filter (createdAt)
    try {
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      // make end inclusive to the end of the day if a date string without time is provided
      if (end && filters.endDate && filters.endDate.length === 10) {
        end.setHours(23, 59, 59, 999);
      }

      if (start || end) {
        filtered = filtered.filter((contract) => {
          const raw = contract.createdAt || contract.createdDate || contract.createdAt;
          if (!raw) return false;
          const d = new Date(raw);
          if (isNaN(d)) return false;
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });
      }
    } catch (e) {
      // ignore parse errors and continue
      console.warn("Error parsing date filters for HopDong:", e);
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

    if (value === 'today') {
      startDate = new Date(today);
      endDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (value === 'yesterday') {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      startDate = new Date(d);
      endDate = new Date(d);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (value === 'this-week') {
      const range = getWeekRange(today);
      startDate = range.start;
      endDate = range.end;
    } else if (value === 'last-week') {
      const range = getWeekRange(today);
      range.start.setDate(range.start.getDate() - 7);
      range.end.setDate(range.end.getDate() - 7);
      startDate = range.start;
      endDate = range.end;
    } else if (value === 'next-week') {
      const range = getWeekRange(today);
      range.start.setDate(range.start.getDate() + 7);
      range.end.setDate(range.end.getDate() + 7);
      startDate = range.start;
      endDate = range.end;
    } else if (value.startsWith('month-')) {
      // month-N (1-12) -> use current year
      const parts = value.split('-');
      const m = parseInt(parts[1], 10);
      if (!Number.isNaN(m) && m >= 1 && m <= 12) {
        const year = today.getFullYear();
        startDate = new Date(year, m - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(year, m, 0);
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (value.startsWith('q')) {
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
    } else if (value === 'this-month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    setFilters((prev) => ({
      ...prev,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      products: [],
      markets: [],
      searchText: '',
    });
    setQuickSelectValue('');
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


  // Navigate to edit contract page
  const openEditModal = (contract) => {
    navigate("/hop-dong/chinh-sua", {
      state: { contract },
    });
  };

  // Navigate to add contract page
  const openAddModal = () => {
    navigate("/hop-dong/them-moi");
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
      // determine firebase key (if provided) or try to find by id
      let keyToRemove = deletingContract.firebaseKey;
      if (!keyToRemove) {
        const found = contracts.find((u) => u.id === deletingContract.id);
        if (found && found.firebaseKey) keyToRemove = found.firebaseKey;
      }

      if (keyToRemove) {
        const contractRef = ref(database, `contracts/${keyToRemove}`);
        await remove(contractRef);
        setContracts((prev) =>
          prev.filter((contract) => contract.firebaseKey !== keyToRemove)
        );
        setFilteredContracts((prev) =>
          prev.filter((contract) => contract.firebaseKey !== keyToRemove)
        );
      } else {
        // If no key found, just remove from local state by id as a fallback
        setContracts((prev) =>
          prev.filter((contract) => contract.id !== deletingContract.id)
        );
        setFilteredContracts((prev) =>
          prev.filter((contract) => contract.id !== deletingContract.id)
        );
      }

      closeDeleteConfirm();
      toast.success("Xóa hợp đồng thành công!");
    } catch (err) {
      console.error("Error deleting contract:", err);
      toast.error("Lỗi khi xóa hợp đồng");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle checkbox selection
  const handleToggleContract = (contractKey) => {
    setSelectedContracts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contractKey)) {
        newSet.delete(contractKey);
      } else {
        newSet.add(contractKey);
      }
      return newSet;
    });
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    // Only select contracts that are not exported (status !== "xuất")
    const selectableContracts = currentContracts.filter((c) => c.status !== "xuất");
    const allCurrentKeys = selectableContracts.map((c) => c.firebaseKey || c.id).filter(Boolean);
    const allSelected = allCurrentKeys.length > 0 && allCurrentKeys.every((key) => selectedContracts.has(key));
    
    setSelectedContracts((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        allCurrentKeys.forEach((key) => newSet.delete(key));
      } else {
        allCurrentKeys.forEach((key) => newSet.add(key));
      }
      return newSet;
    });
  };

  // Open export confirmation modal
  const openExportModal = () => {
    if (selectedContracts.size === 0) {
      toast.warning("Vui lòng chọn ít nhất một hợp đồng để xuất!");
      return;
    }
    setIsExportModalOpen(true);
  };

  // Close export confirmation modal
  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  // Export selected contracts to exportedContracts
  const handleExportContracts = async () => {
    if (selectedContracts.size === 0) return;

    try {
      const exportedContractsRef = ref(database, "exportedContracts");
      
      // Get all contracts to export
      const contractsToExport = contracts.filter((contract) => {
        const key = contract.firebaseKey || contract.id;
        return key && selectedContracts.has(key);
      });

      // Prepare data for export with all required fields
      const exportPromises = contractsToExport.map(async (contract) => {
        const safeValue = (val) => val !== undefined && val !== null ? val : "";
        
        // Get current date/time in format YYYY-MM-DD
        const now = new Date();
        const ngayXhd = now.toISOString().split("T")[0];
        
        // Map contract data to exported format (matching HopDongDaXuat format)
        const exportedData = {
          id: safeValue(contract.id),
          stt: safeValue(contract.stt),
          "ngày xhd": ngayXhd, // Export date - now
          tvbh: safeValue(contract.TVBH || contract.tvbh),
          VSO: safeValue(contract.vso),
          "Tên Kh": safeValue(contract.customerName),
          "Số Điện Thoại": safeValue(contract.phone),
          Email: safeValue(contract.email),
          "Địa Chỉ": safeValue(contract.address),
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
          "Số Khung": safeValue(contract.soKhung || contract.chassisNumber || contract["Số Khung"] || ""),
          "Số Máy": safeValue(contract.soMay || contract.engineNumber || contract["Số Máy"] || ""),
          "Tình Trạng": safeValue(contract.tinhTrangXe || contract.vehicleStatus || contract["Tình Trạng Xe"] || ""), // Tình trạng xe, không phải tình trạng hợp đồng
        };

        // Use firebaseKey as the key in exportedContracts, or generate new key
        const exportKey = contract.firebaseKey || `exported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const exportRef = ref(database, `exportedContracts/${exportKey}`);
        await set(exportRef, exportedData);
      });

      await Promise.all(exportPromises);

      // Update status of exported contracts to "xuất"
      const updateStatusPromises = contractsToExport.map(async (contract) => {
        const targetKey = contract.firebaseKey;
        if (targetKey) {
          const contractRef = ref(database, `contracts/${targetKey}`);
          await update(contractRef, {
            trangThai: "xuất",
          });
        }
      });

      await Promise.all(updateStatusPromises);

      // Update local state to reflect status change
      setContracts((prev) =>
        prev.map((contract) => {
          const key = contract.firebaseKey || contract.id;
          if (key && selectedContracts.has(key)) {
            return { ...contract, status: "xuất" };
          }
          return contract;
        })
      );
      setFilteredContracts((prev) =>
        prev.map((contract) => {
          const key = contract.firebaseKey || contract.id;
          if (key && selectedContracts.has(key)) {
            return { ...contract, status: "xuất" };
          }
          return contract;
        })
      );

      // Clear selection
      setSelectedContracts(new Set());
      closeExportModal();
      toast.success(`Đã xuất ${contractsToExport.length} hợp đồng thành công!`);
      
      // Navigate to exported contracts page after successful export
      setTimeout(() => {
        navigate("/hop-dong-da-xuat");
      }, 1000); // Small delay to show the success message
    } catch (err) {
      console.error("Error exporting contracts:", err);
      toast.error("Lỗi khi xuất hợp đồng: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-8 py-8 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-secondary-600">Đang tải dữ liệu hợp đồng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-8 py-8 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <FilterPanel
          activeTab={'hopdong'}
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
          {/* Header with Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/menu")}
                className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                aria-label="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
              <h2 className="text-2xl font-bold text-primary-700">Hợp đồng</h2>
            </div>
            {userRole === "admin" && (
              <div className="flex items-center gap-3">
                {selectedContracts.size > 0 && (
                  <button
                    onClick={openExportModal}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg border-2 border-transparent hover:bg-white hover:border-primary-600 hover:text-primary-600 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất hợp đồng ({selectedContracts.size})</span>
                  </button>
                )}
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-secondary-600 text-white rounded-lg  border-2 border-transparent  hover:bg-white hover:border-secondary-600 hover:text-secondary-600 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm mới</span>
                </button>
              </div>
            )}
          </div>

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

          {/* User Management Table */}
          {filteredContracts.length === 0 ? (
            <div className="text-center py-8 bg-secondary-50 rounded-lg">
              <p className="text-secondary-600">Không có dữ liệu hợp đồng</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-secondary-100">
                <thead className="bg-primary-400">
                  <tr>
                    {userRole === "admin" && (
                      <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                        {currentContracts.some((c) => c.status !== "xuất") && (
                          <input
                            type="checkbox"
                            checked={currentContracts.length > 0 && currentContracts.filter((c) => c.status !== "xuất").every((c) => {
                              const key = c.firebaseKey || c.id;
                              return key && selectedContracts.has(key);
                            })}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                          />
                        )}
                      </th>
                    )}
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      STT
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      Ngày tạo
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      TVBH
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      Showroom
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      VSO
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      Tên KH
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      Số Điện thoại
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      email
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      Địa chỉ
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      sô CCCD
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
                      Giá HD
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      Số tiền cọc
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      thanh toán
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      ngân hàng
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                      trạng thái
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400 sticky right-0 z-30 bg-primary-400">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-white divide-y divide-secondary-100">
                  {currentContracts.map((contract, index) => {
                    const contractKey = contract.firebaseKey || contract.id;
                    const isSelected = contractKey && selectedContracts.has(contractKey);
                    const isExported = contract.status === "xuất";
                    return (
                    <tr
                      key={contractKey}
                      className={`hover:bg-secondary-50 ${isSelected ? 'bg-primary-50' : ''}`}
                    >
                      {userRole === "admin" && (
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                          {!isExported && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleContract(contractKey)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                          )}
                        </td>
                      )}
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-black border border-secondary-400">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.createdAt || contract["Ngày tạo"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract["TVBH"] ||
                          contract["Họ Và Tên"] ||
                          contract.name ||
                          "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {getShowroomShortName(contract.showroom || contract["Showroom"] || "")}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.vso || contract["VSO"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.customerName || contract["Tên KH"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.phone ||
                          contract["Số Điện Thoại"] ||
                          contract.phoneNumber ||
                          "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.email || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.address || contract["Địa chỉ"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.cccd ||
                          contract["sô CCCD"] ||
                          contract["số CCCD"] ||
                          "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.issueDate || contract["Ngày Cấp"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.issuePlace || contract["Nơi Cấp"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.model || contract["Dòng xe"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.variant || contract["Phiên Bản"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {getColorName(contract.exterior || contract["Ngoại Thất"] || contract.ngoaiThat, true)}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {getColorName(contract.interior || contract["Nội Thất"] || contract.noiThat, false)}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.contractPrice ||
                          contract["Giá HD"] ||
                          contract["Giá HD"] ||
                          "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.deposit || contract["Số tiền cọc"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.payment || contract["thanh toán"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.bank || contract["ngân hàng"] || "-"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                        {contract.status || "-"}
                      </td>
                      {/* Actions column - sticky to right */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400 sticky right-0 z-20 bg-primary-200">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(contract)}
                            className="px-3 py-1 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors flex items-center gap-2 text-sm"
                            aria-label={`Sửa hợp đồng ${
                              contract.customerName || contract.id
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(contract)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            aria-label={`Xóa hợp đồng ${
                              contract.customerName || contract.id
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {/* Print / Giấy xác nhận button */}
                          <button
                            onClick={() => {
                              // open print selection modal with prepared data
                              const printData = {
                                id: contract.id,
                                stt: contract.stt || startIndex + index + 1,
                                createdAt:
                                  contract.createdAt || contract.createdDate,
                                TVBH: contract.TVBH || contract.tvbh,
                                showroom: contract.showroom,
                                vso: contract.vso,
                                customerName:
                                  contract.customerName || contract["Tên KH"],
                                phone: contract.phone,
                                email: contract.email,
                                Email: contract.email,
                                address: contract.address,
                                cccd: contract.cccd,
                                issueDate: contract.issueDate || contract.ngayCap,
                                issuePlace: contract.issuePlace || contract.noiCap,
                                model: contract.model || contract.dongXe,
                                variant: contract.variant || contract.phienBan,
                                exterior: contract.exterior || contract.ngoaiThat,
                                interior: contract.interior || contract.noiThat,
                                contractPrice:
                                  contract.contractPrice || contract.giaHD,
                                deposit: contract.deposit || contract.soTienCoc,
                                payment: contract.payment || contract.thanhToan,
                                bank: contract.bank || contract.nganHang,
                                status: contract.status,
                                soKhung: contract.soKhung || contract["Số Khung"] || contract.chassisNumber || contract.vin || "",
                                soMay: contract.soMay || contract["Số Máy"] || contract.engineNumber || "",
                                "Số Khung": contract.soKhung || contract["Số Khung"] || contract.chassisNumber || contract.vin || "",
                                "Số Máy": contract.soMay || contract["Số Máy"] || contract.engineNumber || "",
                                chassisNumber: contract.soKhung || contract["Số Khung"] || contract.chassisNumber || contract.vin || "",
                                engineNumber: contract.soMay || contract["Số Máy"] || contract.engineNumber || "",
                                representativeName: contract.TVBH || contract.tvbh || "",
                              };
                              setPrintContract(printData);
                              setIsPrintModalOpen(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            aria-label={`Chọn mẫu in ${
                              contract.customerName || contract.id
                            }`}
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
                        // navigate to Giấy xác nhận template and pass contract data
                        navigate("/giay-xac-nhan", { state: printContract });
                        setPrintContract(null);
                      }}
                      className="w-full px-4 py-2 bg-secondary-500 text-white rounded-md"
                    >
                      Giấy xác nhận
                    </button>

                    <button
                      onClick={() => {
                        // Example: navigate to a different template route (if exists)
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
                        // Example: navigate to a different template route (if exists)
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
                        // Example: navigate to a different template route (if exists)
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

          {/* Pagination */}
          {filteredContracts.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between border-t border-secondary-100 bg-neutral-white px-4 py-3 sm:px-6 rounded-lg shadow">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Sau
                </button>
              </div>

              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-secondary-600">
                    Hiển thị <span className="font-medium">{startIndex + 1}</span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredContracts.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredContracts.length}</span>{" "}
                    hợp đồng
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-secondary-400 ring-1 ring-inset ring-secondary-400 hover:bg-secondary-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === currentPage
                                  ? "z-10 bg-primary-600 text-neutral-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                  : "text-secondary-900 ring-1 ring-inset ring-secondary-400 hover:bg-secondary-50 focus:z-20 focus:outline-offset-0"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-secondary-400 ring-1 ring-inset ring-secondary-400 hover:bg-secondary-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === totalPages
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
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
                        {deletingContract.customerName ||
                          deletingContract["Họ Và Tên"] ||
                          "-"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Số điện thoại:
                      </span>{" "}
                      <span className="text-gray-900">
                        {deletingContract.phone || "-"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">Dòng xe:</span>{" "}
                      <span className="text-gray-900">
                        {deletingContract.model || deletingContract.dongXe || "-"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">VSO:</span>{" "}
                      <span className="text-gray-900">
                        {deletingContract.vso || "-"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">Ngày tạo:</span>{" "}
                      <span className="text-gray-900">
                        {deletingContract.createdAt ||
                          deletingContract.createdDate ||
                          "-"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Phương thức thanh toán:
                      </span>{" "}
                      <span className="text-gray-900">
                        {deletingContract.payment ||
                          deletingContract.thanhToan ||
                          "-"}
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

          {/* Export Confirmation Modal */}
          {isExportModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-4 rounded-t-lg">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    <span>Xác nhận xuất hợp đồng</span>
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Bạn có chắc chắn muốn xuất <span className="font-semibold text-primary-600">{selectedContracts.size}</span> hợp đồng đã chọn không?
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 max-h-60 overflow-y-auto">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Danh sách hợp đồng sẽ được xuất:
                    </p>
                    {contracts
                      .filter((contract) => {
                        const key = contract.firebaseKey || contract.id;
                        return key && selectedContracts.has(key);
                      })
                      .map((contract, idx) => (
                        <div key={contract.firebaseKey || contract.id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                          <p className="text-gray-900">
                            <span className="font-semibold">{idx + 1}.</span>{" "}
                            {contract.customerName || contract["Tên KH"] || "-"} - {contract.phone || "-"}
                          </p>
                        </div>
                      ))}
                  </div>

                  <p className="text-primary-600 font-medium text-sm mt-4 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Hợp đồng sẽ được lưu vào danh sách hợp đồng đã xuất với ngày xuất là hôm nay.</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                  <button
                    onClick={closeExportModal}
                    className="px-5 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    aria-label="Hủy"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    onClick={handleExportContracts}
                    className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    aria-label="Xuất hợp đồng"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất hợp đồng</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
