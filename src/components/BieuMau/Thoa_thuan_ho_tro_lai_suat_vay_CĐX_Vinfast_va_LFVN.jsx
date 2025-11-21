import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";

const Thoa_thuan_ho_tro_lai_suat_vay_CĐX_Vinfast_va_LFVN = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper functions
  const formatCurrency = (amount) => {
    if (!amount) return "";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return num.toLocaleString("vi-VN");
  };

  const pad = (num) => String(num).padStart(2, "0");

  // Editable fields
  const [ngayKy, setNgayKy] = useState("");
  const [thangKy, setThangKy] = useState("");
  const [namKy, setNamKy] = useState("");

  // Bên Bán
  const [congTy, setCongTy] = useState("");
  const [diaChiTruSo, setDiaChiTruSo] = useState("");
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
  const [tyLeVay, setTyLeVay] = useState("80%");
  const [thoiHanVay, setThoiHanVay] = useState("");

  // Firebase effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state?.contractId) {
          const contractRef = ref(
            database,
            `contracts/${location.state.contractId}`
          );
          const snapshot = await get(contractRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            setData(contractData);

            // Auto-fill fields
            if (contractData.khachHang) {
              setTenKH(contractData.khachHang || "");
              setDiaChiKH(contractData.diaChiKhachHang || "");
              setDienThoaiKH(contractData.soDienThoaiKhachHang || "");
              setCmtndKH(contractData.soCccdKhachHang || "");
            }

            if (contractData.thongTinXe) {
              setMauXe(contractData.tenXe || "");
              setSoKhung(contractData.soKhung || "");
              setSoMay(contractData.soMay || "");
            }

            setSoHopDong(contractData.soHopDong || "");

            // Set current date
            const now = new Date();
            setNgayKy(pad(now.getDate()));
            setThangKy(pad(now.getMonth() + 1));
            setNamKy(now.getFullYear().toString());
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header buttons - hidden when printing */}
      <div className="print:hidden bg-gray-100 p-4 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Quay lại
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          In Thỏa thuận hỗ trợ lãi suất LFVN
        </button>
      </div>

      {/* Content */}
      <div id="printable-content" className="max-w-4xl mx-auto p-6 bg-white">
        <style>{`
          @media print {
            @page {
              margin: 15mm;
              size: A4;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.4;
            }
            .print\\:hidden {
              display: none !important;
            }
            .hidden {
              display: none !important;
            }
            .print\\:inline {
              display: inline !important;
            }
            .print\\:block {
              display: block !important;
            }
            #printable-content {
              max-width: none;
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
            .page-break {
              page-break-before: always;
            }
          }
        `}</style>

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
              Địa chỉ:{" "}
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
              tại Công ty Tài chính TNHH MTV Lotte Việt Nam (sau đây gọi là "
              <strong>LFVN</strong>") theo chính sách hỗ trợ lãi vay của VinFast
              ("<strong>Chính sách Hỗ trợ lãi vay</strong>") áp dụng cho các
              Khách hàng tham gia chương trình Chuyển đổi xanh mua xe và xuất
              hóa đơn từ ngày …../…../2025 đến hết ngày 31/12/2025, giải ngân
              đến hết ngày 31/12/2025. Công ty TNHH Kinh Doanh Thương Mại Và
              Dịch Vụ VinFast – Mã số thuế: 0108926276 ("
              <strong>VinFast Trading</strong>"), LFVN và Công ty cổ phần Sản
              xuất và Kinh doanh VinFast – Mã số thuế: 0107894416 ("
              <strong>VinFast</strong>") đã ký Thỏa thuận hợp tác ("
              <strong>Thỏa Thuận Hợp Tác</strong>") về việc hỗ trợ Khách Hàng
              vay mua xe ô tô điện VinFast. Theo đó, Khách Hàng sẽ được VinFast
              hỗ trợ thanh toán cho LFVN một khoản tiền chênh lệch giữa số tiền
              lãi của LFVN theo các quy định và điều kiện tại Thỏa Thuận Hợp Tác
              với số tiền lãi Khách Hàng chi trả cố định hàng tháng. Khoản hỗ
              trợ này sẽ được VinFast chi trả cho LFVN thông qua VinFast
              Trading.
            </p>

            <p className="mb-3">
              3. Khách Hàng và LFVN đã hoặc sẽ ký kết một hợp đồng tín dụng
              (hoặc hợp đồng/thỏa thuận/khế ước khác có bản chất là hợp đồng tín
              dụng) và hợp đồng thế chấp (hoặc hợp đồng/thỏa thuận có bản chất
              là giao dịch bảo đảm) và tất cả các thỏa thuận, phụ lục, sửa đổi
              bổ sung liên quan (sau đây gọi chung là "
              <strong>Hợp Đồng Tín Dụng</strong>"). Theo đó, LFVN cho Khách Hàng
              vay một khoản tiền để mua xe ô tô VinFast theo Hợp Đồng Mua Bán
              Xe, giải ngân trực tiếp vào tài khoản của Bên Bán theo tiến độ
              thanh toán của Hợp Đồng Mua Bán Xe;
            </p>

            <p className="mb-4">
              4. Bên Bán được Vinfast Trading ủy quyền giao kết Thỏa thuận này
              với Khách hàng để triển khai Chính sách Hỗ trợ lãi vay.
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
              <p className="font-bold mb-2">1. Chính sách Hỗ trợ lãi vay:</p>
              <div className="ml-4 space-y-2">
                <p>
                  - Số tiền Khách Hàng vay LFVN để thanh toán:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienVay}
                      onChange={(e) => setSoTienVay(e.target.value)}
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
                  ) tương ứng với tỷ lệ vay LFVN:{" "}
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
                  - Bên cho vay: <strong>LFVN</strong>
                </p>
                <p>
                  - Lãi suất LFVN áp dụng: <strong>8,9%/năm</strong>, cố định
                  trong 24 tháng (đã bao gồm mức lãi suất hỗ trợ của LFVN so với
                  Khách hàng thông thường)
                </p>
                <p>
                  - Lãi suất sau thời gian cố định: Lãi suất cơ sở + Biên độ
                  2,1%/năm (đã bao gồm mức lãi suất hỗ trợ của LFVN so với Khách
                  hàng thông thường cho năm thứ 3). Chi tiết theo ghi nhận tại
                  Hợp Đồng Tín Dụng
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
                  - VinFast sẽ hỗ trợ Khách Hàng một khoản tiền ("
                  <strong>Khoản Hỗ Trợ Lãi Vay</strong>") tương đương khoản
                  chênh lệch giữa (i) số tiền lãi của LFVN theo các quy định và
                  điều kiện tại Thỏa Thuận Hợp Tác và (ii) số tiền lãi mà Khách
                  Hàng phải thanh toán, trong thời gian vay (tối đa bằng 96
                  tháng), tương đương{" "}
                  <strong>2%/năm trong 36 tháng trả nợ đầu tiên</strong> kể từ
                  ngày bắt đầu tính lãi theo Hợp Đồng Tín Dụng ("
                  <strong>Thời Hạn Hỗ Trợ Lãi Vay</strong>") hoặc cho đến khi
                  Thời Hạn Hỗ Trợ Lãi Vay chấm dứt trước thời hạn theo quy định
                  tại Thỏa Thuận này, tùy thời điểm nào đến trước.
                </p>
                <p>
                  - Số tiền gốc và lãi Khách Hàng thanh toán định kỳ. Theo đó,
                  Khách hàng sẽ thực hiện trả nợ theo định kỳ 01 tháng/lần một
                  số tiền xác định theo phương pháp gốc trả đều hàng tháng với
                  lãi suất được xác định như sau:
                </p>
                <div className="ml-4">
                  <p>
                    + Lãi suất cho vay trong hạn trong 24 tháng đầu tiên:{" "}
                    <strong>6,9%/năm</strong>
                  </p>
                  <p>
                    + Lãi suất cho vay trong hạn trong 12 tháng tiếp theo: Lãi
                    suất cơ sở + Biên độ 0,1%/năm
                  </p>
                  <p>
                    + Lãi suất cho vay trong hạn trong thời gian vay còn lại:
                    Lãi suất cơ sở + Biên độ 2,1%/năm. Chi tiết theo ghi nhận
                    tại Hợp Đồng Tín Dụng
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">
                2. Để tránh hiểu nhầm Các Bên thống nhất rằng:
              </p>
              <p>
                Trong mọi trường hợp VinFast cũng như VinFast Trading không chịu
                trách nhiệm đối với bất kỳ mức lãi nào ngoài mức lãi quy định
                trên đây vì lý do Khách Hàng không tuân thủ các quy định của
                LFVN hay vì bất kỳ lý do gì không phải do lỗi của
                VinFast/VinFast Trading. Khách Hàng chịu trách nhiệm thanh toán
                với LFVN toàn bộ các khoản lãi và chi phí phát sinh trên mức hỗ
                trợ lãi vay của VinFast Trading quy định ở trên bao gồm các
                khoản phí trả nợ trước hạn; các khoản lãi quá hạn, lãi phạt do
                chậm thanh toán gốc, lãi; lãi tăng lên do Khách Hàng vi phạm
                nghĩa vụ trả nợ hoặc vi phạm nghĩa vụ khác; các khoản tiền hoàn
                trả ưu đãi do trả nợ trước hạn; tiền bồi thường vi phạm Hợp Đồng
                Tín Dụng... VinFast cũng như VinFast Trading không có trách
                nhiệm thông báo, làm rõ, nhắc nợ hay thanh toán thay các khoản
                tiền này cho Khách Hàng.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">
                3. Thời Hạn Hỗ Trợ Lãi Vay sẽ tự động chấm dứt trước hạn trong
                trường hợp:
              </p>
              <p>
                Khách Hàng tất toán Khoản Vay Trước Hạn, hoặc trong trường hợp
                Hợp Đồng Tín Dụng chấm dứt trước khi hết Thời Hạn Hỗ Trợ Lãi Vay
                vì bất cứ lý do gì. Hết Thời Hạn Hỗ Trợ Lãi Vay hoặc khi Thời
                Hạn Hỗ Trợ Lãi Vay chấm dứt trước hạn, Khách Hàng có nghĩa vụ
                tiếp tục thực hiện trả nợ lãi cho LFVN theo đúng quy định tại
                Hợp Đồng Tín Dụng và quy định của LFVN.
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
                  1) Thực hiện kiểm tra, đối chiếu và xác nhận với LFVN các
                  Khoản Hỗ Trợ Lãi Vay hỗ trợ cho Khách Hàng ngay trong ngày khi
                  nhận được thông báo của LFVN có phát sinh các khoản vay của
                  Khách Hàng thông qua email trước khi ký chính thức Thông báo
                  thanh toán Khoản Hỗ Trợ Lãi Vay;
                </p>
                <p>
                  2) Thực hiện việc hỗ trợ Khoản Hỗ Trợ Lãi Vay của Khách Hàng
                  theo Chính sách Hỗ trợ lãi vay theo Thỏa Thuận này;
                </p>
                <p>
                  3) Không chịu trách nhiệm đối với các mâu thuẫn, tranh chấp,
                  khiếu kiện hay khiếu nại nào liên quan đến và/hoặc phát sinh
                  giữa LFVN, Khách Hàng và các tổ chức, cá nhân khác trong quá
                  trình thực hiện Hợp Đồng Tín Dụng và các thỏa thuận liên quan
                  đến Hợp Đồng Tín Dụng mà không phải do lỗi từ VinFast Trading.
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
                  Khoản vay trước hạn, ký Văn bản chuyển nhượng Hợp Đồng Mua Bán
                  và/hoặc xe ô tô là đối tượng của hợp đồng mua bán/ chuyển
                  nhượng với bất kỳ bên thứ ba nào khác, không thực hiện theo
                  đúng quy định tại Hợp Đồng Tín Dụng đã ký giữa Khách Hàng và
                  LFVN dẫn đến LFVN chấm dứt Hợp Đồng Tín Dụng, thì VinFast chấm
                  dứt hỗ trợ Khoản Hỗ Trợ Lãi Vay theo Chính sách Hỗ trợ lãi vay
                  theo quy định tại Thỏa Thuận này kể từ thời điểm Hợp Đồng Tín
                  Dụng bị chấm dứt. Khách Hàng vẫn phải có trách nhiệm thực hiện
                  nghĩa vụ đối với LFVN theo quy định của Hợp Đồng Tín Dụng và
                  các thỏa thuận khác giữa Khách Hàng và LFVN (nếu có).
                </p>
              </div>
            </div>
          </div>

          {/* ĐIỀU 3 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">
              3. <strong>Điều khoản hỗ trợ LFVN</strong>
            </h3>

            <p className="mb-4">
              Khách hàng cam kết không có bất kỳ khiếu nại, khiếu kiện nào và
              đảm bảo Đơn Vị Hỗ Trợ Kỹ Thuật như được định nghĩa phía dưới, cán
              bộ nhân viên của Đơn Vị Hỗ Trợ Kỹ Thuật không phải chịu bất kỳ
              trách nhiệm nào đối với bất kỳ tổn thất và thiệt hại nào (nếu có)
              phát sinh từ hoặc liên quan đến việc thực thi các nội dung nêu tại
              điểm a, b, c dưới đây:
            </p>

            <div className="ml-4 space-y-3">
              <p>
                1. Khách Hàng cho phép LFVN thu thập, xử lý các thông tin về xe,
                vị trí xe, tình trạng xe cho mục đích quản lý tài sản đảm bảo
                cho khoản vay theo Hợp Đồng Tín Dụng, và/hoặc sử dụng vào mục
                đích khác theo thỏa thuận giữa Khách Hàng và LFVN, thông qua bên
                thứ ba là Đơn Vị Hỗ Trợ Kỹ Thuật;
              </p>
              <p>
                2. Trong trường hợp Khách Hàng vi phạm nghĩa vụ trả nợ quá{" "}
                <strong>10 ngày</strong>, LFVN có quyền đề nghị VinFast Trading,
                nhà sản xuất xe và/ hoặc bất kỳ bên thứ ba khác được VinFast
                Trading ủy quyền (gọi chung là "
                <strong>Đơn Vị Hỗ Trợ Kỹ Thuật</strong>") trích xuất dữ liệu
                định vị xe của Khách Hàng và các thông tin liên quan đến xe để
                cung cấp cho LFVN, Khách Hàng đồng ý để Đơn Vị Hỗ Trợ Kỹ Thuật
                thu thập, xử lý, cung cấp và chia sẻ dữ liệu này cho LFVN để
                phục vụ hoạt động xử lý thu hồi nợ, và/hoặc sử dụng vào mục đích
                khác theo thỏa thuận giữa Khách Hàng và LFVN;
              </p>
              <p>
                3. Trong trường hợp Khách Hàng vi phạm nghĩa vụ trả nợ quá{" "}
                <strong>30 ngày</strong>, LFVN có quyền ủy quyền cho Đơn Vị Hỗ
                Trợ Kỹ Thuật kích hoạt tính năng giới hạn mức SOC (dung lượng
                pin) của pin tại ngưỡng <strong>30%</strong> theo đề nghị của
                LFVN, và Khách Hàng đồng ý để Đơn Vị Hỗ Trợ Kỹ Thuật thực hiện
                các việc này;
              </p>
            </div>

            <p className="mt-4">
              Việc hỗ trợ kỹ thuật sẽ áp dụng cho toàn bộ vòng đời Khoản vay mà
              không phụ thuộc vào thời hạn của Thỏa thuận này.
            </p>
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
                Trading. Tuy nhiên, Khách Hàng đồng ý rằng VinFast và/ hoặc
                VinFast Trading có quyền chuyển nhượng, chuyển giao các
                quyền/nghĩa vụ theo Thỏa Thuận này cho bên thứ ba, hoặc trong
                trường hợp VinFast/ VinFast Trading tổ chức lại doanh nghiệp,
                bao gồm sáp nhập vào một công ty khác hoặc được chia, hoặc tách
                hoặc được chuyển đổi với điều kiện là việc chuyển nhượng, chuyển
                giao các quyền/nghĩa vụ đó không gây thiệt hại đến quyền và lợi
                ích của Khách Hàng theo Thỏa Thuận này và bên nhận chuyển giao
                các quyền/nghĩa vụ theo Thỏa Thuận này chịu trách nhiệm tiếp tục
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
                không được giải quyết bằng thương lượng và hòa giải giữa Các
                Bên, thì sẽ được giải quyết tại Tòa án có thẩm quyền.
              </p>
              <p>
                5. Thỏa Thuận này được lập thành 04 (bốn) bản có giá trị như
                nhau, mỗi Bên giữ 02 (hai) bản để thực hiện.
              </p>
            </div>
          </div>

          {/* Signature table */}
          <div className="mt-8">
            <table className="w-full border border-gray-300">
              <tbody>
                <tr>
                  <th className="border border-gray-300 p-4 text-center font-bold w-1/2">
                    ĐẠI DIỆN BÊN BÁN
                  </th>
                  <th className="border border-gray-300 p-4 text-center font-bold w-1/2">
                    KHÁCH HÀNG
                  </th>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-16 text-center">
                    &nbsp;
                  </td>
                  <td className="border border-gray-300 p-16 text-center">
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thoa_thuan_ho_tro_lai_suat_vay_CĐX_Vinfast_va_LFVN;
