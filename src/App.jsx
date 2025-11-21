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
import TTHTLV_CĐX_Shinhan_gui_DL from './components/BieuMau/TTHTLV_CĐX_Shinhan_gui_DL';
import TT_HTLV_CĐX_TPB from './components/BieuMau/TT_HTLV_CĐX_TPB';
import Thoa_thuan_ho_tro_lai_suat_vay_CĐX_Vinfast_va_LFVN from './components/BieuMau/Thoa_thuan_ho_tro_lai_suat_vay_CĐX_Vinfast_va_LFVN';
import PhieuTangBaoHiem from './components/BieuMau/PhieuTangBaoHiem';
import PhieuRutCoc from './components/BieuMau/PhieuRutCoc';
import PDI_KH from './components/BieuMau/PDI_KH';
import GiayXacNhanThanhToanNH from './components/BieuMau/GiayXacNhanThanhToanNH';
import GiayXacNhanTangBaoHiemVPBank from './components/BieuMau/GiayXacNhanTangBaoHiemVPBank';
import GiayXacNhanSKSM from './components/BieuMau/GiayXacNhanSKSM';
import GiayXacNhanPhaiThuKH_DL_Gui_NH from './components/BieuMau/GiayXacNhanPhaiThuKH-DL-Gui-NH';
import GiayXacNhanKieuLoai from './components/BieuMau/GiayXacNhanKieuLoai';
import GiayThoaThuanTraCham from './components/BieuMau/GiayThoaThuanTraCham';
import GiayThoaThuanTraThay from './components/BieuMau/GiayThoaThuanTraThay';
import GiayThoaThuanHTVLCT90_nien_kim_60_thang from './components/BieuMau/GiayThoaThuanHTVLCT90_nien_kim_60_thang';
import GiayThoaThuanHTLS_VPBank from './components/BieuMau/GiayThoaThuanHTLS_VPBank';
import GiayThoaThuanHoTroVayLai from './components/BieuMau/GiayThoaThuanHoTroVayLai';
import DeXuatGiaban from './components/BieuMau/DeXuatGiaban';
import BIDV_ThoaThuanHoTroLaiVay from './components/BieuMau/BIDV_ThoaThuanHoTroLaiVay';

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
          <Route path="/hop-dong/chi-tiet" element={<ProtectedRoute><ContractFormPage /></ProtectedRoute>} />
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
          <Route path="/thoa-thuan-ho-tro-lai-vay-shinhan-cdx" element={<ProtectedRoute><TTHTLV_CĐX_Shinhan_gui_DL /></ProtectedRoute>} />
          <Route path="/bieu-mau-tpbank" element={<ProtectedRoute><TT_HTLV_CĐX_TPB /></ProtectedRoute>} />
          <Route path="/thoa-thuan-ho-tro-lai-suat-vay-lfvn-cdx" element={<ProtectedRoute><Thoa_thuan_ho_tro_lai_suat_vay_CĐX_Vinfast_va_LFVN /></ProtectedRoute>} />
          <Route path="/phieu-tang-bao-hiem" element={<ProtectedRoute><PhieuTangBaoHiem /></ProtectedRoute>} />
          <Route path="/phieu-rut-coc" element={<ProtectedRoute><PhieuRutCoc /></ProtectedRoute>} />
          <Route path="/pdi-kh" element={<ProtectedRoute><PDI_KH /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan-thanh-toan-nh" element={<ProtectedRoute><GiayXacNhanThanhToanNH /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan-tang-bao-hiem-vpbank" element={<ProtectedRoute><GiayXacNhanTangBaoHiemVPBank /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan-sksm" element={<ProtectedRoute><GiayXacNhanSKSM /></ProtectedRoute>} />
          <Route path="/xac-nhan-cong-no" element={<ProtectedRoute><GiayXacNhanPhaiThuKH_DL_Gui_NH /></ProtectedRoute>} />
          <Route path="/giay-xac-nhan-kieu-loai" element={<ProtectedRoute><GiayXacNhanKieuLoai /></ProtectedRoute>} />
          <Route path="/giay-thoa-thuan-tra-cham" element={<ProtectedRoute><GiayThoaThuanTraCham /></ProtectedRoute>} />
          <Route path="/giay-thoa-thuan-tra-thay" element={<ProtectedRoute><GiayThoaThuanTraThay /></ProtectedRoute>} />
          <Route path="/giay-thoa-thuan-htvlct90-nien-kim-60-thang" element={<ProtectedRoute><GiayThoaThuanHTVLCT90_nien_kim_60_thang /></ProtectedRoute>} />
          <Route path="/giay-thoa-thuan-htls-vpbank" element={<ProtectedRoute><GiayThoaThuanHTLS_VPBank /></ProtectedRoute>} />
          <Route path="/giay-thoa-thuan-ho-tro-vay-lai" element={<ProtectedRoute><GiayThoaThuanHoTroVayLai /></ProtectedRoute>} />
          <Route path="/de-xuat-gia-ban" element={<ProtectedRoute><DeXuatGiaban /></ProtectedRoute>} />
          <Route path="/bidv-thoa-thuan-ho-tro-lai-vay" element={<ProtectedRoute><BIDV_ThoaThuanHoTroLaiVay /></ProtectedRoute>} />
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
