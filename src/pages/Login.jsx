import { useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import VinfastLogo from '../assets/vinfast.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Lấy danh sách employees từ Firebase
      const usersRef = ref(database, 'employees');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        
        // Tìm user với email khớp (hỗ trợ cả trường mail/Mail/email)
        const userEntry = Object.entries(users).find(([key, user]) => {
          const userEmail = (user && (user.mail || user.Mail || user.email || '')) .toString().toLowerCase();
          return userEmail === email.toLowerCase();
        });

        if (userEntry) {
          const [userId, userData] = userEntry;
          
          // Kiểm tra xem user có mật khẩu không (hợp lệ cả 'pass' và 'password')
          const storedHash = userData.pass || userData.password || '';
          if (!storedHash) {
            toast.error('Tài khoản chưa được thiết lập mật khẩu. Vui lòng liên hệ quản trị viên!', {
              position: "top-right",
              autoClose: 5000,
            });
            setLoading(false);
            return;
          }
          
          // So sánh mật khẩu đã hash
          const passwordMatch = bcrypt.compareSync(password, storedHash);
          
          if (passwordMatch) {
            // Lưu thông tin đăng nhập vào localStorage
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userId', userId);
            localStorage.setItem('username', userData.user || userData.username || userData.TVBH || userData.name || '');
            localStorage.setItem('userRole', userData.quyen || userData['Quyền'] || userData.role || 'user');
            localStorage.setItem('userEmail', userData.mail || userData.Mail || userData.email || '');
            localStorage.setItem('userDepartment', userData.phongBan || userData['Phòng Ban'] || userData.department || userData['Bộ phận'] || '');

            toast.success('Đăng nhập thành công!', {
              position: "top-right",
              autoClose: 2000,
            });

            // Chuyển đến trang chính sau 2 giây
            setTimeout(() => {
              navigate('/trang-chu');
            }, 2000);
          } else {
            toast.error('Email hoặc mật khẩu không đúng!', {
              position: "top-right",
              autoClose: 4000,
            });
          }
        } else {
          toast.error('Email hoặc mật khẩu không đúng!', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      } else {
        toast.error('Không tìm thấy dữ liệu người dùng!', {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-neutral-white to-secondary-300 flex items-center justify-center px-4 text-secondary-900">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={VinfastLogo}
              alt="VinFast logo"
              className="h-20 w-20 object-contain"
            />
          </div>
          {/* <h1 className="text-3xl font-bold text-[#E60012] mb-2">
            VINFAST - BÁO CÁO MARKETING
          </h1> */}
          <p className="text-gray-600">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form */}
  <div className="bg-neutral-white rounded-lg shadow-2xl p-8 border border-secondary-100">
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-secondary-600 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="Nhập email"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-secondary-600 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-secondary-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:brightness-90 active:brightness-75'
              }`}
              aria-label="Đăng nhập VinFast"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>&copy; 2025 VinFast. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
