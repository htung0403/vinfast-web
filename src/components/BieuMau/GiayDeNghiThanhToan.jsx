import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";
import { uniqueNgoaiThatColors } from "../../data/calculatorData";
import { vndToWords } from "../../utils/vndToWords";

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
      (color) =>
        color.code === colorCode ||
        color.name.toLowerCase() === colorCode.toLowerCase()
    );
    return found ? found.name : colorCode; // Return name if found, otherwise return original value
  };

  // Helper function to calculate remaining amount (salePrice - advancePayment)
  const calculateRemainingAmount = (salePrice, advancePayment) => {
    const salePriceNum =
      typeof salePrice === "string"
        ? salePrice.replace(/\D/g, "")
        : String(salePrice);
    const advancePaymentNum =
      typeof advancePayment === "string"
        ? advancePayment.replace(/\D/g, "")
        : String(advancePayment);

    const sale = parseInt(salePriceNum, 10) || 0;
    const advance = parseInt(advancePaymentNum, 10) || 0;
    const remaining = sale - advance;

    return remaining > 0 ? remaining.toString() : "0";
  };

  useEffect(() => {
    const loadData = async () => {
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
        let showroomName = incoming.showroom || "Chi Nhánh Trường Chinh";

        // Nếu có firebaseKey, thử lấy showroom từ contracts
        if (incoming.firebaseKey) {
          try {
            const contractId = incoming.firebaseKey;
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

        const branchInfo =
          getBranchByShowroomName(showroomName) || getDefaultBranch();
        setBranch(branchInfo);

        const salePrice = incoming.contractPrice || "230.400.000";
        const advancePayment = incoming.deposit || "216.000.000";
        const calculatedRemaining = calculateRemainingAmount(
          salePrice,
          advancePayment
        );

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
        const defaultVehicleInfo = `Mua 01 chiếc xe ô tô con, chỗ, Nhãn hiệu: ${processedData.model
          }, màu ${getColorName(processedData.exterior)}, số tự động, mới 100%.`;
        setVehicleInfo(incoming.vehicleInfo || defaultVehicleInfo);
        if (incoming.recipientInfo) {
          setRecipientInfo(incoming.recipientInfo);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [location.state]);

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);

    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đồng`;
  };


  const handleBack = () => {
    navigate(-1);
  };

  // Current date formatted for header: "TP.HCM, Ngày D Tháng M năm YYYY"
  const today = new Date();
  const headerDate = `TP.HCM, Ngày ${today.getDate()} Tháng ${today.getMonth() + 1
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
            <p className="font-bold">
              -
              <span className="print:hidden">
                <input
                  type="text"
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm font-bold w-full max-w-md focus:outline-none focus:border-blue-500"
                  placeholder="Trung Tâm Thế Chấp Vùng 9"
                />
              </span>
              <span className="hidden print:inline">{recipientInfo}</span>
            </p>
          </div>

          {/* Căn cứ */}
          <div className="text-sm">
            <p className="mb-2">
              <em>Căn cứ Hợp đồng mua bán xe ô tô số:</em>{" "}
              <strong>{data.contractNumber}</strong>,{" "}
              <em>
                ngày <strong>{data.createdAt}</strong> giữa Ông/Bà{" "}
                <strong>{data.customerName}</strong> và{" "}
                <strong>
                  CHI NHÁNH {getShowroomShortName(data?.showroom).toUpperCase()}{" "}
                  - CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN
                </strong>
              </em>
            </p>
            <p className="mb-1">
              <em>- Căn cứ vào tình hình thực tế.</em>
            </p>

            <p className="mb-1">
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
                Loại xe mua:{" "}
                <span className="print:hidden ">
                  <input
                    type="text"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal italic w-full max-w-lg focus:outline-none focus:border-blue-500"
                    placeholder={`Mua 01 chiếc xe ô tô con, chỗ, Nhãn hiệu: ${data.model
                      }, màu ${getColorName(data.exterior)} mới 100%.`}
                  />
                </span>
              </em>
            </div>

            <div>
              - Giá bán:<strong> {formatCurrency(data.salePrice)}</strong> (Bằng
              chữ: <strong>{vndToWords(data.salePrice)}</strong>)
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
                      CHI NHÁNH{" "}
                      {getShowroomShortName(data?.showroom).toUpperCase()} -
                      CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI
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
                  <td className="border border-gray-800 px-4 py-2 w-3/4"></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-4 py-2 w-1/4 text-center">
                    Ngày
                  </td>
                  <td className="border border-gray-800 px-4 py-2 w-3/4 text-center font-semibold"></td>
                </tr>
              </tbody>
            </table>
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
