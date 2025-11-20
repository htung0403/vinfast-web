import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import HopDongPage from './pages/HopDongPage';
import HopDongDaXuatPage from './pages/HopDongDaXuatPage';
import EditHopDongDaXuatPage from './pages/EditHopDongDaXuatPage';
import ContractFormPage from './pages/ContractFormPage';
import NhanSuPage from './pages/NhanSuPage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import GiayXacNhan from './components/BieuMau/GiayXacNhan';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import GiayXacNhanThongTin from './components/BieuMau/GiayXacNhanThongTin';
import GiayDeNghiThanhToan from './components/BieuMau/GiayDeNghiThanhToan';
import GiayXacNhanTangBaoHiem from './components/BieuMau/GiayXacNhanTangBaoHiem';
import PhuLucHopDong from './components/BieuMau/PhuLucHopDong';
import DeNghiXuatHoaDon from './components/BieuMau/DeNghiXuatHoaDon';
import Dashboard from './pages/Dashboard';
import CalculatorPage from './pages/CalculatorPage';
import Invoice2Page from './pages/Invoice2Page';
import QuanLyKhachHangPage from './pages/QuanLyKhachHangPage';
import HopDongMuaBanXe from './components/BieuMau/HopDongMuaBanXe';

function App() {
  return (
    <Router>
  <div className="min-h-screen bg-gradient-to-b from-white to-slate-200">
        <Header />

        {/* Routes */}
        <Routes>
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/trang-chu" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
          <Route path="/hop-dong" element={<ProtectedRoute><HopDongPage /></ProtectedRoute>} />
          <Route path="/hop-dong/them-moi" element={<ProtectedRoute><ContractFormPage /></ProtectedRoute>} />
          <Route path="/hop-dong/chinh-sua" element={<ProtectedRoute><ContractFormPage /></ProtectedRoute>} />
          <Route path="/hop-dong-da-xuat" element={<ProtectedRoute><HopDongDaXuatPage /></ProtectedRoute>} />
          <Route path="/hop-dong-da-xuat/edit/:id" element={<ProtectedRoute><EditHopDongDaXuatPage /></ProtectedRoute>} />
          <Route path="/nhan-su" element={<ProtectedRoute><NhanSuPage /></ProtectedRoute>} />
          <Route path="/quan-ly-khach-hang" element={<ProtectedRoute><QuanLyKhachHangPage /></ProtectedRoute>} />
          <Route path="/ho-so" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan" element={<ProtectedRoute><GiayXacNhan /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan-thong-tin" element={<ProtectedRoute><GiayXacNhanThongTin /></ProtectedRoute>} />
          <Route path="/giay-de-nghi-thanh-toan" element={<ProtectedRoute><GiayDeNghiThanhToan /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan-tang-bao-hiem" element={<ProtectedRoute><GiayXacNhanTangBaoHiem /></ProtectedRoute>} />
          <Route path="/phu-luc-hop-dong" element={<ProtectedRoute><PhuLucHopDong /></ProtectedRoute>} />
          <Route path="/bao-gia" element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>} />
          <Route path="/in-bao-gia-2" element={<ProtectedRoute><Invoice2Page /></ProtectedRoute>} />
          <Route path="/hop-dong-mua-ban-xe" element={<ProtectedRoute><HopDongMuaBanXe /></ProtectedRoute>} />
          <Route path="/de-nghi-xuat-hoa-don" element={<ProtectedRoute><DeNghiXuatHoaDon /></ProtectedRoute>} />
        </Routes>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
