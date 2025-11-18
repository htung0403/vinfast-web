import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  thong_tin_ky_thuat_xe,
  danh_sach_xe,
  formatCurrency,
} from "../data/calculatorData";

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Invoice2Page() {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    // Get data from localStorage
    const savedData = localStorage.getItem("invoiceData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setInvoiceData(data);
      } catch (e) {
        console.error("Error loading saved invoice data:", e);
        navigate("/bao-gia");
      }
    } else {
      // No data, redirect back to calculator
      navigate("/bao-gia");
    }
  }, [navigate]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (!invoiceData) {
    return <div className="p-4">Đang tải dữ liệu...</div>;
  }

  // Helper functions to get display values
  const getCustomerTypeLabel = () => {
    return invoiceData.customerType === "ca_nhan" ? "Cá nhân" : "Công ty";
  };

  const getBusinessTypeLabel = () => {
    if (invoiceData.businessType) {
      return invoiceData.businessType === "khong_kinh_doanh"
        ? "Không Kinh Doanh"
        : "Kinh Doanh";
    }
    return invoiceData.customerType === "ca_nhan"
      ? "Không Kinh Doanh"
      : "Kinh Doanh";
  };

  const getExteriorColorName = () => {
    // Try to get color name from data, fallback to code
    return invoiceData.exteriorColorName || invoiceData.exteriorColor || "";
  };

  const getInteriorColorName = () => {
    // Try to get color name from data, fallback to code
    return invoiceData.interiorColorName || invoiceData.interiorColor || "";
  };

  const getRegistrationLocationLabel = () => {
    // If registrationLocation is already a label (string), return it
    if (
      invoiceData.registrationLocation &&
      !["hcm", "hanoi", "danang", "cantho", "haiphong", "other"].includes(
        invoiceData.registrationLocation
      )
    ) {
      return invoiceData.registrationLocation;
    }

    const locationMap = {
      hcm: "TP. Hồ Chí Minh",
      hanoi: "Hà Nội",
      danang: "Đà Nẵng",
      cantho: "Cần Thơ",
      haiphong: "Hải Phòng",
      other: "Tỉnh thành khác",
    };
    return (
      locationMap[invoiceData.registrationLocation] ||
      invoiceData.registrationLocation ||
      "TP. Hồ Chí Minh"
    );
  };

  // Calculate payment schedule
  const totalAmount =
    (invoiceData.carTotal || 0) + (invoiceData.totalOnRoadCost || 0);
  const deposit = invoiceData.depositAmount || 0;
  const remaining = totalAmount - deposit;
  const payment1 = Math.round(remaining * 0.4); // 40% khi xuất hóa đơn
  const payment2 = remaining - payment1; // Còn lại khi đăng ký

  // Get current date for footer
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return (
    <div className="min-h-screen bg-white p-4 print:p-5">
      {/* Back Button - Hidden when printing */}
      <div className="no-print mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
      </div>
      <style>{`
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          h2, .section-title {
            page-break-after: avoid;
          }
          table {
            page-break-inside: avoid;
          }
          .section-title {
            margin-top: 10px;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-center uppercase mb-3 bg-blue-50 text-blue-900 p-2 border border-blue-900 text-base font-bold">
          BẢNG BÁO GIÁ CHI PHÍ MUA XE TẠM TÍNH
        </h2>

        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr>
              <td className="p-1" style={{ width: "15%" }}>
                <strong>Kính Gửi:</strong>
              </td>
              <td className="p-1" style={{ width: "35%" }}>
                {(invoiceData.customerName || "QUÝ KHÁCH HÀNG").toUpperCase()}
              </td>
              <td className="p-1" style={{ width: "15%" }}>
                <strong>Đóng Tên:</strong>
              </td>
              <td className="p-1" style={{ width: "35%" }}>
                {getCustomerTypeLabel()}
              </td>
            </tr>
            <tr>
              <td className="p-1" style={{ width: "15%" }}>
                <strong>Địa Chỉ:</strong>
              </td>
              <td className="p-1" style={{ width: "35%" }}>
                {invoiceData.customerAddress || "Thành phố Hồ Chí Minh"}
              </td>
              <td className="p-1" style={{ width: "15%" }}>
                <strong>Như Chủ:</strong>
              </td>
              <td className="p-1" style={{ width: "35%" }}>
                {getBusinessTypeLabel()}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 text-blue-900 font-bold uppercase p-1 mt-3 mb-0 border border-gray-300 text-xs">
          Thông tin sản phẩm
        </div>
        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "33%" }}
              >
                <strong>Dòng xe</strong>
              </td>
              <td className="border border-gray-300 p-1">
                {invoiceData.carModel || "VF 3"}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "33%" }}
              >
                <strong>Phiên bản</strong>
              </td>
              <td className="border border-gray-300 p-1">
                {invoiceData.carVersion || "Base"}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "33%" }}
              >
                <strong>Ngoại thất</strong>
              </td>
              <td className="border border-gray-300 p-1">
                {getExteriorColorName()}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "33%" }}
              >
                <strong>Nội thất</strong>
              </td>
              <td className="border border-gray-300 p-1">
                {getInteriorColorName()}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 text-blue-900 font-bold uppercase p-1 mt-3 mb-0 border border-gray-300 text-xs">
          Giá xe & Chương trình khuyến mãi
        </div>
        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "50%" }}
              >
                <strong>Giá Xe Đã Bao Gồm VAT</strong>
              </td>
              <td className="border border-gray-300 p-1 text-right">
                <strong>{formatCurrency(invoiceData.carBasePrice || 0)}</strong>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1 bg-blue-50" colSpan="2">
                <strong>Chương trình khuyến mãi</strong>
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "50%" }}
              >
                Giảm giá khuyến mãi cơ bản
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(
                  Math.max(
                    0,
                    (invoiceData.carBasePrice || 0) -
                      (invoiceData.carPriceAfterPromotions || 0)
                  )
                )}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "50%" }}
              >
                Giảm giá hạng thành viên
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(invoiceData.vinClubDiscount || 0)}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "50%" }}
              >
                Ưu đãi BHVC (Quy đổi 2 năm)
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(invoiceData.bhvc2Discount || 0)}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "50%" }}
              >
                Hỗ trợ đổi xe xăng → điện
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(invoiceData.convertSupportDiscount || 0)}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "50%" }}
              >
                Miễn Phí Màu Nâng Cao
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(invoiceData.premiumColorDiscount || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1 bg-blue-50">
                <strong>Giá xuất hóa đơn</strong>
              </td>
              <td className="border border-gray-300 p-1 text-right bg-blue-50">
                <strong>
                  {formatCurrency(
                    invoiceData.priceFinalPayment || invoiceData.carTotal || 0
                  )}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 text-blue-900 font-bold uppercase p-1 mt-3 mb-0 border border-gray-300 text-xs">
          Chi phí lăn bánh
        </div>
        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                1
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Lệ phí trước bạ
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              >
                {invoiceData.carModel && invoiceData.carModel.includes("VF")
                  ? "0%"
                  : "10%"}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                Miễn Phí
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "17%" }}
              >
                Hóa đơn
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                2
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Phí 01 năm BH Dân sự
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              ></td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                {formatCurrency(invoiceData.liabilityInsurance || 0)}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "17%" }}
              >
                Hóa đơn
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                3
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Phí cấp biển số
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              >
                {getRegistrationLocationLabel()}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                {formatCurrency(invoiceData.plateFee || 0)}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "17%" }}
              >
                Biên Lai
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                4
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Phí kiểm định
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              ></td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                {formatCurrency(invoiceData.inspectionFee || 0)}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "17%" }}
              >
                Biên Lai
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                5
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Phí bảo trì đường bộ
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              >
                {getCustomerTypeLabel()}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                {formatCurrency(invoiceData.roadFee || 0)}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "17%" }}
              >
                Biên Lai
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                6
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Phí dịch vụ
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              ></td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                {formatCurrency(invoiceData.registrationFee || 0)}
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "17%" }}
              ></td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                7
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                BHVC bao gồm Pin
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "15%" }}
              >
                {getBusinessTypeLabel()}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "20%" }}
              >
                {formatCurrency(invoiceData.bodyInsurance || 0)}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "17%" }}
              >
                Hóa Đơn
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 text-blue-900 font-bold uppercase p-1 mt-3 mb-0 border border-gray-300 text-xs">
          Tổng chi phí lăn bánh
        </div>
        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr className="bg-blue-50">
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                <strong>STT</strong>
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                <strong>Hình thức</strong>
              </td>
              <td
                className="border border-gray-300 p-1 text-center"
                style={{ width: "15%" }}
              >
                <strong>%</strong>
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "37%" }}
              >
                <strong>Số tiền</strong>
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                1
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Ngân hàng
              </td>
              <td
                className="border border-gray-300 p-1 text-center"
                style={{ width: "15%" }}
              >
                {invoiceData.hasLoan && invoiceData.loanRatio
                  ? `${invoiceData.loanRatio}%`
                  : "0%"}
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "37%" }}
              >
                {formatCurrency(invoiceData.loanAmount || 0)}
              </td>
            </tr>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "8%" }}
              >
                2
              </td>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "40%" }}
              >
                Đối Ứng
              </td>
              <td
                className="border border-gray-300 p-1 text-center"
                style={{ width: "15%" }}
              ></td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "37%" }}
              >
                {formatCurrency(invoiceData.downPayment || 0)}
              </td>
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-gray-300 p-1" colSpan="3">
                <strong>Tổng</strong>
              </td>
              <td className="border border-gray-300 p-1 text-right">
                <strong>
                  {formatCurrency(invoiceData.totalOnRoadCost || 0)}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 text-blue-900 font-bold uppercase p-1 mt-3 mb-0 border border-gray-300 text-xs">
          Phương thức thanh toán
        </div>
        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr className="bg-blue-50">
              <td
                className="border border-gray-300 p-1"
                style={{ width: "25%" }}
              >
                <strong>Hình thức</strong>
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "25%" }}
              >
                <strong>Đặt cọc</strong>
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "25%" }}
              >
                <strong>Lần 1: Xuất hóa đơn</strong>
              </td>
              <td
                className="border border-gray-300 p-1 text-right"
                style={{ width: "25%" }}
              >
                <strong>Lần 2: Đăng ký</strong>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1">Ngân hàng</td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(deposit)}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(payment1)}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatCurrency(payment2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 text-blue-900 font-bold uppercase p-1 mt-3 mb-0 border border-gray-300 text-xs">
          Quà tặng
        </div>
        <table className="w-full border-collapse mb-0 text-sm bg-white">
          <tbody>
            <tr>
              <td
                className="border border-gray-300 p-1"
                style={{ width: "33%" }}
              >
                Áo trùm, bao tay lái, sáp thơm, bình chữa cháy
              </td>
              <td className="border border-gray-300 p-1 text-right">Tặng</td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs italic mt-2 text-right text-gray-700">
          Báo giá có hiệu lực đến hết ngày 30/11/2025
        </p>

        <div className="text-right mt-2 text-xs italic font-medium">
          <strong>
            Thành phố Hồ Chí Minh, Ngày {day} tháng {month} năm {year}
          </strong>
        </div>

        <footer className="mt-4 flex justify-between text-sm">
          <div className="w-[45%] text-center">
            <strong className="block mb-1">Khách hàng</strong>
            <p>(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="w-[45%] text-center">
            <strong className="block mb-1">Người báo giá</strong>
            <p>(Ký và ghi rõ họ tên)</p>
          </div>
        </footer>

        {/* Action Buttons */}
        <div className="text-center mt-5 pt-4 border-t-2 border-blue-900 no-print">
          <button
            onClick={handlePrint}
            className="px-8 py-3 bg-blue-900 text-white font-bold rounded cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg"
          >
            IN BÁO GIÁ
          </button>
        </div>
      </div>
    </div>
  );
}
