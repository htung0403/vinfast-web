import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";
import { getBranchByShowroomName } from "../../data/branchData";

const TT_HTLV_CĐX_TPB = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper functions
  const formatCurrency = (value) => {
    if (!value) return "";
    const number = typeof value === "string" ? value.replace(/[^\d]/g, "") : value.toString().replace(/[^\d]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Nếu đã là định dạng dd/mm/yyyy hoặc dd-mm-yyyy thì giữ nguyên
    if (dateString.includes("/") || (dateString.includes("-") && dateString.split("-")[0].length <= 2)) {
      return dateString;
    }
    // Nếu là ISO date (yyyy-mm-dd)
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      // Nếu không parse được, trả về nguyên bản
    }
    return dateString;
  };

  const pad = (num) => String(num).padStart(2, "0");

  // Editable fields
  const [ngayKy, setNgayKy] = useState("");
  const [thangKy, setThangKy] = useState("");
  const [namKy, setNamKy] = useState("");

  // Bên Bán
  const [congTy, setCongTy] = useState(
    "CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH TRƯỜNG CHINH"
  );
  const [diaChiTruSo, setDiaChiTruSo] = useState(
    "682A Trường Chinh, Phường 15, Tân Bình, TP. Hồ Chí Minh"
  );
  const [maSoDN, setMaSoDN] = useState("");
  const [taiKhoan, setTaiKhoan] = useState("");
  const [nganHangTK, setNganHangTK] = useState("");
  const [daiDien, setDaiDien] = useState("");
  const [chucVu, setChucVu] = useState("");
  const [giayUyQuyen, setGiayUyQuyen] = useState("");
  const [ngayUyQuyen, setNgayUyQuyen] = useState("");

  // Khách Hàng
  const [tenKH, setTenKH] = useState("");
  const [diaChiKH, setDiaChiKH] = useState("");
  const [dienThoaiKH, setDienThoaiKH] = useState("");
  const [maSoThueKH, setMaSoThueKH] = useState("");
  const [cmtndKH, setCmtndKH] = useState("");
  const [ngayCapKH, setNgayCapKH] = useState("");
  const [noiCapKH, setNoiCapKH] = useState("");
  const [daiDienKH, setDaiDienKH] = useState("");
  const [chucVuKH, setChucVuKH] = useState("");

  // Thông tin xe và hợp đồng
  const [soHopDong, setSoHopDong] = useState("");
  const [mauXe, setMauXe] = useState("");
  const [soKhung, setSoKhung] = useState("");
  const [soMay, setSoMay] = useState("");

  // Thông tin vay
  const [soTienVay, setSoTienVay] = useState("");
  const [soTienVayBangChu, setSoTienVayBangChu] = useState("");
  const [tyLeVay, setTyLeVay] = useState("");
  const [thoiHanVay, setThoiHanVay] = useState("");
  const [laiSuatCo, setLaiSuatCo] = useState("");

  // Firebase effect
  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";
      let showroomLoadedFromContracts = false;

      // Nếu có firebaseKey, thử lấy showroom từ contracts trước
      if (location.state?.firebaseKey || location.state?.contractId) {
        const contractId = location.state.firebaseKey || location.state.contractId;
        try {
          const contractsRef = ref(database, `contracts/${contractId}`);
          const snapshot = await get(contractsRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            console.log("Loaded from contracts:", contractData);
            setData(contractData);
            
            if (contractData.showroom) {
              showroomName = contractData.showroom;
              showroomLoadedFromContracts = true;
              console.log("Showroom loaded from contracts:", showroomName);
              
              // Cập nhật thông tin công ty và địa chỉ dựa trên showroom
              const branchInfo = getBranchByShowroomName(showroomName);
              if (branchInfo) {
                setCongTy(
                  `CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH ${branchInfo.shortName.toUpperCase()}`
                );
                setDiaChiTruSo(branchInfo.address);
              }
            }

            // Auto-fill fields từ contracts
            if (contractData.khachHang || contractData.customerName) {
              setTenKH(contractData.khachHang || contractData.customerName || "");
              setDiaChiKH(contractData.diaChiKhachHang || contractData.diaChiKhachHang || contractData.address || "");
              setDienThoaiKH(contractData.soDienThoaiKhachHang || contractData.soDienThoaiKhachHang || contractData.phone || "");
              setCmtndKH(contractData.soCccdKhachHang || contractData.soCccdKhachHang || contractData.cccd || contractData.CCCD || "");
            }

            if (contractData.thongTinXe || contractData.tenXe || contractData.dongXe || contractData.model) {
              setMauXe(contractData.tenXe || contractData.dongXe || contractData.model || contractData["Dòng xe"] || "");
              setSoKhung(contractData.soKhung || contractData["Số Khung"] || contractData.chassisNumber || "");
              setSoMay(contractData.soMay || contractData["Số Máy"] || contractData.engineNumber || "");
            }

            setSoHopDong(contractData.soHopDong || contractData.contractNumber || contractData.soHopDong || "");

            // Ngày cấp CCCD
            if (contractData.ngayCap || contractData.issueDate || contractData["Ngày Cấp"] || contractData["Ngày cấp"]) {
              const ngayCap = contractData.ngayCap || contractData.issueDate || contractData["Ngày Cấp"] || contractData["Ngày cấp"] || "";
              setNgayCapKH(formatDate(ngayCap));
            }

            // Nơi cấp CCCD
            if (contractData.noiCap || contractData.issuePlace || contractData["Nơi Cấp"] || contractData["Nơi cấp"]) {
              setNoiCapKH(contractData.noiCap || contractData.issuePlace || contractData["Nơi Cấp"] || contractData["Nơi cấp"] || "");
            }

            // Mã số thuế
            if (contractData.maSoThue || contractData["Mã số thuế"] || contractData["Mã Số Thuế"]) {
              setMaSoThueKH(contractData.maSoThue || contractData["Mã số thuế"] || contractData["Mã Số Thuế"] || "");
            }
          } else {
            console.log("Contract not found in contracts path");
          }
        } catch (err) {
          console.error("Error loading showroom from contracts:", err);
        }
      }

      // Thử load từ exportedContracts nếu có firebaseKey
      if (location.state?.firebaseKey) {
        try {
          const contractRef = ref(
            database,
            `exportedContracts/${location.state.firebaseKey}`
          );
          const snapshot = await get(contractRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            console.log("Loaded from exportedContracts:", contractData);
            
            // Chỉ override showroom nếu chưa có từ contracts
            if (contractData.showroom && !showroomLoadedFromContracts) {
              showroomName = contractData.showroom;
              console.log("Showroom loaded from exportedContracts:", showroomName);
              
              // Cập nhật thông tin công ty và địa chỉ dựa trên showroom
              const branchInfo = getBranchByShowroomName(showroomName);
              if (branchInfo) {
                setCongTy(
                  `CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH ${branchInfo.shortName.toUpperCase()}`
                );
                setDiaChiTruSo(branchInfo.address);
              }
            }
            
            // Lấy Model từ database
            if (contractData.dongXe || contractData.model || contractData["Dòng xe"]) {
              setMauXe(contractData.dongXe || contractData.model || contractData["Dòng xe"] || "");
            }
            
            // Lấy Số Khung từ database
            if (contractData.soKhung || contractData["Số Khung"] || contractData.chassisNumber) {
              setSoKhung(contractData.soKhung || contractData["Số Khung"] || contractData.chassisNumber || "");
            }
            
            // Lấy Số Máy từ database
            if (contractData.soMay || contractData["Số Máy"] || contractData.engineNumber) {
              setSoMay(contractData.soMay || contractData["Số Máy"] || contractData.engineNumber || "");
            }
            
            // Lấy thông tin khách hàng từ database
            if (contractData.customerName || contractData["Tên KH"] || contractData.khachHang) {
              setTenKH(contractData.customerName || contractData["Tên KH"] || contractData.khachHang || "");
            }
            
            // Địa chỉ khách hàng
            if (contractData.address || contractData["Địa chỉ"] || contractData["Địa Chỉ"] || contractData.diaChiKhachHang) {
              setDiaChiKH(contractData.address || contractData["Địa chỉ"] || contractData["Địa Chỉ"] || contractData.diaChiKhachHang || "");
            }
            
            // Điện thoại khách hàng
            if (contractData.phone || contractData["Số Điện Thoại"] || contractData["Số điện thoại"] || contractData.soDienThoaiKhachHang) {
              setDienThoaiKH(contractData.phone || contractData["Số Điện Thoại"] || contractData["Số điện thoại"] || contractData.soDienThoaiKhachHang || "");
            }
            
            // Mã số thuế (nếu có)
            if (contractData.maSoThue || contractData["Mã số thuế"] || contractData["Mã Số Thuế"]) {
              setMaSoThueKH(contractData.maSoThue || contractData["Mã số thuế"] || contractData["Mã Số Thuế"] || "");
            }
            
            // Căn cước/CCCD
            if (contractData.cccd || contractData.CCCD || contractData["Căn cước"] || contractData.customerCCCD || contractData.soCccdKhachHang) {
              setCmtndKH(contractData.cccd || contractData.CCCD || contractData["Căn cước"] || contractData.customerCCCD || contractData.soCccdKhachHang || "");
            }
            
            // Ngày cấp - format dd/mm/yyyy
            if (contractData.ngayCap || contractData.issueDate || contractData["Ngày Cấp"] || contractData["Ngày cấp"]) {
              const ngayCap = contractData.ngayCap || contractData.issueDate || contractData["Ngày Cấp"] || contractData["Ngày cấp"] || "";
              setNgayCapKH(formatDate(ngayCap));
            }
            
            // Nơi cấp
            if (contractData.noiCap || contractData.issuePlace || contractData["Nơi Cấp"] || contractData["Nơi cấp"]) {
              setNoiCapKH(contractData.noiCap || contractData.issuePlace || contractData["Nơi Cấp"] || contractData["Nơi cấp"] || "");
            }

            // Số hợp đồng
            if (contractData.soHopDong || contractData.contractNumber || contractData["Số Hợp Đồng"]) {
              setSoHopDong(contractData.soHopDong || contractData.contractNumber || contractData["Số Hợp Đồng"] || "");
            }
          }
        } catch (error) {
          console.error("Error loading contract data:", error);
        }
      }

      // Cập nhật thông tin công ty nếu showroom đã được load từ database
      if (showroomName && showroomLoadedFromContracts) {
        const branchInfo = getBranchByShowroomName(showroomName);
        if (branchInfo) {
          setCongTy(
            `CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH ${branchInfo.shortName.toUpperCase()}`
          );
          setDiaChiTruSo(branchInfo.address);
        }
      }

      // Set default date
      const today = new Date();
      setNgayKy(pad(today.getDate()));
      setThangKy(pad(today.getMonth() + 1));
      setNamKy(today.getFullYear().toString());

      // Nếu có showroom từ location.state và chưa load từ contracts, cập nhật thông tin công ty
      if (location.state?.showroom && !showroomLoadedFromContracts) {
        const branchInfo = getBranchByShowroomName(location.state.showroom);
        if (branchInfo) {
          setCongTy(
            `CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH ${branchInfo.shortName.toUpperCase()}`
          );
          setDiaChiTruSo(branchInfo.address);
        }
      }

      // Auto-fill từ location.state (chỉ khi không có firebaseKey hoặc muốn override)
      if (location.state) {
        const stateData = location.state;
        if (!location.state.firebaseKey && !location.state.contractId) {
          setData(stateData);
          if (stateData.customerName) setTenKH(stateData.customerName);
          if (stateData.customerAddress) setDiaChiKH(stateData.customerAddress);
          if (stateData.customerPhone) setDienThoaiKH(stateData.customerPhone);
          if (stateData.customerCCCD) setCmtndKH(stateData.customerCCCD);
          if (stateData.contractNumber) setSoHopDong(stateData.contractNumber);
          if (stateData.hieuxe) setMauXe(stateData.hieuxe);
          if (stateData.soKhung) setSoKhung(stateData.soKhung);
          if (stateData.soMay) setSoMay(stateData.soMay);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [location.state]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: "Times New Roman" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 p-8"
      style={{ fontFamily: "Times New Roman" }}
    >
      <div className="max-w-4xl mx-auto print:max-w-4xl print:mx-auto">
        <div
          className="flex-1 bg-white p-8 print:pt-0 flex flex-col"
          id="printable-content"
        >
          {/* Header with title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase">
            THỎA THUẬN HỖ TRỢ LÃI VAY
          </h1>
          <div className="mt-4">
            <p className="text-sm">
              Thỏa thuận hỗ trợ lãi vay ("<strong>Thỏa Thuận</strong>") này được
              ký ngày{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={ngayKy}
                  onChange={(e) => setNgayKy(e.target.value)}
                  className="border-b border-gray-400 px-1 w-8 text-center focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline underline">{ngayKy}</span>{" "}
              tháng{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={thangKy}
                  onChange={(e) => setThangKy(e.target.value)}
                  className="border-b border-gray-400 px-1 w-8 text-center focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline underline">{thangKy}</span>{" "}
              năm{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={namKy}
                  onChange={(e) => setNamKy(e.target.value)}
                  className="border-b border-gray-400 px-1 w-16 text-center focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline underline">{namKy}</span>,
              bởi và giữa:
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-sm space-y-4 font-serif">
          {/* Bên Bán */}
          <div>
            <p className="font-bold mb-2">
              <strong>CÔNG TY</strong>{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={congTy}
                  onChange={(e) => setCongTy(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline underline">{congTy}</span>
            </p>
            <p className="mb-1">
              Địa chỉ trụ sở chính:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={diaChiTruSo}
                  onChange={(e) => setDiaChiTruSo(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{diaChiTruSo}</span>
            </p>
            <p className="mb-1">
              Mã số doanh nghiệp:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={maSoDN}
                  onChange={(e) => setMaSoDN(e.target.value)}
                  className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline underline">{maSoDN}</span>
            </p>
            <p className="mb-1">
              Tài khoản:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={taiKhoan}
                  onChange={(e) => setTaiKhoan(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline font-bold">{taiKhoan}</span>{" "}
              tại Ngân hàng{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={nganHangTK}
                  onChange={(e) => setNganHangTK(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{nganHangTK}</span>
            </p>
            <p className="mb-1">
              Đại diện:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={daiDien}
                  onChange={(e) => setDaiDien(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{daiDien}</span> Chức vụ:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={chucVu}
                  onChange={(e) => setChucVu(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{chucVu}</span>
            </p>
            <p className="mb-1">
              (Theo Giấy uỷ quyền số{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={giayUyQuyen}
                  onChange={(e) => setGiayUyQuyen(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{giayUyQuyen}</span> ngày{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={ngayUyQuyen}
                  onChange={(e) => setNgayUyQuyen(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{ngayUyQuyen}</span>)
            </p>
            <p className="mb-2 font-bold">
              ("<strong>Bên Bán</strong>")
            </p>
          </div>

          <p className="text-center font-bold mb-4">
            <strong>VÀ</strong>
          </p>

          {/* Khách Hàng */}
          <div>
            <p className="font-bold mb-2">
              <span className="print:hidden">
                <input
                  type="text"
                  value={tenKH}
                  onChange={(e) => setTenKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{tenKH}</span>
            </p>
            <p className="mb-1">
              Địa chỉ:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={diaChiKH}
                  onChange={(e) => setDiaChiKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{diaChiKH}</span>
            </p>
            <p className="mb-1">
              Điện thoại:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={dienThoaiKH}
                  onChange={(e) => setDienThoaiKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{dienThoaiKH}</span>
            </p>
            <p className="mb-1">
              Mã số thuế:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={maSoThueKH}
                  onChange={(e) => setMaSoThueKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{maSoThueKH}</span>
            </p>
            <p className="mb-1">
              CMTND/TCC: Số{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={cmtndKH}
                  onChange={(e) => setCmtndKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{cmtndKH}</span> cấp ngày{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={ngayCapKH}
                  onChange={(e) => setNgayCapKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{ngayCapKH}</span> bởi{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={noiCapKH}
                  onChange={(e) => setNoiCapKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{noiCapKH}</span>
            </p>
            <p className="mb-1">
              Đại diện:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={daiDienKH}
                  onChange={(e) => setDaiDienKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{daiDienKH}</span> Chức vụ:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={chucVuKH}
                  onChange={(e) => setChucVuKH(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{chucVuKH}</span>
            </p>
            <p className="font-bold mb-4">
              ("<strong>Khách Hàng</strong>")
            </p>
          </div>

          <p className="mb-4">
            Bên Bán và Khách Hàng sau đây được gọi riêng là{" "}
            <strong>"Bên"</strong> và gọi chung là <strong>"Các Bên"</strong>
          </p>

          {/* XÉT RẰNG */}
          <div>
            <h3 className="font-bold mb-3">
              <strong>XÉT RẰNG:</strong>
            </h3>

            <p className="mb-3">
              1. Bên Bán và Khách Hàng đã ký hợp đồng mua bán xe ô tô số{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soHopDong}
                  onChange={(e) => setSoHopDong(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{soHopDong}</span> (sau đây
              gọi chung là "<strong>Hợp Đồng Mua Bán Xe</strong>") với thông tin
              về xe như sau:
            </p>
            <div className="ml-4 mb-3">
              <p>
                - Model:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={mauXe}
                    onChange={(e) => setMauXe(e.target.value)}
                    className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{mauXe}</span>
              </p>
              <p>
                - Số Khung:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soKhung}
                    onChange={(e) => setSoKhung(e.target.value)}
                    className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{soKhung}</span>
              </p>
              <p>
                - Số Máy:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soMay}
                    onChange={(e) => setSoMay(e.target.value)}
                    className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{soMay}</span>
              </p>
            </div>

            <p className="mb-3">
              2. Khách Hàng thuộc trường hợp được áp dụng chính sách hỗ trợ một
              khoản tiền tương đương một phần khoản lãi vay của khoản vay mua xe
              tại Ngân hàng TMCP Tiên Phong (sau đây gọi là "
              <strong>Ngân Hàng</strong>") theo chính sách hỗ trợ lãi vay của
              VinFast ("<strong>Chính sách Hỗ trợ lãi vay</strong>") áp dụng cho
              các Khách hàng cá nhân có thời hạn đặt cọc/xuất hóa đơn từ ngày
              …./…./….. và giải ngân khoản vay mua xe đến hết ngày 31/12/2025.
              Công ty TNHH Kinh Doanh Thương Mại Và Dịch Vụ VinFast – Mã số
              thuế: 0108926276 ("<strong>VinFast Trading</strong>"), Ngân Hàng
              và Công ty cổ phần Sản xuất và Kinh doanh VinFast – Mã số thuế:
              0107894416 ("<strong>VinFast</strong>") đã ký Thỏa thuận hợp tác
              ("<strong>Thỏa Thuận Hợp Tác</strong>") về việc hỗ trợ Khách Hàng
              vay mua xe ô tô điện VinFast. Theo đó, Khách Hàng sẽ được VinFast
              hỗ trợ thanh toán cho Ngân Hàng một khoản tiền chênh lệch giữa số
              tiền lãi của Ngân Hàng theo các quy định và điều kiện tại Thỏa
              Thuận Hợp Tác với số tiền lãi Khách Hàng chi trả cố định hàng
              tháng. Khoản hỗ trợ này sẽ được VinFast chi trả cho Ngân Hàng
              thông qua VinFast Trading.
            </p>

            <p className="mb-3">
              3. Khách Hàng và Ngân Hàng đã hoặc sẽ ký kết một hợp đồng tín dụng
              (hoặc hợp đồng/thỏa thuận/khế ước khác có bản chất là hợp đồng tín
              dụng) và hợp đồng thế chấp (hoặc hợp đồng/thỏa thuận có bản chất
              là giao dịch bảo đảm) và tất cả các thỏa thuận, phụ lục, sửa đổi
              bổ sung liên quan (sau đây gọi chung là "
              <strong>Hợp Đồng Tín Dụng</strong>"). Theo đó, Ngân Hàng cho Khách
              Hàng vay một khoản tiền để mua xe ô tô VinFast theo Hợp Đồng Mua
              Bán Xe, giải ngân trực tiếp vào tài khoản của bên bán theo tiến độ
              thanh toán của Hợp Đồng Mua Bán Xe;
            </p>

            <p className="mb-4">
              4. Bên bán được Vinfast Trading ủy quyền giao kết Thỏa thuận này
              với Khách hàng để triển khai Chính sách Hỗ trợ lãi vay (áp dụng
              cho Đại lý phân phối, bỏ nếu là VFT).
            </p>

            <p className="mb-4">
              Do vậy, để thực hiện Chính Sách Hỗ trợ lãi vay nêu trên, Các Bên
              thống nhất ký kết Thỏa Thuận với những nội dung như sau:
            </p>
          </div>

          {/* ĐIỀU 1 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">
              1. <strong>Thỏa thuận về việc Hỗ Trợ Lãi Vay:</strong>
            </h3>

            <div className="mb-4">
              <p className="font-bold mb-2">
                1. Công thức tính Khoản Hỗ Trợ Lãi Vay:
              </p>
              <p className="mb-2">
                Các Bên tại đây đồng ý rằng, khoản lãi vay mà VinFast sẽ hỗ trợ
                trả thay Khách Hàng cho Ngân Hàng thông qua VinFast Trading đối
                với mỗi Hợp Đồng Tín Dụng (sau đây là "
                <strong>Khoản Hỗ Trợ Lãi Vay</strong>") được tính như sau:
              </p>
              <div className="ml-4 mb-3 bg-gray-50 p-3 border border-gray-300">
                <p className="font-bold">
                  Khoản Hỗ Trợ Lãi Vay (kỳ tính toán theo tháng) = Dự nợ gốc ×
                  Lãi suất hỗ trợ × số ngày vay thực tế trong tháng / 365
                </p>
              </div>
              <p className="text-sm">Trong đó:</p>
              <div className="ml-4 space-y-1 text-sm">
                <p>
                  • <strong>Tháng T:</strong> tháng kỳ tính toán, nằm trong thời
                  gian triển khai chương trình hỗ trợ của VinFast
                </p>
                <p>
                  • <strong>Dự nợ gốc:</strong> nguyên tắc tính theo quy định
                  của Ngân hàng; là số dư nợ gốc Khách Hàng phải trả tại tháng T
                  (T là tháng giải ngân); tháng đầu tiên bằng số tiền gốc Khách
                  Hàng được giải ngân
                </p>
                <p>
                  • <strong>Lãi suất hỗ trợ:</strong> là mức lãi suất trả thay
                  được VinFast đồng ý trả thay cho Khách Hàng
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">2. Chính sách Hỗ trợ lãi vay:</p>
              <div className="ml-4 space-y-2">
                <p>
                  - Số tiền Khách Hàng vay Ngân Hàng để thanh toán:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienVay}
                      onChange={(e) =>
                        setSoTienVay(formatCurrency(e.target.value))
                      }
                      className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{soTienVay}</span> VNĐ
                  (Bằng chữ:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienVayBangChu}
                      onChange={(e) => setSoTienVayBangChu(e.target.value)}
                      className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">
                    {soTienVayBangChu}
                  </span>
                  ) tương ứng với tỷ lệ vay Ngân Hàng:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={tyLeVay}
                      onChange={(e) => setTyLeVay(e.target.value)}
                      className="border-b border-gray-400 px-1 w-16 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{tyLeVay}</span> giá trị
                  xe
                </p>
                <p>
                  - Ngân Hàng vay: <strong>Ngân hàng TMCP Tiên Phong</strong>
                </p>
                <p>
                  - Lãi suất Ngân hàng áp dụng:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={laiSuatCo}
                      onChange={(e) => setLaiSuatCo(e.target.value)}
                      className="border-b border-gray-400 px-1 w-16 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{laiSuatCo}</span>{" "}
                  %/năm, cố định trong 24 tháng (đã bao gồm mức lãi suất hỗ trợ
                  của Ngân Hàng so với Khách hàng thông thường)
                </p>
                <p>
                  - Lãi suất sau thời gian cố định: Lãi suất cơ sở + Biên độ
                  3.6%/năm (đã bao gồm mức lãi suất hỗ trợ của Ngân Hàng so với
                  Khách hàng thông thường cho năm thứ 3). Chi tiết theo ghi nhận
                  tại Hợp Đồng Tín Dụng
                </p>
                <p>
                  - Thời hạn vay:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={thoiHanVay}
                      onChange={(e) => setThoiHanVay(e.target.value)}
                      className="border-b border-gray-400 px-1 w-24 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{thoiHanVay}</span>{" "}
                  tháng
                </p>
                <p>
                  - VinFast sẽ hỗ trợ trả thay cho Khách Hàng một khoản tiền lãi
                  ("<strong>Khoản Hỗ Trợ Lãi Vay</strong>") tương đương bằng
                  khoản chênh lệch giữa (i) số tiền lãi Khách Hàng phải thanh
                  toán theo mức lãi suất cho vay tại Hợp Đồng Tín Dụng và (ii)
                  số tiền lãi mà Khách Hàng phải thanh toán theo mức lãi suất
                  cho vay được nêu dưới đây trong suốt thời gian vay (tối đa
                  bằng 96 tháng) kể từ ngày bắt đầu tính lãi theo Hợp Đồng Tín
                  Dụng, tương đương <strong>2%/năm</strong>, nhưng không quá{" "}
                  <strong>36 tháng</strong> ("
                  <strong>Thời Hạn Hỗ Trợ Lãi Vay</strong>") hoặc cho đến khi
                  Thời Hạn Hỗ Trợ Lãi Vay chấm dứt trước thời hạn theo quy định
                  tại Thỏa Thuận này, tùy thời điểm nào đến trước.
                </p>
                <p className="font-bold mt-2">
                  Số tiền gốc và lãi Khách Hàng thanh toán hàng tháng theo
                  phương án gốc trả đều hàng tháng, lãi theo dư nợ giảm dần:
                </p>
                <div className="ml-4 mt-2">
                  <p>
                    + Lãi suất cho vay trong hạn trong 24 tháng đầu tiên: Khách
                    Hàng chi trả lãi cố định
                  </p>
                  <p>
                    + Lãi suất cho vay trong hạn trong 12 tháng tiếp theo: Là
                    phần chênh lệch giữa mức lãi suất cho vay trong hạn Khách
                    hàng phải trả theo Hợp Đồng Tín Dụng trừ (-) 2%/năm
                  </p>
                  <p>
                    + Lãi suất cho vay trong hạn trong thời gian vay còn lại:
                    Lãi suất cơ sở + Biên độ 3.6%/năm. Chi tiết theo ghi nhận
                    tại Hợp Đồng Tín Dụng
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">
                3. Để tránh hiểu nhầm Các Bên thống nhất rằng:
              </p>
              <p>
                Trong mọi trường hợp VinFast, VinFast Trading không chịu trách
                nhiệm đối với bất kỳ mức lãi nào ngoài mức lãi quy định trên đây
                vì lý do Khách Hàng không tuân thủ các quy định của Ngân Hàng
                hay vì bất kỳ lý do gì không phải do lỗi của VinFast, VinFast
                Trading. Khách Hàng chịu trách nhiệm thanh toán với Ngân Hàng
                toàn bộ các khoản lãi và chi phí phát sinh trên mức hỗ trợ lãi
                vay của VinFast quy định ở trên bao gồm các khoản phí trả nợ
                trước hạn; các khoản lãi quá hạn, lãi chậm trả lãi; lãi tăng lên
                do Khách Hàng vi phạm nghĩa vụ trả nợ hoặc vi phạm nghĩa vụ
                khác; các khoản tiền hoàn trả ưu đãi do trả nợ trước hạn; tiền
                bồi thường vi phạm Hợp Đồng Tín Dụng... VinFast/VinFast Trading
                không có trách nhiệm thông báo, làm rõ, nhắc nợ hay thanh toán
                thay các khoản tiền này cho Khách Hàng.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">
                4. Thời Hạn Hỗ Trợ Lãi Vay sẽ tự động chấm dứt trước hạn trong
                trường hợp:
              </p>
              <p>
                (i) Hợp Đồng Tín Dụng chấm dứt trước khi hết Thời Hạn Hỗ Trợ Lãi
                Vay vì bất cứ lý do gì hoặc (ii) theo thỏa thuận về việc chấm
                dứt Thỏa Thuận Hỗ Trợ Lãi Vay giữa Khách Hàng và VinFast/VinFast
                Trading. Hết Thời Hạn Hỗ Trợ Lãi Vay hoặc khi Thời Hạn Hỗ Trợ
                Lãi Vay chấm dứt trước hạn, Khách Hàng có nghĩa vụ tiếp tục thực
                hiện trả nợ lãi cho Ngân Hàng theo đúng quy định tại Hợp Đồng
                Tín Dụng và quy định của Ngân Hàng.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">
                5. Thỏa thuận riêng giữa các Bên:
              </p>
              <p>
                Không phụ thuộc vào các thỏa thuận nêu trên, Các Bên đồng ý
                rằng, thỏa thuận trả thay lãi vay theo Thỏa Thuận này là thỏa
                thuận riêng giữa các Bên (bao gồm cả VinFast, VinFast Trading),
                không ràng buộc, liên quan đến Ngân Hàng. Ngân Hàng chỉ tham gia
                với vai trò hỗ trợ VinFast, VinFast Trading chuyển số tiền lãi
                được VinFast/VinFast Trading hỗ trợ trả thay cho Khách hàng để
                Khách Hàng trả nợ lãi. Do đó, trường hợp VinFast/VinFast Trading
                không thực hiện/thực hiện không đầy đủ việc hỗ trợ lãi vay đã
                thỏa thuận với Khách Hàng, Khách Hàng vẫn có nghĩa vụ thanh toán
                đầy đủ các khoản tiền lãi theo đúng thỏa thuận với Ngân Hàng tại
                Hợp Đồng Tín Dụng. Trường hợp VinFast/VinFast Trading vi phạm
                nội dung tại Thỏa Thuận này dẫn đến khoản tiền lãi của Khách
                Hàng bị chậm thanh toán, Ngân Hàng được quyền xử lý, quản lý và
                phân loại nợ đối với khoản vay của Khách Hàng phù hợp với quy
                định có liên quan của pháp luật và thỏa thuận giữa Ngân Hàng và
                Khách Hàng tại Hợp Đồng Tín Dụng.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">6. Chia sẻ thông tin cá nhân:</p>
              <p>
                Khách Hàng đồng ý cho phép Ngân Hàng, VinFast, VinFast Trading,
                Bên bán được cung cấp các thông tin cá nhân, thông tin liên quan
                đến xe ô tô, khoản vay được VinFast, VinFast Trading cam kết trả
                thay lãi vay và các thông tin khác của Khách Hàng tại Ngân Hàng
                hoặc tại VinFast, VinFast Trading, Bên bán cho bên còn lại theo
                yêu cầu của bên còn lại với thời gian và số lượng cung cấp không
                hạn chế. Việc sử dụng thông tin sau khi được Ngân Hàng, VinFast,
                VinFast Trading, Bên bán cung cấp, thực hiện theo quyết định của
                Ngân Hàng, VinFast, VinFast Trading, Bên bán.
              </p>
            </div>
          </div>

          {/* ĐIỀU 2 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">
              2. <strong>Quyền và nghĩa vụ của các Bên</strong>
            </h3>

            <div className="mb-4">
              <p className="font-bold mb-2">
                1. Quyền và nghĩa vụ của VinFast Trading:
              </p>
              <div className="ml-4 space-y-2">
                <p>
                  1) Thực hiện kiểm tra, đối chiếu và xác nhận với Ngân Hàng các
                  Khoản Hỗ Trợ Lãi Vay hỗ trợ cho Khách Hàng khi nhận được thông
                  báo của Ngân Hàng có phát sinh các khoản vay của Khách Hàng
                  thông qua email trước khi ký chính thức thông báo thanh toán
                  Khoản Hỗ Trợ Lãi Vay;
                </p>
                <p>
                  2) Thực hiện việc hỗ trợ Khoản Hỗ Trợ Lãi Vay của Khách Hàng
                  theo Chính sách Hỗ trợ lãi vay theo Thỏa Thuận này;
                </p>
                <p>
                  3) Không chịu trách nhiệm đối với các mâu thuẫn, tranh chấp,
                  khiếu kiện hay khiếu nại nào liên quan đến và/hoặc phát sinh
                  giữa Ngân Hàng, Khách Hàng và các tổ chức, cá nhân khác trong
                  quá trình thực hiện Hợp Đồng Tín Dụng và các thỏa thuận liên
                  quan đến Hợp Đồng Tín Dụng mà không phải do lỗi từ VinFast
                  Trading.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">
                2. Quyền và nghĩa vụ của Khách Hàng:
              </p>
              <div className="ml-4 space-y-2">
                <p>
                  1) Được VinFast Trading thực hiện việc hỗ trợ Khoản Hỗ Trợ Lãi
                  Vay và áp dụng Chính sách Hỗ trợ lãi vay theo quy định của
                  Thỏa Thuận này.
                </p>
                <p>
                  2) Tự chi trả, thanh toán nợ gốc, phí trả nợ trước hạn và bất
                  kỳ khoản lãi, lãi quá hạn nào phát sinh ngoài phạm vi Khoản Hỗ
                  Trợ Lãi Vay, Thời Hạn Hỗ Trợ Lãi Vay và Chính sách Hỗ trợ lãi
                  vay.
                </p>
                <p>
                  3) Khách Hàng cam kết miễn trừ cho VinFast, VinFast Trading
                  mọi trách nhiệm, nghĩa vụ liên quan đến bất kỳ tranh chấp, mâu
                  thuẫn, khiếu kiện, hay khiếu nại nào phát sinh từ, hoặc liên
                  quan đến Hợp Đồng Tín Dụng.
                </p>
                <p>
                  4) Khách Hàng không được VinFast Trading hỗ trợ Khoản Hỗ Trợ
                  Lãi Vay kể từ thời điểm Khách Hàng ký Văn bản chuyển nhượng
                  Hợp Đồng Mua Bán và/hoặc xe ô tô là đối tượng của hợp đồng mua
                  bán/chuyển nhượng với bất kỳ bên thứ ba nào khác.
                </p>
                <p>
                  5) Trong Thời Hạn Hỗ Trợ Lãi Vay, nếu Khách Hàng tất toán
                  Khoản Giải Ngân trước hạn, ký văn bản chuyển nhượng Hợp Đồng
                  Mua Bán và/hoặc xe ô tô là đối tượng của hợp đồng mua
                  bán/chuyển nhượng với bất kỳ bên thứ ba nào khác, không thực
                  hiện theo đúng quy định tại Hợp Đồng Tín Dụng đã ký giữa Khách
                  Hàng và Ngân Hàng dẫn đến Ngân Hàng chấm dứt Hợp Đồng Tín Dụng
                  thì VinFast chấm dứt hỗ trợ Khoản Hỗ Trợ Lãi Vay theo Chính
                  sách Hỗ trợ lãi vay theo quy định tại Thỏa Thuận này kể từ
                  thời điểm Hợp Đồng Tín Dụng bị chấm dứt. Khách Hàng vẫn phải
                  có trách nhiệm thực hiện nghĩa vụ đối với Ngân Hàng theo quy
                  định của Hợp Đồng Tín Dụng và các thỏa thuận khác giữa Khách
                  Hàng và Ngân Hàng (nếu có).
                </p>
              </div>
            </div>
          </div>

          {/* ĐIỀU 3 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">
              3. <strong>Điều khoản hỗ trợ Ngân hàng</strong>
            </h3>

            <p className="mb-4">
              Khách hàng cam kết không có bất kỳ khiếu nại, khiếu kiện nào và
              đảm bảo Đơn Vị Hỗ Trợ Kỹ Thuật như được định nghĩa phía dưới, cán
              bộ nhân viên của Đơn Vị Hỗ Trợ Kỹ Thuật không phải chịu bất kỳ
              trách nhiệm nào đối với bất kỳ tổn thất và thiệt hại nào (nếu có)
              phát sinh từ hoặc liên quan đến việc thực thi các nội dung nêu tại
              điểm 1, 2, 3 dưới đây:
            </p>

            <div className="ml-4 space-y-3">
              <p>
                1) Khách Hàng cho phép Ngân Hàng thu thập, xử lý các thông tin
                về xe, vị trí xe, tình trạng xe cho mục đích quản lý tài sản đảm
                bảo cho khoản vay theo Hợp Đồng Tín Dụng thông qua bên thứ ba là
                Đơn Vị Hỗ Trợ Kỹ Thuật.
              </p>
              <p>
                2) Trong trường hợp Khách Hàng vi phạm nghĩa vụ trả nợ quá{" "}
                <strong>60 ngày</strong>, Ngân Hàng có quyền đề nghị VinFast
                Trading, nhà sản xuất xe và/hoặc bất kỳ bên thứ ba khác được
                VinFast Trading ủy quyền (gọi chung là "
                <strong>Đơn Vị Hỗ Trợ Kỹ Thuật</strong>") trích xuất dữ liệu
                định vị xe của Khách Hàng và Khách Hàng đồng ý để Đơn Vị Hỗ Trợ
                Kỹ Thuật thu thập, xử lý, cung cấp và chia sẻ dữ liệu này cho
                Ngân Hàng để phục vụ hoạt động xử lý thu hồi nợ.
              </p>
              <p>
                3) Trong trường hợp Khách Hàng vi phạm nghĩa vụ trả nợ quá{" "}
                <strong>90 ngày</strong>, Ngân Hàng có quyền ủy quyền cho Đơn Vị
                Hỗ Trợ Kỹ Thuật kích hoạt tính năng giới hạn mức SOC (dung lượng
                pin) của pin tại ngưỡng <strong>30%</strong> theo đề nghị của
                Ngân Hàng và Khách Hàng đồng ý để Đơn Vị Hỗ Trợ Kỹ Thuật thực
                hiện các việc này.
              </p>
            </div>
          </div>

          {/* ĐIỀU 4 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">
              4. <strong>Hiệu lực của Thỏa Thuận</strong>
            </h3>

            <div className="ml-4 space-y-3">
              <p>
                1. Thỏa Thuận này có hiệu lực kể từ ngày ký đến ngày hết hiệu
                lực của Hợp Đồng Tín Dụng. Thỏa Thuận có thể chấm dứt trước thời
                hạn theo thỏa thuận của Các Bên hoặc xảy ra các trường hợp quy
                định tại Điều 2.2.e Thỏa Thuận này.
              </p>
              <p>
                2. Khách Hàng không được chuyển nhượng, chuyển giao quyền và
                nghĩa vụ của mình theo Thỏa Thuận này cho bất kỳ bên thứ ba nào
                nếu không được chấp thuận trước bằng văn bản của VinFast
                Trading. Tuy nhiên, Khách Hàng đồng ý rằng VinFast và/hoặc
                VinFast Trading có quyền chuyển nhượng, chuyển giao các
                quyền/nghĩa vụ theo Thỏa Thuận này cho bên thứ ba, hoặc trong
                trường hợp VinFast/VinFast Trading tổ chức lại doanh nghiệp, bao
                gồm sáp nhập vào một công ty khác hoặc được chia, hoặc tách hoặc
                được chuyển đổi với điều kiện là việc chuyển nhượng, chuyển giao
                các quyền/nghĩa vụ đó không gây thiệt hại đến quyền và lợi ích
                của Khách Hàng theo Thỏa Thuận này và bên nhận chuyển giao các
                quyền/nghĩa vụ theo Thỏa Thuận này chịu trách nhiệm tiếp tục
                thực hiện đầy đủ các quyền và nghĩa vụ đối với Khách hàng theo
                Thỏa thuận này.
              </p>
              <p>
                3. Mọi sửa đổi, bổ sung Thỏa Thuận này phải được lập thành văn
                bản và được ký bởi người đại diện hợp pháp của mỗi Bên.
              </p>
              <p>
                4. Thỏa Thuận này được điều chỉnh theo các quy định của pháp
                luật Việt Nam. Mọi tranh chấp phát sinh từ Thỏa Thuận này nếu
                không được giải quyết bằng thương lượng và hòa giải giữa các
                Bên, thì sẽ được giải quyết tại Tòa án có thẩm quyền.
              </p>
              <p>
                5. Thỏa Thuận này được lập thành 04 (bốn) bản có giá trị như
                nhau, mỗi Bên giữ 02 (hai) bản để thực hiện.
              </p>
            </div>
          </div>
        </div>

          {/* Signature */}
          <div className="mt-16">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-center font-bold p-4 w-1/2">
                    <p className="mb-20">ĐẠI DIỆN BÊN BÁN</p>
                  </td>
                  <td className="text-center font-bold p-4 w-1/2">
                    <p className="mb-20">KHÁCH HÀNG</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center mt-8 print:hidden space-x-4">
        <button
          onClick={handleBack}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
        >
          Quay lại
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          In Thỏa Thuận
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 15mm 20mm 15mm 20mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          input,
          input:focus,
          input[type="text"],
          input[type="text"]:focus {
            border: none !important;
            border-bottom: none !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          .underline,
          span.underline,
          .print\\:inline.underline,
          span.print\\:inline.underline {
            text-decoration: none !important;
            border-bottom: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TT_HTLV_CĐX_TPB;
