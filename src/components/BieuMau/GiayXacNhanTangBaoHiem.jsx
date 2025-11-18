import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBranchByShowroomName, getDefaultBranch } from "../../data/branchData";

const GiayXacNhanTangBaoHiem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState("TRUNG TÂM THẾ CHẤP VÙNG 9");
  const [customerAddress, setCustomerAddress] = useState("");
  const [insuranceContract, setInsuranceContract] = useState("");
  const [insuranceValue, setInsuranceValue] = useState("");
  const [insuranceStart, setInsuranceStart] = useState("");
  const [insuranceEnd, setInsuranceEnd] = useState("");
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

  useEffect(() => {
    if (location.state) {
      const incoming = location.state;
      const formatDateString = (val) => {
        if (!val) return null;
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) return val;
        const d = new Date(val);
        if (isNaN(d)) return val;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(
          d.getMonth() + 1
        )}/${d.getFullYear()}`;
      };

      const formatDateToVNPartial = (val) => {
        if (!val) return null;
        // if already contains 'tháng' assume it's formatted
        if (/tháng/i.test(val) && /năm/i.test(val)) return val;
        // parse common dd/mm/yyyy or ISO
        let d = null;
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
          const [dd, mm, yyyy] = val.split("/");
          return `${dd.padStart(2, "0")} tháng ${mm.padStart(
            2,
            "0"
          )} năm ${yyyy}`;
        }
        d = new Date(val);
        if (isNaN(d)) return val;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())} tháng ${pad(
          d.getMonth() + 1
        )} năm ${d.getFullYear()}`;
      };

      // Lấy thông tin chi nhánh
      const showroomName = incoming.showroom || "TRƯỜNG CHINH";
      const branchInfo = getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      const processedData = {
        customerName:
          incoming.customerName || incoming["Tên KH"] || "HUỲNH THỊ NGỌC SANG",
        contractNumber: incoming.vso || "S00901-VSO-25-10-0015",
        createdAt:
          formatDateToVNPartial(incoming.createdAt) || "06 tháng 10 năm 2025",
        model: incoming.model || "VINFAST VF5 PLUS",
        vin: incoming.vin || "RLNV5JSE75HB14380",
        engineNumber: incoming.engineNumber || "VFCAFB258090159",
        vehicleValue: incoming.vehicleValue || "507.840.000",
        insuranceValue: incoming.insuranceValue || "6.144.864",
        insuranceContract: incoming.insuranceContract || "VCM/02914735",
        insuranceStart: incoming.insuranceStart || "07/11/2025",
        insuranceEnd: incoming.insuranceEnd || "07/11/2026",
        customerAddress:
          incoming.customerAddress ||
          "Số 211, Xóm 1, Thôn 7, Xã Tánh Linh, Tỉnh Lâm Đồng, Việt Nam",
        showroom: incoming.showroom || branchInfo.shortName.toUpperCase(),
      };
      setData(processedData);
      // Initialize editable fields from data
      setCustomerAddress(processedData.customerAddress);
      setInsuranceContract(processedData.insuranceContract);
      setInsuranceValue(processedData.insuranceValue);
      setInsuranceStart(processedData.insuranceStart);
      setInsuranceEnd(processedData.insuranceEnd);
      if (incoming.recipientInfo) {
        setRecipientInfo(incoming.recipientInfo);
      }
    } else {
      // Sử dụng chi nhánh mặc định
      const defaultBranch = getDefaultBranch();
      setBranch(defaultBranch);
      const defaultData = {
        customerName: "HUỲNH THỊ NGỌC SANG",
        contractNumber: "S00901-VSO-25-10-0015",
        createdAt: "06 tháng 10 năm 2025",
        model: "VINFAST VF5 PLUS",
        vin: "RLNV5JSE75HB14380",
        engineNumber: "VFCAFB258090159",
        vehicleValue: "507.840.000",
        insuranceValue: "6.144.864",
        insuranceContract: "VCM/02914735",
        insuranceStart: "07/11/2025",
        insuranceEnd: "07/11/2026",
        customerAddress:
          "Số 211, Xóm 1, Thôn 7, Xã Tánh Linh, Tỉnh Lâm Đồng, Việt Nam",
        showroom: defaultBranch.shortName.toUpperCase(),
      };
      setData(defaultData);
      // Initialize editable fields from default data
      setCustomerAddress(defaultData.customerAddress);
      setInsuranceContract(defaultData.insuranceContract);
      setInsuranceValue(defaultData.insuranceValue);
      setInsuranceStart(defaultData.insuranceStart);
      setInsuranceEnd(defaultData.insuranceEnd);
    }
    setLoading(false);
  }, [location.state]);

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VND`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Current date formatted for header
  const today = new Date();
  const headerDate = `Tp.HCM, ngày ${today.getDate()} tháng ${
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
              <p className="font-bold text-sm mb-1">
                CN {getShowroomShortName(data?.showroom).toUpperCase()} - CÔNG TY
              </p>
              <p className="font-bold text-sm mb-1">CP ĐẦU TƯ TM VÀ DV Ô TÔ</p>
              <p className="font-bold text-sm">ĐÔNG SÀI GÒN</p>
            </div>

            <div className="flex-1 text-center">
              <p className="font-bold text-sm mb-1">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="font-bold text-sm mb-1">
                Độc lập – Tự do – Hạnh phúc
              </p>
              <p className="italic text-sm mt-4">{headerDate}</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-center mb-8 uppercase">
          GIẤY XÁC NHẬN TẶNG BẢO HIỂM
        </h1>

        {/* Recipient */}
        <div className="mb-6">
          <p className="font-bold mb-1 text-center">
            <strong>Kính gởi:</strong>{" "}
            <strong>
              NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG
              <br /> – {recipientInfo}
            </strong>
          </p>
        </div>

        {/* Content */}
        <div className="mb-6 text-sm space-y-4">
          <p>
            Bằng bản này :{" "}
            <strong className="uppercase">
              CN {getShowroomShortName(data?.showroom).toUpperCase()} - CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ
              Ô TÔ ĐÔNG SÀI GÒN
            </strong>
          </p>

          <p>Địa chỉ: {branch ? branch.address : "Số 682A Trường Chinh, Phường 15, Tp.HCM"}</p>

          <p>
            Xác nhận tặng bảo hiểm vật chất xe cho khách{" "}
            <strong>{data.customerName}</strong> theo hợp đồng mua bán số{" "}
            {data.contractNumber} được kí ngày {data.createdAt}.
          </p>

          <div className="space-y-2">
            <p>
              Người được bảo hiểm: <strong>{data.customerName}</strong>
            </p>
            <p>Địa chỉ: {customerAddress || data.customerAddress}</p>
            <p>Hiệu xe: {data.model}</p>
            <p>
              Số khung: <strong>{data.vin}</strong>
            </p>
            <p>
              Số máy: <strong>{data.engineNumber}</strong>
            </p>
            <p>
              Giá trị xe : <strong>{formatCurrency(data.vehicleValue)}</strong>
            </p>
            <p>
              Giá trị hợp đồng bảo hiểm :{" "}
              <strong>{formatCurrency(insuranceValue || data.insuranceValue)}</strong>
            </p>
            <p>
              Số hợp đồng bảo hiểm : <strong>{insuranceContract || data.insuranceContract}</strong>
            </p>
            <p>
              Thời hạn bảo hiểm{" "}
              <strong>
                Từ 10 giờ 00 phút, ngày {insuranceStart || data.insuranceStart} đến 09 giờ 59
                phút, ngày {insuranceEnd || data.insuranceEnd}
              </strong>
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 flex justify-end">
          <div className="w-78">
            {" "}
            {/* Điều chỉnh chiều rộng này nếu cần */}
            <p className="italic text-right">
              TP. Hồ Chí Minh, ngày {today.getDate()} tháng{" "}
              {today.getMonth() + 1} năm {today.getFullYear()}
            </p>
            <div className="mt-4 text-center">
              <p className="font-bold">TỔNG GIÁM ĐỐC</p>
            </div>
          </div>
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
                Địa chỉ khách hàng:
              </label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[80px]"
                placeholder="Nhập địa chỉ khách hàng"
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Số hợp đồng bảo hiểm:
              </label>
              <input
                type="text"
                value={insuranceContract}
                onChange={(e) => setInsuranceContract(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số hợp đồng bảo hiểm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Giá trị hợp đồng bảo hiểm:
              </label>
              <input
                type="text"
                value={insuranceValue}
                onChange={(e) => setInsuranceValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập giá trị hợp đồng bảo hiểm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Thời hạn bảo hiểm:
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Từ ngày (dd/mm/yyyy):</label>
                  <input
                    type="text"
                    value={insuranceStart}
                    onChange={(e) => setInsuranceStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="07/11/2025"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Đến ngày (dd/mm/yyyy):</label>
                  <input
                    type="text"
                    value={insuranceEnd}
                    onChange={(e) => setInsuranceEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="07/11/2026"
                  />
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
            In Giấy Xác Nhận
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

export default GiayXacNhanTangBaoHiem;
