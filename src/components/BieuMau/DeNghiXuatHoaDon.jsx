import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";

const DeNghiXuatHoaDon = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);

  // Editable fields
  const [soPhieu, setSoPhieu] = useState("");
  const [ngayBanHanh, setNgayBanHanh] = useState("");
  const [ngayKyHopDong, setNgayKyHopDong] = useState("");
  const [kinhGui, setKinhGui] = useState("Phòng Tài chính - Kế toán.");
  const [nguoiDeNghi, setNguoiDeNghi] = useState(() => {
    // Lấy userName từ localStorage khi khởi tạo
    return localStorage.getItem("username") || "";
  });
  const [boPhan, setBoPhan] = useState(() => {
    // Lấy phòng ban từ localStorage khi khởi tạo
    return localStorage.getItem("userDepartment") || "";
  });
  const [lyDo, setLyDo] = useState("Đăng ký xe");
  const [soTienThu, setSoTienThu] = useState("");
  const [nganHangSoTien, setNganHangSoTien] = useState("");
  const [nganHangTen, setNganHangTen] = useState("");
  const [nganHangChiNhanh, setNganHangChiNhanh] = useState("");
  
  // Refs để lưu vị trí con trỏ
  const soTienThuInputRef = useRef(null);
  const nganHangSoTienInputRef = useRef(null);

  // Helper function to get shortName from showroom
  const getShowroomShortName = (showroomValue) => {
    if (!showroomValue) return "Trường Chinh";
    const foundBranch = getBranchByShowroomName(showroomValue);
    if (foundBranch) {
      return foundBranch.shortName;
    }
    return "Trường Chinh";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    if (!numericAmount) return "";
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} vnđ`;
  };

  const parseCurrency = (value) => {
    if (!value) return "";
    // Loại bỏ tất cả ký tự không phải số
    return String(value).replace(/\D/g, "");
  };

  const getDisplayValue = (rawValue) => {
    // Format khi hiển thị
    return formatCurrency(rawValue);
  };

  const handleCurrencyInput = (e, setter, inputRef) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Lấy số thô từ giá trị hiện tại (trước khi thay đổi)
    const oldValue = e.target.value;
    const oldNumericValue = parseCurrency(oldValue);
    
    // Đếm số ký tự số trước vị trí con trỏ
    const textBeforeCursor = oldValue.substring(0, cursorPosition);
    const digitsBeforeCursor = parseCurrency(textBeforeCursor).length;
    
    // Parse để lấy số thô từ giá trị mới
    const newRawValue = parseCurrency(value);
    // Lưu số thô vào state
    setter(newRawValue);
    
    // Tính toán vị trí con trỏ mới sau khi format
    setTimeout(() => {
      if (inputRef.current) {
        const formattedValue = formatCurrency(newRawValue);
        // Tính vị trí mới: tìm vị trí của chữ số thứ digitsBeforeCursor trong formattedValue
        let newCursorPosition = formattedValue.length;
        
        if (digitsBeforeCursor > 0 && newRawValue.length > 0) {
          // Đếm số ký tự số từ đầu đến vị trí cần thiết
          let digitCount = 0;
          for (let i = 0; i < formattedValue.length; i++) {
            if (/\d/.test(formattedValue[i])) {
              digitCount++;
              if (digitCount === digitsBeforeCursor) {
                newCursorPosition = i + 1;
                break;
              }
            }
          }
        } else if (newRawValue.length === 0) {
          newCursorPosition = 0;
        }
        
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const formatDateString = (val) => {
    if (!val) return null;
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) return val;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";
      let tvbhName = "";

      // Nếu có firebaseKey, thử lấy showroom và TVBH từ contracts
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
            if (contractData.tvbh) {
              tvbhName = contractData.tvbh;
            }
          }
        } catch (err) {
          console.error("Error loading showroom from contracts:", err);
        }
      }

      // Nếu có firebaseKey, thử từ exportedContracts
      if (location.state?.firebaseKey) {
        try {
          const contractRef = ref(
            database,
            `exportedContracts/${location.state.firebaseKey}`
          );
          const snapshot = await get(contractRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            if (contractData.showroom) {
              showroomName = contractData.showroom;
            }
            if (contractData.tvbh) {
              tvbhName = contractData.tvbh;
            }
          }
        } catch (err) {
          console.error("Error loading from exportedContracts:", err);
        }
      }

      // Set TVBH name
      if (tvbhName) {
        setNguoiDeNghi(tvbhName);
      } else {
        // Fallback to localStorage nếu không có TVBH
        setNguoiDeNghi(localStorage.getItem("username") || "");
      }

      const branchInfo =
        getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      // Set default date to today
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const todayStr = `${pad(today.getDate())}/${pad(
        today.getMonth() + 1
      )}/${today.getFullYear()}`;
      setNgayBanHanh(todayStr);

      if (location.state) {
        const incoming = location.state;

        // Parse currency values
        const depositNum =
          typeof incoming.deposit === "string"
            ? incoming.deposit.replace(/\D/g, "")
            : String(incoming.deposit || "");
        const contractPriceNum =
          typeof incoming.contractPrice === "string"
            ? incoming.contractPrice.replace(/\D/g, "")
            : String(incoming.contractPrice || "");
        const bankAmount =
          contractPriceNum && depositNum
            ? (parseInt(contractPriceNum) - parseInt(depositNum)).toString()
            : "";

        setData({
          contractNumber: incoming.vso || incoming.contractNumber || "",
          contractDate:
            formatDateString(incoming.createdAt || incoming.contractDate) ||
            todayStr,
          customerName:
            incoming.customerName || incoming.tenKh || incoming["Tên Kh"] || "",
          customerAddress:
            incoming.address || incoming.diaChi || incoming["Địa Chỉ"] || "",
          soKhung:
            incoming.soKhung ||
            incoming["Số Khung"] ||
            incoming.chassisNumber ||
            incoming.vin ||
            "",
          contractPrice: incoming.contractPrice || incoming.giaHopDong || "",
          deposit: incoming.deposit || incoming.giaGiam || "",
          bank: incoming.bank || incoming.nganHang || "",
        });

        // Set editable fields from incoming data (lưu số thô)
        setSoTienThu(depositNum || "");
        setNganHangSoTien(bankAmount || "");
        // Lấy tên ngân hàng từ incoming hoặc từ branch data
        setNganHangTen(incoming.bank || incoming.nganHang || branchInfo?.bankName || "VP Bank");
        setNganHangChiNhanh(incoming.recipientInfo || "TT Thế Chấp Vùng 9");
        
        // Set ngày ký hợp đồng
        const contractDateStr = formatDateString(incoming.createdAt || incoming.contractDate) || todayStr;
        setNgayKyHopDong(contractDateStr);
        
        // Set TVBH from incoming data if available
        if (incoming.tvbh) {
          setNguoiDeNghi(incoming.tvbh);
        }
      } else {
        // Default data - sử dụng branch info
        setData({
          contractNumber: "S00901-VSO-25-09-0039",
          contractDate: todayStr,
          customerName: "NGÔ NGUYỄN HOÀI NAM",
          customerAddress:
            "Số 72/14 Đường tỉnh lộ 7, Ấp Bình Hạ, Thái Mỹ, Củ Chi, Tp Hồ Chí Minh",
          soKhung: "RLLVFPNT9SH858285",
          contractPrice: "719040000",
          deposit: "72040000",
          bank: branchInfo?.bankName || "VP Bank",
        });
        setSoTienThu("72040000");
        setNganHangSoTien("647000000");
        setNganHangTen(branchInfo?.bankName || "VP Bank");
        setNganHangChiNhanh("TT Thế Chấp Vùng 9");
        setNgayKyHopDong(todayStr);
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

  if (!data) {
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
      <div className="max-w-4xl mx-auto print:max-w-4xl print:mx-auto">
        <div className="flex-1 bg-white p-8 print:p-0 flex flex-col min-h-screen print:min-h-0 print:h-auto" id="printable-content">
          {/* Header */}
          <div className="mb-6">
            <table className="w-full border-2 border-black">
              <tbody>
                <tr>
                  {/* Left Column - Company name */}
                  <td
                    className="border-r-2 border-black p-2 align-middle text-center"
                    style={{ width: "30%" }}
                  >
                    <div className="font-bold text-sm uppercase leading-tight">
                      {branch?.headerName ? (
                        branch.headerName.split('\n').map((line, index, arr) => (
                          <p key={index} className={index < arr.length - 1 ? "mb-0.5" : ""}>
                            {line}
                          </p>
                        ))
                      ) : (
                        <>
                          <p className="mb-0.5">CÔNG TY CP ĐT TM</p>
                          <p className="mb-0.5">DỊCH VỤ Ô TÔ</p>
                          <p className="mb-0.5">ĐÔNG SÀI</p>
                          <p className="mb-0.5">GÒN-CN TRƯỜNG</p>
                          <p>CHINH</p>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Middle Column - Title (2 rows) */}
                  <td
                    className="border-r-2 border-black align-middle text-center"
                    style={{ width: "40%" }}
                  >
                    <div className="border-b-2 border-black pb-2 mb-2">
                      <h1 className="text-medium font-bold uppercase">
                        PHIẾU ĐỀ NGHỊ
                      </h1>
                    </div>
                    <div>
                      <h2 className="text-medium font-bold uppercase">
                        XUẤT HÓA ĐƠN BÁN XE
                      </h2>
                    </div>
                  </td>

                  {/* Right Column - Number and Date */}
                  <td className="p-2 align-middle" style={{ width: "30%" }}>
                    <p className="text-sm mb-1">
                      Số:{" "}
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={soPhieu}
                          onChange={(e) => setSoPhieu(e.target.value)}
                          className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-32 focus:outline-none focus:border-blue-500"
                          placeholder=""
                        />
                      </span>
                      <span className="hidden print:inline">{soPhieu}</span>
                    </p>
                    <p className="text-sm">
                      Ngày ban hành:{" "}
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={ngayBanHanh}
                          onChange={(e) => setNgayBanHanh(e.target.value)}
                          className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-32 focus:outline-none focus:border-blue-500"
                          placeholder="18/11/2025"
                        />
                      </span>
                      <span className="hidden print:inline">{ngayBanHanh}</span>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Main Content */}
          <div className="text-sm space-y-3 text-center">
            {/* Về việc */}
            <p>
              <strong>Về việc: Xuất hóa đơn xe theo HĐ : </strong>
              <strong>{data.contractNumber}</strong>
            </p>

            {/* Số Khung */}
            <p>
              <strong className="underline">Số Khung </strong>
              <strong>: {data.soKhung}</strong>
            </p>
          </div>
          <div className="text-sm space-y-3">
            {/* Kính gửi */}
            <span className="italic ml-32">Kính gửi:</span>
            <strong> Phòng Tài chính - Kế toán.</strong>

            {/* Người đề nghị */}
            <div className="space-y-2">
              <p>
                <span>Họ và tên người đề nghị:</span>{" "}
                <span className="font-bold">{nguoiDeNghi}</span>
              </p>

              <p>
                <span>Bộ phận:</span>{" "}
                <span>{boPhan}</span>
              </p>

              <p>
                <span>Lí do đề nghị:</span>{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={lyDo}
                    onChange={(e) => setLyDo(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-full max-w-md focus:outline-none focus:border-blue-500"
                    placeholder="Đăng ký xe"
                  />
                </span>
                <span className="hidden print:inline">{lyDo}</span>
              </p>
            </div>

            {/* Financial Details */}
            <div className="space-y-2">
              <p>
                <span>Số tiền thu:</span>{" "}
                <span className="print:hidden">
                  <input
                    ref={soTienThuInputRef}
                    type="text"
                    value={getDisplayValue(soTienThu)}
                    onChange={(e) => handleCurrencyInput(e, setSoTienThu, soTienThuInputRef)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-full max-w-md focus:outline-none focus:border-blue-500"
                    placeholder="72.040.000 vnđ"
                  />
                </span>
                <span className="hidden print:inline">{getDisplayValue(soTienThu) || "-"}</span>
              </p>

              <p>
                <span>Ngân hàng:</span>{" "}
                <span className="print:hidden">
                  <input
                    ref={nganHangSoTienInputRef}
                    type="text"
                    value={getDisplayValue(nganHangSoTien)}
                    onChange={(e) => handleCurrencyInput(e, setNganHangSoTien, nganHangSoTienInputRef)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                    placeholder="647.000.000 vnđ"
                  />
                </span>
                <span className="hidden print:inline">{getDisplayValue(nganHangSoTien) || "-"}</span>{" "}
                (Ngân hàng{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nganHangTen}
                    onChange={(e) => setNganHangTen(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                    placeholder="VP bank"
                  />
                </span>
                <span className="hidden print:inline">{nganHangTen}</span> -{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nganHangChiNhanh}
                    onChange={(e) => setNganHangChiNhanh(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto focus:outline-none focus:border-blue-500"
                    placeholder="TT Thế Chấp Vùng 9"
                  />
                </span>
                <span className="hidden print:inline">{nganHangChiNhanh}</span>
                .)
              </p>

              <p>
                <span>Hợp đồng số:</span> {data.contractNumber}
                <span className="ml-8">Ngày ký:</span>{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={ngayKyHopDong}
                    onChange={(e) => setNgayKyHopDong(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-28 focus:outline-none focus:border-blue-500"
                    placeholder="dd/mm/yyyy"
                  />
                </span>
                <span className="hidden print:inline">{ngayKyHopDong}</span>
              </p>

              <p>
                <span>Trị giá hợp đồng :</span>{" "}
                <span className="font-bold">{formatCurrency(data.contractPrice)}</span>
              </p>
            </div>

            {/* Buyer Information */}
            <div className="space-y-2">
              <p>
                <span>Người mua (tổ chức/cá nhân):</span>{" "}
                <span className="font-bold">{data.customerName}</span>
              </p>

              <p>
                <span>Địa chỉ:</span> {data.customerAddress}
              </p>
            </div>
          </div>

          {/* Footer - Signatures */}
          <div className="mt-4 print:mt-4 flex-grow">
            <p className="text-sm mb-2">
              <strong>Ghi chú:</strong>
            </p>
            <div className="flex justify-between mt-4 print:mt-4">
              <div className="flex-1 text-center">
                <p className="font-bold text-sm">BỘ PHẬN KẾ TOÁN</p>
                <div className="h-24 print:h-20"></div>
              </div>
              <div className="flex-1 text-center">
                <p className="font-bold text-sm">BỘ PHẬN KINH DOANH</p>
                <div className="h-24 print:h-20"></div>
              </div>
              <div className="flex-1 text-center">
                <p className="font-bold text-sm">NGƯỜI ĐỀ NGHỊ</p>
                <div className="h-24 print:h-20"></div>
              </div>
            </div>
          </div>

          {/* Form Reference */}
          <div className="pt-4 w-full text-right mr-16 border-t border-black print:pt-2">
            <p className="text-xs italic">
              Biểu mẫu QTTCKT-BM06 ban hành lần 1 ngày 01/7/2014
            </p>
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
          In Phiếu Đề Nghị
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
          }

          body * {
            visibility: hidden;
          }

          #printable-content,
          #printable-content * {
            visibility: visible;
          }

          .min-h-screen {
            min-height: 0 !important;
            height: auto !important;
          }

          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 190mm !important;
            min-height: 277mm !important;
            padding: 8mm !important;
            margin: 0 !important;
            background: white !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .flex-grow {
            flex-grow: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DeNghiXuatHoaDon;
