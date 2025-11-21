import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../firebase/config";
import {
  Calendar,
  Users,
  FileText,
  Car,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";

// Helper function to get current week number
const getCurrentWeek = () => {
  const today = new Date();
  const jan1 = new Date(today.getFullYear(), 0, 1);
  const dayOfWeek = jan1.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const week1Monday = new Date(today.getFullYear(), 0, 1 + daysToMonday);
  const diffTime = today - week1Monday;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  return weekNumber > 0 ? weekNumber : 1;
};

// Helper function to get start and end date of a week
const getWeekDates = (weekNumber, year) => {
  // January 1st of the year
  const jan1 = new Date(year, 0, 1);
  // Get the day of week (0 = Sunday, 1 = Monday, ...)
  const dayOfWeek = jan1.getDay();
  // Calculate days to add to get to Monday of week 1
  // If Jan 1 is Sunday (0), we need to go back 6 days, if Monday (1), we go back 0 days, etc.
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  // Get Monday of week 1
  const week1Monday = new Date(year, 0, 1 + daysToMonday);
  // Calculate start date of the selected week (weekNumber - 1 weeks after week 1)
  const startDate = new Date(week1Monday);
  startDate.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
  // End date is 6 days after start date (Sunday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

// Helper function to get current week or previous week dates
const getCurrentOrPreviousWeekDates = (option) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days to Monday of current week
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  // Get Monday of current week
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() + daysToMonday);
  currentWeekMonday.setHours(0, 0, 0, 0);
  
  if (option === "current") {
    // Current week: Monday to Sunday
    const endDate = new Date(currentWeekMonday);
    endDate.setDate(currentWeekMonday.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return { startDate: currentWeekMonday, endDate };
  } else {
    // Previous week: Monday to Sunday (7 days before current week)
    const previousWeekMonday = new Date(currentWeekMonday);
    previousWeekMonday.setDate(currentWeekMonday.getDate() - 7);
    const endDate = new Date(previousWeekMonday);
    endDate.setDate(previousWeekMonday.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return { startDate: previousWeekMonday, endDate };
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [newCustomersNeedAdvice, setNewCustomersNeedAdvice] = useState([]); // Customers that need consultation

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // day, week, month, quarter, year, range
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedWeekOption, setSelectedWeekOption] = useState("current"); // "current" or "previous"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState("all"); // "all" or specific employee name
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeContracts, setSelectedEmployeeContracts] = useState([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  
  // User permissions
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userDepartment, setUserDepartment] = useState("");
  const [actualEmployeeName, setActualEmployeeName] = useState(""); // Actual name from employees collection
  const [employeesMap, setEmployeesMap] = useState({}); // Map TVBH -> department
  const [teamEmployeeNames, setTeamEmployeeNames] = useState([]); // List of employee names in team (for leader)
  const [employeesLoaded, setEmployeesLoaded] = useState(false); // Flag to know when employees data is loaded
  
  const [reportData, setReportData] = useState({
    byEmployee: [],
    byModel: [],
    summary: {
      total: 0,
      signed: 0,
      exported: 0,
      pending: 0,
      cancelled: 0,
      completed: 0,
      transferred: 0,
      newCustomers: 0,
    },
  });

  // Load user info from localStorage first
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

  const [allContracts, setAllContracts] = useState([]); // Store all contracts before filtering
  const [allCustomers, setAllCustomers] = useState([]); // Store all customers before filtering

  // Fetch contracts from Firebase
  useEffect(() => {
    const loadContracts = async () => {
      try {
        setLoading(true);
        const contractsRef = ref(database, "contracts");
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const contractsArray = Object.entries(data).map(([key, contract]) => {
          // Handle date - can be createdDate or createdAt, and might be empty
          let createdAt = contract.createdDate || contract.createdAt || "";
          // If date is empty, use current date as fallback
          if (!createdAt) {
            createdAt = new Date().toISOString().split("T")[0];
          }

          return {
            firebaseKey: key,
            id: contract.id || "",
            createdAt: createdAt,
            createdDate: contract.createdDate || createdAt,
            TVBH: contract.tvbh || contract.TVBH || "Không xác định",
            tvbh: contract.tvbh || contract.TVBH || "Không xác định",
            customerName: contract.customerName || contract["Tên KH"] || "",
            "Tên KH": contract["Tên KH"] || contract.customerName || "",
            model: contract.dongXe || contract["Dòng xe"] || "Không xác định",
            dongXe: contract.dongXe || contract["Dòng xe"] || "Không xác định",
            status: contract.trangThai || contract.status || "mới",
            trangThai: contract.trangThai || contract.status || "mới",
            contractPrice: contract.giaHD || contract["Giá HD"] || 0,
            giaHD: contract.giaHD || contract["Giá HD"] || 0,
            deposit: contract.soTienCoc || contract["Số tiền cọc"] || 0,
            soTienCoc: contract.soTienCoc || contract["Số tiền cọc"] || 0,
            // Lưu toàn bộ thông tin từ Firebase để có thể navigate
            ...contract,
          };
        });

        setAllContracts(contractsArray);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu hợp đồng: " + err.message);
        setAllContracts([]);
      }
    };

    loadContracts();
  }, []);


  // Apply permission filter to contracts
  useEffect(() => {
    // If contracts haven't been loaded yet, wait
    if (allContracts.length === 0 && loading) {
      // Still loading, don't filter yet
      return;
    }

    // Don't filter until user info is loaded
    if (!userRole) {
      setContracts([]);
      // If contracts are loaded but userRole not set yet, keep loading
      if (allContracts.length > 0) {
        // Contracts loaded but user info not loaded, wait a bit
        return;
      }
      // No contracts and no userRole, set loading false
      setLoading(false);
      return;
    }

    // If no contracts loaded yet, just set empty array and stop loading
    if (allContracts.length === 0) {
      setContracts([]);
      setLoading(false);
      return;
    }

    // For user and leader, wait until employees are loaded to get actual names
    if ((userRole === "user" || userRole === "leader") && !employeesLoaded) {
      setContracts([]);
      return;
    }

    let filteredContracts = allContracts;
    
    if (userRole === "user") {
      // User: only see their own contracts (by TVBH matching actual employee name)
      // Use actualEmployeeName from employees collection (loaded via userEmail)
      if (actualEmployeeName) {
        filteredContracts = allContracts.filter(
          (contract) => {
            const contractTVBH = contract.TVBH || "";
            // Match exact name or try case-insensitive comparison
            return contractTVBH === actualEmployeeName || 
                   contractTVBH.toLowerCase() === actualEmployeeName.toLowerCase();
          }
        );
      } else if (!employeesLoaded) {
        // Still loading employee data, wait
        filteredContracts = [];
        return;
      } else {
        // Employee name not found, show empty
        filteredContracts = [];
      }
      // Set loading false after filtering for user
      setLoading(false);
    } else if (userRole === "leader") {
      // Leader: see contracts of employees in same department
      if (userDepartment && employeesLoaded) {
        if (teamEmployeeNames.length > 0) {
          filteredContracts = allContracts.filter((contract) => {
            const contractTVBH = contract.TVBH || "";
            return teamEmployeeNames.includes(contractTVBH);
          });
        } else {
          // No team members found, show empty
          filteredContracts = [];
        }
        // Set loading false after filtering for leader
        setLoading(false);
      } else {
        // No department or employees not loaded, can't filter yet
        filteredContracts = [];
        // Don't set loading false yet, wait for employees to load
      }
    } else if (userRole === "admin") {
      // Admin: see all contracts (no filter - filteredContracts = allContracts)
      setLoading(false);
    }

    setContracts(filteredContracts);
  }, [allContracts, userRole, username, userEmail, actualEmployeeName, userDepartment, teamEmployeeNames, employeesLoaded, loading]);

  // Fetch customers from Firebase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersRef = ref(database, "customers");
        const snapshot = await get(customersRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const customersArray = Object.entries(data).map(([key, customer]) => {
          // Handle date - can be ngay or createdDate
          let ngay = customer.ngay || customer.createdDate || "";
          // If date is empty, use current date as fallback
          if (!ngay) {
            ngay = new Date().toISOString().split("T")[0];
          }

          return {
            firebaseKey: key,
            ngay: ngay,
            tenKhachHang: customer.tenKhachHang || "",
            soDienThoai: customer.soDienThoai || "",
            tinhThanh: customer.tinhThanh || "",
            dongXe: customer.dongXe || "",
            phienBan: customer.phienBan || "",
            mauSac: customer.mauSac || "",
            mucDo: customer.mucDo || "",
            tinhTrang: customer.tinhTrang || "",
            noiDung: customer.noiDung || "",
            nguon: customer.nguon || "",
            nhuCau: customer.nhuCau || "",
            thanhToan: customer.thanhToan || "",
            TVBH: customer.tvbh || customer.TVBH || "",
            tvbh: customer.tvbh || customer.TVBH || "",
          };
        });

        setAllCustomers(customersArray);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu khách hàng: " + err.message);
        setAllCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  // Apply permission filter to customers and filter new customers needing advice
  useEffect(() => {
    // If no customers loaded yet, wait
    if (allCustomers.length === 0 && userRole !== "admin") {
      return;
    }

    // Don't filter until user info is loaded
    if (!userRole) {
      setCustomers([]);
      setNewCustomersNeedAdvice([]);
      return;
    }

    // For user and leader, wait until employees are loaded to get actual names
    if ((userRole === "user" || userRole === "leader") && !employeesLoaded) {
      setCustomers([]);
      setNewCustomersNeedAdvice([]);
      return;
    }

    let filteredCustomers = [];

    // Apply permission filter to all customers first
    if (userRole === "user") {
      // User: only see their own customers (by TVBH matching actual employee name)
      if (actualEmployeeName) {
        filteredCustomers = allCustomers.filter((customer) => {
          const customerTVBH = customer.TVBH || customer.tvbh || "";
          return customerTVBH === actualEmployeeName || 
                 customerTVBH.toLowerCase() === actualEmployeeName.toLowerCase();
        });
      } else {
        // Employee name not found, show empty
        filteredCustomers = [];
      }
    } else if (userRole === "leader") {
      // Leader: see customers of employees in same department
      if (userDepartment && teamEmployeeNames.length > 0) {
        filteredCustomers = allCustomers.filter((customer) => {
          const customerTVBH = customer.TVBH || customer.tvbh || "";
          return teamEmployeeNames.includes(customerTVBH);
        });
      } else {
        // No team members found, show empty
        filteredCustomers = [];
      }
    } else if (userRole === "admin") {
      // Admin: see all customers (no filter)
      filteredCustomers = allCustomers;
    }

    setCustomers(filteredCustomers);
  }, [allCustomers, userRole, actualEmployeeName, userDepartment, teamEmployeeNames, employeesLoaded]);

  // Get unique list of employees from contracts (filtered by permissions)
  const getUniqueEmployees = () => {
    const employees = new Set();
    contracts.forEach((contract) => {
      if (contract.TVBH && contract.TVBH !== "Không xác định") {
        // Additional permission check - only show employees user can see
        if (userRole === "admin" || 
            (userRole === "user" && contract.TVBH === username) ||
            (userRole === "leader" && teamEmployeeNames.includes(contract.TVBH))) {
        employees.add(contract.TVBH);
        }
      }
    });
    return Array.from(employees).sort();
  };

  // Generate report based on filters
  useEffect(() => {
    if (contracts.length === 0 && customers.length === 0) {
      // Reset report data if no data
      setReportData({
        byEmployee: [],
        byModel: [],
        summary: {
          total: 0,
          signed: 0,
          exported: 0,
          pending: 0,
          cancelled: 0,
          completed: 0,
          transferred: 0,
          newCustomers: 0,
        },
      });
      return;
    }

    let filteredContracts =
      contracts.length > 0 ? filterContractsByTimeRange(contracts) : [];

    // Filter by employee if selected
    if (selectedEmployee !== "all" && filteredContracts.length > 0) {
      filteredContracts = filteredContracts.filter(
        (contract) => contract.TVBH === selectedEmployee
      );
    }

    const filteredCustomers =
      customers.length > 0 ? filterCustomersByTimeRange(customers) : [];

    generateReports(filteredContracts, filteredCustomers);
  }, [
    contracts,
    customers,
    timeRange,
    selectedDate,
    selectedStartDate,
    selectedEndDate,
    selectedWeekOption,
    selectedMonth,
    selectedQuarter,
    selectedYear,
    selectedEmployee,
  ]);

  const filterContractsByTimeRange = (contracts) => {
    let startDate, endDate;

    switch (timeRange) {
      case "day":
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        const weekDates = getCurrentOrPreviousWeekDates(selectedWeekOption);
        startDate = weekDates.startDate;
        endDate = weekDates.endDate;
        break;
      case "month":
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        const quarterStartMonth = (selectedQuarter - 1) * 3;
        startDate = new Date(selectedYear, quarterStartMonth, 1);
        endDate = new Date(
          selectedYear,
          quarterStartMonth + 3,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "year":
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        break;
      case "range":
        startDate = new Date(selectedStartDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return contracts;
    }

    return contracts.filter((contract) => {
      if (!contract.createdAt) {
        return false; // Skip contracts without date
      }

      // Parse date - handle both ISO string and date string formats
      let contractDate;
      if (typeof contract.createdAt === "string") {
        // If it's a date string like "2024-01-15", parse it
        contractDate = new Date(contract.createdAt);
        // If parsing failed, try adding time component
        if (isNaN(contractDate.getTime())) {
          contractDate = new Date(contract.createdAt + "T00:00:00");
        }
      } else {
        contractDate = new Date(contract.createdAt);
      }

      // Check if date is valid
      if (isNaN(contractDate.getTime())) {
        return false;
      }

      return contractDate >= startDate && contractDate <= endDate;
    });
  };

  const filterCustomersByTimeRange = (customers) => {
    let startDate, endDate;

    switch (timeRange) {
      case "day":
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        const weekDates = getCurrentOrPreviousWeekDates(selectedWeekOption);
        startDate = weekDates.startDate;
        endDate = weekDates.endDate;
        break;
      case "month":
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        const quarterStartMonth = (selectedQuarter - 1) * 3;
        startDate = new Date(selectedYear, quarterStartMonth, 1);
        endDate = new Date(
          selectedYear,
          quarterStartMonth + 3,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "year":
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        break;
      case "range":
        startDate = new Date(selectedStartDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return customers;
    }

    return customers.filter((customer) => {
      if (!customer.ngay) {
        return false; // Skip customers without date
      }

      // Parse date - handle both ISO string and date string formats
      let customerDate;
      if (typeof customer.ngay === "string") {
        // If it's a date string like "2024-01-15", parse it
        customerDate = new Date(customer.ngay);
        // If parsing failed, try adding time component
        if (isNaN(customerDate.getTime())) {
          customerDate = new Date(customer.ngay + "T00:00:00");
        }
      } else {
        customerDate = new Date(customer.ngay);
      }

      // Check if date is valid
      if (isNaN(customerDate.getTime())) {
        return false;
      }

      return customerDate >= startDate && customerDate <= endDate;
    });
  };

  // Apply time filter to new customers needing advice
  useEffect(() => {
    // Get the base list of customers needing advice (already filtered by permission and criteria)
    // We need to filter this by time range
    const baseNeedsAdviceCustomers = customers.filter((customer) => {
      const tinhTrang = customer.tinhTrang || "";
      const mucDo = customer.mucDo || "";
      
      const needsAdvice = 
        (tinhTrang === "Mới" || tinhTrang === "Đã liên hệ") &&
        (mucDo === "Very hot" || mucDo === "Hot");
      
      return needsAdvice;
    });

    // Apply time filter
    const filteredNeedsAdvice = filterCustomersByTimeRange(baseNeedsAdviceCustomers);
    
    // Sort by date (newest first)
    filteredNeedsAdvice.sort((a, b) => {
      const dateA = new Date(a.ngay || 0);
      const dateB = new Date(b.ngay || 0);
      return dateB - dateA;
    });
    
    setNewCustomersNeedAdvice(filteredNeedsAdvice);
  }, [
    customers,
    timeRange,
    selectedDate,
    selectedStartDate,
    selectedEndDate,
    selectedWeekOption,
    selectedMonth,
    selectedQuarter,
    selectedYear,
  ]);

  const generateReports = (filteredContracts, filteredCustomers) => {
    // Group by employee
    const byEmployee = {};
    const byModel = {};

    let total = 0;
    let signed = 0;
    let exported = 0;
    let pending = 0;
    let cancelled = 0;
    let completed = 0;
    let transferred = 0;
    let newCustomers = filteredCustomers.length;

    filteredContracts.forEach((contract) => {
      total++;

      // Count by status
      switch (contract.status) {
        case "mới":
          signed++;
          break;
        case "xuất":
          exported++;
          break;
        case "hoàn":
          completed++;
          break;
        case "hủy":
          cancelled++;
          break;
        case "chuyển tên":
          transferred++;
          break;
        default:
          pending++;
      }

      // Group by employee
      const employee = contract.TVBH || "Không xác định";
      if (!byEmployee[employee]) {
        byEmployee[employee] = {
          employee,
          total: 0,
          signed: 0,
          exported: 0,
          pending: 0,
          cancelled: 0,
          completed: 0,
          transferred: 0,
          models: new Set(), // Track unique models for this employee
          pendingContracts: [], // Track pending contracts (đã ký nhưng chưa xuất)
        };
      }

      // Add model to employee's model set
      const model = contract.model || "Không xác định";
      byEmployee[employee].models.add(model);

      // Track pending contracts (status = "mới" - đã ký nhưng chưa xuất)
      if (contract.status === "mới") {
        byEmployee[employee].pendingContracts.push({
          ...contract, // Lưu toàn bộ thông tin hợp đồng để có thể navigate
          firebaseKey: contract.firebaseKey,
          id: contract.id || contract.firebaseKey,
          customerName: contract.customerName || "",
          model: contract.model || "",
          createdAt: contract.createdAt || "",
        });
      }

      byEmployee[employee].total++;
      switch (contract.status) {
        case "mới":
          byEmployee[employee].signed++;
          break;
        case "xuất":
          byEmployee[employee].exported++;
          break;
        case "hoàn":
          byEmployee[employee].completed++;
          break;
        case "hủy":
          byEmployee[employee].cancelled++;
          break;
        case "chuyển tên":
          byEmployee[employee].transferred++;
          break;
        default:
          byEmployee[employee].pending++;
      }

      // Group by model (reuse the model variable declared above)
      if (!byModel[model]) {
        byModel[model] = {
          model,
          total: 0,
          signed: 0,
          exported: 0,
          pending: 0,
          cancelled: 0,
          completed: 0,
          transferred: 0,
        };
      }

      byModel[model].total++;
      switch (contract.status) {
        case "mới":
          byModel[model].signed++;
          break;
        case "xuất":
          byModel[model].exported++;
          break;
        case "hoàn":
          byModel[model].completed++;
          break;
        case "hủy":
          byModel[model].cancelled++;
          break;
        case "chuyển tên":
          byModel[model].transferred++;
          break;
        default:
          byModel[model].pending++;
      }
    });

    setReportData({
      byEmployee: Object.values(byEmployee)
        .map((emp) => ({
          ...emp,
          models: Array.from(emp.models).sort(), // Convert Set to sorted Array
        }))
        .sort((a, b) => b.total - a.total),
      byModel: Object.values(byModel).sort((a, b) => b.total - a.total),
      summary: {
        total,
        signed,
        exported,
        pending,
        cancelled,
        completed,
        transferred,
        newCustomers,
      },
    });
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case "day":
        return `ngày ${selectedDate}`;
      case "week":
        return selectedWeekOption === "current" ? "tuần này" : "tuần trước";
      case "month":
        return `tháng ${selectedMonth}/${selectedYear}`;
      case "quarter":
        return `quý ${selectedQuarter}/${selectedYear}`;
      case "year":
        return `năm ${selectedYear}`;
      case "range":
        return `từ ${selectedStartDate} đến ${selectedEndDate}`;
      default:
        return "";
    }
  };

  const openPendingContractsModal = (employeeName, pendingContracts) => {
    setSelectedEmployeeName(employeeName);
    setSelectedEmployeeContracts(pendingContracts || []);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeContracts([]);
    setSelectedEmployeeName("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-secondary-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-700">
          Dashboard Báo Cáo
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          Bộ lọc
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Loại báo cáo
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
            >
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
              <option value="quarter">Theo quý</option>
              <option value="year">Theo năm</option>
              <option value="range">Tùy chọn khoảng thời gian</option>
            </select>
          </div>

          {timeRange === "day" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Ngày
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
              />
            </div>
          )}

          {timeRange === "week" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Chọn tuần
              </label>
              <select
                value={selectedWeekOption}
                onChange={(e) => setSelectedWeekOption(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
              >
                <option value="current">Tuần này</option>
                <option value="previous">Tuần trước</option>
              </select>
            </div>
          )}

          {timeRange === "range" && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  min={selectedStartDate}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                />
              </div>
            </>
          )}

          {timeRange === "month" && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tháng
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Năm
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}

          {timeRange === "quarter" && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Quý
                </label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                >
                  <option value={1}>Quý 1</option>
                  <option value={2}>Quý 2</option>
                  <option value={3}>Quý 3</option>
                  <option value={4}>Quý 4</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Năm
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}

          {timeRange === "year" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Năm
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Employee Filter - Only show if user is admin or leader */}
          {(userRole === "admin" || userRole === "leader") && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Nhân viên
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
            >
              <option value="all">Tất cả nhân viên</option>
              {getUniqueEmployees().map((employee) => (
                <option key={employee} value={employee}>
                  {employee}
                </option>
              ))}
            </select>
          </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Tổng hợp đồng</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-600">
                {reportData.summary.total}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-primary-100 rounded-full">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Đã ký</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {reportData.summary.signed}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Đã xuất</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {reportData.summary.exported}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Tồn kho</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
                {reportData.summary.pending}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Khách hàng mới
              </p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {reportData.summary.newCustomers}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Report by Employee */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Báo cáo theo Nhân viên ({getTimeRangeText()})</span>
          </h2>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dòng xe
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã ký
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã xuất
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tồn
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoàn thành
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hủy
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyển tên
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hợp đồng tồn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.byEmployee.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 text-center">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-none truncate" title={item.employee}>
                        {item.employee}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                        {item.models && item.models.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.models.map((model, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                              >
                                {model}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.total}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.signed}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.exported}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.pending}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.completed}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.cancelled}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.transferred}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                        {item.pendingContracts && item.pendingContracts.length > 0 ? (
                          <button
                            onClick={() => openPendingContractsModal(item.employee, item.pendingContracts)}
                            className="bg-slate-300 hover:bg-slate-400 text-white font-semibold py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                          >
                            {item.pendingContracts.length}
                          </button>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Report by Model */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Báo cáo theo Mẫu xe ({getTimeRangeText()})</span>
          </h2>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mẫu xe
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã ký
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã xuất
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tồn
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoàn thành
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hủy
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyển tên
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.byModel.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 text-center">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none truncate" title={item.model}>
                        {item.model}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.total}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.signed}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.exported}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.pending}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.completed}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.cancelled}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {item.transferred}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* New Customers Needing Advice Table */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          Khách hàng mới cần tư vấn
        </h2>

        {newCustomersNeedAdvice.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
            Không có khách hàng mới cần tư vấn
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên khách hàng
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỉnh thành
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dòng xe
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phiên bản
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Màu sắc
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mức độ
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tình trạng
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nguồn
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newCustomersNeedAdvice.map((customer, index) => {
                    // Helper function for mucDo color classes
                    const getMucDoClasses = (mucDo) => {
                      const colorMap = {
                        'Very hot': 'bg-red-100 text-red-800',
                        'Hot': 'bg-orange-100 text-orange-800',
                        'Cool': 'bg-blue-100 text-blue-800',
                        'Warm': 'bg-yellow-100 text-yellow-800',
                      };
                      return colorMap[mucDo] || 'bg-gray-100 text-gray-800';
                    };

                    return (
                      <tr key={customer.firebaseKey} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {customer.ngay ? new Date(customer.ngay).toLocaleDateString("vi-VN") : '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none truncate" title={customer.tenKhachHang || ''}>
                          {customer.tenKhachHang || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {customer.soDienThoai || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-none truncate" title={customer.tinhThanh || ''}>
                          {customer.tinhThanh || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-none truncate" title={customer.dongXe || ''}>
                          {customer.dongXe || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-none truncate" title={customer.phienBan || ''}>
                          {customer.phienBan || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-none truncate" title={customer.mauSac || ''}>
                          {customer.mauSac || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                          {customer.mucDo ? (
                            <span className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getMucDoClasses(customer.mucDo)}`}>
                              {customer.mucDo}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                          {customer.tinhTrang ? (
                            <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                              {customer.tinhTrang}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-none truncate" title={customer.nguon || ''}>
                          {customer.nguon || '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <button
                            onClick={() => navigate("/quan-ly-khach-hang")}
                            className="text-primary-600 hover:text-primary-800 font-medium text-xs sm:text-sm"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal hiển thị hợp đồng tồn */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 truncate">
                Hợp đồng tồn - {selectedEmployeeName}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1">
              {selectedEmployeeContracts.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {selectedEmployeeContracts.map((contract, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        closeModal();
                        navigate("/hop-dong/chi-tiet", {
                          state: { contract: contract, mode: 'details' },
                        });
                      }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg mb-2">
                            {contract.customerName || `Hợp đồng ${contract.id || idx + 1}`}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                            {contract.model && (
                              <div className="flex items-center gap-1">
                                <Car className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium">{contract.model}</span>
                              </div>
                            )}
                            {contract.createdAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>
                                  {new Date(contract.createdAt).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {contract.customerName && (
                              <div className="text-gray-500">
                                Tên khách hàng: {contract.customerName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                  Không có hợp đồng tồn
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 sm:py-2.5 px-5 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
