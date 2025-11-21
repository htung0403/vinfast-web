import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";

const GiayThoaThuanTraCham = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);

  // Editable fields
  const [soThoaThuan, setSoThoaThuan] = useState("");
  const [ngayKy, setNgayKy] = useState("");
  const [thangKy, setThangKy] = useState("");
  const [namKy, setNamKy] = useState("");

  // Company fields
  const [congTy, setCongTy] = useState("");
  const [maSoDN, setMaSoDN] = useState("");
  const [daiDien, setDaiDien] = useState("");
  const [chucVu, setChucVu] = useState("");
  const [soGiayUyQuyen, setSoGiayUyQuyen] = useState("");
  const [ngayUyQuyen, setNgayUyQuyen] = useState("");

  // Customer fields
  const [tenKH, setTenKH] = useState("");
  const [diaChiKH, setDiaChiKH] = useState("");
  const [dienThoaiKH, setDienThoaiKH] = useState("");
  const [maSoThueKH, setMaSoThueKH] = useState("");
  const [soCCCDKH, setSoCCCDKH] = useState("");
  const [ngayCapKH, setNgayCapKH] = useState("");
  const [noiCapKH, setNoiCapKH] = useState("");

  // Spouse fields
  const [tenVoChong, setTenVoChong] = useState("");
  const [diaChiVoChong, setDiaChiVoChong] = useState("");
  const [dienThoaiVoChong, setDienThoaiVoChong] = useState("");
  const [maSoThueVoChong, setMaSoThueVoChong] = useState("");
  const [soCCCDVoChong, setSoCCCDVoChong] = useState("");
  const [ngayCapVoChong, setNgayCapVoChong] = useState("");
  const [noiCapVoChong, setNoiCapVoChong] = useState("");

  // Contract and car fields
  const [soHopDong, setSoHopDong] = useState("");
  const [ngayHopDong, setNgayHopDong] = useState("");
  const [modelXe, setModelXe] = useState("");
  const [soKhung, setSoKhung] = useState("");
  const [soMay, setSoMay] = useState("");
  const [giaTriThanhToan, setGiaTriThanhToan] = useState("");
  const [soTienTraCham, setSoTienTraCham] = useState("");
  const [soTienTraChamBangChu, setSoTienTraChamBangChu] = useState("");
  const [ngayTraNo, setNgayTraNo] = useState("");
  const [thoiHanThanhToan, setThoiHanThanhToan] = useState("60");

  // Helper function to convert number to Vietnamese words
  const numberToWords = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    const num = parseInt(numericAmount, 10);
    if (isNaN(num) || num === 0) return "";

    const ones = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];
    const tens = [
      "",
      "mười",
      "hai mươi",
      "ba mươi",
      "bốn mươi",
      "năm mươi",
      "sáu mươi",
      "bảy mươi",
      "tám mươi",
      "chín mươi",
    ];
    const hundreds = [
      "",
      "một trăm",
      "hai trăm",
      "ba trăm",
      "bốn trăm",
      "năm trăm",
      "sáu trăm",
      "bảy trăm",
      "tám trăm",
      "chín trăm",
    ];

    const readGroup = (n) => {
      if (n === 0) return "";
      let result = "";
      const hundred = Math.floor(n / 100);
      const ten = Math.floor((n % 100) / 10);
      const one = n % 10;

      if (hundred > 0) {
        result += hundreds[hundred] + " ";
      }

      if (ten > 0) {
        if (ten === 1) {
          result += "mười ";
          if (one > 0) {
            result += one === 5 ? "lăm " : ones[one] + " ";
          }
        } else {
          result += tens[ten] + " ";
          if (one > 0) {
            if (one === 5 && ten > 0) {
              result += "lăm ";
            } else if (one === 1 && ten > 1) {
              result += "mốt ";
            } else {
              result += ones[one] + " ";
            }
          }
        }
      } else if (one > 0) {
        if (hundred > 0 && one === 5) {
          result += "lăm ";
        } else {
          result += ones[one] + " ";
        }
      }
      return result.trim();
    };

    const billion = Math.floor(num / 1000000000);
    const million = Math.floor((num % 1000000000) / 1000000);
    const thousand = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    let result = "";
    if (billion > 0) {
      result += readGroup(billion) + " tỷ ";
    }
    if (million > 0) {
      result += readGroup(million) + " triệu ";
    }
    if (thousand > 0) {
      result += readGroup(thousand) + " nghìn ";
    }
    if (remainder > 0) {
      result += readGroup(remainder);
    }

    return result.trim() + " đồng";
  };

  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";

      // Nếu có firebaseKey, thử lấy showroom từ contracts
      if (location.state?.firebaseKey) {
        try {
          const contractId = location.state.firebaseKey;
          const contractsRef = ref(database, `contracts/${contractId}`);
          const snapshot = await get(contractsRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            if (contractData.showroom) {
              showroomName = contractData.showroom;
            }
          }
        } catch (err) {
          console.error("Error loading showroom from contracts:", err);
        }
      }

      // Lấy thông tin chi nhánh
      const branchInfo =
        getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      if (location.state) {
        const incoming = location.state;

        // Parse date for agreement signing
        const today = new Date();
        setNgayKy(String(today.getDate()).padStart(2, "0"));
        setThangKy(String(today.getMonth() + 1).padStart(2, "0"));
        setNamKy(String(today.getFullYear()));

        // Company info
        setCongTy(incoming.congTy || incoming["Công Ty"] || "");
        setMaSoDN(branchInfo?.taxCode || "");
        setDaiDien(branchInfo?.representativeName || "");
        setChucVu(branchInfo?.position || "");

        // Customer info
        setTenKH(
          incoming.customerName ||
            incoming["Tên KH"] ||
            incoming["Tên Kh"] ||
            ""
        );
        setDiaChiKH(
          incoming.address || incoming["Địa Chỉ"] || incoming.diaChi || ""
        );
        setDienThoaiKH(
          incoming.phone ||
            incoming["Số Điện Thoại"] ||
            incoming.soDienThoai ||
            ""
        );
        setMaSoThueKH(incoming.maSoThue || incoming["Mã Số Thuế"] || "");
        setSoCCCDKH(incoming.cccd || incoming.CCCD || incoming["CCCD"] || "");
        setNgayCapKH(
          incoming.issueDate || incoming.ngayCap || incoming["Ngày Cấp"] || ""
        );
        setNoiCapKH(
          incoming.issuePlace || incoming.noiCap || incoming["Nơi Cấp"] || ""
        );

        // Spouse info (if available)
        setTenVoChong(incoming.tenVoChong || incoming["Tên Vợ/Chồng"] || "");
        setDiaChiVoChong(
          incoming.diaChiVoChong || incoming["Địa Chỉ Vợ/Chồng"] || ""
        );
        setDienThoaiVoChong(
          incoming.dienThoaiVoChong || incoming["Điện Thoại Vợ/Chồng"] || ""
        );
        setMaSoThueVoChong(
          incoming.maSoThueVoChong || incoming["Mã Số Thuế Vợ/Chồng"] || ""
        );
        setSoCCCDVoChong(
          incoming.cccdVoChong || incoming["CCCD Vợ/Chồng"] || ""
        );
        setNgayCapVoChong(
          incoming.ngayCapVoChong || incoming["Ngày Cấp Vợ/Chồng"] || ""
        );
        setNoiCapVoChong(
          incoming.noiCapVoChong || incoming["Nơi Cấp Vợ/Chồng"] || ""
        );

        // Contract info
        setSoHopDong(
          incoming.vso || incoming["VSO"] || incoming.soHopDong || ""
        );
        const contractDate =
          incoming.contractDate ||
          incoming.createdAt ||
          incoming.createdDate ||
          "";
        setNgayHopDong(contractDate);
        setModelXe(
          incoming.model || incoming.dongXe || incoming["Dòng xe"] || ""
        );
        setSoKhung(
          incoming.soKhung ||
            incoming["Số Khung"] ||
            incoming.chassisNumber ||
            ""
        );
        setSoMay(
          incoming.soMay || incoming["Số Máy"] || incoming.engineNumber || ""
        );
        const giaTri =
          incoming.contractPrice ||
          incoming.giaHD ||
          incoming["Giá Hợp Đồng"] ||
          "";
        setGiaTriThanhToan(giaTri);
        const soTien = incoming.soTienTraCham || "";
        setSoTienTraCham(soTien);
        if (soTien) {
          setSoTienTraChamBangChu(numberToWords(soTien));
        }
        setThoiHanThanhToan(incoming.thoiHanThanhToan || "60");

        setData({
          loaded: true,
        });
      } else {
        // Dữ liệu mẫu
        const today = new Date();
        setNgayKy(String(today.getDate()).padStart(2, "0"));
        setThangKy(String(today.getMonth() + 1).padStart(2, "0"));
        setNamKy(String(today.getFullYear()));

        setCongTy("");
        setMaSoDN(branchInfo?.taxCode || "0316801817-002");
        setDaiDien(branchInfo?.representativeName || "Nguyễn Thành Trai");
        setChucVu(branchInfo?.position || "Tổng Giám Đốc");

        setTenKH("Nguyễn Văn A");
        setDiaChiKH("123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh");
        setDienThoaiKH("0901234567");
        setMaSoThueKH("");
        setSoCCCDKH("001234567890");
        setNgayCapKH("01/01/2020");
        setNoiCapKH("Công An TP. Hồ Chí Minh");

        setModelXe("VINFAST VF 5");
        setSoHopDong("S00901-VSO-24-10-0042");
        setNgayHopDong("08/10/2024");
        setSoKhung("");
        setSoMay("");
        setGiaTriThanhToan("540000000");
        setSoTienTraCham("");

        setData({
          loaded: true,
        });
      }
      setLoading(false);
    };

    loadData();
  }, [location.state]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      if (dateStr.includes("/")) {
        return dateStr;
      }
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return "";
    try {
      let date;
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateStr);
      }
      if (isNaN(date.getTime())) return "";
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day} tháng ${month} năm ${year}`;
    } catch {
      return "";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

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

  if (!data) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: "Times New Roman" }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">Không có dữ liệu hợp đồng</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 p-8"
      style={{ fontFamily: "Times New Roman" }}
    >
      <div className="flex gap-6 max-w-4xl mx-auto print:max-w-4xl print:mx-auto">
        <div className="flex-1 bg-white" id="printable-content">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase mb-2">
              THỎA THUẬN THANH TOÁN CHẬM
            </h1>
            <div className="text-sm mb-4">
              <span className="font-semibold">Số:</span>
              <span className="print:hidden">
                <input
                  type="text"
                  value={soThoaThuan}
                  onChange={(e) => setSoThoaThuan(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập số thỏa thuận"
                />
              </span>
              <span className="hidden print:inline ml-2">
                {soThoaThuan || "______"}
              </span>
            </div>
          </div>

          {/* Introduction */}
          <div className="text-sm mb-6 leading-relaxed">
            <p>
              Thỏa thuận thanh toán chậm ("Thỏa Thuận") này được ký ngày
              <span className="print:hidden">
                <input
                  type="text"
                  value={ngayKy}
                  onChange={(e) => setNgayKy(e.target.value)}
                  className="border-b border-gray-400 px-1 py-0 text-sm w-12 text-center focus:outline-none focus:border-blue-500"
                  placeholder="__"
                />
              </span>
              <span className="hidden print:inline mx-1">
                {ngayKy || "____"}
              </span>
              tháng
              <span className="print:hidden">
                <input
                  type="text"
                  value={thangKy}
                  onChange={(e) => setThangKy(e.target.value)}
                  className="border-b border-gray-400 px-1 py-0 text-sm w-12 text-center focus:outline-none focus:border-blue-500"
                  placeholder="__"
                />
              </span>
              <span className="hidden print:inline mx-1">
                {thangKy || "____"}
              </span>
              năm
              <span className="print:hidden">
                <input
                  type="text"
                  value={namKy}
                  onChange={(e) => setNamKy(e.target.value)}
                  className="border-b border-gray-400 px-1 py-0 text-sm w-16 text-center focus:outline-none focus:border-blue-500"
                  placeholder="____"
                />
              </span>
              <span className="hidden print:inline mx-1">
                {namKy || "____"}
              </span>
              , bởi và giữa:
            </p>
          </div>

          {/* Company Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold uppercase mb-3">
              CÔNG TY
              <span className="print:hidden">
                <input
                  type="text"
                  value={congTy}
                  onChange={(e) => setCongTy(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-full max-w-md ml-2 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên công ty"
                />
              </span>
              <span className="hidden print:inline ml-2">
                {congTy || ""}
              </span>
            </h2>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-semibold">Địa chỉ trụ sở chính:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={branch?.address || ""}
                    readOnly
                    className="border-b border-gray-400 px-2 py-1 text-sm w-full max-w-md focus:outline-none"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {branch?.address ||
                    "682A Trường Chinh, Phường 15, Tân Bình, TP. Hồ Chí Minh"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Mã số doanh nghiệp:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={maSoDN}
                    onChange={(e) => setMaSoDN(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập mã số doanh nghiệp"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {maSoDN || "______"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Đại diện:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={daiDien}
                    onChange={(e) => setDaiDien(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập tên đại diện"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {daiDien || "______"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Chức vụ:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={chucVu}
                    onChange={(e) => setChucVu(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập chức vụ"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {chucVu || "______"}
                </span>
              </div>
              <div className="">
                (Theo Giấy uỷ quyền số
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soGiayUyQuyen}
                    onChange={(e) => setSoGiayUyQuyen(e.target.value)}
                    className="border-b border-gray-400 px-1 py-0 text-xs w-24 focus:outline-none focus:border-blue-500"
                    placeholder="____"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {soGiayUyQuyen || "____"}
                </span>
                ngày
                <span className="print:hidden">
                  <input
                    type="text"
                    value={ngayUyQuyen}
                    onChange={(e) => setNgayUyQuyen(e.target.value)}
                    className="border-b border-gray-400 px-1 py-0 text-xs w-24 focus:outline-none focus:border-blue-500"
                    placeholder="____"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {ngayUyQuyen || "____"}
                </span>
                )
              </div>
              <p className="font-bold">(Bên Bán)</p>
            </div>
          </div>

          {/* Separator */}
          <div className="text-center mb-6">
            <p className="text-base font-bold">VÀ</p>
          </div>

          {/* Customer Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">
              Ông/Bà
              <span className="print:hidden">
                <input
                  type="text"
                  value={tenKH}
                  onChange={(e) => setTenKH(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-64 ml-2 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên khách hàng"
                />
              </span>
              <span className="hidden print:inline ml-2">
                {tenKH || "______"}
              </span>
            </h2>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-semibold">Địa chỉ:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={diaChiKH}
                    onChange={(e) => setDiaChiKH(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-full max-w-md focus:outline-none focus:border-blue-500"
                    placeholder="Nhập địa chỉ"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {diaChiKH || "______"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Điện thoại:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={dienThoaiKH}
                    onChange={(e) => setDienThoaiKH(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {dienThoaiKH || "______"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Mã số thuế:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={maSoThueKH}
                    onChange={(e) => setMaSoThueKH(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập mã số thuế"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {maSoThueKH || "______"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Căn cước/CCCD/Hộ chiếu:</span>{" "}
                Số
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soCCCDKH}
                    onChange={(e) => setSoCCCDKH(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập số CCCD"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {soCCCDKH || "______"}
                </span>
                cấp ngày
                <span className="print:hidden">
                  <input
                    type="text"
                    value={ngayCapKH}
                    onChange={(e) => setNgayCapKH(e.target.value)}
                    className="border-b border-gray-400 px-1 py-0 text-sm w-24 focus:outline-none focus:border-blue-500"
                    placeholder="____"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {ngayCapKH || "____"}
                </span>
                bởi
                <span className="print:hidden">
                  <input
                    type="text"
                    value={noiCapKH}
                    onChange={(e) => setNoiCapKH(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập nơi cấp"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {noiCapKH || "______"}
                </span>
              </div>
            </div>
          </div>

          {/* Spouse Section */}
          {(tenVoChong ||
            diaChiVoChong ||
            dienThoaiVoChong ||
            soCCCDVoChong) && (
            <div className="mb-6">
              <h2 className="text-base font-bold mb-3">Có vợ/chồng là</h2>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">Ông/Bà</span>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={tenVoChong}
                      onChange={(e) => setTenVoChong(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập tên vợ/chồng"
                    />
                  </span>
                  <span className="hidden print:inline ml-2">
                    {tenVoChong || "______"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Địa chỉ:</span>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={diaChiVoChong}
                      onChange={(e) => setDiaChiVoChong(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-full max-w-md focus:outline-none focus:border-blue-500"
                      placeholder="Nhập địa chỉ"
                    />
                  </span>
                  <span className="hidden print:inline ml-2">
                    {diaChiVoChong || "______"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Điện thoại:</span>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={dienThoaiVoChong}
                      onChange={(e) => setDienThoaiVoChong(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </span>
                  <span className="hidden print:inline ml-2">
                    {dienThoaiVoChong || "______"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Mã số thuế:</span>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={maSoThueVoChong}
                      onChange={(e) => setMaSoThueVoChong(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập mã số thuế"
                    />
                  </span>
                  <span className="hidden print:inline ml-2">
                    {maSoThueVoChong || "______"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Căn cước/CCCD/Hộ chiếu:</span>{" "}
                  Số
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soCCCDVoChong}
                      onChange={(e) => setSoCCCDVoChong(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập số CCCD"
                    />
                  </span>
                  <span className="hidden print:inline mx-1">
                    {soCCCDVoChong || "______"}
                  </span>
                  cấp ngày
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={ngayCapVoChong}
                      onChange={(e) => setNgayCapVoChong(e.target.value)}
                      className="border-b border-gray-400 px-1 py-0 text-sm w-24 focus:outline-none focus:border-blue-500"
                      placeholder="____"
                    />
                  </span>
                  <span className="hidden print:inline mx-1">
                    {ngayCapVoChong || "____"}
                  </span>
                  bởi
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={noiCapVoChong}
                      onChange={(e) => setNoiCapVoChong(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập nơi cấp"
                    />
                  </span>
                  <span className="hidden print:inline mx-1">
                    {noiCapVoChong || "______"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm mb-6 font-bold">(Khách Hàng)</p>

          {/* Parties Definition */}
          <p className="text-sm mb-6">
            Bên Bán và Khách Hàng sau đây được gọi riêng là "Bên" và gọi chung
            là "Các Bên"
          </p>

          {/* WHEREAS Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3">XÉT RẰNG:</h2>
            <div className="text-sm space-y-2">
              <p>
                1. Khách Hàng là khách hàng cá nhân mua xe ô tô điện VinFast
                và/hoặc là (ii) vợ/chồng của Khách Hàng đã ký Hợp đồng mua bán
                xe ô tô điện VinFast số
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soHopDong}
                    onChange={(e) => setSoHopDong(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập số hợp đồng"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {soHopDong || "______"}
                </span>
                , ngày
                <span className="print:hidden">
                  <input
                    type="text"
                    value={formatDate(ngayHopDong)}
                    onChange={(e) => setNgayHopDong(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập ngày"
                  />
                </span>
                <span className="hidden print:inline mx-1">
                  {formatDate(ngayHopDong) || "____"}
                </span>
                với Bên Bán (sau đây gọi chung là "Hợp Đồng Mua Bán Xe") với
                thông tin về xe như sau:
              </p>
            </div>
            {/* Car Information */}
            <div className="ml-4 space-y-2">
              <div>
                <span className="mr-2">-</span>
                <span className="">Model:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={modelXe}
                    onChange={(e) => setModelXe(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập model xe"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {modelXe || "______"}
                </span>
              </div>
              <div>
                <span className="mr-2">-</span>
                <span className="">Số khung:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soKhung}
                    onChange={(e) => setSoKhung(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập số khung"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {soKhung || "______"}
                </span>
              </div>
              <div>
                <span className="mr-2">-</span>
                <span className="">Số máy:</span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soMay}
                    onChange={(e) => setSoMay(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập số máy"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {soMay || "______"}
                </span>
              </div>
              <div>
                <span className="mr-2">-</span>
                <span className="">
                  Giá trị thanh toán xe mua (là giá trên hóa đơn đã bao gồm VAT
                  đã trừ đi các ưu đãi bằng tiền nếu có):
                </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={formatCurrency(giaTriThanhToan)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setGiaTriThanhToan(val);
                    }}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập giá trị"
                  />
                </span>
                <span className="hidden print:inline ml-2">
                  {formatCurrency(giaTriThanhToan) || "______"} VNĐ
                </span>
                <span className="font-bold"> ("Giá Trị Thanh Toán")</span>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <p>
                2. Khách Hàng mua xe theo Chương trình mua xe 0 đồng ("Chương
                Trình"), thuộc trường hợp được Bên Bán áp dụng chính sách thúc
                đẩy bán hàng theo đó Bên Bán sẽ cho Khách Hàng thanh toán chậm
                một khoản tiền tương đương tối đa Giá Trị Thanh Toán trừ đi
                khoản tiền Khách Hàng vay tổ chức tín dụng để mua xe, và đảm bảo
                không cao hơn 10% Giá Trị Thanh Toán trong thời hạn tối đa 60
                tháng ("Khoản Trả Chậm"). Chương Trình áp dụng cho (các) khách
                hàng thỏa mãn đầy đủ các điều kiện sau:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>
                  Mua xe Herio Green hoặc VF5 và được xuất hóa đơn từ ngày
                  13/09/2025 đến hết ngày 31/12/2025.
                </li>
                <li>
                  Đã được tổ chức tín dụng đối tác thuộc danh sách do VinFast
                  thông báo theo từng thời kỳ ra thông báo cho vay để mua xe
                  ("Ngân Hàng Cho Vay").
                </li>
                <li>
                  Các điều kiện khác của Chương Trình đã được VinFast công bố
                  tại thời điểm ký kết Thỏa Thuận này bao gồm nhưng không giới
                  hạn thông báo triển khai Chương Trình tại Phụ lục 01 đính kèm
                  Thỏa Thuận này.
                </li>
                <li>
                  Không được áp dụng đồng thời mức hỗ trợ lãi suất của "Chương
                  trình ưu đãi chuyển đổi xanh", ưu đãi chính sách "Vì Thủ Đô
                  trong xanh" và "Sài Gòn xanh" và các chương trình hỗ trợ lãi
                  vay khác do VinFast thông báo theo từng thời kỳ.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <p>
                3. Bên Bán tại đây chỉ định Khách Hàng thanh toán Khoản Trả Chậm
                và các khoản thanh toán khác cho Bên Bán theo Thỏa Thuận này
                trực tiếp cho VinFast và VinFast được Bên Bán ủy quyền, vô điều
                kiện và không hủy ngang, để thực hiện việc nhận tiền thanh toán
                và thực hiện các biện pháp phù hợp để yêu cầu Khách Hàng thanh
                toán theo các điều khoản và điều kiện của Thỏa Thuận này.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <p>
                4. VinFast có thể ủy quyền cho tổ chức tín dụng thực hiện một
                phần hoặc toàn bộ công việc nêu tại Mục 3 trên đây để thu Khoản
                Trả Chậm và các khoản thanh toán khác cho Bên Bán theo Thỏa
                Thuận này từ Khách Hàng ("Ngân Hàng Thu Hộ").
              </p>
            </div>

            {/* DO VẬY Section */}
            <div>
              <p className="font-bold mb-3">
                DO VẬY, để thực hiện Chương Trình nêu trên, Các Bên thống nhất
                ký kết Thỏa Thuận này với những nội dung như sau:
              </p>
            </div>

            {/* Điều 1 */}
            <div className="space-y-3">
              <h3 className="font-bold">Điều 1. Điều khoản thanh toán</h3>
              <p>
                Khách Hàng mua xe theo Chương Trình được phép thanh toán chậm
                Khoản Trả Chậm với nội dung cụ thể như sau:
              </p>

              {/* 1.1 */}
              <div className="ml-4 space-y-2">
                <span className="">1.1. Chính sách trả chậm:</span>
                <div className="space-y-2">
                  <p>
                    <span>a) Số tiền Khách Hàng được trả chậm:</span>
                    <span className="print:hidden">
                      <input
                        type="text"
                        value={formatCurrency(soTienTraCham)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setSoTienTraCham(val);
                          setSoTienTraChamBangChu(numberToWords(val));
                        }}
                        className="border-b border-gray-400 px-2 py-1 text-sm w-48 ml-2 focus:outline-none focus:border-blue-500"
                        placeholder="Nhập số tiền"
                      />
                    </span>
                    <span className="hidden print:inline ml-2">
                      {formatCurrency(soTienTraCham) || "______"} VNĐ
                    </span>
                  </p>
                  <p>
                    <span>(Bằng chữ:</span>
                    <span className="print:hidden">
                      <input
                        type="text"
                        value={soTienTraChamBangChu}
                        onChange={(e) =>
                          setSoTienTraChamBangChu(e.target.value)
                        }
                        className="border-b border-gray-400 px-2 py-1 text-sm w-full max-w-2xl focus:outline-none focus:border-blue-500"
                        placeholder="Nhập bằng chữ"
                      />
                    </span>
                    <span className="hidden print:inline ml-2">
                      {soTienTraChamBangChu || "______"}
                    </span>
                    <strong>)</strong>
                  </p>
                  <p>
                    <span>b) Phí áp dụng:</span> Không áp dụng.
                  </p>
                  <p>
                    <span>c) Thời hạn thanh toán:</span>
                    <span className="print:hidden">
                      <input
                        type="text"
                        value={thoiHanThanhToan}
                        onChange={(e) => setThoiHanThanhToan(e.target.value)}
                        className="border-b border-gray-400 px-2 py-1 text-sm w-16 ml-2 focus:outline-none focus:border-blue-500"
                        placeholder="60"
                      />
                    </span>
                    <span className="hidden print:inline ml-2">
                      {thoiHanThanhToan || "60"}
                    </span>
                    {" "}tháng.
                  </p>
                  <p>
                    <span>d) Kỳ hạn thanh toán:</span> Ngày
                    <span className="print:hidden">
                      <input
                        type="text"
                        value={ngayTraNo}
                        onChange={(e) => setNgayTraNo(e.target.value)}
                        className="border-b border-gray-400 px-2 py-1 text-sm w-24 ml-2 focus:outline-none focus:border-blue-500"
                        placeholder="Nhập ngày"
                      />
                    </span>
                    <span className="hidden print:inline ml-2">
                      {ngayTraNo || "____"}
                    </span>
                    hàng tháng cho đến khi Khách Hàng hoàn tất nghĩa vụ thanh
                    toán.<sup>3</sup>
                  </p>
                  <p className="mt-2">
                    Kỳ thanh toán đầu tiên là tháng T+1 trong đó: tháng T là
                    tháng mà Bên Bán bàn giao xe cho Khách Hàng.
                  </p>
                </div>
              </div>

              {/* 1.2 */}
              <div className="ml-4 mt-4">
                <span>
                  1.2. Trong trường hợp đến kỳ hạn thanh toán theo quy định tại
                  Thỏa Thuận này mà Khách Hàng thanh toán chậm và/hoặc không đầy
                  đủ, thì ngoài các biện pháp khác được quy định tại Thỏa Thuận
                  này, Khách Hàng còn phải thanh toán thêm cho VinFast khoản
                  lãi/phí chậm thanh toán, được tính theo mức lãi suất 10%/năm
                  trên số tiền chậm thanh toán, tương ứng với số ngày thực tế
                  chậm trả.{" "}
                </span>
              </div>

              {/* 1.3 */}
              <div className="ml-4 mt-4">
                <span className="">1.3. Hình thức thanh toán: </span>
                <span className="mb-2">
                  Khách Hàng có thể lựa chọn một trong các hình thức thanh toán
                  sau đây hoặc các hình thức khác do VinFast thông báo theo từng
                  thời kỳ:
                </span>
                <div className="ml-4 space-y-2">
                  <p>
                    a) Thanh toán tự động qua dịch vụ thu hộ định kỳ hàng tháng
                    của Ngân Hàng Thu Hộ được quy định tại Phụ lục 02 đính kèm
                    Thỏa Thuận này.
                  </p>
                  <p className="ml-4">
                    Trong trường hợp Khách Hàng lựa chọn hình thức thanh toán
                    tại điểm a) nêu trên, Khách Hàng đồng ý cho phép VinFast
                    cung cấp dữ liệu cá nhân của Khách Hàng (bao gồm hình ảnh
                    hoặc thông tin từ căn cước/CCCD, hộ chiếu hoặc một phần
                    thông tin định danh điện tử của Khách Hàng) cho Ngân Hàng
                    Thu Hộ. Mục đích của việc cung cấp dữ liệu cá nhân này là để
                    thực hiện yêu cầu của Khách Hàng và VinFast sẽ xử lý yêu cầu
                    này phù hợp với quy định của pháp luật hiện hành về bảo vệ
                    dữ liệu cá nhân.
                  </p>
                  <p>
                    b) Khách Hàng thanh toán trực tiếp vào tài khoản của VinFast
                    thông qua hướng dẫn trên ứng dụng "VinFast" và/hoặc các nền
                    tảng trực tuyến khác theo hướng dẫn của VinFast theo từng
                    thời kỳ. Khách Hàng có thể lựa chọn thanh toán 01 (một) kỳ
                    hoặc thanh toán trước nhiều kỳ.
                  </p>
                </div>
              </div>
            </div>

            {/* Điều 2 */}
            <div className="mt-6 space-y-4">
              <h3 className="font-bold">
                Điều 2. Quyền và nghĩa vụ của các Bên
              </h3>

              {/* 2.1 */}
              <div className="ml-4 space-y-2">
                <h4 className="">2.1. Quyền và nghĩa vụ của Bên Bán:</h4>
                <div className="ml-4 space-y-1">
                  <p>
                    a) Hỗ trợ Khách Hàng thanh toán chậm theo Chương Trình và
                    các điều khoản của Thỏa Thuận này.
                  </p>
                  <p>
                    b) Yêu cầu Khách Hàng thanh toán đầy đủ và đúng hạn Khoản
                    Trả Chậm và/hoặc các khoản phí, lãi phạt và chi phí phát
                    sinh khác liên quan (nếu có) cho VinFast theo quy định của
                    Thỏa Thuận này và các văn bản khác có liên quan.
                  </p>
                  <p>
                    c) Ủy quyền vô điều kiện và không hủy ngang cho VinFast thực
                    hiện các biện pháp phù hợp để yêu cầu Khách Hàng thanh toán
                    theo quy định của pháp luật và Thỏa Thuận này trong trường
                    hợp Khách Hàng vi phạm nghĩa vụ thanh toán.
                  </p>
                </div>
              </div>

              {/* 2.2 */}
              <div className="ml-4 space-y-2">
                <h4 className="">2.2. Quyền và nghĩa vụ của Khách Hàng:</h4>
                <div className="ml-4">
                  <p>
                    a) Được hưởng chính sách thanh toán chậm một phần Giá Trị
                    Thanh Toán theo quy định của Chương Trình và Thỏa Thuận này
                    khi đáp ứng đầy đủ các điều kiện.
                  </p>
                  <p>
                    b) Hiểu rõ và đồng ý thanh toán đầy đủ và đúng hạn Khoản Trả
                    Chậm và các khoản phí, lãi suất phạt, chi phí phát sinh khác
                    (nếu có) cho VinFast hoặc Ngân Hàng Thu Hộ do VinFast chỉ
                    định theo Thỏa Thuận này.
                  </p>
                  <p>
                    c) Có quyền thanh toán trước hạn một phần hoặc toàn bộ Khoản
                    Trả Chậm.
                  </p>
                  <p>
                    d) Phải thanh toán trước hạn và thanh toán đầy đủ Khoản Trả
                    Chậm trước khi ký kết bất kỳ văn bản chuyển nhượng nào đối
                    với Hợp Đồng Mua Bán Xe và/hoặc trước khi xe là đối tượng
                    của hợp đồng mua bán/chuyển nhượng với bất kỳ bên thứ ba nào
                    khác.
                  </p>
                  <p>
                    e) Trong trường hợp Khách Hàng vi phạm các điều kiện của
                    Chương Trình hoặc các nghĩa vụ khác theo Thỏa Thuận này,
                    toàn bộ Khoản Trả Chậm còn lại và/hoặc các khoản phí, lãi
                    phạt và chi phí phát sinh khác liên quan sẽ trở thành khoản
                    nợ đến hạn ngay lập tức. VinFast có quyền áp dụng các chương
                    trình hỗ trợ lãi suất hoặc chương trình hỗ trợ thanh toán
                    cho Khách Hàng khi Khách Hàng vay vốn để mua xe tại Ngân
                    Hàng Cho Vay (nếu có).
                  </p>
                  <p>
                    f) Bằng việc ký kết Thỏa Thuận này, Khách Hàng đồng ý cho
                    phép VinFast và Bên Bán xử lý thông tin và dữ liệu cá nhân
                    của Khách Hàng theo "Chính Sách Bảo Vệ Dữ Liệu Cá Nhân" của
                    VinFast được công bố tại{" "}
                    <span className="text-blue-600 underline">
                      https://vinfastauto.com/vn_vi/privacy-policy
                    </span>{" "}
                    và pháp luật hiện hành về bảo vệ dữ liệu cá nhân.
                  </p>
                </div>
              </div>
            </div>

            {/* Điều 3 */}
            <div className="mt-6 space-y-4">
              <h3 className="font-bold">Điều 3. Biện pháp can thiệp</h3>

              {/* 3.1 */}
              <div className="ml-4 space-y-2">
                <span className="">
                  3.1. Để phục vụ hoạt động VinFast yêu cầu thanh toán và/hoặc
                  yêu cầu Khách Hàng thực hiện nghĩa vụ khác theo Thỏa Thuận
                  này, Khách Hàng đồng ý để VinFast và/hoặc bất kỳ bên thứ ba do
                  VinFast ủy quyền hoặc chỉ định (gọi chung là “
                  <strong>Đơn Vị Hỗ Trợ Kỹ Thuật</strong>”) thực hiện các công
                  việc sau:
                </span>{" "}
                <div className="ml-4 space-y-2">
                  <p>
                    a) Thu thập, xử lý và sử dụng thông tin về xe, dữ liệu trong
                    xe và dữ liệu định vị xe của Khách Hàng trong suốt thời hạn
                    Thỏa Thuận này có hiệu lực; và
                  </p>
                  <p>
                    b) Trong trường hợp Khách Hàng vi phạm nghĩa vụ thanh toán
                    theo quy định tại Điều 2 của Thỏa Thuận này quá 30 ngày hoặc
                    theo thời hạn khác do VinFast yêu cầu, Đơn Vị Hỗ Trợ Kỹ
                    Thuật có quyền thực hiện các biện pháp can thiệp vào vận
                    hành của xe, bao gồm nhưng không giới hạn ngắt vận hành xe,
                    ngừng cung cấp dịch vụ liên quan đến xe. Trong vòng 02 ngày
                    trước khi thực hiện, cảnh báo sẽ được hiển thị trên màn hình
                    chính của xe mỗi khi xe được khởi động. Để làm rõ, Đơn Vị Hỗ
                    Trợ Kỹ Thuật sẽ ngừng thực hiện các biện pháp can thiệp nêu
                    trên khi Khách Hàng tuân thủ nghĩa vụ thanh toán Khoản Trả
                    Chậm và/hoặc các khoản phí, lãi phạt và chi phí phát sinh
                    khác liên quan (nếu có) đối với VinFast.
                  </p>
                </div>
              </div>

              {/* 3.2 */}
              <div className="ml-4 space-y-2">
                <span className="">3.2. </span>
                <span>
                  Khách Hàng đồng ý phối hợp, không cản trở và không có ý kiến
                  gì khác khi VinFast/Đơn Vị Hỗ Trợ Kỹ Thuật và bất kỳ cán bộ
                  nhân viên liên quan của các Bên thực hiện các nội dung quy
                  định tại Điều 3.1 trên đây và tự mình chịu trách nhiệm đối với
                  bất kỳ tổn thất, thiệt hại phát sinh từ hoặc liên quan đến
                  việc thực hiện Điều 3 này, ngay cả sau khi Thỏa Thuận đã chấm
                  dứt, trừ khi pháp luật có quy định khác.
                </span>
              </div>
            </div>

            {/* Điều 4 */}
            <div className="mt-6 space-y-4">
              <h3 className="font-bold">Điều 4. Cam kết của Khách Hàng</h3>

              {/* 4.1 */}
              <div className="ml-4 space-y-2">
                <span className="">4.1. </span>
                <span>
                  Khách Hàng cam kết hoàn tất toàn bộ hồ sơ vay vốn với Ngân
                  Hàng Cho Vay trong thời hạn tối đa 30 ngày kể từ ngày Khách
                  Hàng được cấp đăng ký xe (cà vẹt) từ cơ quan có thẩm quyền. Để
                  làm rõ “<span className="italic">hoàn tất hồ sơ vay vốn</span>
                  ” được hiểu là việc Khách Hàng đã ký kết đầy đủ hợp đồng tín
                  dụng, hợp đồng thế chấp (nếu có), và thực hiện toàn bộ nghĩa
                  vụ cung cấp giấy tờ, ký nhận, cũng như các thủ tục cần thiết
                  khác theo yêu cầu của Ngân Hàng để khoản vay mua xe của Khách
                  Hàng được giải ngân cho Bên Bán.
                </span>
              </div>

              {/* 4.2 */}
              <div className="ml-4 space-y-2">
                <span className="">4.2. </span>
                <span>
                  Trường hợp Khách Hàng không hoàn thành nghĩa vụ nêu trên hoặc
                  giao dịch với Ngân Hàng Cho Vay bị từ chối/đình chỉ do lỗi của
                  Khách Hàng, thì Khách Hàng cam kết bồi thường cho Bên Bán toàn
                  bộ các chi phí, tổn thất và nghĩa vụ tài chính mà Bên Bán phải
                  gánh chịu phát sinh từ việc Khách Hàng không hoàn thành hồ sơ
                  vay vốn, bao gồm nhưng không giới hạn ở: chi phí quản lý, xử
                  lý hành chính; các khoản phạt, phí phát sinh với cơ quan Nhà
                  nước hoặc đối tác thứ ba; các khoản thiệt hại khác có liên
                  quan trực tiếp.
                </span>
              </div>
            </div>

            {/* Điều 5 */}
            <div className="mt-6 space-y-4">
              <h3 className="font-bold">Điều 5. Hiệu lực của Thỏa Thuận</h3>

              {/* 5.1 */}
              <div className="ml-4 space-y-2">
                <span className="">5.1. </span>
                <span>
                  Thỏa Thuận này có hiệu lực kể từ ngày ký kết và có hiệu lực
                  cho đến khi các Bên đã thực hiện đầy đủ các nghĩa vụ của mình
                  theo Thỏa Thuận này.
                </span>
              </div>

              {/* 5.2 */}
              <div className="ml-4 space-y-2">
                <span className="">5.2. </span>
                <span>
                  Bên Bán và Khách Hàng đồng ý không được chuyển nhượng hoặc
                  chuyển giao quyền và nghĩa vụ của mình cho bất kỳ bên thứ ba
                  nào mà không có sự đồng ý trước bằng văn bản của VinFast.
                </span>
              </div>

              {/* 5.3 */}
              <div className="ml-4 space-y-2">
                <span className="">5.3. </span>
                <span>
                  Mọi sửa đổi, bổ sung của Thỏa Thuận này phải được VinFast chấp
                  thuận, được lập thành văn bản và được ký kết bởi người đại
                  diện hợp pháp của các Bên. Các sửa đổi, bổ sung không được
                  VinFast chấp thuận sẽ không có hiệu lực.
                </span>
              </div>

              {/* 5.4 */}
              <div className="ml-4 space-y-2">
                <span className="">5.4. </span>
                <span>
                  Thỏa Thuận này được điều chỉnh bởi pháp luật Việt Nam. Mọi
                  tranh chấp phát sinh từ hoặc liên quan đến Thỏa Thuận này mà
                  không thể giải quyết thông qua thương lượng hoặc hòa giải sẽ
                  được giải quyết bởi Tòa án có thẩm quyền.
                </span>
              </div>

              {/* 5.5 */}
              <div className="ml-4 space-y-2">
                <span className="">5.5. </span>
                <span>
                  Thỏa Thuận này được lập thành 04 (bốn) bản có giá trị pháp lý
                  như nhau, mỗi Bên giữ 02 (hai) bản.
                </span>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-12 mb-8">
              <div className="flex justify-between">
                {/* Bên Bán */}
                <div className="flex-1 text-center">
                  <p className="font-bold mb-16">ĐẠI DIỆN BÊN BÁN</p>
                </div>

                {/* Khách Hàng */}
                <div className="flex-1 text-center">
                  <p className="font-bold mb-16">KHÁCH HÀNG</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto mt-8 print:hidden">
        <div className="text-center space-x-4">
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
            In Giấy Thỏa Thuận
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
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
            margin: 0;
            box-shadow: none;
            page-break-after: avoid;
            page-break-inside: avoid;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          /* Padding cho từng trang khi in */
          @page {
            margin: 10mm 10mm;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: hidden !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          h1, h2 {
            page-break-after: avoid;
          }
          
          p {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default GiayThoaThuanTraCham;
