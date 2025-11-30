import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, push, update, remove } from 'firebase/database';
import { database } from '../firebase/config';
import { X, Trash2, Plus, Edit, Search, ArrowLeft, FileText, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { uniqueNgoaiThatColors, uniqueNoiThatColors, danh_sach_xe, carPriceData } from '../data/calculatorData';
import { getBranchByShowroomName } from '../data/branchData';
import { provinces } from '../data/provincesData';

// Dropdown options
const MUC_DO_OPTIONS = ['Very hot', 'Hot', 'Cool', 'Warm'];
const TINH_TRANG_OPTIONS = [
  'Mới',
  'Chưa liên hệ được',
  'Đã tư vấn',
  'Đã báo giá',
  'Hẹn lái thử',
  'Đã lái thử',
  'Đã đặt cọc',
  'Đang làm ngân hàng',
  'Không quan tâm',
  'Không mua'
];
const THANH_TOAN_OPTIONS = ['Trả thẳng', 'Trả góp'];
const NHU_CAU_OPTIONS = ['Kinh doanh', 'Không kinh doanh'];
const NGUON_OPTIONS = ['Showroom', 'Facebook', 'Web', 'Giới thiệu', 'Sự kiện'];
const KHACH_HANG_LA_OPTIONS = ['Cá nhân', 'Công ty'];

export default function QuanLyKhachHangPage() {
  const navigate = useNavigate();
  const [allCustomers, setAllCustomers] = useState([]); // Store all customers before filtering
  const [customers, setCustomers] = useState([]); // Filtered customers based on permissions
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User permissions
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userDepartment, setUserDepartment] = useState("");
  const [actualEmployeeName, setActualEmployeeName] = useState(""); // Actual name from employees collection
  const [employeesMap, setEmployeesMap] = useState({}); // Map TVBH -> department
  const [teamEmployeeNames, setTeamEmployeeNames] = useState([]); // List of employee names in team (for leader)
  const [employeesLoaded, setEmployeesLoaded] = useState(false); // Flag to know when employees data is loaded
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isWorkHistoryModalOpen, setIsWorkHistoryModalOpen] = useState(false);
  const [workHistoryCustomer, setWorkHistoryCustomer] = useState(null);
  const [workHistoryEntries, setWorkHistoryEntries] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // Format: 'mucDo-{firebaseKey}' or 'tinhTrang-{firebaseKey}' or 'tvbh-{firebaseKey}'
  const [dropdownPosition, setDropdownPosition] = useState({}); // Store position for each dropdown: { 'mucDo-key': { side: 'bottom' | 'top', left: number, top: number } }
  const [employees, setEmployees] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    ngay: new Date().toISOString().split('T')[0],
    tenKhachHang: '',
    soDienThoai: '',
    khachHangLa: '',
    tinhThanh: '',
    dongXe: '',
    phienBan: '',
    mauSac: '',
    nhuCau: '',
    thanhToan: '',
    nguon: 'Hợp đồng',
    mucDo: '',
    tinhTrang: '',
    noiDung: '',
    selectedContractId: '',
    tvbh: '',
  });

  // Helper function to map color code to name
  const getColorName = (colorCode, isExterior = true) => {
    if (!colorCode) return colorCode || "-";
    const colorList = isExterior ? uniqueNgoaiThatColors : uniqueNoiThatColors;
    const found = colorList.find(
      (color) => color.code === colorCode || color.name.toLowerCase() === colorCode.toLowerCase()
    );
    return found ? found.name : colorCode;
  };

  // Get list of car models (dòng xe)
  const getCarModels = () => {
    return danh_sach_xe.map(xe => xe.ten_hien_thi);
  };

  // Get list of variants (phiên bản) based on selected car model
  const getVariants = (selectedModel) => {
    if (!selectedModel) return [];
    const variants = new Set();
    carPriceData.forEach(car => {
      if (car.model === selectedModel && car.trim) {
        variants.add(car.trim);
      }
    });
    return Array.from(variants).sort();
  };

  // Get list of colors (màu sắc) - exterior colors
  const getColors = () => {
    return uniqueNgoaiThatColors.map(color => color.name);
  };

  // Helper function to get color classes for mucDo (level)
  const getMucDoColorClasses = (option, isSelected = false) => {
    const colorMap = {
      'Very hot': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        hover: 'hover:bg-red-200',
        ring: 'ring-red-300',
        selectedBg: 'bg-red-200',
        selectedText: 'text-red-900'
      },
      'Hot': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        hover: 'hover:bg-orange-200',
        ring: 'ring-orange-300',
        selectedBg: 'bg-orange-200',
        selectedText: 'text-orange-900'
      },
      'Cool': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        hover: 'hover:bg-blue-200',
        ring: 'ring-blue-300',
        selectedBg: 'bg-blue-200',
        selectedText: 'text-blue-900'
      },
      'Warm': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        hover: 'hover:bg-yellow-200',
        ring: 'ring-yellow-300',
        selectedBg: 'bg-yellow-200',
        selectedText: 'text-yellow-900'
      }
    };

    const colors = colorMap[option] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      hover: 'hover:bg-gray-200',
      ring: 'ring-gray-300',
      selectedBg: 'bg-gray-200',
      selectedText: 'text-gray-900'
    };

    if (isSelected) {
      return `${colors.selectedBg} ${colors.selectedText} ring-2 ${colors.ring}`;
    }
    return `${colors.bg} ${colors.text} ${colors.hover}`;
  };

  // Extract province from address or showroom
  const extractProvince = (address, showroom) => {
    if (!address && !showroom) return '';

    const searchText = (address || showroom || '').toLowerCase();
    
    for (const province of provinces) {
      if (searchText.includes(province.toLowerCase())) {
        return province;
      }
    }

    // Try to extract from showroom
    if (showroom) {
      if (showroom.includes('Hà Nội') || showroom.includes('Hanoi')) return 'Thành phố Hà Nội';
      if (showroom.includes('Hồ Chí Minh') || showroom.includes('Ho Chi Minh') || showroom.includes('TP.HCM')) return 'Thành phố Hồ Chí Minh';
      if (showroom.includes('Đà Nẵng')) return 'Thành phố Đà Nẵng';
      if (showroom.includes('Hải Phòng')) return 'Thành phố Hải Phòng';
      if (showroom.includes('Cần Thơ')) return 'Thành phố Cần Thơ';
    }

    return '';
  };

  // Load user info from localStorage
  useEffect(() => {
    const usernameValue = localStorage.getItem("username") || "";
    const userEmailValue = localStorage.getItem("userEmail") || "";
    const userRoleValue = localStorage.getItem("userRole") || "user";
    const userDepartmentValue = localStorage.getItem("userDepartment") || "";
    
    setUsername(usernameValue);
    setUserEmail(userEmailValue);
    setUserRole(userRoleValue);
    setUserDepartment(userDepartmentValue);
  }, []);

  // Load employees data to get actual employee name and map TVBH -> department
  useEffect(() => {
    const loadEmployeesData = async () => {
      setEmployeesLoaded(false);
      
      if (!userEmail && !userRole) {
        setEmployeesLoaded(true);
        return;
      }

      try {
        const employeesRef = ref(database, "employees");
        const snapshot = await get(employeesRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const employeesMapping = {};
        const teamNames = [];
        let foundEmployeeName = "";

        // Find current user's actual name from employees by email
        if (userEmail) {
          const userEntry = Object.entries(data).find(([key, employee]) => {
            const employeeEmail = (employee && (employee.mail || employee.Mail || employee.email || "")).toString().toLowerCase();
            return employeeEmail === userEmail.toLowerCase();
          });

          if (userEntry) {
            const [userId, employeeData] = userEntry;
            // Get actual name from employee - try multiple fields
            foundEmployeeName = employeeData.TVBH || employeeData.user || employeeData.username || employeeData.name || "";
            setActualEmployeeName(foundEmployeeName);
          }
        }

        // Build employees mapping and team names
        Object.entries(data).forEach(([key, employee]) => {
          const employeeName = employee.TVBH || employee.user || employee.username || employee.name || "";
          const employeeDept = employee.phongBan || employee["Phòng Ban"] || employee.department || employee["Bộ phận"] || "";
          const employeeEmail = (employee.mail || employee.Mail || employee.email || "").toString().toLowerCase();

          if (employeeName) {
            employeesMapping[employeeName] = employeeDept;
            
            // For leader: collect all employees in same department
            if (userRole === "leader" && userDepartment && employeeDept === userDepartment) {
              teamNames.push(employeeName);
            }
          }
        });

        setEmployeesMap(employeesMapping);
        
        if (userRole === "leader") {
          // Include current user in team if found
          if (foundEmployeeName && !teamNames.includes(foundEmployeeName)) {
            teamNames.push(foundEmployeeName);
          }
          setTeamEmployeeNames(teamNames);
        } else if (userRole === "admin") {
          // Admin can see all employees
          setTeamEmployeeNames(Object.keys(employeesMapping));
        }
        
        setEmployeesLoaded(true);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu nhân viên: " + err.message);
        // Set empty array on error so filter can proceed
        setTeamEmployeeNames([]);
        setEmployeesLoaded(true);
      }
    };

    loadEmployeesData();
  }, [userRole, userDepartment, userEmail]);

  // Load employees from Firebase (for dropdown selection)
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
              email: emp.mail || emp.Mail || emp.email || '',
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

  // Get TVBH from userEmail in localStorage
  const getTVBHFromUserEmail = () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    if (!userEmail) return '';
    
    const employee = employees.find(emp => 
      emp.email && emp.email.toLowerCase() === userEmail.toLowerCase()
    );
    
    return employee ? employee.TVBH : '';
  };

  // Load contracts for selection
  useEffect(() => {
    const loadContracts = async () => {
      try {
        const contractsRef = ref(database, 'contracts');
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};
        
        const contractsList = Object.entries(data || {}).map(([key, contract]) => ({
          firebaseKey: key,
          id: contract.id || key,
          customerName: contract.customerName || contract["Tên KH"] || '',
          phone: contract.phone || contract["Số Điện Thoại"] || '',
          address: contract.address || contract["Địa chỉ"] || '',
          showroom: contract.showroom || '',
          dongXe: contract.dongXe || contract.model || '',
          phienBan: contract.phienBan || contract.variant || '',
          ngoaiThat: contract.ngoaiThat || contract.exterior || '',
          thanhToan: contract.thanhToan || contract.payment || '',
          tvbh: contract.tvbh || contract.TVBH || '',
          createdAt: contract.createdDate || contract.createdAt || '',
        }));

        setContracts(contractsList);
      } catch (err) {
        console.error('Error loading contracts:', err);
      }
    };

    loadContracts();
  }, []);

  // Load all customers from Firebase (without permission filter)
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersRef = ref(database, 'customers');
        const snapshot = await get(customersRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
          firebaseKey: key,
          stt: customer.stt || index + 1,
          ...customer,
        }));

        // Sort by STT
        customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));

        setAllCustomers(customersList);
      } catch (err) {
        console.error('Error loading customers:', err);
        toast.error('Lỗi khi tải dữ liệu khách hàng');
        setAllCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  // Apply permission filter to customers
  useEffect(() => {
    // If no customers loaded yet and not admin, wait for customers to load
    if (allCustomers.length === 0) {
      // If admin, can set loading false immediately (no customers to show)
      if (userRole === "admin") {
        setCustomers([]);
        setFilteredCustomers([]);
        setLoading(false);
        return;
      }
      // For user/leader, wait for customers to load first
      // But if employees are already loaded, we know there are no customers
      if (employeesLoaded) {
        setCustomers([]);
        setFilteredCustomers([]);
        setLoading(false);
        return;
      }
      // Still waiting for either customers or employees to load
      return;
    }

    let filtered = [];

    if (userRole === "user") {
      // User: only see their own customers (by TVBH matching actual employee name)
      if (!employeesLoaded) {
        // Still loading employee data, show empty but keep loading
        filtered = [];
      } else if (actualEmployeeName) {
        // Filter by actual employee name
        filtered = allCustomers.filter((customer) => {
          const customerTVBH = customer.tvbh || "";
          return customerTVBH === actualEmployeeName || 
                 customerTVBH.toLowerCase() === actualEmployeeName.toLowerCase();
        });
      } else {
        // Employee name not found, show empty
        filtered = [];
      }
      // Set loading false after filtering for user (whether employees loaded or not)
      if (employeesLoaded) {
        setLoading(false);
      }
    } else if (userRole === "leader") {
      // Leader: see customers of employees in same department
      if (!employeesLoaded) {
        // Still loading employee data, show empty but keep loading
        filtered = [];
      } else {
        if (userDepartment && teamEmployeeNames.length > 0) {
          // Filter by team employee names
          filtered = allCustomers.filter((customer) => {
            const customerTVBH = customer.tvbh || "";
            return teamEmployeeNames.includes(customerTVBH);
          });
        } else {
          // No team members found, show empty
          filtered = [];
        }
        // Set loading false after filtering for leader
        setLoading(false);
      }
    } else if (userRole === "admin") {
      // Admin: see all customers (no filter)
      filtered = allCustomers;
      setLoading(false);
    }

    setCustomers(filtered);
    setFilteredCustomers(filtered);
  }, [allCustomers, userRole, actualEmployeeName, userDepartment, teamEmployeeNames, employeesLoaded]);

  // Apply search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = customers.filter((customer) => {
      return Object.values(customer).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return false;
        return String(val).toLowerCase().includes(searchLower);
      });
    });

    setFilteredCustomers(filtered);
  }, [searchText, customers]);

  // Handle contract selection
  const handleContractSelect = (contractId) => {
    const selectedContract = contracts.find(c => c.firebaseKey === contractId || c.id === contractId);
    if (selectedContract) {
      const province = extractProvince(selectedContract.address, selectedContract.showroom);
      const colorName = getColorName(selectedContract.ngoaiThat, true);

      setFormData({
        ...formData,
        selectedContractId: contractId,
        tenKhachHang: selectedContract.customerName || '',
        soDienThoai: selectedContract.phone || '',
        tinhThanh: province,
        dongXe: selectedContract.dongXe || '',
        phienBan: selectedContract.phienBan || '',
        mauSac: colorName,
        thanhToan: selectedContract.thanhToan || '',
        tvbh: selectedContract.tvbh || '',
      });
    }
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Open add modal
  const openAddModal = () => {
    // Auto-get TVBH from userEmail
    const tvbh = getTVBHFromUserEmail();
    
    setFormData({
      ngay: new Date().toISOString().split('T')[0],
      tenKhachHang: '',
      soDienThoai: '',
      khachHangLa: '',
      tinhThanh: '',
      dongXe: '',
      phienBan: '',
      mauSac: '',
      nhuCau: '',
      thanhToan: '',
      nguon: 'Hợp đồng',
      mucDo: '',
      tinhTrang: '',
      noiDung: '',
      selectedContractId: '',
      tvbh: tvbh,
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      ngay: customer.ngay || new Date().toISOString().split('T')[0],
      tenKhachHang: customer.tenKhachHang || '',
      soDienThoai: customer.soDienThoai || '',
      khachHangLa: customer.khachHangLa || '',
      tinhThanh: customer.tinhThanh || '',
      dongXe: customer.dongXe || '',
      phienBan: customer.phienBan || '',
      mauSac: customer.mauSac || '',
      nhuCau: customer.nhuCau || '',
      thanhToan: customer.thanhToan || '',
      nguon: customer.nguon || 'Hợp đồng',
      mucDo: customer.mucDo || '',
      tinhTrang: customer.tinhTrang || '',
      noiDung: customer.noiDung || '',
      selectedContractId: customer.selectedContractId || '',
      tvbh: customer.tvbh || '',
    });
    setIsEditModalOpen(true);
  };

  // Close modals
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setFormData({
      ngay: new Date().toISOString().split('T')[0],
      tenKhachHang: '',
      soDienThoai: '',
      khachHangLa: '',
      tinhThanh: '',
      dongXe: '',
      phienBan: '',
      mauSac: '',
      nhuCau: '',
      thanhToan: '',
      nguon: 'Hợp đồng',
      mucDo: '',
      tinhTrang: '',
      noiDung: '',
      selectedContractId: '',
      tvbh: '',
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
  };

  // Save customer
  const handleSave = async () => {
    if (!formData.tenKhachHang || !formData.soDienThoai) {
      toast.error('Vui lòng điền tên khách hàng và số điện thoại!');
      return;
    }

    try {
      const customerData = {
        ngay: formData.ngay,
        tenKhachHang: formData.tenKhachHang,
        soDienThoai: formData.soDienThoai,
        khachHangLa: formData.khachHangLa || '',
        tinhThanh: formData.tinhThanh,
        dongXe: formData.dongXe,
        phienBan: formData.phienBan,
        mauSac: formData.mauSac,
        nhuCau: formData.nhuCau || '',
        thanhToan: formData.thanhToan,
        nguon: formData.nguon || 'Hợp đồng',
        mucDo: formData.mucDo || '',
        tinhTrang: formData.tinhTrang || '',
        noiDung: formData.noiDung || '',
        selectedContractId: formData.selectedContractId || '',
        tvbh: formData.tvbh || '',
      };

      if (isEditModalOpen && editingCustomer) {
        // Update existing customer
        const customerRef = ref(database, `customers/${editingCustomer.firebaseKey}`);
        await update(customerRef, {
          ...customerData,
          stt: editingCustomer.stt,
        });
        toast.success('Cập nhật khách hàng thành công!');
        closeEditModal();
      } else {
        // Create new customer
        const maxStt = allCustomers.length > 0 ? Math.max(...allCustomers.map(c => c.stt || 0)) : 0;
        const customerRef = ref(database, 'customers');
        const newCustomerRef = await push(customerRef, {
          ...customerData,
          stt: maxStt + 1,
        });
        toast.success('Thêm khách hàng thành công!');
        closeAddModal();
      }

      // Reload customers (just reload allCustomers, permission filter will be applied in separate useEffect)
      const customersRef = ref(database, 'customers');
      const snapshot = await get(customersRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
        firebaseKey: key,
        stt: customer.stt || index + 1,
        ...customer,
      }));
      customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
      setAllCustomers(customersList);
    } catch (err) {
      console.error('Error saving customer:', err);
      toast.error('Lỗi khi lưu khách hàng: ' + err.message);
    }
  };

  // Delete customer
  const handleDelete = async (customer) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.tenKhachHang}"?`)) {
      return;
    }

    try {
      const customerRef = ref(database, `customers/${customer.firebaseKey}`);
      await remove(customerRef);
      toast.success('Xóa khách hàng thành công!');

      // Reload customers (just reload allCustomers, permission filter will be applied in separate useEffect)
      const customersRef = ref(database, 'customers');
      const snapshot = await get(customersRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
        firebaseKey: key,
        stt: customer.stt || index + 1,
        ...customer,
      }));
      customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
      setAllCustomers(customersList);
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Lỗi khi xóa khách hàng: ' + err.message);
    }
  };

  // Helper function to convert YYYY-MM-DD to dd/mm/yyyy
  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    // If already in dd/mm/yyyy format, return as is
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return dateStr;
    
    // Try to parse YYYY-MM-DD format
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to convert dd/mm/yyyy to YYYY-MM-DD
  const parseDateFromDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    // Try to parse dd/mm/yyyy format
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse other formats (MM-DD, etc.)
    const datePattern = /^\d{1,2}[-/]\d{1,2}$/;
    if (datePattern.test(dateStr)) {
      const parts = dateStr.split(/[-/]/);
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    
    return dateStr;
  };

  // Parse work history from content string
  const parseWorkHistory = (content) => {
    if (!content || !content.trim()) return [];
    
    const entries = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach((line) => {
      // Match pattern: "Lần x: Ngày - Nội dung"
      // First extract the "Lần x:" part
      const lanMatch = line.match(/Lần\s*(\d+):\s*(.+)/);
      if (!lanMatch) return;
      
      const lan = parseInt(lanMatch[1]);
      const rest = lanMatch[2].trim();
      
      let ngay = '';
      let noiDung = '';
      
      // Try to split by " - " (space-dash-space) from the end
      // This handles cases like "11-19 - ABC" where date has dash
      const lastDashIndex = rest.lastIndexOf(' - ');
      
      if (lastDashIndex > 0) {
        // Found separator " - "
        ngay = rest.substring(0, lastDashIndex).trim();
        noiDung = rest.substring(lastDashIndex + 3).trim();
        
        // If ngay is empty or doesn't look like a date, check if date is in noiDung
        if (!ngay || (!/^\d/.test(ngay))) {
          const contentDateMatch = noiDung.match(/^(\d{1,2}[-/]\d{1,2}(?:[-/]\d{1,4})?)\s*-\s*(.+)/);
          if (contentDateMatch) {
            ngay = contentDateMatch[1];
            noiDung = contentDateMatch[2].trim();
          }
        }
      } else {
        // Try underscore separator
        const lastUnderscoreIndex = rest.lastIndexOf(' _ ');
        if (lastUnderscoreIndex > 0) {
          ngay = rest.substring(0, lastUnderscoreIndex).trim();
          noiDung = rest.substring(lastUnderscoreIndex + 3).trim();
        } else {
          // No separator found, check if content starts with date pattern
          const contentDateMatch = rest.match(/^(\d{1,2}[-/]\d{1,2}(?:[-/]\d{1,4})?)\s*-\s*(.+)/);
          if (contentDateMatch) {
            ngay = contentDateMatch[1];
            noiDung = contentDateMatch[2].trim();
          } else {
            // No date pattern found, treat entire rest as content
            noiDung = rest;
          }
        }
      }
      
      // If we still don't have a date but have content with date pattern, extract it
      if (!ngay && noiDung) {
        const contentDateMatch = noiDung.match(/^(\d{1,2}[-/]\d{1,2}(?:[-/]\d{1,4})?)\s*-\s*(.+)/);
        if (contentDateMatch) {
          ngay = contentDateMatch[1];
          noiDung = contentDateMatch[2].trim();
        }
      }
      
      if (ngay || noiDung) {
        
        // Format date to dd/mm/yyyy for display
        if (ngay) {
          // If already in dd/mm/yyyy format, keep it
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(ngay)) {
            // Already in correct format, just normalize
            const match = ngay.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (match) {
              ngay = `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
            }
          } else {
            // Convert to dd/mm/yyyy format
            const datePattern = /^\d{1,2}[-/]\d{1,2}$/;
            if (datePattern.test(ngay)) {
              // MM-DD or DD-MM format, add current year and convert to dd/mm/yyyy
              const parts = ngay.split(/[-/]/);
              const currentYear = new Date().getFullYear();
              // Assume DD-MM format (Vietnam standard)
              ngay = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${currentYear}`;
            } else {
              // Try to parse other date formats and convert to dd/mm/yyyy
              const fullDatePattern = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
              if (fullDatePattern.test(ngay)) {
                const parts = ngay.split(/[-/]/);
                if (parts.length === 3) {
                  if (parts[0].length === 4) {
                    // YYYY-MM-DD -> dd/mm/yyyy
                    ngay = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
                  } else if (parseInt(parts[2]) > 31) {
                    // MM-DD-YYYY -> dd/mm/yyyy
                    ngay = `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`;
                  } else {
                    // DD-MM-YYYY -> dd/mm/yyyy (already correct format, just normalize)
                    ngay = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
                  }
                }
              } else {
                // Try to use formatDateToDDMMYYYY helper
                ngay = formatDateToDDMMYYYY(ngay);
              }
            }
          }
        } else {
          // No date, use today's date in dd/mm/yyyy format
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          ngay = `${day}/${month}/${year}`;
        }
        
        entries.push({
          lan: lan,
          ngay: ngay,
          noiDung: noiDung,
        });
      }
    });
    
    return entries;
  };

  // Format work history entries to string
  const formatWorkHistory = (entries) => {
    return entries
      .sort((a, b) => a.lan - b.lan)
      .map(entry => {
        // Ensure date is in dd/mm/yyyy format
        const formattedDate = formatDateToDDMMYYYY(entry.ngay);
        return `Lần ${entry.lan}: ${formattedDate} - ${entry.noiDung}`;
      })
      .join('\n');
  };

  // Open work history modal
  const openWorkHistoryModal = (customer) => {
    setWorkHistoryCustomer(customer);
    const existingEntries = parseWorkHistory(customer.noiDung || '');
    
    if (existingEntries.length > 0) {
      // Dates are already in dd/mm/yyyy format from parseWorkHistory
      setWorkHistoryEntries(existingEntries);
    } else {
      // Start with one empty entry with today's date in dd/mm/yyyy format
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      setWorkHistoryEntries([{ lan: 1, ngay: `${day}/${month}/${year}`, noiDung: '' }]);
    }
    
    setIsWorkHistoryModalOpen(true);
  };

  // Close work history modal
  const closeWorkHistoryModal = () => {
    setIsWorkHistoryModalOpen(false);
    setWorkHistoryCustomer(null);
    setWorkHistoryEntries([]);
  };

  // Add new work history entry
  const addWorkHistoryEntry = () => {
    const maxLan = workHistoryEntries.length > 0 
      ? Math.max(...workHistoryEntries.map(e => e.lan)) 
      : 0;
    // Format today's date as dd/mm/yyyy
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setWorkHistoryEntries([
      ...workHistoryEntries,
      { lan: maxLan + 1, ngay: `${day}/${month}/${year}`, noiDung: '' }
    ]);
  };

  // Remove work history entry
  const removeWorkHistoryEntry = (index) => {
    const newEntries = workHistoryEntries.filter((_, i) => i !== index);
    // Renumber entries
    const renumbered = newEntries.map((entry, idx) => ({
      ...entry,
      lan: idx + 1
    }));
    setWorkHistoryEntries(renumbered);
  };

  // Update work history entry
  const updateWorkHistoryEntry = (index, field, value) => {
    const newEntries = [...workHistoryEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setWorkHistoryEntries(newEntries);
  };

  // Validate date format dd/mm/yyyy
  const validateDate = (dateStr) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Basic validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Check if date is valid (e.g., not 31/02)
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return false;
    }
    
    return true;
  };

  // Save work history
  const saveWorkHistory = async () => {
    if (!workHistoryCustomer) return;

    // Validate all entries
    for (const entry of workHistoryEntries) {
      if (entry.ngay && !validateDate(entry.ngay)) {
        toast.error(`Ngày không hợp lệ: ${entry.ngay}. Vui lòng nhập theo định dạng dd/mm/yyyy (ví dụ: 19/11/2024)`);
        return;
      }
    }

    // Filter out empty entries
    const validEntries = workHistoryEntries.filter(
      entry => entry.ngay && entry.noiDung && entry.noiDung.trim()
    );

    if (validEntries.length === 0) {
      toast.error('Vui lòng nhập ít nhất một lần lịch sử làm việc với đầy đủ ngày và nội dung!');
      return;
    }

    try {
      const formattedContent = formatWorkHistory(validEntries);
      const customerRef = ref(database, `customers/${workHistoryCustomer.firebaseKey}`);
      await update(customerRef, { noiDung: formattedContent });

      toast.success('Lưu lịch sử làm việc thành công!');

      // Reload customers (just reload allCustomers, permission filter will be applied in separate useEffect)
      const customersRef = ref(database, 'customers');
      const snapshot = await get(customersRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
        firebaseKey: key,
        stt: customer.stt || index + 1,
        ...customer,
      }));
      customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
      setAllCustomers(customersList);

      closeWorkHistoryModal();
    } catch (err) {
      console.error('Error saving work history:', err);
      toast.error('Lỗi khi lưu lịch sử làm việc: ' + err.message);
    }
  };

  // Update customer field directly from table
  const updateCustomerField = async (customer, field, value) => {
    try {
      const customerRef = ref(database, `customers/${customer.firebaseKey}`);
      await update(customerRef, { [field]: value });

      // Update allCustomers (permission filter will be applied in separate useEffect)
      const updatedAllCustomers = allCustomers.map(c => 
        c.firebaseKey === customer.firebaseKey 
          ? { ...c, [field]: value }
          : c
      );
      setAllCustomers(updatedAllCustomers);
      
      setOpenDropdown(null);
      toast.success('Cập nhật thành công!');
    } catch (err) {
      console.error('Error updating customer field:', err);
      toast.error('Lỗi khi cập nhật: ' + err.message);
    }
  };

  // Send notification to employee
  const sendNotificationToEmployee = async (employeeEmail, customerName, customerPhone, tvbh) => {
    if (!employeeEmail) return;
    
    try {
      // Normalize email for Firebase key (replace . and @ with safe characters)
      const normalizedEmail = employeeEmail.replace(/\./g, '_').replace(/@/g, '_at_');
      const notificationsRef = ref(database, `notifications/${normalizedEmail}`);
      
      const notification = {
        title: "Khách hàng mới được phân chia",
        message: `Bạn đã được phân chia khách hàng: ${customerName}${customerPhone ? ` (${customerPhone})` : ''}`,
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
        customerName: customerName,
        customerPhone: customerPhone,
        tvbh: tvbh,
      };
      
      await push(notificationsRef, notification);
    } catch (error) {
      console.error("Error sending notification:", error);
      // Don't show error to user, just log it
    }
  };

  // Get employee email from TVBH
  const getEmployeeEmailByTVBH = async (tvbh) => {
    if (!tvbh) return null;
    
    try {
      const employeesRef = ref(database, 'employees');
      const snapshot = await get(employeesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const employee = Object.values(data).find(
          (emp) => (emp.TVBH || emp['TVBH'] || '').trim() === tvbh.trim()
        );
        
        if (employee) {
          return employee.mail || employee.Mail || employee.email || null;
        }
      }
    } catch (error) {
      console.error("Error getting employee email:", error);
    }
    
    return null;
  };

  // Update TVBH (assign customer to employee) - for admin only
  const updateCustomerTVBH = async (customer, tvbh) => {
    try {
      const customerRef = ref(database, `customers/${customer.firebaseKey}`);
      await update(customerRef, { tvbh: tvbh });

      // Update allCustomers (permission filter will be applied in separate useEffect)
      const updatedAllCustomers = allCustomers.map(c => 
        c.firebaseKey === customer.firebaseKey 
          ? { ...c, tvbh: tvbh }
          : c
      );
      setAllCustomers(updatedAllCustomers);
      
      // Send notification to employee if TVBH is assigned
      if (tvbh && tvbh.trim() !== '') {
        const employeeEmail = await getEmployeeEmailByTVBH(tvbh);
        if (employeeEmail) {
          await sendNotificationToEmployee(
            employeeEmail,
            customer.tenKhachHang || 'Khách hàng',
            customer.soDienThoai || '',
            tvbh
          );
        }
      }
      
      setOpenDropdown(null);
      toast.success(`Đã phân chia khách hàng cho ${tvbh || 'chưa gán'}!`);
    } catch (err) {
      console.error('Error updating customer TVBH:', err);
      toast.error('Lỗi khi phân chia khách hàng: ' + err.message);
    }
  };

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = (dropdownKey) => {
    const container = document.querySelector(`[data-dropdown-key="${dropdownKey}"]`);
    if (!container) return { side: 'bottom', left: 0, top: 0 };
    
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedDropdownHeight = 400; // Approximate height of dropdown with all options
    const estimatedDropdownWidth = 180; // Approximate width of dropdown
    
    let side = 'bottom';
    let top = rect.bottom + 8; // 8px = mt-2
    let left = rect.left;
    
    // If not enough space below but enough space above, show on top
    if (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight) {
      side = 'top';
      top = rect.top - estimatedDropdownHeight - 8; // 8px = mb-2
    }
    
    // Adjust horizontal position if dropdown would overflow
    if (left + estimatedDropdownWidth > viewportWidth) {
      left = viewportWidth - estimatedDropdownWidth - 10; // 10px padding from edge
    }
    if (left < 10) {
      left = 10; // 10px padding from edge
    }
    
    return { side, left, top };
  };

  // Update dropdown position when it opens
  useEffect(() => {
    if (openDropdown) {
      // Use setTimeout to ensure DOM is updated and measure actual dropdown height
      const updatePosition = () => {
        const position = calculateDropdownPosition(openDropdown);
        setDropdownPosition(prev => ({
          ...prev,
          [openDropdown]: position
        }));
      };

      // Initial calculation
      setTimeout(updatePosition, 0);
      
      // Recalculate after a short delay to get actual dropdown height
      setTimeout(() => {
        const dropdownElement = document.querySelector(`[data-dropdown-menu="${openDropdown}"]`);
        const container = document.querySelector(`[data-dropdown-key="${openDropdown}"]`);
        if (dropdownElement && container) {
          const actualHeight = dropdownElement.offsetHeight;
          const rect = container.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          let side = 'bottom';
          let top = rect.bottom + 8;
          let left = rect.left;
          
          if (spaceBelow < actualHeight && spaceAbove > actualHeight) {
            side = 'top';
            top = rect.top - actualHeight - 8;
          }
          
          const estimatedDropdownWidth = 180;
          const viewportWidth = window.innerWidth;
          if (left + estimatedDropdownWidth > viewportWidth) {
            left = viewportWidth - estimatedDropdownWidth - 10;
          }
          if (left < 10) {
            left = 10;
          }
          
          setDropdownPosition(prev => ({
            ...prev,
            [openDropdown]: { side, left, top }
          }));
        }
      }, 10);

      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [openDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-secondary-600">Đang tải dữ liệu khách hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-primary-700">Quản Lý Khách Hàng</h2>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-secondary-600 text-white rounded-lg border-2 border-transparent hover:bg-white hover:border-secondary-600 hover:text-secondary-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-3 sm:mb-4">
        <p className="text-sm sm:text-base text-secondary-600">
          Tổng số: <span className="font-semibold text-primary-600">{filteredCustomers.length}</span> khách hàng
        </p>
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-6 sm:py-8 bg-secondary-50 rounded-lg">
          <p className="text-sm sm:text-base text-secondary-600">Không có dữ liệu khách hàng</p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-visible shadow-md rounded-lg relative -mx-4 sm:mx-0" style={{ isolation: 'isolate' }}>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-secondary-100 relative">
              <thead className="bg-primary-400">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    STT
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Ngày
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Tên Khách Hàng
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Số Điện Thoại
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    TVBH
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Tỉnh Thành
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Dòng Xe
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Phiên Bản
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Màu Sắc
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Nhu Cầu
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Thanh Toán
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Nguồn
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Mức Độ
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Trạng thái
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                    Nội Dung
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400 sticky right-0 z-30 bg-primary-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-white divide-y divide-secondary-100 relative" style={{ isolation: 'isolate' }}>
                {filteredCustomers.map((customer, index) => (
                  <tr 
                    key={customer.firebaseKey} 
                    className="hover:bg-secondary-50"
                    style={{ 
                      zIndex: (openDropdown === `mucDo-${customer.firebaseKey}` || openDropdown === `tinhTrang-${customer.firebaseKey}` || openDropdown === `tvbh-${customer.firebaseKey}`) ? 9999 : 'auto',
                      position: 'relative'
                    }}
                  >
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-semibold text-black border border-secondary-400">
                      {customer.stt || index + 1}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] truncate" title={customer.ngay || ''}>
                      {customer.ngay || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[120px] sm:max-w-none truncate" title={customer.tenKhachHang || ''}>
                      {customer.tenKhachHang || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400">
                      {customer.soDienThoai || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 relative" style={{ overflow: 'visible', zIndex: openDropdown === `tvbh-${customer.firebaseKey}` ? 9999 : 'auto' }}>
                      {userRole === 'admin' ? (
                        <div 
                          className="dropdown-container relative inline-block w-full" 
                          style={{ zIndex: openDropdown === `tvbh-${customer.firebaseKey}` ? 9999 : 'auto' }}
                          data-dropdown-key={`tvbh-${customer.firebaseKey}`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === `tvbh-${customer.firebaseKey}` ? null : `tvbh-${customer.firebaseKey}`);
                            }}
                            className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap w-full justify-between bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                            title={customer.tvbh || 'Chưa phân chia'}
                          >
                            <span className="max-w-[80px] sm:max-w-[120px] truncate">{customer.tvbh || 'Chưa phân chia'}</span>
                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          </button>
                          {openDropdown === `tvbh-${customer.firebaseKey}` && dropdownPosition[`tvbh-${customer.firebaseKey}`] && (
                            <div 
                              className="fixed bg-white border overflow-y-auto max-h-[300px] border-gray-300 rounded-2xl shadow-xl p-2 z-[9999] flex flex-col gap-1 min-w-[180px]"
                              data-dropdown-menu={`tvbh-${customer.firebaseKey}`}
                              style={{ 
                                position: 'fixed',
                                left: `${dropdownPosition[`tvbh-${customer.firebaseKey}`].left}px`,
                                top: `${dropdownPosition[`tvbh-${customer.firebaseKey}`].top}px`,
                                zIndex: 9999
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCustomerTVBH(customer, '');
                                }}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                                  !customer.tvbh 
                                    ? 'bg-gray-200 text-gray-800 ring-2 ring-gray-300' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                Chưa phân chia
                              </button>
                              {employees.map((employee) => (
                                <button
                                  key={employee.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCustomerTVBH(customer, employee.TVBH);
                                  }}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                                    customer.tvbh === employee.TVBH 
                                      ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-300' 
                                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }`}
                                >
                                  {employee.TVBH}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-[80px] sm:max-w-none truncate" title={customer.tvbh || ''}>
                          {customer.tvbh || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.tinhThanh || ''}>
                      {customer.tinhThanh || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.dongXe || ''}>
                      {customer.dongXe || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.phienBan || ''}>
                      {customer.phienBan || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.mauSac || ''}>
                      {customer.mauSac || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.nhuCau || ''}>
                      {customer.nhuCau || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.thanhToan || ''}>
                      {customer.thanhToan || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 max-w-[100px] sm:max-w-none truncate" title={customer.nguon || ''}>
                      {customer.nguon || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 relative" style={{ overflow: 'visible', zIndex: openDropdown === `mucDo-${customer.firebaseKey}` ? 9999 : 'auto' }}>
                      <div 
                        className="dropdown-container relative inline-block" 
                        style={{ zIndex: openDropdown === `mucDo-${customer.firebaseKey}` ? 9999 : 'auto' }}
                        data-dropdown-key={`mucDo-${customer.firebaseKey}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `mucDo-${customer.firebaseKey}` ? null : `mucDo-${customer.firebaseKey}`);
                          }}
                          className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                            customer.mucDo 
                              ? getMucDoColorClasses(customer.mucDo, false)
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          <span className="max-w-[60px] sm:max-w-[80px] truncate">{customer.mucDo || '-'}</span>
                          <ChevronDown className="w-3 h-3 flex-shrink-0" />
                        </button>
                        {openDropdown === `mucDo-${customer.firebaseKey}` && dropdownPosition[`mucDo-${customer.firebaseKey}`] && (
                          <div 
                            className="fixed bg-white border overflow-hidden border-gray-300 rounded-2xl shadow-xl p-2 z-[9999] flex flex-col gap-1"
                            data-dropdown-menu={`mucDo-${customer.firebaseKey}`}
                            style={{ 
                              position: 'fixed',
                              left: `${dropdownPosition[`mucDo-${customer.firebaseKey}`].left}px`,
                              top: `${dropdownPosition[`mucDo-${customer.firebaseKey}`].top}px`,
                              zIndex: 9999
                            }}
                          >
                            {MUC_DO_OPTIONS.map((option) => (
                              <button
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCustomerField(customer, 'mucDo', option);
                                }}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                  getMucDoColorClasses(option, customer.mucDo === option)
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 relative" style={{ overflow: 'visible', zIndex: openDropdown === `tinhTrang-${customer.firebaseKey}` ? 9999 : 'auto' }}>
                      <div 
                        className="dropdown-container relative inline-block" 
                        style={{ zIndex: openDropdown === `tinhTrang-${customer.firebaseKey}` ? 9999 : 'auto' }}
                        data-dropdown-key={`tinhTrang-${customer.firebaseKey}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `tinhTrang-${customer.firebaseKey}` ? null : `tinhTrang-${customer.firebaseKey}`);
                          }}
                          className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors whitespace-nowrap"
                        >
                          <span className="max-w-[100px] sm:max-w-[150px] truncate">{customer.tinhTrang || '-'}</span>
                          <ChevronDown className="w-3 h-3 flex-shrink-0" />
                        </button>
                        {openDropdown === `tinhTrang-${customer.firebaseKey}` && dropdownPosition[`tinhTrang-${customer.firebaseKey}`] && (
                          <div 
                            className="fixed bg-white border border-gray-300 rounded-2xl shadow-xl p-2 z-[9999] flex flex-col gap-1 min-w-[180px]"
                            data-dropdown-menu={`tinhTrang-${customer.firebaseKey}`}
                            style={{ 
                              position: 'fixed',
                              left: `${dropdownPosition[`tinhTrang-${customer.firebaseKey}`].left}px`,
                              top: `${dropdownPosition[`tinhTrang-${customer.firebaseKey}`].top}px`,
                              zIndex: 9999
                            }}
                          >
                            {TINH_TRANG_OPTIONS.map((option) => (
                              <button
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCustomerField(customer, 'tinhTrang', option);
                                }}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                  customer.tinhTrang === option 
                                    ? 'bg-green-100 text-green-800 ring-2 ring-green-300' 
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-black border border-secondary-400 max-w-[150px] sm:max-w-xs truncate" title={customer.noiDung || ''}>
                      {customer.noiDung || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-black border border-secondary-400 sticky right-0 z-20 bg-white">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openWorkHistoryModal(customer)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Thêm lịch sử làm việc"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-1 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary-700 truncate">Thêm Khách Hàng Mới</h3>
              <button
                onClick={closeAddModal}
                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Contract Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Hợp Đồng (tùy chọn)
                </label>
                <select
                  value={formData.selectedContractId}
                  onChange={(e) => handleContractSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn hợp đồng --</option>
                  {contracts.map((contract) => (
                    <option key={contract.firebaseKey} value={contract.firebaseKey}>
                      {contract.customerName} - {contract.phone} - {contract.dongXe} ({contract.createdAt})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Chọn hợp đồng để tự động điền thông tin khách hàng</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngay}
                    onChange={(e) => handleInputChange('ngay', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tên Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tenKhachHang}
                    onChange={(e) => handleInputChange('tenKhachHang', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Khách hàng là
                  </label>
                  <select
                    value={formData.khachHangLa}
                    onChange={(e) => handleInputChange('khachHangLa', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn loại khách hàng --</option>
                    {KHACH_HANG_LA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tỉnh Thành
                  </label>
                  <select
                    value={formData.tinhThanh}
                    onChange={(e) => handleInputChange('tinhThanh', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn tỉnh thành --</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Dòng Xe
                  </label>
                  <select
                    value={formData.dongXe}
                    onChange={(e) => {
                      handleInputChange('dongXe', e.target.value);
                      // Reset phiên bản when dòng xe changes
                      if (e.target.value !== formData.dongXe) {
                        handleInputChange('phienBan', '');
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn dòng xe --</option>
                    {getCarModels().map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing customers or contract selection) */}
                    {formData.dongXe && !getCarModels().includes(formData.dongXe) && (
                      <option value={formData.dongXe}>
                        {formData.dongXe} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phiên Bản
                  </label>
                  <select
                    value={formData.phienBan}
                    onChange={(e) => handleInputChange('phienBan', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!formData.dongXe}
                  >
                    <option value="">-- Chọn phiên bản --</option>
                    {getVariants(formData.dongXe).map((variant) => (
                      <option key={variant} value={variant}>
                        {variant}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing customers or contract selection) */}
                    {formData.phienBan && !getVariants(formData.dongXe).includes(formData.phienBan) && (
                      <option value={formData.phienBan}>
                        {formData.phienBan} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Màu Sắc
                  </label>
                  <select
                    value={formData.mauSac}
                    onChange={(e) => handleInputChange('mauSac', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn màu sắc --</option>
                    {getColors().map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing customers or contract selection) */}
                    {formData.mauSac && !getColors().includes(formData.mauSac) && (
                      <option value={formData.mauSac}>
                        {formData.mauSac} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nhu Cầu
                  </label>
                  <select
                    value={formData.nhuCau}
                    onChange={(e) => handleInputChange('nhuCau', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn nhu cầu --</option>
                    {NHU_CAU_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Thanh Toán
                  </label>
                  <select
                    value={formData.thanhToan}
                    onChange={(e) => handleInputChange('thanhToan', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn phương thức thanh toán --</option>
                    {THANH_TOAN_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nguồn
                  </label>
                  <select
                    value={formData.nguon}
                    onChange={(e) => handleInputChange('nguon', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn nguồn --</option>
                    {NGUON_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Mức Độ
                  </label>
                  <select
                    value={formData.mucDo}
                    onChange={(e) => handleInputChange('mucDo', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn mức độ --</option>
                    {MUC_DO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Trạng thái khách hàng
                  </label>
                  <select
                    value={formData.tinhTrang}
                    onChange={(e) => handleInputChange('tinhTrang', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn trạng thái khách hàng --</option>
                    {TINH_TRANG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Nội Dung
                </label>
                <textarea
                  value={formData.noiDung}
                  onChange={(e) => handleInputChange('noiDung', e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={closeAddModal}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary-700 truncate">Chỉnh Sửa Khách Hàng</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Contract Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Chọn Hợp Đồng (tùy chọn)
                </label>
                <select
                  value={formData.selectedContractId}
                  onChange={(e) => handleContractSelect(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn hợp đồng --</option>
                  {contracts.map((contract) => (
                    <option key={contract.firebaseKey} value={contract.firebaseKey}>
                      {contract.customerName} - {contract.phone} - {contract.dongXe} ({contract.createdAt})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Chọn hợp đồng để tự động điền thông tin khách hàng</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngay}
                    onChange={(e) => handleInputChange('ngay', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tên Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tenKhachHang}
                    onChange={(e) => handleInputChange('tenKhachHang', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Khách hàng là
                  </label>
                  <select
                    value={formData.khachHangLa}
                    onChange={(e) => handleInputChange('khachHangLa', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn loại khách hàng --</option>
                    {KHACH_HANG_LA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tỉnh Thành
                  </label>
                  <select
                    value={formData.tinhThanh}
                    onChange={(e) => handleInputChange('tinhThanh', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn tỉnh thành --</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Dòng Xe
                  </label>
                  <select
                    value={formData.dongXe}
                    onChange={(e) => {
                      handleInputChange('dongXe', e.target.value);
                      // Reset phiên bản when dòng xe changes
                      if (e.target.value !== formData.dongXe) {
                        handleInputChange('phienBan', '');
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn dòng xe --</option>
                    {getCarModels().map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing customers or contract selection) */}
                    {formData.dongXe && !getCarModels().includes(formData.dongXe) && (
                      <option value={formData.dongXe}>
                        {formData.dongXe} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phiên Bản
                  </label>
                  <select
                    value={formData.phienBan}
                    onChange={(e) => handleInputChange('phienBan', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!formData.dongXe}
                  >
                    <option value="">-- Chọn phiên bản --</option>
                    {getVariants(formData.dongXe).map((variant) => (
                      <option key={variant} value={variant}>
                        {variant}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing customers or contract selection) */}
                    {formData.phienBan && !getVariants(formData.dongXe).includes(formData.phienBan) && (
                      <option value={formData.phienBan}>
                        {formData.phienBan} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Màu Sắc
                  </label>
                  <select
                    value={formData.mauSac}
                    onChange={(e) => handleInputChange('mauSac', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn màu sắc --</option>
                    {getColors().map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                    {/* Show current value if it doesn't match any option (for editing existing customers or contract selection) */}
                    {formData.mauSac && !getColors().includes(formData.mauSac) && (
                      <option value={formData.mauSac}>
                        {formData.mauSac} (giá trị hiện tại)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nhu Cầu
                  </label>
                  <select
                    value={formData.nhuCau}
                    onChange={(e) => handleInputChange('nhuCau', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn nhu cầu --</option>
                    {NHU_CAU_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Thanh Toán
                  </label>
                  <select
                    value={formData.thanhToan}
                    onChange={(e) => handleInputChange('thanhToan', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn phương thức thanh toán --</option>
                    {THANH_TOAN_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nguồn
                  </label>
                  <select
                    value={formData.nguon}
                    onChange={(e) => handleInputChange('nguon', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn nguồn --</option>
                    {NGUON_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Mức Độ
                  </label>
                  <select
                    value={formData.mucDo}
                    onChange={(e) => handleInputChange('mucDo', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn mức độ --</option>
                    {MUC_DO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Trạng thái khách hàng
                  </label>
                  <select
                    value={formData.tinhTrang}
                    onChange={(e) => handleInputChange('tinhTrang', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Chọn trạng thái khách hàng --</option>
                    {TINH_TRANG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Nội Dung
                </label>
                <textarea
                  value={formData.noiDung}
                  onChange={(e) => handleInputChange('noiDung', e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={closeEditModal}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work History Modal */}
      {isWorkHistoryModalOpen && workHistoryCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary-700 truncate">
                Lịch sử làm việc - {workHistoryCustomer.tenKhachHang}
              </h3>
              <button
                onClick={closeWorkHistoryModal}
                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {workHistoryEntries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700">Lần {entry.lan}</h4>
                    {workHistoryEntries.length > 1 && (
                      <button
                        onClick={() => removeWorkHistoryEntry(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Xóa lần này"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.ngay}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Auto-format as user types (dd/mm/yyyy)
                        // Remove non-numeric characters except /
                        value = value.replace(/[^\d/]/g, '');
                        // Auto-insert slashes
                        if (value.length > 2 && value[2] !== '/') {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length > 5 && value[5] !== '/') {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        // Limit to dd/mm/yyyy format (10 characters)
                        if (value.length <= 10) {
                          updateWorkHistoryEntry(index, 'ngay', value);
                        }
                      }}
                      placeholder="dd/mm/yyyy"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={entry.noiDung}
                      onChange={(e) => updateWorkHistoryEntry(index, 'noiDung', e.target.value)}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nhập nội dung lịch sử làm việc..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addWorkHistoryEntry}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm lần</span>
              </button>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={closeWorkHistoryModal}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveWorkHistory}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

