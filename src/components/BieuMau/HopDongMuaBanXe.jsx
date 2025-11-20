import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";

const HopDongMuaBanXe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);
  
  // Input fields for [---] placeholders
  const [giayUyQuyen1, setGiayUyQuyen1] = useState("");
  const [giayUyQuyen1Ngay, setGiayUyQuyen1Ngay] = useState("");
  const [giayUyQuyen2, setGiayUyQuyen2] = useState("");
  const [giayUyQuyen2Ngay, setGiayUyQuyen2Ngay] = useState("");
  const [thoiHanDatCoc, setThoiHanDatCoc] = useState("");
  const [thoiHanDot2, setThoiHanDot2] = useState("");
  const [soTienDot2, setSoTienDot2] = useState("");
  const [soTienDot2BangChu, setSoTienDot2BangChu] = useState("");
  const [soTienVay, setSoTienVay] = useState("");
  const [soTienVayBangChu, setSoTienVayBangChu] = useState("");
  const [soTienDot3, setSoTienDot3] = useState("");
  const [soTienDot3BangChu, setSoTienDot3BangChu] = useState("");
  const [diaDiemGiaoXe, setDiaDiemGiaoXe] = useState("");
  const [thoiGianGiaoXe, setThoiGianGiaoXe] = useState("");
  const [thoiGianGiaoXeRaw, setThoiGianGiaoXeRaw] = useState("");
  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
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
          // Error handling
        }
      }

      const branchInfo =
        getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      const formatDateString = (val) => {
        if (!val) return null;
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) return val;
        const d = new Date(val);
        if (isNaN(d)) return val;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      };

      if (location.state) {
        const incoming = location.state;
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const todayStr = `${pad(today.getDate())}/${pad(
          today.getMonth() + 1
        )}/${today.getFullYear()}`;

        const processedData = {
          contractNumber:
            incoming.vso || incoming.contractNumber || "",
          contractDate:
            formatDateString(incoming.createdAt || incoming.ngayXhd) ||
            todayStr,
          customerName:
            incoming.customerName || incoming.tenKh || incoming["Tên Kh"] || "",
          customerAddress:
            incoming.address || incoming.diaChi || incoming["Địa Chỉ"] || "",
          phone:
            incoming.phone ||
            incoming.soDienThoai ||
            incoming["Số Điện Thoại"] ||
            "",
          email: incoming.email || incoming.Email || "",
          cccd: incoming.cccd || incoming.CCCD || "",
          cccdIssueDate:
            formatDateString(
              incoming.issueDate || incoming.ngayCap || incoming["Ngày Cấp"]
            ) || "",
          cccdIssuePlace:
            incoming.issuePlace ||
            incoming.noiCap ||
            incoming["Nơi Cấp"] ||
            "",
          // Thông tin tổ chức (nếu có)
          taxCode: incoming.taxCode || incoming.MSDN || "",
          representative: incoming.representative || incoming.daiDien || "",
          position: incoming.position || incoming.chucVu || "",
          // Thông tin xe
          model: incoming.model || incoming.dongXe || "",
          variant: incoming.variant || incoming.phienBan || "",
          exterior: incoming.exterior || incoming.ngoaiThat || "",
          interior: incoming.interior || incoming.noiThat || "",
          soKhung:
            incoming.soKhung ||
            incoming["Số Khung"] ||
            incoming.chassisNumber ||
            incoming.vin ||
            "",
          contractPrice: incoming.contractPrice || incoming.giaHopDong || "",
          deposit: incoming.deposit || incoming.giaGiam || "",
          // Chính sách ưu đãi
          uuDai: incoming.uuDai || incoming["Ưu đãi"] || "",
          showroom: incoming.showroom || branchInfo.shortName,
        };
        setData(processedData);
      } else {
        // Default data
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const todayStr = `${pad(today.getDate())}/${pad(
          today.getMonth() + 1
        )}/${today.getFullYear()}`;
        setData({
          contractNumber: "S00901-VSO-25-09-0039",
          contractDate: todayStr,
          customerName: "NGÔ NGUYỄN HOÀI NAM",
          customerAddress:
            "Số 72/14 Đường tỉnh lộ 7, Ấp Bình Hạ, Thái Mỹ, Củ Chi, Tp Hồ Chí Minh",
          phone: "0901234567",
          email: "example@email.com",
          cccd: "079123456789",
          cccdIssueDate: "01/01/2020",
          cccdIssuePlace: "Bộ Công An",
          soKhung: "RLLVFPNT9SH858285",
          contractPrice: "719040000",
          deposit: "72040000",
          model: "VF 8",
          variant: "Eco",
          exterior: "Đen",
          interior: "Đen",
          uuDai: "",
          showroom: branchInfo.shortName,
        });
      }
      setLoading(false);
    };

    loadData();
  }, [location.state]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    if (!numericAmount) return "";
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  // Helper function to convert number to Vietnamese words
  const numberToWords = (amount) => {
    if (!amount) return "";

    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    const num = parseInt(numericAmount, 10);

    if (isNaN(num) || num === 0) return "Không đồng";

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

    const readGroup = (n, showZeroHundred = false) => {
      if (n === 0) return "";

      let result = "";
      const hundred = Math.floor(n / 100);
      const ten = Math.floor((n % 100) / 10);
      const one = n % 10;

      if (hundred > 0) {
        result += hundreds[hundred] + " ";
      } else if (showZeroHundred && ten > 0) {
        result += "không trăm ";
      }

      if (ten > 0) {
        if (ten === 1) {
          result += "mười ";
          if (one > 0) {
            if (one === 5) {
              result += "lăm ";
            } else if (one === 1) {
              result += "một ";
            } else {
              result += ones[one] + " ";
            }
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
      result += readGroup(billion, true) + " tỷ ";
    }
    if (million > 0) {
      result += readGroup(million, true) + " triệu ";
    }
    if (thousand > 0) {
      result += readGroup(thousand, true) + " nghìn ";
    }
    if (remainder > 0) {
      result += readGroup(remainder, false) + " ";
    }

    const trimmed = result.trim();
    if (!trimmed) return "Không đồng";

    return (
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + " đồng"
    );
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

  if (!data || !branch) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: "Times New Roman" }}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không có dữ liệu hợp đồng</p>
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
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
      <div className="max-w-5xl mx-auto print:max-w-5xl print:mx-auto">
        <div
          className="bg-white p-8 print:pt-4 print:pb-4"
          id="printable-content"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase mb-2">
              HỢP ĐỒNG MUA BÁN XE ĐIỆN VINFAST
            </h1>
            <div className="text-right text-sm mb-2">
              <span>Số: {data.contractNumber || "[---]"}</span>
            </div>
            <div className="text-sm">
              <span>
                được ký ngày{" "}
                {data.contractDate
                  ? data.contractDate.split("/")[0]
                  : "[---]"}{" "}
                tháng{" "}
                {data.contractDate
                  ? data.contractDate.split("/")[1]
                  : "[---]"}{" "}
                năm{" "}
                {data.contractDate
                  ? data.contractDate.split("/")[2]
                  : "[---]"}
                , giữa:
              </span>
            </div>
          </div>

          {/* Two Column Layout - CÔNG TY and KHÁCH HÀNG */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* Left Column - CÔNG TY */}
            <div className="border border-gray-300">
              <div className="bg-gray-100 p-2 font-semibold text-sm">
                CÔNG TY
              </div>
              <div className="p-3 text-sm space-y-2">
                <p>
                  <strong>Trụ sở chính:</strong> {branch.address}
                </p>
                <p>
                  <strong>MSDN:</strong> {branch.taxCode}
                </p>
                <p>
                  <strong>Đại diện:</strong> {branch.representativeName}
                </p>
                <p>
                  <strong>Chức vụ:</strong> {branch.position}
                </p>
                <p>
                  <strong>Giấy uỷ quyền:</strong>{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={giayUyQuyen1}
                      onChange={(e) => setGiayUyQuyen1(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{giayUyQuyen1 || "[---]"}</span>{" "}
                  ngày{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={giayUyQuyen1Ngay}
                      onChange={(e) => setGiayUyQuyen1Ngay(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{giayUyQuyen1Ngay || "[---]"}</span>
                </p>
                <p>
                  <strong>Tài khoản:</strong> {branch.bankAccount} -{" "}
                  {branch.bankName}
                </p>
                <p>
                  <strong>Chủ tài khoản:</strong> {branch.name}
                </p>
                <p className="mt-2">
                  Sau đây gọi là <strong>"Bên Bán"</strong>
                </p>
              </div>
            </div>

            {/* Right Column - KHÁCH HÀNG */}
            <div className="border border-gray-300">
              <div className="bg-gray-100 p-2 font-semibold text-sm">
                KHÁCH HÀNG
              </div>
              <div className="p-3 text-sm space-y-2">
                <p>
                  <strong>Địa chỉ:</strong> {data.customerAddress || "[---]"}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {data.phone || "[---]"}
                </p>
                <p>
                  <strong>Email:</strong> {data.email || "[---]"}
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Nếu là cá nhân:</p>
                  <p className="">
                    CCCD: Số {data.cccd || "[---]"} cấp ngày{" "}
                    {data.cccdIssueDate || "[---]"} bởi{" "}
                    {data.cccdIssuePlace || "[---]"}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="font-semibold">Nếu là tổ chức:</p>
                  <p className="">
                    MSDN: {data.taxCode || "[---]"}
                  </p>
                  <p className="">
                    Đại diện: {data.representative || "[---]"}
                  </p>
                  <p className="">
                    Chức vụ: {data.position || "[---]"}
                  </p>
                  <p className="">
                    Giấy uỷ quyền:{" "}
                    <span className="print:hidden">
                      <input
                        type="text"
                        value={giayUyQuyen2}
                        onChange={(e) => setGiayUyQuyen2(e.target.value)}
                        className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                        placeholder=""
                      />
                    </span>
                    <span className="hidden print:inline">{giayUyQuyen2 || "[---]"}</span>{" "}
                    ngày{" "}
                    <span className="print:hidden">
                      <input
                        type="text"
                        value={giayUyQuyen2Ngay}
                        onChange={(e) => setGiayUyQuyen2Ngay(e.target.value)}
                        className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                        placeholder=""
                      />
                    </span>
                    <span className="hidden print:inline">{giayUyQuyen2Ngay || "[---]"}</span>
                  </p>
                </div>
                <p className="mt-2">
                  Sau đây gọi là <strong>"Khách Hàng"</strong>
                </p>
              </div>
            </div>
          </div>

          {/* General Agreement Statement */}
          <div className="mb-2 text-sm">
            <p className="italic">
              Bên Bán và Khách Hàng sau đây được gọi riêng là <strong>"Bên"</strong> và gọi
              chung là <strong>"Các Bên"</strong>
            </p>
            <p className="mt-2">
              Các Bên cùng thỏa thuận và thống nhất như sau:
            </p>
          </div>

          {/* Điều 1 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">
              Điều 1. Thông tin về xe, giá trị mua bán và thanh toán
            </h2>

            {/* 1.1 */}
            <div className="mb-2">
              <h3 className="font-semibold">
                1.1 Thông tin về xe và giá trị mua bán
              </h3>

              {/* Table */}
              <table className="w-full border border-gray-800 text-sm mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-800 p-2 text-center" style={{ width: "5%" }}>
                      T/T
                    </th>
                    <th className="border border-gray-800 p-2 text-left" style={{ width: "50%" }}>
                      Mô tả xe
                    </th>
                    <th className="border border-gray-800 p-2 text-center" style={{ width: "10%" }}>
                      Số lượng
                    </th>
                    <th className="border border-gray-800 p-2 text-right" style={{ width: "17.5%" }}>
                      Đơn Giá (VNĐ)
                    </th>
                    <th className="border border-gray-800 p-2 text-right" style={{ width: "17.5%" }}>
                      Thành tiền (VNĐ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-800 p-2 text-center">1</td>
                    <td className="border border-gray-800 p-2">
                      <div className="space-y-1">
                        <p>
                          VinFast {data.model || "[---]"} - Phiên bản:{" "}
                          {data.variant || "[---]"} Màu: {data.exterior || "[---]"}
                        </p>
                        <p>
                          <span className="print:hidden">
                            <input
                              type="text"
                              value={data.gomPin || ""}
                              onChange={(e) => setData({...data, gomPin: e.target.value})}
                              className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                              placeholder="gồm/ không gồm pin"
                            />
                          </span>
                          <span className="hidden print:inline">{data.gomPin || "[gồm/ không gồm pin]"}</span>
                        </p>
                        <p>Số khung: {data.soKhung || "[---]"}</p>
                        <p>Tình trạng: Mới 100%</p>
                        <p>
                          Thông số kỹ thuật: Theo tiêu chuẩn của Nhà sản xuất
                        </p>
                        <p className="">
                          (sau đây gọi là <strong>"Xe"</strong>)
                        </p>
                      </div>
                    </td>
                    <td className="border border-gray-800 p-2 text-center">1</td>
                    <td className="border border-gray-800 p-2 text-right">
                      {formatCurrency(data.contractPrice) || "[---]"}
                    </td>
                    <td className="border border-gray-800 p-2 text-right">
                      {formatCurrency(data.contractPrice) || "[---]"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="4"
                      className="border border-gray-800 p-2 font-bold text-left"
                    >
                      Tổng cộng:
                    </td>
                    <td className="border border-gray-800 p-2 font-bold text-right">
                      {formatCurrency(data.contractPrice) || "[---]"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Số tiền bằng chữ */}
              <p className="mb-4">
                <strong>Số tiền bằng chữ:</strong>{" "}
                <strong>{numberToWords(data.contractPrice) || "[---]"}</strong>
              </p>

              {/* Price Inclusion Clause */}
              <p className="mb-4 text-justify">
                Giá xe nêu trên đã bao gồm thuế tiêu thụ đặc biệt, thuế giá trị
                gia tăng (nếu có) nhưng chưa bao gồm: lệ phí đăng ký xe, lệ phí
                trước bạ, phí bảo hiểm xe, phí dịch vụ thuê pin (nếu có) và các
                chi phí khác (nếu có).
              </p>
            </div>

            {/* 1.2 */}
            <div className="mb-4">
              <h3 className="font-semibold">
                1.2 Chính sách ưu đãi áp dụng: {data.uuDai || "[---]"}
              </h3>
              <p className="mb-2 text-justify">
                Chi tiết về chính sách ưu đãi được công bố trên Website{" "}
                <span className="">https://vinfastauto.com</span> ("<strong>Website</strong>").
              </p>
              <p className="text-justify">
                Bên Bán có quyền điều chỉnh hoặc hủy bỏ chính sách ưu đãi nếu
                Khách Hàng chậm thanh toán/nhận Xe hoặc vi phạm các điều khoản
                của Hợp đồng này.
              </p>
            </div>

            {/* 1.3 */}
            <div className="mb-4">
              <h3 className="font-semibold">
                1.3 Thanh toán tiền mua Xe
              </h3>
              <div className="space-y-2 text-justify">
                <p>
                  <strong>a) Đợt 1:</strong> Khách Hàng thanh toán số tiền đặt
                  cọc là {formatCurrency(data.deposit) || "[---]"} VNĐ (bằng chữ:{" "}
                  {numberToWords(data.deposit) || "[---]"}) trong thời hạn{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={thoiHanDatCoc}
                      onChange={(e) => setThoiHanDatCoc(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{thoiHanDatCoc || "[---]"}</span>{" "}
                  ngày kể từ ngày ký Hợp đồng này. Số tiền đặt cọc này sẽ
                  được chuyển thành tiền mua Xe khi Khách Hàng thanh toán đợt
                  cuối cùng.
                </p>
                <p>
                  <strong>b) Tiến độ các đợt thanh toán tiếp theo như sau:</strong>
                </p>
                <p className="pl-4">
                  Khách Hàng có thể lựa chọn một trong hai phương thức thanh
                  toán: <strong>trả thẳng</strong> hoặc <strong>trả góp</strong>.
                </p>
                <p className="pl-4">
                  <strong>Thanh toán trả thẳng:</strong>
                </p>
                <p className="pl-8">
                  <strong>Đợt 2:</strong> Khách Hàng thanh toán số tiền còn lại
                  là{" "}
                  {data.contractPrice && data.deposit
                    ? formatCurrency(
                        (
                          parseInt(
                            String(data.contractPrice).replace(/\D/g, "")
                          ) -
                          parseInt(String(data.deposit).replace(/\D/g, ""))
                        ).toString()
                      )
                    : "[---]"}{" "}
                  VNĐ trong thời hạn{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={thoiHanDot2}
                      onChange={(e) => setThoiHanDot2(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{thoiHanDot2 || "[---]"}</span>{" "}
                  ngày kể từ ngày Bên Bán thông báo Xe sẵn sàng giao cho Khách Hàng.
                </p>
                <p className="pl-4">
                  <strong>Thanh toán trả góp:</strong>
                </p>
                <p className="pl-8">
                  <strong>Đợt 2:</strong> Khách Hàng thanh toán số tiền{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienDot2}
                      onChange={(e) => setSoTienDot2(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{soTienDot2 || "[---]"}</span>{" "}
                  VNĐ (bằng chữ:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienDot2BangChu}
                      onChange={(e) => setSoTienDot2BangChu(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{soTienDot2BangChu || "[---]"}</span>
                  ) trong thời hạn 07 (bảy) ngày làm việc kể từ ngày Bên Bán thông báo Xe sẵn sàng giao cho Khách
                  Hàng hoặc theo thỏa thuận giữa các Bên. Đồng thời, Khách Hàng
                  giao cho Bên Bán bản chính Thông báo giải ngân của Ngân hàng
                  về số tiền vay{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienVay}
                      onChange={(e) => setSoTienVay(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{soTienVay || "[---]"}</span>{" "}
                  VNĐ (bằng chữ:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienVayBangChu}
                      onChange={(e) => setSoTienVayBangChu(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{soTienVayBangChu || "[---]"}</span>
                  ) để mua Xe.
                </p>
                <p className="pl-8">
                  <strong>Đợt 3:</strong> Ngân hàng phải giải ngân số tiền{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienDot3}
                      onChange={(e) => setSoTienDot3(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{soTienDot3 || "[---]"}</span>{" "}
                  VNĐ (bằng chữ:{" "}
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soTienDot3BangChu}
                      onChange={(e) => setSoTienDot3BangChu(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                      placeholder=""
                    />
                  </span>
                  <span className="hidden print:inline">{soTienDot3BangChu || "[---]"}</span>
                  ) vào tài khoản của Bên Bán trong
                  thời hạn 05 (năm) ngày làm việc kể từ ngày Bên Bán và Khách
                  Hàng giao cho Ngân hàng phiếu hẹn đăng ký xe.
                </p>
              </div>
            </div>

            {/* 1.4 */}
            <div className="mb-4">
              <h3 className="font-semibold">
                1.4 Phương thức thanh toán
              </h3>
              <div className="space-y-2 text-justify">
                <p>
                  Khách Hàng thanh toán cho Bên Bán bằng một trong các phương
                  thức sau:
                </p>
                <p className="pl-4">
                  <strong>(i)</strong> Chuyển khoản vào tài khoản của Bên Bán
                  (thông tin tài khoản ghi ở phần đầu Hợp đồng). Nội dung
                  chuyển khoản theo cú pháp: <strong>Tên Khách Hàng Số điện
                  thoại Số hợp đồng mua bán Số đơn hàng Model Xe</strong>.
                  Phí chuyển khoản do Khách Hàng chịu.
                </p>
                <p className="pl-4">
                  <strong>(ii)</strong> Thanh toán bằng tiền mặt (không áp dụng
                  đối với mua hàng qua kênh trực tuyến).
                </p>
                <p className="pl-4">
                  <strong>(iii)</strong> Thanh toán bằng thẻ ngân hàng (chỉ áp
                  dụng đối với thanh toán tiền đặt cọc, phí giao dịch do Bên Bán
                  chịu).
                </p>
              </div>
            </div>
          </div>

          {/* Điều 2 */}
          <div className="mb-6 text-sm">
            <h2 className="font-bold">
              Điều 2. Thời gian và địa điểm giao Xe
            </h2>
            <div className="space-y-2 text-justify">
              <p>
                <strong>2.1 Thời gian giao Xe:</strong>{" "}
                <span className="print:hidden">
                  <input
                    type="date"
                    value={thoiGianGiaoXeRaw}
                    onChange={(e) => {
                      setThoiGianGiaoXeRaw(e.target.value);
                      if (e.target.value) {
                        setThoiGianGiaoXe(formatDateForDisplay(e.target.value));
                      } else {
                        setThoiGianGiaoXe("");
                      }
                    }}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{thoiGianGiaoXe || "[---/---/---]"}</span>
                /theo thông báo của Bên Bán trước ít nhất 07 ngày
                làm việc (đối với mua hàng qua kênh trực tuyến).
              </p>
              <p>
                <strong>2.2 Địa điểm giao Xe tại:</strong>{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={diaDiemGiaoXe}
                    onChange={(e) => setDiaDiemGiaoXe(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                    placeholder=""
                  />
                </span>
                <span className="hidden print:inline">{diaDiemGiaoXe || "[---]"}</span>
              </p>
              <p>
                <strong>2.3</strong> Trừ trường hợp quy định tại Điều 3, Bên Bán
                sẽ giao Xe kèm theo hóa đơn và đầy đủ giấy tờ cho Khách Hàng sau
                khi nhận được 100% tổng giá trị mua bán quy định tại Điều 01 của
                Hợp đồng.
              </p>
            </div>
          </div>
          
          {/* Điều 3 */}
          <div className="mb-2 text-sm">
              <h2 className="font-bold">
              Điều 3. Thủ tục mua xe khi Khách Hàng thanh toán bằng hình thức
              trả góp
            </h2>
            <div className="space-y-2 text-justify">
              <p>
                <strong>3.1.</strong> Sau khi nhận được Đợt thanh toán 2 và tiếp
                nhận Thông báo giải ngân, Bên Bán sẽ xuất hóa đơn cho Khách
                Hàng. Khách Hàng phải hoàn tất thủ tục đăng ký xe trong thời hạn
                05 (năm) ngày làm việc kể từ ngày được thông báo. Việc đăng ký
                xe phải có sự tham gia của nhân viên Bên Bán, Khách Hàng phải
                tuân thủ hướng dẫn của Bên Bán. Khách Hàng ủy quyền cho Bên Bán
                giữ phiếu hẹn để nhận kết quả trong quá trình thực hiện tại cơ
                quan nhà nước có thẩm quyền.
              </p>
              <p>
                <strong>3.2.</strong> Trong trường hợp vì bất kỳ lý do nào, Ngân
                hàng phát hành Thông báo giải ngân không giải ngân đầy đủ và đúng
                hạn số tiền còn lại của Đợt thanh toán 3 cho Bên Bán, thì:
              </p>
              <p className="pl-4">
                <strong>a)</strong> Trong thời hạn 10 (mười) ngày làm việc kể từ
                ngày Bên Bán yêu cầu, Khách Hàng phải thanh toán đầy đủ toàn bộ
                số tiền còn lại cho Bên Bán.
              </p>
              <p className="pl-4">
                <strong>b)</strong> Sau thời hạn quy định tại Điều 3.2.(a), nếu
                Bên Bán không nhận được số tiền còn lại của Đợt thanh toán 3,
                Bên Bán có quyền yêu cầu Khách Hàng thực hiện theo phương án do
                Bên Bán đề xuất. Khách Hàng đồng ý ủy quyền cho Bên Bán toàn
                quyền quyết định đối với Xe, bao gồm <strong>thanh lý xe để thu
                hồi các khoản tiền mà Khách Hàng còn nợ</strong>. Số tiền thu
                được từ việc thanh lý Xe sẽ được ưu tiên thanh toán các khoản nợ
                của Khách Hàng đối với Bên Bán. Khách Hàng chịu mọi chi phí và
                thiệt hại phát sinh từ việc thanh lý Xe và phải trả cho Bên Bán
                phí ủy quyền bằng 10% giá trị Xe tại thời điểm thanh lý.
              </p>
            </div>
          </div>

          {/* Điều 4 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">Điều 4. Bảo hành</h2>
            <div className="space-y-2 text-justify">
              <p>
                <strong>4.1. Chính sách bảo hành:</strong> quy định tại sổ bảo
                hành do Bên Bán cung cấp cho Khách Hàng.
              </p>
              <p>
                <strong>4.2. Địa điểm bảo hành:</strong> tại các Trung tâm dịch
                vụ sửa chữa xe điện VinFast.
              </p>
            </div>
          </div>

          {/* Điều 5 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">
              Điều 5. Trách nhiệm của Các Bên
            </h2>
            <div className="space-y-2 text-justify">
              <p>
                <strong>5.1.</strong> Bên Bán có nghĩa vụ cung cấp đầy đủ hóa
                đơn, chứng từ, tài liệu hợp lệ cho Khách Hàng.
              </p>
              <p>
                <strong>5.2.</strong> Việc thông báo của Bên Bán phải bằng văn
                bản, email, ứng dụng VinFast Trading, cuộc gọi hoặc tin nhắn.
              </p>
              <p>
                <strong>5.3.</strong> Khách Hàng có trách nhiệm thanh toán và
                nhận Xe theo đúng thời gian đã quy định.
              </p>
              <p>
                <strong>5.4.</strong> Việc giao nhận Xe và giấy tờ phải do
                Khách Hàng trực tiếp thực hiện. Nếu Khách Hàng ủy quyền cho
                người khác thực hiện, phải có giấy ủy quyền hợp lệ và thông báo
                cho Bên Bán trước ít nhất 03 (ba) ngày làm việc.
              </p>
              <p>
                <strong>5.5.</strong> Trong trường hợp Khách Hàng chậm nhận Xe
                sau khi đã thanh toán 100% giá trị Hợp đồng, Khách Hàng phải trả
                phí lưu kho cho Bên Bán. Nếu Khách Hàng chậm nhận Xe quá 30
                (ba mươi) ngày kể từ ngày Bên Bán thông báo Xe sẵn sàng giao,
                Bên Bán có quyền thanh lý Xe để thu hồi các khoản tiền mà Khách
                Hàng còn nợ.
              </p>
              <p>
                <strong>5.6.</strong> Trong trường hợp Khách Hàng chậm thanh
                toán, Khách Hàng phải trả lãi suất chậm thanh toán là 15%/năm
                tính trên số tiền chậm thanh toán.
              </p>
              <p>
                <strong>5.7.</strong> Khách Hàng hiểu và đồng ý rằng Xe hoạt
                động tối ưu khi sử dụng pin chính hãng và thiết bị sạc theo đúng
                hướng dẫn sử dụng và sổ bảo hành. VinFast Trading và VinFast
                được miễn trừ trách nhiệm đối với mọi thiệt hại phát sinh nếu
                Khách Hàng không sử dụng Xe theo đúng hướng dẫn.
              </p>
              <p>
                <strong>5.8.</strong> Xe được tích hợp eSIM (nếu có) để cung cấp
                các dịch vụ và tính năng thông minh cho Khách Hàng. Để sử dụng
                các dịch vụ này, Khách Hàng phải duy trì eSIM. Thông tin chi
                tiết được quy định trong E-brochure trên Website hoặc ứng dụng
                VinFast.
              </p>
            </div>
          </div>

          {/* Điều 6 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">
              Điều 6. Chuyển rủi ro và quyền sở hữu
            </h2>
            <div className="space-y-2 text-justify">
              <p>
                Trừ khi có quy định khác trong Hợp đồng, toàn bộ quyền sở hữu,
                rủi ro và lợi ích liên quan đến Xe được chuyển giao cho Khách
                Hàng vào thời điểm sớm nhất trong các thời điểm sau: (i) khi Xe
                được giao cho Khách Hàng hoặc người đại diện hợp pháp của Khách
                Hàng; (ii) khi Khách Hàng thanh toán 100% giá trị Hợp đồng; hoặc
                (iii) khi Bên Bán xuất hóa đơn GTGT cho Khách Hàng (đối với
                trường hợp thanh toán trả góp).
              </p>
            </div>
          </div>

          {/* Điều 7 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">
              Điều 7. Bảo vệ dữ liệu cá nhân
            </h2>
            <div className="space-y-2 text-justify">
              <p>
                <strong>7.1.</strong> VinFast Trading và VinFast có thể xử lý dữ
                liệu cá nhân của Khách Hàng liên quan đến Hợp đồng này, bao gồm
                dữ liệu liên quan đến các tính năng dịch vụ thông minh (thông số
                Xe, lịch sử di chuyển, trạng thái pin, cập nhật phần mềm từ xa,
                cảnh báo pin yếu, ước tính mức sử dụng pin, tìm kiếm, định vị
                và điều hướng đến trạm sạc gần nhất, chẩn đoán Xe và các dữ liệu
                khác được phân loại là dữ liệu cá nhân theo quy định pháp luật
                hiện hành).
              </p>
              <p>
                <strong>7.2. Đối với Khách Hàng là cá nhân:</strong> Bằng việc
                ký Hợp đồng này, Khách Hàng là cá nhân thừa nhận, hiểu và cho
                phép VinFast Trading và VinFast xử lý dữ liệu cá nhân của mình
                cho các mục đích và phương thức được mô tả trong Chính sách Bảo
                vệ Dữ liệu Cá nhân được công bố trên Website và được điều chỉnh
                theo thời gian.
              </p>
              <p>
                <strong>7.3. Đối với Khách Hàng là tổ chức:</strong>
              </p>
              <p className="pl-4">
                <strong>(a)</strong> Mỗi Bên chịu trách nhiệm thu thập sự đồng
                ý cần thiết từ chủ thể dữ liệu cá nhân liên quan đến Hợp đồng
                này và chịu trách nhiệm về dữ liệu cá nhân mà mình xử lý.
              </p>
              <p className="pl-4">
                <strong>(b)</strong> Các Bên cam kết thực hiện: (i) các quy trình
                bảo mật để bảo vệ dữ liệu cá nhân thu được theo Hợp đồng; và
                (ii) tuân thủ các quy định pháp luật về bảo vệ dữ liệu cá nhân.
              </p>
            </div>
          </div>

          {/* Điều 8 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">Điều 8. Bất khả kháng</h2>
            <div className="space-y-2 text-justify">
              <p>
                Các sự kiện bất khả kháng sẽ được các Bên xử lý theo quy định
                pháp luật.
              </p>
            </div>
          </div>

          {/* Điều 9 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">
              Điều 9. Hiệu lực và Chấm dứt Hợp Đồng
            </h2>
            <div className="space-y-2 text-justify">
              <p>
                Hợp đồng này có hiệu lực kể từ ngày ký tại phần đầu Hợp đồng và
                chấm dứt trong các trường hợp sau:
              </p>
              <p>
                <strong>9.1.</strong> Các Bên thỏa thuận chấm dứt Hợp đồng.
              </p>
              <p>
                <strong>9.2.</strong> Bên Bán có quyền đơn phương chấm dứt Hợp
                đồng nếu Khách Hàng vi phạm bất kỳ nghĩa vụ nào và không khắc
                phục hoặc không thể khắc phục trong thời hạn 10 (mười) ngày kể
                từ ngày đến hạn hoặc thông báo, và Khách Hàng sẽ không được hoàn
                lại tiền đặt cọc. Bên Bán, theo quyết định của mình, có quyền
                đơn phương chấm dứt Hợp đồng mà không phải chịu bất kỳ khoản phí
                phạt nào, với điều kiện thông báo cho Khách Hàng trước ít nhất 07
                (bảy) ngày. Để làm rõ, trong trường hợp chấm dứt như vậy, Bên
                Bán sẽ hoàn lại tiền đặt cọc cho Khách Hàng và sẽ không phải chịu
                trách nhiệm về bất kỳ khoản thanh toán nào khác.
              </p>
            </div>
          </div>

          {/* Điều 10 */}
          <div className="mb-2 text-sm">
            <h2 className="font-bold">Điều 10. Các điều khoản khác</h2>
            <div className="space-y-2 text-justify">
              <p>
                <strong>10.1.</strong> Trong trường hợp các Bên không thể thương
                lượng giải quyết, mọi tranh chấp liên quan đến Hợp đồng này sẽ
                được giải quyết tại Tòa án có thẩm quyền.
              </p>
              <p>
                <strong>10.2.</strong> Bằng văn bản thông báo trước 5 (năm) ngày
                làm việc mà không nhận được phản hồi của Khách Hàng trong 5
                (năm) ngày làm việc kể từ ngày thông báo, Bên Bán hiểu rằng
                Khách Hàng đồng ý cho Bên Bán chuyển giao Hợp Đồng này cho công
                ty con/liên kết của mình hoặc công ty mới thành lập do tái cơ
                cấu với điều kiện không ảnh hưởng đến quyền lợi của Khách Hàng.
              </p>
              <p>
                <strong>10.3.</strong> Hợp Đồng được lập thành{" "}
                <span className="bg-gray-200 px-1">04 (bốn)</span> bản có giá trị
                như nhau, mỗi Bên giữ{" "}
                <span className="bg-gray-200 px-1">02 (hai)</span> bản.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-8 mb-6">
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-bold">KHÁCH HÀNG</p>
              </div>
              <div className="text-right">
                <p className="font-bold">BÊN BÁN</p>
              </div>
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
          In Hợp Đồng
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 10mm 10mm 25mm 10mm;
            size: A4;
          }
          
          body * {
            visibility: hidden;
          }
          
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          
          #printable-content {
            position: relative;
            width: 100%;
            padding: 0;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          /* Footer styling for print */
          .page-footer {
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            display: none;
            font-size: 10px;
          }
          
          /* Show footer on appropriate pages */
          .page-footer.page-1 {
            display: flex;
          }
          
          /* Page break for content sections */
        }
      `}</style>
    </div>
  );
};

export default HopDongMuaBanXe;

