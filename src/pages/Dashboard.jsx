import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebase/config";
import { Calendar, Users, FileText, Car, TrendingUp, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // day, month, quarter, year
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
      newCustomers: 0
    }
  });

  // Fetch contracts from Firebase
  useEffect(() => {
    const loadContracts = async () => {
      try {
        setLoading(true);
        const contractsRef = ref(database, "contracts");
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        console.log("Firebase data loaded:", Object.keys(data).length, "contracts");

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
            TVBH: contract.tvbh || contract.TVBH || "Không xác định",
            customerName: contract.customerName || contract["Tên KH"] || "",
            model: contract.dongXe || contract["Dòng xe"] || "Không xác định",
            status: contract.trangThai || contract.status || "mới",
            contractPrice: contract.giaHD || contract["Giá HD"] || 0,
            deposit: contract.soTienCoc || contract["Số tiền cọc"] || 0,
          };
        });

        console.log("Processed contracts:", contractsArray.length);
        setContracts(contractsArray);
        setLoading(false);
      } catch (err) {
        console.error("Error loading contracts:", err);
        toast.error("Lỗi khi tải dữ liệu hợp đồng: " + err.message);
        setLoading(false);
        setContracts([]);
      }
    };

    loadContracts();
  }, []);

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
          };
        });

        setCustomers(customersArray);
      } catch (err) {
        console.error("Error loading customers:", err);
        toast.error("Lỗi khi tải dữ liệu khách hàng: " + err.message);
        setCustomers([]);
      }
    };

    loadCustomers();
  }, []);

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
          newCustomers: 0
        }
      });
      return;
    }

    const filteredContracts = contracts.length > 0 ? filterContractsByTimeRange(contracts) : [];
    const filteredCustomers = customers.length > 0 ? filterCustomersByTimeRange(customers) : [];
    
    console.log("Filtered contracts:", filteredContracts.length, "out of", contracts.length);
    console.log("Filtered customers:", filteredCustomers.length, "out of", customers.length);
    
    generateReports(filteredContracts, filteredCustomers);
  }, [contracts, customers, timeRange, selectedDate, selectedMonth, selectedQuarter, selectedYear]);

  const filterContractsByTimeRange = (contracts) => {
    let startDate, endDate;

    switch (timeRange) {
      case "day":
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        const quarterStartMonth = (selectedQuarter - 1) * 3;
        startDate = new Date(selectedYear, quarterStartMonth, 1);
        endDate = new Date(selectedYear, quarterStartMonth + 3, 0, 23, 59, 59, 999);
        break;
      case "year":
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        break;
      default:
        return contracts;
    }

    return contracts.filter(contract => {
      if (!contract.createdAt) {
        return false; // Skip contracts without date
      }
      
      // Parse date - handle both ISO string and date string formats
      let contractDate;
      if (typeof contract.createdAt === 'string') {
        // If it's a date string like "2024-01-15", parse it
        contractDate = new Date(contract.createdAt);
        // If parsing failed, try adding time component
        if (isNaN(contractDate.getTime())) {
          contractDate = new Date(contract.createdAt + 'T00:00:00');
        }
      } else {
        contractDate = new Date(contract.createdAt);
      }

      // Check if date is valid
      if (isNaN(contractDate.getTime())) {
        console.warn("Invalid date for contract:", contract.firebaseKey, contract.createdAt);
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
      case "month":
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        const quarterStartMonth = (selectedQuarter - 1) * 3;
        startDate = new Date(selectedYear, quarterStartMonth, 1);
        endDate = new Date(selectedYear, quarterStartMonth + 3, 0, 23, 59, 59, 999);
        break;
      case "year":
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        break;
      default:
        return customers;
    }

    return customers.filter(customer => {
      if (!customer.ngay) {
        return false; // Skip customers without date
      }
      
      // Parse date - handle both ISO string and date string formats
      let customerDate;
      if (typeof customer.ngay === 'string') {
        // If it's a date string like "2024-01-15", parse it
        customerDate = new Date(customer.ngay);
        // If parsing failed, try adding time component
        if (isNaN(customerDate.getTime())) {
          customerDate = new Date(customer.ngay + 'T00:00:00');
        }
      } else {
        customerDate = new Date(customer.ngay);
      }

      // Check if date is valid
      if (isNaN(customerDate.getTime())) {
        console.warn("Invalid date for customer:", customer.firebaseKey, customer.ngay);
        return false;
      }

      return customerDate >= startDate && customerDate <= endDate;
    });
  };

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

    filteredContracts.forEach(contract => {
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
          transferred: 0
        };
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

      // Group by model
      const model = contract.model || "Không xác định";
      if (!byModel[model]) {
        byModel[model] = {
          model,
          total: 0,
          signed: 0,
          exported: 0,
          pending: 0,
          cancelled: 0,
          completed: 0,
          transferred: 0
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
      byEmployee: Object.values(byEmployee).sort((a, b) => b.total - a.total),
      byModel: Object.values(byModel).sort((a, b) => b.total - a.total),
      summary: {
        total,
        signed,
        exported,
        pending,
        cancelled,
        completed,
        transferred,
        newCustomers
      }
    });
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case "day":
        return `ngày ${selectedDate}`;
      case "month":
        return `tháng ${selectedMonth}/${selectedYear}`;
      case "quarter":
        return `quý ${selectedQuarter}/${selectedYear}`;
      case "year":
        return `năm ${selectedYear}`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-700">Dashboard Báo Cáo</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Bộ lọc thời gian
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="quarter">Theo quý</option>
              <option value="year">Theo năm</option>
            </select>
          </div>

          {timeRange === "day" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {timeRange === "month" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Quý</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>Quý 1</option>
                  <option value={2}>Quý 2</option>
                  <option value={3}>Quý 3</option>
                  <option value={4}>Quý 4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-primary-600">{reportData.summary.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã ký</p>
              <p className="text-2xl font-bold text-green-600">{reportData.summary.signed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã xuất</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.summary.exported}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tồn kho</p>
              <p className="text-2xl font-bold text-orange-600">{reportData.summary.pending}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng mới</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.summary.newCustomers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report by Employee */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Báo cáo theo Nhân viên ({getTimeRangeText()})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã ký</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã xuất</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoàn thành</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hủy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyển tên</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.byEmployee.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.employee}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.total}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.signed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.exported}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.pending}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.completed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.cancelled}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.transferred}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report by Model */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Báo cáo theo Mẫu xe ({getTimeRangeText()})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mẫu xe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã ký</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã xuất</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoàn thành</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hủy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyển tên</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.byModel.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.model}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.total}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.signed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.exported}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.pending}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.completed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.cancelled}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.transferred}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}