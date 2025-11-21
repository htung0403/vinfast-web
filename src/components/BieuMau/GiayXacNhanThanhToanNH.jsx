import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";

const GiayXacNhanThanhToanNH = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);

  // Editable fields
  const [ngayThang, setNgayThang] = useState("18");
  const [thangNam, setThangNam] = useState("11");
  const [nam, setNam] = useState("2025");
  const [hopDongSo, setHopDongSo] = useState("S00901-VSO-25-09-0039");
  const [ngayHopDong, setNgayHopDong] = useState("29/09/2025");
  const [customerName, setCustomerName] = useState("Ngô Nguyên Hoài Nam");
  const [loaiXeMua, setLoaiXeMua] = useState("Mua 01 chiếc xe ô tô con");
  const [mauXe, setMauXe] = useState("chỗ 07");
  const [nhanHieu, setNhanHieu] = useState("VinFast");
  const [mauTrang, setMauTrang] = useState("màu Trắng");
  const [soTuDong, setSoTuDong] = useState("số tự động");
  const [moiNhat, setMoiNhat] = useState("mới 100%");
  const [giaBan, setGiaBan] = useState("719.040.000");
  const [soTienDaTra, setSoTienDaTra] = useState("72.040.000");
  const [soTienConThieu, setSoTienConThieu] = useState("647.000.000");
  const [taiKhoanSo, setTaiKhoanSo] = useState("288999");
  const [nganHang, setNganHang] = useState("Ngân Hàng VP Bank_CN Gò Vấp");
  const [chuTK, setChuTK] = useState(
    "CHI NHÁNH TRƯỜNG CHINH-CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN"
  );

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    if (!numericAmount) return "";
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";

      // Nếu có firebaseKey, thử lấy showroom từ contracts
      if (location.state?.firebaseKey) {
        try {
          const contractRef = ref(
            database,
            `contracts/${location.state.firebaseKey}`
          );
          const snapshot = await get(contractRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            if (contractData.showroom) {
              showroomName = contractData.showroom;
            }
          }
        } catch (error) {
          console.error("Error loading contract data:", error);
        }
      }

      const branchInfo =
        getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      // Set default date to today
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setNgayThang(pad(today.getDate()));
      setThangNam(pad(today.getMonth() + 1));
      setNam(today.getFullYear().toString());

      if (location.state) {
        const stateData = location.state;
        setData(stateData);

        // Auto-fill từ location.state nếu có
        if (stateData.contractNumber) setHopDongSo(stateData.contractNumber);
        if (stateData.contractDate) setNgayHopDong(stateData.contractDate);
        if (stateData.customerName) setCustomerName(stateData.customerName);
        if (stateData.contractPrice)
          setGiaBan(formatCurrency(stateData.contractPrice));
        if (stateData.hieuxe) setNhanHieu(stateData.hieuxe);
      } else {
        // Default data structure
        setData({
          contractNumber: "",
          contractDate: "",
          customerName: "",
          contractPrice: "",
          hieuxe: "",
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
      className="min-h-screen bg-gray-50 p-8"
      style={{ fontFamily: "Times New Roman" }}
    >
      <div className="max-w-4xl mx-auto print:max-w-4xl print:mx-auto">
        <div
          className="flex-1 bg-white p-8 print:pt-0 flex flex-col min-h-screen print:min-h-[calc(100vh-40mm)]"
          id="printable-content"
        >
          {/* Header */}
          <div className="mb-6">
            <table className="w-full">
              <tbody>
                <tr>
                  {/* Left Column - Company info */}
                  <td className="align-top" style={{ width: "50%" }}>
                    <div className="text-sm font-bold leading-relaxed">
                      <p className="mb-1">CÔNG TY CỔ PHẦN ĐẦU TƯ</p>
                      <p className="mb-1">THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ</p>
                      <p className="mb-1">ĐÔNG SÀI GÒN</p>
                      <p className="mb-3">CHI NHÁNH TRƯỜNG CHINH</p>
                    </div>
                  </td>

                  {/* Right Column - Title */}
                  <td className="align-top text-right" style={{ width: "50%" }}>
                    <div className="text-sm font-bold leading-relaxed">
                      <p className="mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="mb-3">Độc lập - Tự do - Hạnh phúc</p>
                      <p className="italic font-normal mt-4">
                        TP.HCM, Ngày{" "}
                        <span className="print:hidden">
                          <input
                            type="text"
                            value={ngayThang}
                            onChange={(e) => setNgayThang(e.target.value)}
                            className="border-b border-gray-400 px-1 text-sm w-8 text-center focus:outline-none focus:border-blue-500"
                          />
                        </span>
                        <span className="hidden print:inline">{ngayThang}</span>{" "}
                        Tháng{" "}
                        <span className="print:hidden">
                          <input
                            type="text"
                            value={thangNam}
                            onChange={(e) => setThangNam(e.target.value)}
                            className="border-b border-gray-400 px-1 text-sm w-8 text-center focus:outline-none focus:border-blue-500"
                          />
                        </span>
                        <span className="hidden print:inline">{thangNam}</span>{" "}
                        năm{" "}
                        <span className="print:hidden">
                          <input
                            type="text"
                            value={nam}
                            onChange={(e) => setNam(e.target.value)}
                            className="border-b border-gray-400 px-1 text-sm w-12 text-center focus:outline-none focus:border-blue-500"
                          />
                        </span>
                        <span className="hidden print:inline">{nam}</span>
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase">
              GIẤY ĐỀ NGHỊ THANH TOÁN
            </h1>
          </div>

          {/* Kính gửi */}
          <div className="text-sm mb-4">
            <p className="font-bold">
              Kính gửi: Ngân Hàng TMCP Việt Nam Thịnh Vượng – Trung tâm thế chấp
              vùng 9
            </p>
          </div>

          {/* Main Content */}
          <div className="text-sm space-y-3">
            {/* Paragraph 1 */}
            <p className="text-justify leading-relaxed italic">
              Căn cứ Hợp đồng mua bán xe ô tô số:{" "}
              <strong>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={hopDongSo}
                    onChange={(e) => setHopDongSo(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{hopDongSo}</span>
              </strong>
              , ngày{" "}
              <strong>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={ngayHopDong}
                    onChange={(e) => setNgayHopDong(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{ngayHopDong}</span>
              </strong>{" "}
              giữa Ông/Bà:{" "}
              <strong>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{customerName}</span>
              </strong>{" "}
              và{" "}
              <strong>
                CHI NHÁNH TRƯỜNG CHINH-CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô
                TÔ ĐÔNG SÀI GÒN
              </strong>
            </p>

            {/* Căn cứ vào tình hình thực tế */}
            <p className="leading-relaxed">
              - <span className="italic">Căn cứ vào tình hình thực tế.</span>
            </p>

            {/* Paragraph 2 */}
            <p className="text-justify leading-relaxed">
              Nay{" "}
              <strong>
                CHI NHÁNH TRƯỜNG CHINH-CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô
                TÔ ĐÔNG SÀI GÒN
              </strong>{" "}
              đề nghị{" "}
              <strong>
                Ngân Hàng TMCP Việt Nam Thịnh Vượng – Trung tâm thế chấp vùng 9
              </strong>{" "}
              thanh toán số tiền khách hàng vay mua xe tại Công ty như sau:
            </p>

            {/* Bullet points */}
            <div className="space-y-2 ml-6">
              <p>
                • Tên khách hàng vay:{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{customerName}</span>
                </strong>{" "}
                Loại xe mua:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={loaiXeMua}
                    onChange={(e) => setLoaiXeMua(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline italic">{loaiXeMua}</span>
              </p>

              <p className="italic">
                con ,{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={mauXe}
                    onChange={(e) => setMauXe(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-16 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{mauXe}</span>, Nhãn hiệu:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nhanHieu}
                    onChange={(e) => setNhanHieu(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{nhanHieu}</span>,{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={mauTrang}
                    onChange={(e) => setMauTrang(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{mauTrang}</span>,{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soTuDong}
                    onChange={(e) => setSoTuDong(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{soTuDong}</span>,{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={moiNhat}
                    onChange={(e) => setMoiNhat(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{moiNhat}</span>.
              </p>

              <p>
                • Giá bán:{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={giaBan}
                      onChange={(e) =>
                        setGiaBan(e.target.value.replace(/\D/g, ""))
                      }
                      className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">
                    {formatCurrency(giaBan)}
                  </span>
                </strong>{" "}
                VNĐ{" "}
                <span className="italic">
                  (Bằng chữ:Bảy trăm mười chín triệu không trăm bốn mươi nghìn
                  chẵn Việt Nam đồng )
                </span>
              </p>

              <p>
                • Số tiền khách hàng đã trả trước:{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienDaTra}
                      onChange={(e) =>
                        setSoTienDaTra(e.target.value.replace(/\D/g, ""))
                      }
                      className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">
                    {formatCurrency(soTienDaTra)}
                  </span>
                </strong>{" "}
                đồng.
              </p>

              <p>
                • Số tiền khách hàng còn thiếu để thanh toán:{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienConThieu}
                      onChange={(e) =>
                        setSoTienConThieu(e.target.value.replace(/\D/g, ""))
                      }
                      className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">
                    {formatCurrency(soTienConThieu)}
                  </span>
                </strong>{" "}
                đồng.
              </p>

              <p>
                • Đề nghị thanh toán số tiền trên vào tài khoản số:{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={taiKhoanSo}
                      onChange={(e) => setTaiKhoanSo(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{taiKhoanSo}</span>
                </strong>{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nganHang}
                    onChange={(e) => setNganHang(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{nganHang}</span>
              </p>

              <p>
                • Chủ TK :{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={chuTK}
                      onChange={(e) => setChuTK(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-full focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{chuTK}</span>
                </strong>
              </p>
            </div>
          </div>

          {/* Signature Table */}
          <div className="mt-12">
            <table className="w-full border-2 border-black">
              <tbody>
                <tr className="border-b-2 border-black">
                  <td colSpan={2} className="p-2 text-center font-bold">
                    CHI NHÁNH TRƯỜNG CHINH-CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH
                    VỤ Ô TÔ ĐÔNG SÀI GÒN
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 text-center w-1/3">
                    <p className="italic">Ký tên</p>
                  </td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">
                    <p>Họ và tên</p>
                  </td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">
                    <p>Chức vụ</p>
                  </td>
                  <td className="p-2"></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 text-center">
                    <p>Ngày</p>
                  </td>
                  <td className="p-2"></td>
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
          In Giấy Đề Nghị
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 5mm 20mm 5mm 20mm;
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
            min-height: calc(100vh - 10mm);
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            display: flex !important;
            flex-direction: column !important;
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
        }
      `}</style>
    </div>
  );
};

export default GiayXacNhanThanhToanNH;
