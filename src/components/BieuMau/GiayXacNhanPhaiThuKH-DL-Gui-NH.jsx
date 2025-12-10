import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { vndToWords } from "../../utils/vndToWords";

const GiayXacNhanPhaiThuKH_DL_Gui_NH = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [tpHCM, setTpHCM] = useState("Tp Hồ Chí Minh");
  const [ngay, setNgay] = useState("");
  const [thang, setThang] = useState("");
  const [nam, setNam] = useState("");

  // Company info
  const [congTy, setCongTy] = useState(
    "CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH TRƯỜNG CHINH"
  );
  const [diaChiTruSo, setDiaChiTruSo] = useState(
    "682A Trường Chinh, Phường 15, Tân Bình, TP. Hồ Chí Minh"
  );
  const [maSoDN, setMaSoDN] = useState("");
  const [daiDien, setDaiDien] = useState("");
  const [chucVu, setChucVu] = useState("");
  const [giayUyQuyen, setGiayUyQuyen] = useState("");

  // Contract info
  const [soHopDong, setSoHopDong] = useState("");
  const [ngayKyHopDong, setNgayKyHopDong] = useState("");
  const [giaTriHopDong, setGiaTriHopDong] = useState("");
  const [ongBa, setOngBa] = useState("");
  const [modelXe, setModelXe] = useState("");
  const [mucDichMuaBanXe, setMucDichMuaBanXe] = useState("");
  const [congTySauBangVan, setCongTySauBangVan] = useState("");
  const [congNoPhaiThanh, setCongNoPhaiThanh] = useState("");
  const [soTienConLai, setSoTienConLai] = useState("");
  const [soTienBangChu, setSoTienBangChu] = useState("");
  const [giaTriHopDongBangChu, setGiaTriHopDongBangChu] = useState("");
  const [soTienVay, setSoTienVay] = useState("");
  const [soTienVayBangChu, setSoTienVayBangChu] = useState("");

  // Bank info
  const [soTaiKhoan, setSoTaiKhoan] = useState("");
  const [nganHang, setNganHang] = useState("");
  const [chiNhanh, setChiNhanh] = useState("");
  const [chuTaiKhoan, setChuTaiKhoan] = useState("");
  const [congTyTaiKhoan, setCongTyTaiKhoan] = useState("");

  const formatCurrency = (value) => {
    if (!value) return "";
    const number = value.replace(/[^\d]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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

  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";
      let contractData = null;

      // Nếu có firebaseKey, lấy dữ liệu từ database
      if (location.state?.firebaseKey) {
        try {
          const contractRef = ref(
            database,
            `contracts/${location.state.firebaseKey}`
          );
          const snapshot = await get(contractRef);
          if (snapshot.exists()) {
            contractData = snapshot.val();
            if (contractData.showroom) {
              showroomName = contractData.showroom;
            }
          }
        } catch (error) {
          console.error("Error loading contract data:", error);
        }
      }

      // Lấy thông tin chi nhánh
      const branchInfo =
        getBranchByShowroomName(showroomName) || getDefaultBranch();

      // Set default date
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setNgay(pad(today.getDate()));
      setThang(pad(today.getMonth() + 1));
      setNam(today.getFullYear().toString());

      // Sử dụng dữ liệu từ database hoặc location.state
      const dataSource = contractData || location.state || {};

      // Auto-fill thông tin công ty từ branch
      if (branchInfo) {
        setCongTy(`${branchInfo.name.toUpperCase()}`);
        setDiaChiTruSo(branchInfo.address);
        setMaSoDN(branchInfo.taxCode || "");
        setDaiDien(branchInfo.representativeName || "");
        setChucVu(branchInfo.position || "");

        // Auto-fill thông tin ngân hàng từ branch
        setSoTaiKhoan(branchInfo.bankAccount || "");
        setNganHang(branchInfo.bankName || "");
        setChiNhanh(branchInfo.bankBranch || "");
        setChuTaiKhoan(branchInfo.representativeName || "");
        setCongTyTaiKhoan(branchInfo.name || "");
      }

      // Auto-fill từ dữ liệu hợp đồng
      if (dataSource) {
        setData(dataSource);

        // Thông tin khách hàng
        const customerName =
          dataSource.customerName ||
          dataSource["Tên KH"] ||
          dataSource["Tên Kh"] ||
          "";
        if (customerName) setOngBa(customerName);

        // Model xe
        const model =
          dataSource.model || dataSource.dongXe || dataSource["Dòng xe"] || "";
        if (model) setModelXe(model);

        // Số hợp đồng (mã hợp đồng)
        const contractNumber =
          dataSource.vso ||
          dataSource["VSO"] ||
          dataSource.soHopDong ||
          dataSource.contractNumber ||
          "";
        if (contractNumber) setSoHopDong(contractNumber);

        // Ngày ký hợp đồng
        const contractDate =
          dataSource.contractDate ||
          dataSource.createdAt ||
          dataSource.createdDate ||
          "";
        if (contractDate) {
          setNgayKyHopDong(formatDate(contractDate));
        }

        // Giá trị hợp đồng
        const contractPrice =
          dataSource.contractPrice ||
          dataSource.giaHD ||
          dataSource["Giá Hợp Đồng"] ||
          dataSource.totalPrice ||
          "";
        if (contractPrice) {
          const priceValue =
            typeof contractPrice === "string"
              ? contractPrice.replace(/\D/g, "")
              : String(contractPrice);
          setGiaTriHopDong(formatCurrency(priceValue));
          setGiaTriHopDongBangChu(vndToWords(priceValue));
        }

        // Số tiền còn lại (nếu có)
        const remainingAmount =
          dataSource.soTienConLai ||
          dataSource["Số Tiền Còn Lại"] ||
          dataSource.remainingAmount ||
          "";
        if (remainingAmount) {
          const amountValue =
            typeof remainingAmount === "string"
              ? remainingAmount.replace(/\D/g, "")
              : String(remainingAmount);
          setSoTienConLai(formatCurrency(amountValue));
          setSoTienBangChu(vndToWords(amountValue));
        }

        // Số tiền Khách Hàng vay Ngân hàng (nếu có)
        const loanAmount =
          dataSource.soTienVay ||
          dataSource["Số Tiền Vay"] ||
          dataSource.loanAmount ||
          "";
        if (loanAmount) {
          const loanValue =
            typeof loanAmount === "string"
              ? loanAmount.replace(/\D/g, "")
              : String(loanAmount);
          setSoTienVay(formatCurrency(loanValue));
          setSoTienVayBangChu(vndToWords(loanValue));
        }

        // Thông tin ngân hàng (nếu có)
        if (dataSource.bankAccount) setSoTaiKhoan(dataSource.bankAccount);
        if (dataSource.bankName) setNganHang(dataSource.bankName);
        if (dataSource.bankBranch) setChiNhanh(dataSource.bankBranch);
      } else {
        setData({
          customerName: "",
          contractDate: "",
          totalPrice: "",
        });
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
      className="min-h-screen bg-gray-50 p-8 print:p-0 print:m-0"
      style={{ fontFamily: "Times New Roman" }}
    >
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
        <div className="bg-white p-12 print:p-0 print:bg-white text-[14px] print:text-[14px]" id="printable-content">
          {/* Header */}
          <div className="text-center mb-2">
            <p className="font-bold">
              Cộng Hòa – Xã Hội – Chủ Nghĩa – Việt Nam
            </p>
            <p className="font-bold">Độc lập – Tự do – Hạnh Phúc</p>
            <p className="mt-2">**********</p>
          </div>

          <div className="text-right mb-4 italic">
            <span className="print:hidden">
              <input
                type="text"
                value={tpHCM}
                onChange={(e) => setTpHCM(e.target.value)}
                className="border-b border-gray-400 px-1 w-40 text-center focus:outline-none focus:border-blue-500"
              />
            </span>
            <span className="hidden print:inline">{tpHCM}</span>, ngày{" "}
            <span className="print:hidden">
              <input
                type="text"
                value={ngay}
                onChange={(e) => setNgay(e.target.value)}
                className="border-b border-gray-400 px-1 w-12 text-center focus:outline-none focus:border-blue-500"
              />
            </span>
            <span className="hidden print:inline">{ngay}</span> tháng{" "}
            <span className="print:hidden">
              <input
                type="text"
                value={thang}
                onChange={(e) => setThang(e.target.value)}
                className="border-b border-gray-400 px-1 w-12 text-center focus:outline-none focus:border-blue-500"
              />
            </span>
            <span className="hidden print:inline">{thang}</span> năm{" "}
            <span className="print:hidden">
              <input
                type="text"
                value={nam}
                onChange={(e) => setNam(e.target.value)}
                className="border-b border-gray-400 px-1 w-20 text-center focus:outline-none focus:border-blue-500"
              />
            </span>
            <span className="hidden print:inline">{nam}</span>
          </div>

          {/* Title */}
          <h1 className="text-center text-[20px] font-bold mb-8">
            GIẤY XÁC NHẬN CÔNG NỢ
          </h1>

          {/* Company Info */}
          <div className="mb-3 space-y-1">
            <p>
              <span className="print:hidden">
                <input
                  type="text"
                  value={congTy}
                  onChange={(e) => setCongTy(e.target.value)}
                  className="border-b border-gray-400 font-bold uppercase px-1 w-full focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline font-bold">{congTy}</span>
            </p>
            <p>
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
            <p>
              Mã số doanh nghiệp:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={maSoDN}
                  onChange={(e) => setMaSoDN(e.target.value)}
                  className="border-b border-gray-400 px-1 w-64 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{maSoDN}</span>
            </p>
            <div className="flex gap-8">
              <p>
                Đại diện:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={daiDien}
                    onChange={(e) => setDaiDien(e.target.value)}
                    className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{daiDien}</span>
              </p>
              <p>
                Chức vụ:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={chucVu}
                    onChange={(e) => setChucVu(e.target.value)}
                    className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{chucVu}</span>
              </p>
            </div>
            <p>
              (Theo giấy ủy quyền số{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={giayUyQuyen}
                  onChange={(e) => setGiayUyQuyen(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{giayUyQuyen}</span>)
            </p>
          </div>

          {/* Content */}
          <div className="mb-6 space-y-3 text-justify">
            <p>Nội dung xác nhận:</p>

            <p>
              Căn cứ vào hợp đồng mua bán xe ô tô số{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soHopDong}
                  onChange={(e) => setSoHopDong(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập số hợp đồng"
                />
              </span>
              <span className="hidden print:inline">
                {soHopDong || "______"}
              </span>{" "}
              ký ngày{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={ngayKyHopDong}
                  onChange={(e) => setNgayKyHopDong(e.target.value)}
                  className="border-b border-gray-400 px-1 w-32 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập ngày ký"
                />
              </span>
              <span className="hidden print:inline">
                {ngayKyHopDong || "______"}
              </span>{" "}
              giữa{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={congTy}
                  onChange={(e) => setCongTy(e.target.value)}
                  className="border-b border-gray-400 px-1 font-bold w-64 focus:outline-none focus:border-blue-500"
                  style={{ textTransform: "none" }}
                  placeholder="Công ty"
                />
              </span>
              <span
                className="hidden print:inline font-bold"
                style={{ textTransform: "none" }}
              >
                {congTy || "Công ty"}
              </span>{" "}
              và{" "}
              <strong>Ông/Bà</strong>{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={ongBa}
                  onChange={(e) => setOngBa(e.target.value)}
                  className="border-b border-gray-400 px-1 w-64 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{ongBa}</span> về việc mua
              bán xe{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={modelXe}
                  onChange={(e) => setModelXe(e.target.value)}
                  className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập model xe"
                />
              </span>
              <span className="hidden print:inline">{modelXe || "______"}</span>{" "}
              với giá trị hợp đồng{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={giaTriHopDong}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setGiaTriHopDong(formatCurrency(val));
                    setGiaTriHopDongBangChu(vndToWords(val));
                  }}
                  className="border-b border-gray-400 font-bold px-1 w-48 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline font-bold">{giaTriHopDong}</span>
              <strong>{" "}VNĐ</strong> <em className="font-bold">(Bằng chữ:</em>{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={giaTriHopDongBangChu}
                  onChange={(e) => setGiaTriHopDongBangChu(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full font-bold italic focus:outline-none focus:border-blue-500"
                  placeholder="Nhập bằng chữ"
                />
              </span>
              <span className="hidden print:inline font-bold italic">
                {giaTriHopDongBangChu || "______"}
              </span>
              <strong>)</strong>. Bằng văn bản này:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={congTy}
                  onChange={(e) => setCongTy(e.target.value)}
                  className="border-b border-gray-400 px-1 font-bold w-auto focus:outline-none focus:border-blue-500"
                  style={{ textTransform: "none" }}
                  placeholder="Công ty"
                />
              </span>
              <span
                className="hidden print:inline font-bold"
                style={{ textTransform: "none" }}
              >
                {congTy || "Công ty"}
              </span>{" "}
              xác nhận <strong>Ông/Bà</strong>{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={ongBa}
                  onChange={(e) => setOngBa(e.target.value)}
                  className="border-b border-gray-400 px-1 w-auto focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{ongBa}</span> còn phải
              thanh toán số tiền còn lại là{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soTienConLai}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setSoTienConLai(formatCurrency(val));
                    setSoTienBangChu(vndToWords(val));
                  }}
                  className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập số tiền"
                />
              </span>
              <span className="hidden print:inline">
                {soTienConLai || "______"} VNĐ
              </span>{" "}
              <em className="font-bold">(Bằng chữ:</em>{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soTienBangChu}
                  onChange={(e) => setSoTienBangChu(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full font-bold italic focus:outline-none focus:border-blue-500"
                  placeholder="Nhập bằng chữ"
                />
              </span>
              <span className="hidden print:inline font-bold italic">
                {soTienBangChu || "______"}
              </span>
              <strong>)</strong>. Số tiền Khách Hàng vay Ngân hàng để thanh
              toán:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soTienVay}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const val = rawValue.replace(/\D/g, "");
                    setSoTienVay(formatCurrency(val));
                    // Tự động chuyển số tiền sang chữ khi nhập
                    if (val && val.length > 0) {
                      const numValue = parseInt(val, 10);
                      if (!isNaN(numValue) && numValue > 0) {
                        setSoTienVayBangChu(vndToWords(val));
                      } else {
                        setSoTienVayBangChu("");
                      }
                    } else {
                      setSoTienVayBangChu("");
                    }
                  }}
                  className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập số tiền vay"
                />
              </span>
              <span className="hidden print:inline">
                {soTienVay || "______"} VNĐ
              </span>{" "}
              <em className="font-bold">(Bằng chữ:</em>{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soTienVayBangChu}
                  onChange={(e) => setSoTienVayBangChu(e.target.value)}
                  className="border-b border-gray-400 px-1 w-full font-bold italic focus:outline-none focus:border-blue-500"
                  placeholder="Nhập bằng chữ"
                />
              </span>
              <span className="hidden print:inline font-bold italic">
                {soTienVayBangChu || "______"}
              </span>
              <strong>)</strong>. Dựa theo thông báo cho vay đã phê duyệt, kính
              đề nghị quý ngân hàng giải ngân số tiền còn lại theo thông báo cho
              vay theo thông tin số tài khoản dưới đây
            </p>
          </div>

          {/* Bank Info */}
          <div className="mb-6 space-y-2">
            <p>
              Số tài khoản:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={soTaiKhoan}
                  onChange={(e) => setSoTaiKhoan(e.target.value)}
                  className="border-b border-gray-400 px-1 w-64 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{soTaiKhoan}</span>
            </p>
            <div className="flex gap-8">
              <p>
                Ngân hàng{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nganHang}
                    onChange={(e) => setNganHang(e.target.value)}
                    className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{nganHang}</span>
              </p>
              <p>
                -
                <span className="print:hidden">
                  <input
                    type="text"
                    value={chiNhanh}
                    onChange={(e) => setChiNhanh(e.target.value)}
                    className="border-b border-gray-400 px-1 w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{chiNhanh}</span>
              </p>
            </div>
            <p>
              Chủ tài khoản:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={
                    "Công ty Cổ phần Đầu tư Thương mại và Dịch vụ Ô tô Đông Sài Gòn"
                  }
                  onChange={(e) => setCongTyTaiKhoan(e.target.value)}
                  className="border-b border-gray-400 px-1 w-[70%] focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">
                {congTyTaiKhoan || "______"}
              </span>
            </p>
          </div>

          <p className="mb-3">Xin chân thành cảm ơn!</p>

          {/* Signature */}
          <div className="flex w-full">
            <div className="w-1/2"></div>
            <div className="w-1/2">
              <p className="font-bold mb-1 text-center">CÔNG TY XÁC NHẬN</p>
              <p className="italic mb-20 text-center">(Ký tên, Đóng dấu)</p>
            </div>
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
          In Giấy Xác Nhận
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 15mm 10mm;
            size: A4;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
            page-break-after: avoid !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            height: auto !important;
            overflow: visible !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          .bg-gray-50 {
            background: white !important;
          }
          .max-w-4xl {
            max-width: none !important;
          }
          .mx-auto {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .p-8, .p-12 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GiayXacNhanPhaiThuKH_DL_Gui_NH;
