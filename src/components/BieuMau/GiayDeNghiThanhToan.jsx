import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { uniqueNgoaiThatColors } from "../../data/calculatorData";

const GiayDeNghiThanhToan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState(
    "Trung Tâm Thế Chấp Vùng 9"
  );
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [branch, setBranch] = useState(null);

  // Helper function to get shortName from showroom (similar to GiayXacNhanThongTin.jsx)
  const getShowroomShortName = (showroomValue) => {
    if (!showroomValue) return "Trường Chinh";
    // Try to find branch by showroom name
    const foundBranch = getBranchByShowroomName(showroomValue);
    if (foundBranch) {
      return foundBranch.shortName;
    }
    return "Trường Chinh"; // Default fallback
  };

  // Helper function to get color name from color code
  const getColorName = (colorCode) => {
    if (!colorCode) return colorCode || "";
    const found = uniqueNgoaiThatColors.find(
      (color) => color.code === colorCode || color.name.toLowerCase() === colorCode.toLowerCase()
    );
    return found ? found.name : colorCode; // Return name if found, otherwise return original value
  };

  // Helper function to calculate remaining amount (salePrice - advancePayment)
  const calculateRemainingAmount = (salePrice, advancePayment) => {
    const salePriceNum =
      typeof salePrice === "string" ? salePrice.replace(/\D/g, "") : String(salePrice);
    const advancePaymentNum =
      typeof advancePayment === "string" ? advancePayment.replace(/\D/g, "") : String(advancePayment);
    
    const sale = parseInt(salePriceNum, 10) || 0;
    const advance = parseInt(advancePaymentNum, 10) || 0;
    const remaining = sale - advance;
    
    return remaining > 0 ? remaining.toString() : "0";
  };

  useEffect(() => {
    if (location.state) {
      const incoming = location.state;
      const formatDateString = (val) => {
        if (!val) return null;
        // if already dd/mm/yyyy
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) return val;
        const d = new Date(val);
        if (isNaN(d)) return val;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(
          d.getMonth() + 1
        )}/${d.getFullYear()}`;
      };

      // Lấy thông tin chi nhánh
      const showroomName = incoming.showroom || "Chi Nhánh Trường Chinh";
      const branchInfo =
        getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      const salePrice = incoming.contractPrice || "230.400.000";
      const advancePayment = incoming.deposit || "216.000.000";
      const calculatedRemaining = calculateRemainingAmount(salePrice, advancePayment);
      
      const processedData = {
        customerName:
          incoming.customerName || incoming["Tên KH"] || "Trần Thị B",
        contractNumber: incoming.vso || "S00901-VSO-25-01-0041",
        createdAt: formatDateString(incoming.createdAt) || "28/06/2024",
        model: incoming.model || "VF8",
        salePrice: salePrice,
        advancePayment: advancePayment,
        remainingAmount: incoming.remainingAmount || calculatedRemaining,
        bankAccount: incoming.bankAccount || branchInfo.bankAccount,
        bankBranch:
          incoming.bankBranch ||
          `${branchInfo.bankName} - ${branchInfo.bankBranch}`,
        exterior: incoming.exterior || "Đỏ",
        showroom: incoming.showroom || branchInfo.shortName,
      };
      setData(processedData);
      // Initialize vehicleInfo from data
      const defaultVehicleInfo = `Mua 01 chiếc xe ô tô con, chỗ, Nhãn hiệu: ${processedData.model}, màu ${getColorName(processedData.exterior)}, số tự động, mới 100%.`;
      setVehicleInfo(incoming.vehicleInfo || defaultVehicleInfo);
      if (incoming.recipientInfo) {
        setRecipientInfo(incoming.recipientInfo);
      }
    } else {
      // Sử dụng chi nhánh mặc định
      const defaultBranch = getDefaultBranch();
      setBranch(defaultBranch);
      const defaultSalePrice = "230.400.000";
      const defaultAdvancePayment = "216.000.000";
      const calculatedRemaining = calculateRemainingAmount(defaultSalePrice, defaultAdvancePayment);
      
      const defaultData = {
        customerName: "Trần Thị B",
        contractNumber: "S00901-VSO-25-01-0041",
        createdAt: "28/06/2024",
        model: "VF8",
        salePrice: defaultSalePrice,
        advancePayment: defaultAdvancePayment,
        remainingAmount: calculatedRemaining,
        bankAccount: defaultBranch.bankAccount,
        bankBranch: `${defaultBranch.bankName} - ${defaultBranch.bankBranch}`,
        exterior: "Đỏ",
        showroom: defaultBranch.shortName,
      };
      setData(defaultData);
      const defaultVehicleInfo = `Mua 01 chiếc xe ô tô con, chỗ, Nhãn hiệu: ${defaultData.model}, màu ${getColorName(defaultData.exterior)} mới 100%.`;
      setVehicleInfo(defaultVehicleInfo);
    }
    setLoading(false);
  }, [location.state]);

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);

    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đồng`;
  };

  // Helper function to convert number to Vietnamese words
  const numberToWords = (amount) => {
    if (!amount) return "";
    
    // Convert to number
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
        // Show "không trăm" when hundred is 0 but there are tens (not just ones)
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

    // Capitalize first letter and add "chẵn Việt Nam đồng"
    const trimmed = result.trim();
    if (!trimmed) return "Không đồng";
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return capitalized + " Việt Nam đồng";
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Current date formatted for header: "TP.HCM, Ngày D Tháng M năm YYYY"
  const today = new Date();
  const headerDate = `TP.HCM, Ngày ${today.getDate()} Tháng ${
    today.getMonth() + 1
  } năm ${today.getFullYear()}`;

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
          <p className="text-red-600 mb-4">Không có dữ liệu</p>
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
      <div className="flex gap-6 max-w-7xl mx-auto print:max-w-4xl print:mx-auto">
        <div className="flex-1 bg-white p-8" id="printable-content">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-bold w-[300px] text-sm mb-1">
                  CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN
                </p>
                <p className="font-bold w-[300px] text-sm mb-1">
                  CHI NHÁNH {getShowroomShortName(data?.showroom).toUpperCase()}
                </p>
              </div>

              <div className="flex-1 text-center">
                <p className="font-bold text-sm mb-1">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="font-bold text-sm mb-1">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <p className="italic text-sm mt-4">{headerDate}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-center mb-8 uppercase">
            GIẤY ĐỀ NGHỊ THANH TOÁN
          </h1>

          {/* Recipient */}
          <div className="mb-6 text-center">
            <p className="font-bold mb-1">
              Kính gửi: NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG-VP BANK
            </p>
            <p className="font-bold">-{recipientInfo}</p>
          </div>

          {/* Căn cứ */}
          <div className="mb-6 text-sm">
            <p className="mb-2">
              <em>Căn cứ Hợp đồng mua bán xe ô tô số:</em>{" "}
              <strong>{data.contractNumber}</strong>,{" "}
              <em>
                ngày <strong>{data.createdAt}</strong> giữa Ông/Bà{" "}
                <strong>{data.customerName}</strong> và <strong>CHI NHÁNH {" "}
                {getShowroomShortName(data?.showroom).toUpperCase()} - CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN</strong>
              </em>
            </p>
            <p className="mb-4">
              <em>- Căn cứ vào tình hình thực tế.</em>
            </p>

            <p className="mb-4">
              Nay{" "}
              <strong>
                CHI NHÁNH {getShowroomShortName(data?.showroom).toUpperCase()} -
                CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN
              </strong>{" "}
              đề nghị{" "}
              <strong>
                NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG VP BANK-
                {recipientInfo.toUpperCase()}
              </strong>{" "}
              thanh toán số tiền khách hàng vay mua xe tại Công ty như sau:
            </p>
          </div>

          {/* Thông tin thanh toán */}
          <div className="mb-8 text-sm space-y-3">
            <div>
              - Tên khách hàng vay: <strong>{data.customerName}</strong>
              <em className="ml-4">
                Loại xe mua: {vehicleInfo || `Mua 01 chiếc xe ô tô con, chỗ, Nhãn hiệu: ${data.model}, màu ${getColorName(data.exterior)} mới 100%.`}
              </em>
            </div>

            <div>
              - Giá bán:<strong> {formatCurrency(data.salePrice)}</strong>
              {" "}(Bằng chữ: {" "} 
              <strong>
                {numberToWords(data.salePrice)}
              </strong>)
            </div>

            <div>
              - Số tiền khách hàng đã trả trước:{" "}
              <strong>{formatCurrency(data.advancePayment)}</strong>
            </div>

            <div>
              - Số tiền khách hàng còn thiếu để thanh toán:{" "}
              <strong>{formatCurrency(data.remainingAmount)}</strong>
            </div>

            <div>
              - Đề nghị thanh toán số tiền trên vào tài khoản số:{" "}
              {data.bankAccount} {data.bankBranch}
            </div>

            <div>
              - Chủ TK:{" "}
              <strong>
                Công ty Cổ Phần Đầu Tư Thương Mại Và Dịch Vụ ô tô Đông Sài Gòn.
              </strong>
            </div>
          </div>

          {/* Phần chữ ký - BẢNG VỚI 2 CỘT TỶ LỆ 1:3 */}
          <div className="mt-8 flex justify-end">
            <table className="border-collapse border border-gray-800 w-full">
              <tbody>
                <tr>
                  <td
                    colSpan="2"
                    className="border border-gray-800 px-4 py-3 text-center"
                  >
                    <strong>
                      CHI NHÁNH {getShowroomShortName(data?.showroom).toUpperCase()} - CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI
                      GÒN
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-4 py-2 w-1/4 text-center">
                    <em>
                      <br />
                      Ký tên
                      <br />
                      <br />
                    </em>
                  </td>
                  <td className="border border-gray-800 px-4 py-2 w-3/4">
                    {/* Ô trống để ký tên */}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-4 py-2 w-1/4 text-center">
                    Họ và tên
                    <br />
                    Chức vụ
                  </td>
                  <td className="border border-gray-800 px-4 py-2 w-3/4">
                    
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-4 py-2 w-1/4 text-center">
                    Ngày
                  </td>
                  <td className="border border-gray-800 px-4 py-2 w-3/4 text-center font-semibold">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar với input */}
        <div className="w-120 print:hidden flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-8 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Thông tin "Kính gửi":
              </label>
              <input
                type="text"
                value={recipientInfo}
                onChange={(e) => setRecipientInfo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập thông tin kính gửi"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Thông tin loại xe:
              </label>
              <textarea
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[80px]"
                placeholder="Nhập thông tin loại xe"
                rows={3}
              />
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
            In Giấy Đề Nghị
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
          
          .max-w-7xl.flex {
            display: block !important;
          }
          
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm;
            box-shadow: none;
            page-break-after: avoid;
            page-break-inside: avoid;
            font-family: 'Times New Roman', Times, serif !important;
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

export default GiayDeNghiThanhToan;
