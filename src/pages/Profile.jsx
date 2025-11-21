import { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bcrypt from 'bcryptjs';
import { 
  User, 
  FileText, 
  Briefcase, 
  Phone, 
  Share2, 
  Lock, 
  Key, 
  Edit, 
  Save, 
  X, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Info,
  Calendar,
  MapPin
} from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    position: '',
    birthdate: '',
    startDate: '',
    status: '',
    zalo: '',
    tiktok: '',
    facebook: '',
    fanpage: '',
    web: '',
  });

  const [departments, setDepartments] = useState([
    { value: '', label: 'Chưa chọn bộ phận' }
  ]);

  const [positions, setPositions] = useState([
    { value: '', label: 'Chưa chọn vị trí' }
  ]);

  const [customDepartment, setCustomDepartment] = useState('');
  const [customPosition, setCustomPosition] = useState('');
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);
  const [showCustomPosition, setShowCustomPosition] = useState(false);

  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // All users can edit their own profile
  const canEdit = true;

  useEffect(() => {
    loadDepartmentsFromUsers();
    loadPositionsFromUsers();
    loadUserProfile();
  }, []);

  const loadDepartmentsFromUsers = async () => {
    try {
      const usersRef = ref(database, 'employees');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();

        // Extract unique departments from users (support canonical 'phongBan')
        const uniqueDepartments = [...new Set(
          Object.values(usersData)
            .map(item => item.phongBan || item['Phòng Ban'] || item.department || item['Bộ phận'])
            .filter(Boolean)
        )];

        const departmentOptions = [
          { value: '', label: 'Chưa chọn bộ phận' },
          ...uniqueDepartments.sort().map(dept => ({ value: dept, label: dept })),
          { value: '__custom__', label: '➕ Nhập mới' }
        ];

        setDepartments(departmentOptions);
      } else {
        setDepartments([
          { value: '', label: 'Chưa chọn bộ phận' },
          { value: '__custom__', label: '➕ Nhập mới' }
        ]);
      }
    } catch (error) {
      console.error('Error loading departments from users:', error);
      setDepartments([
        { value: '', label: 'Lỗi tải danh sách bộ phận' },
        { value: '__custom__', label: '➕ Nhập mới' }
      ]);
    }
  };

  const loadPositionsFromUsers = async () => {
    try {
      const usersRef = ref(database, 'employees');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();

        // Extract unique positions from users (support canonical 'chucVu')
        const uniquePositions = [...new Set(
          Object.values(usersData)
            .map(item => item.chucVu || item['Chức Vị'] || item.position)
            .filter(Boolean)
        )];

        const positionOptions = [
          { value: '', label: 'Chưa chọn vị trí' },
          ...uniquePositions.sort().map(pos => ({ value: pos, label: pos })),
          { value: '__custom__', label: '➕ Nhập mới' }
        ];

        setPositions(positionOptions);
      } else {
        setPositions([
          { value: '', label: 'Chưa chọn vị trí' },
          { value: '__custom__', label: '➕ Nhập mới' }
        ]);
      }
    } catch (error) {
      console.error('Error loading positions from users:', error);
      setPositions([
        { value: '', label: 'Lỗi tải danh sách vị trí' },
        { value: '__custom__', label: '➕ Nhập mới' }
      ]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        navigate('/login');
        return;
      }

      // Get user info from employees table
      const userRef = ref(database, `employees/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const u = userSnapshot.val();

        // Map fields from users node directly (prefer canonical keys)
        setUserData({
          username: u.user || u.username || '',
          name: u.TVBH || u.name || '',
          email: u.mail || u.Mail || u.email || '',
          phone: u.soDienThoai || u.phone || u.phoneNumber || '',
          role: u.quyen || u['Quyền'] || u.role || 'user',
          department: u.phongBan || u['Phòng Ban'] || u.department || '',
          position: u.chucVu || u['Chức Vị'] || u.position || '',
          birthdate: u.sinhNhat || u['Sinh Nhật'] || u.birthday || u.birthdate || '',
          startDate: u.ngayVaoLam || u['Ngày vào làm'] || u.createdAt || u.startDate || '',
          status: u.tinhTrang || u['tình trạng'] || u.status || 'active',
          zalo: u.zalo || u.Zalo || '',
          tiktok: u.tiktok || u.TikTok || '',
          facebook: u.facebook || u.Facebook || '',
          fanpage: u.fanpage || '',
          web: u.web || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin profile!', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle custom department
    if (name === 'department') {
      if (value === '__custom__') {
        setShowCustomDepartment(true);
        setUserData(prev => ({ ...prev, department: '' }));
        return;
      } else {
        setShowCustomDepartment(false);
        setCustomDepartment('');
      }
    }
    
    // Handle custom position
    if (name === 'position') {
      if (value === '__custom__') {
        setShowCustomPosition(true);
        setUserData(prev => ({ ...prev, position: '' }));
        return;
      } else {
        setShowCustomPosition(false);
        setCustomPosition('');
      }
    }
    
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Chỉ lưu khi đang ở chế độ edit
    if (!isEditing) {
      console.log('Not in edit mode, preventing save');
      return;
    }
    
    console.log('Starting save process...');
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const userId = localStorage.getItem('userId');
      const userRef = ref(database, `employees/${userId}`);
      
      // Use custom values if provided
      const finalDepartment = showCustomDepartment ? customDepartment : userData.department;
      const finalPosition = showCustomPosition ? customPosition : userData.position;

      // Update employees table (use canonical keys)
      await update(userRef, {
        user: userData.username,
        TVBH: userData.name,
        mail: userData.email,
        soDienThoai: userData.phone || '',
        phongBan: finalDepartment,
        chucVu: finalPosition,
        sinhNhat: userData.birthdate || '',
        zalo: userData.zalo || '',
        tiktok: userData.tiktok || '',
        facebook: userData.facebook || '',
        fanpage: userData.fanpage || '',
        web: userData.web || '',
      });

      // Update localStorage
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userEmail', userData.email);

      toast.success('Cập nhật profile thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Tắt chế độ chỉnh sửa sau khi lưu thành công
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Không thể lưu thông tin. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
        
    // Validation
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setChangingPassword(true);

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        toast.error('Vui lòng đăng nhập lại!', {
          position: "top-right",
          autoClose: 4000,
        });
        navigate('/login');
        return;
      }

  // Get current user data from Firebase (employees)
  const userRef = ref(database, `employees/${userId}`);
  const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        toast.error('Không tìm thấy thông tin người dùng!', {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      const currentUserData = snapshot.val();

      // Verify current password (support 'pass' or 'password')
      const storedHash = currentUserData.pass || currentUserData.password || '';
      const passwordMatch = bcrypt.compareSync(
        passwordData.currentPassword, 
        storedHash
      );

      if (!passwordMatch) {
        toast.error('Mật khẩu hiện tại không đúng!', {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }


      // Hash new password
      const hashedNewPassword = bcrypt.hashSync(passwordData.newPassword, 10);

      // Update password in employees database (store in 'pass')
      await update(userRef, {
        pass: hashedNewPassword
      });

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);

      toast.success('Đổi mật khẩu thành công!', {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error('Error changing password:', error);
      
      toast.error(`Không thể đổi mật khẩu: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          Thông tin cá nhân
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Quản lý thông tin profile của bạn</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSave}>
          {/* Basic Information Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Username - Read Only */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={userData.username}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Không thể thay đổi</p>
            </div>

            {/* Role - Read Only */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Vai trò
              </label>
              <input
                type="text"
                value={
                  userData.role === 'admin' ? 'Quản trị viên' : 
                  userData.role === 'leader' ? 'Trưởng nhóm' :
                  userData.role === 'accountant' || userData.role === 'kế toán' ? 'Kế toán' :
                  'Nhân viên'
                }
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                placeholder="Nhập họ và tên"
                required
                disabled={saving || !isEditing}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                placeholder="email@example.com"
                required
                disabled={saving || !isEditing}
              />
            </div>

            </div>
          </div>

          {/* Work Information Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              Thông tin công việc
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Department */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Bộ phận
              </label>
              {showCustomDepartment ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                    placeholder="Nhập bộ phận mới"
                    disabled={saving || !isEditing}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomDepartment(false);
                      setCustomDepartment('');
                    }}
                    className="px-2 sm:px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center justify-center flex-shrink-0"
                    disabled={saving || !isEditing}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <select
                  name="department"
                  value={userData.department}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  disabled={saving || !isEditing}
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Vị trí
              </label>
              {showCustomPosition ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                    placeholder="Nhập vị trí mới"
                    disabled={saving || !isEditing}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomPosition(false);
                      setCustomPosition('');
                    }}
                    className="px-2 sm:px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center justify-center flex-shrink-0"
                    disabled={saving || !isEditing}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <select
                  name="position"
                  value={userData.position}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  disabled={saving || !isEditing}
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Status - Read Only */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Tình trạng
              </label>
              <input
                type="text"
                value={userData.status === 'active' ? 'Hoạt động' : userData.status === 'inactive' ? 'Không hoạt động' : userData.status || 'N/A'}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Không thể thay đổi</p>
            </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Thông tin liên hệ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                placeholder="Nhập số điện thoại"
                disabled={saving || !isEditing}
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Sinh nhật
              </label>
              <input
                type="date"
                name="birthdate"
                value={userData.birthdate ? userData.birthdate.split('T')[0] : ''}
                onChange={(e) => setUserData(prev => ({ ...prev, birthdate: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                disabled={saving || !isEditing}
              />
            </div>

            {/* Start Date - Read Only */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Ngày vào làm
              </label>
              <input
                type="text"
                value={userData.startDate ? (userData.startDate.includes('T') ? userData.startDate.split('T')[0] : userData.startDate) : 'N/A'}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Không thể thay đổi</p>
            </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Mạng xã hội
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Zalo */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Zalo
                </label>
                <input
                  type="text"
                  name="zalo"
                  value={userData.zalo}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập tên Zalo"
                  disabled={saving || !isEditing}
                />
              </div>

              {/* TikTok */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  TikTok
                </label>
                <input
                  type="text"
                  name="tiktok"
                  value={userData.tiktok}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập tên TikTok"
                  disabled={saving || !isEditing}
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={userData.facebook}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập tên Facebook"
                  disabled={saving || !isEditing}
                />
              </div>

              {/* Fanpage */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Fanpage
                </label>
                <input
                  type="text"
                  name="fanpage"
                  value={userData.fanpage}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập tên Fanpage"
                  disabled={saving || !isEditing}
                />
              </div>

              {/* Web */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="web"
                  value={userData.web}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="https://example.com"
                  disabled={saving || !isEditing}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {!isEditing ? (
                // View Mode - Show Edit Button
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit button clicked');
                      setIsEditing(true);
                    }}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/trang-chu')}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    Quay lại
                  </button>
                </>
              ) : (
                // Edit Mode - Show Save and Cancel Buttons
                <>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white transition text-sm sm:text-base ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-700 active:bg-green-800'
                    }`}
                  >
                    {saving ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                        Đang lưu...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        Lưu thay đổi
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      loadUserProfile(); // Reload data to cancel changes
                    }}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    Hủy
                  </button>
                </>
              )}
            </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              Đổi mật khẩu
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Cập nhật mật khẩu để bảo mật tài khoản</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            {showPasswordSection ? (
              <>
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                Đóng
              </>
            ) : (
              <>
                <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword}>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Current Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                  disabled={changingPassword}
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                  disabled={changingPassword}
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-xs sm:text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  disabled={changingPassword}
                />
              </div>
            </div>

            {/* Password Change Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={changingPassword}
                className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white transition text-sm sm:text-base ${
                  changingPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {changingPassword ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Đang cập nhật...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cập nhật mật khẩu
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                disabled={changingPassword}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Additional Info Card */}
      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-blue-700">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
              Lưu ý:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
              <li>Tên đăng nhập, vai trò, tình trạng và ngày vào làm không thể thay đổi</li>
              <li>Tất cả user đều có thể chỉnh sửa thông tin profile của mình</li>
              <li>Bạn có thể đổi mật khẩu bất kỳ lúc nào để bảo mật tài khoản</li>
              <li>Mật khẩu mới phải có ít nhất 6 ký tự</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default Profile;
