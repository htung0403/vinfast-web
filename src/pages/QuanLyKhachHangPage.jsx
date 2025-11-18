import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, push, update, remove } from 'firebase/database';
import { database } from '../firebase/config';
import { X, Trash2, Plus, Edit, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';
import { getBranchByShowroomName } from '../data/branchData';
import { provinces } from '../data/provincesData';

export default function QuanLyKhachHangPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    ngay: new Date().toISOString().split('T')[0],
    tenKhachHang: '',
    soDienThoai: '',
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
          createdAt: contract.createdDate || contract.createdAt || '',
        }));

        setContracts(contractsList);
      } catch (err) {
        console.error('Error loading contracts:', err);
      }
    };

    loadContracts();
  }, []);

  // Load customers from Firebase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
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

        setCustomers(customersList);
        setFilteredCustomers(customersList);
        setLoading(false);
      } catch (err) {
        console.error('Error loading customers:', err);
        toast.error('Lỗi khi tải dữ liệu khách hàng');
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

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
    setFormData({
      ngay: new Date().toISOString().split('T')[0],
      tenKhachHang: '',
      soDienThoai: '',
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
        const maxStt = customers.length > 0 ? Math.max(...customers.map(c => c.stt || 0)) : 0;
        const customerRef = ref(database, 'customers');
        const newCustomerRef = await push(customerRef, {
          ...customerData,
          stt: maxStt + 1,
        });
        toast.success('Thêm khách hàng thành công!');
        closeAddModal();
      }

      // Reload customers
      const customersRef = ref(database, 'customers');
      const snapshot = await get(customersRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
        firebaseKey: key,
        stt: customer.stt || index + 1,
        ...customer,
      }));
      customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
      setCustomers(customersList);
      setFilteredCustomers(customersList);
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

      // Reload customers
      const customersRef = ref(database, 'customers');
      const snapshot = await get(customersRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
        firebaseKey: key,
        stt: customer.stt || index + 1,
        ...customer,
      }));
      customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
      setCustomers(customersList);
      setFilteredCustomers(customersList);
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Lỗi khi xóa khách hàng: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-8 py-8 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-secondary-600">Đang tải dữ liệu khách hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-8 py-8 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
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
          <h2 className="text-2xl font-bold text-primary-700">Quản Lý Khách Hàng</h2>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-secondary-600 text-white rounded-lg border-2 border-transparent hover:bg-white hover:border-secondary-600 hover:text-secondary-600 transition-all duration-200 flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-4">
        <p className="text-secondary-600">
          Tổng số: <span className="font-semibold text-primary-600">{filteredCustomers.length}</span> khách hàng
        </p>
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8 bg-secondary-50 rounded-lg">
          <p className="text-secondary-600">Không có dữ liệu khách hàng</p>
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
                  Ngày
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Tên Khách Hàng
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Số Điện Thoại
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Tỉnh Thành
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Dòng Xe
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Phiên Bản
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Màu Sắc
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Nhu Cầu
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Thanh Toán
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Nguồn
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Mức Độ
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Tình Trạng
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400">
                  Nội Dung
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-secondary-900 uppercase tracking-wider border border-secondary-400 sticky right-0 z-30 bg-primary-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-white divide-y divide-secondary-100">
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.firebaseKey} className="hover:bg-secondary-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-black border border-secondary-400">
                    {customer.stt || index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.ngay || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.tenKhachHang || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.soDienThoai || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.tinhThanh || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.dongXe || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.phienBan || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.mauSac || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.nhuCau || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.thanhToan || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.nguon || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.mucDo || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400">
                    {customer.tinhTrang || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-black border border-secondary-400 max-w-xs truncate" title={customer.noiDung || ''}>
                    {customer.noiDung || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border border-secondary-400 sticky right-0 z-20">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="p-1 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary-700">Thêm Khách Hàng Mới</h3>
              <button
                onClick={closeAddModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngay}
                    onChange={(e) => handleInputChange('ngay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tenKhachHang}
                    onChange={(e) => handleInputChange('tenKhachHang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh Thành
                  </label>
                  <select
                    value={formData.tinhThanh}
                    onChange={(e) => handleInputChange('tinhThanh', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dòng Xe
                  </label>
                  <input
                    type="text"
                    value={formData.dongXe}
                    onChange={(e) => handleInputChange('dongXe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên Bản
                  </label>
                  <input
                    type="text"
                    value={formData.phienBan}
                    onChange={(e) => handleInputChange('phienBan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu Sắc
                  </label>
                  <input
                    type="text"
                    value={formData.mauSac}
                    onChange={(e) => handleInputChange('mauSac', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhu Cầu
                  </label>
                  <input
                    type="text"
                    value={formData.nhuCau}
                    onChange={(e) => handleInputChange('nhuCau', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thanh Toán
                  </label>
                  <input
                    type="text"
                    value={formData.thanhToan}
                    onChange={(e) => handleInputChange('thanhToan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nguồn
                  </label>
                  <input
                    type="text"
                    value={formData.nguon}
                    onChange={(e) => handleInputChange('nguon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức Độ
                  </label>
                  <input
                    type="text"
                    value={formData.mucDo}
                    onChange={(e) => handleInputChange('mucDo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình Trạng
                  </label>
                  <input
                    type="text"
                    value={formData.tinhTrang}
                    onChange={(e) => handleInputChange('tinhTrang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội Dung
                </label>
                <textarea
                  value={formData.noiDung}
                  onChange={(e) => handleInputChange('noiDung', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary-700">Chỉnh Sửa Khách Hàng</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngay}
                    onChange={(e) => handleInputChange('ngay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tenKhachHang}
                    onChange={(e) => handleInputChange('tenKhachHang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh Thành
                  </label>
                  <select
                    value={formData.tinhThanh}
                    onChange={(e) => handleInputChange('tinhThanh', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dòng Xe
                  </label>
                  <input
                    type="text"
                    value={formData.dongXe}
                    onChange={(e) => handleInputChange('dongXe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên Bản
                  </label>
                  <input
                    type="text"
                    value={formData.phienBan}
                    onChange={(e) => handleInputChange('phienBan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu Sắc
                  </label>
                  <input
                    type="text"
                    value={formData.mauSac}
                    onChange={(e) => handleInputChange('mauSac', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhu Cầu
                  </label>
                  <input
                    type="text"
                    value={formData.nhuCau}
                    onChange={(e) => handleInputChange('nhuCau', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thanh Toán
                  </label>
                  <input
                    type="text"
                    value={formData.thanhToan}
                    onChange={(e) => handleInputChange('thanhToan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nguồn
                  </label>
                  <input
                    type="text"
                    value={formData.nguon}
                    onChange={(e) => handleInputChange('nguon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức Độ
                  </label>
                  <input
                    type="text"
                    value={formData.mucDo}
                    onChange={(e) => handleInputChange('mucDo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình Trạng
                  </label>
                  <input
                    type="text"
                    value={formData.tinhTrang}
                    onChange={(e) => handleInputChange('tinhTrang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội Dung
                </label>
                <textarea
                  value={formData.noiDung}
                  onChange={(e) => handleInputChange('noiDung', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

