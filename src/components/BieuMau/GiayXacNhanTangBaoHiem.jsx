import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";

const GiayXacNhanTangBaoHiem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nganHangName, setNganHangName] = useState(
    "NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG"
  );
  const [recipientInfo, setRecipientInfo] = useState(
    "TRUNG TÂM THẾ CHẤP VÙNG 9"
  );
  const [insuranceContract, setInsuranceContract] = useState("");
  const [insuranceValue, setInsuranceValue] = useState("");
  const [insuranceStart, setInsuranceStart] = useState("");
  const [insuranceEnd, setInsuranceEnd] = useState("");
  const [branch, setBranch] = useState(null);
  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("59");

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
    const loadData = async () => {
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
        let showroomName = incoming.showroom || "TRƯỜNG CHINH";
        let contractDataFromDB = null;

        // Nếu có firebaseKey, thử lấy dữ liệu từ exportedContracts hoặc contracts
        if (incoming.firebaseKey) {
          try {
            const contractId = incoming.firebaseKey;
            // Thử exportedContracts trước (vì đây là từ trang hợp đồng đã xuất)
            let contractsRef = ref(database, `exportedContracts/${contractId}`);
            let snapshot = await get(contractsRef);
            
            // Nếu không có trong exportedContracts, thử contracts
            if (!snapshot.exists()) {
              contractsRef = ref(database, `contracts/${contractId}`);
              snapshot = await get(contractsRef);
            }
            
            if (snapshot.exists()) {
              contractDataFromDB = snapshot.val();
              if (contractDataFromDB.showroom) {
                showroomName = contractDataFromDB.showroom;
              }
            }
          } catch (err) {
            console.error("Error loading contract from database:", err);
          }
        }

        const branchInfo =
          getBranchByShowroomName(showroomName) || getDefaultBranch();
        setBranch(branchInfo);

        // Map dữ liệu từ incoming và contractDataFromDB
        // Ưu tiên contractDataFromDB nếu có, sau đó mới đến incoming
        const getValue = (field, dbField = null) => {
          if (contractDataFromDB) {
            // Thử các tên field khác nhau từ database
            const dbValue = dbField 
              ? contractDataFromDB[dbField] || contractDataFromDB[field]
              : contractDataFromDB[field];
            if (dbValue) return dbValue;
          }
          return incoming[field] || incoming[dbField] || "";
        };

        const processedData = {
          customerName:
            getValue("customerName", "Tên KH") ||
            getValue("tenKh", "Tên Kh") ||
            "",
          contractNumber: 
            getValue("vso", "VSO") || 
            getValue("contractNumber", "") || "",
          createdAt:
            formatDateToVNPartial(
              getValue("createdAt", "ngày xhd") ||
              getValue("ngayXhd", "ngày XHD")
            ) || "",
          model: 
            getValue("model", "Dòng xe") ||
            getValue("dongXe", "Dòng Xe") ||
            "",
          vin: 
            getValue("vin", "Số Khung") ||
            getValue("soKhung", "soKhung") ||
            getValue("chassisNumber", "") ||
            "",
          engineNumber: 
            getValue("engineNumber", "Số Máy") ||
            getValue("soMay", "soMay") ||
            "",
          vehicleValue: 
            getValue("vehicleValue", "Giá Hợp Đồng") ||
            getValue("contractPrice", "giaHopDong") ||
            getValue("giaHopDong", "") ||
            "",
          insuranceValue: 
            getValue("insuranceValue", "") || "",
          insuranceContract: 
            getValue("insuranceContract", "") || "",
          insuranceStart: 
            getValue("insuranceStart", "") || "",
          insuranceEnd: 
            getValue("insuranceEnd", "") || "",
          customerAddress:
            getValue("customerAddress", "Địa Chỉ") ||
            getValue("address", "diaChi") ||
            getValue("diaChi", "") ||
            "",
          showroom: 
            showroomName || 
            branchInfo.shortName.toUpperCase(),
        };
        setData(processedData);
        // Initialize editable fields from data
        setInsuranceContract(processedData.insuranceContract);
        setInsuranceValue(processedData.insuranceValue);
        setInsuranceStart(convertToDateInput(processedData.insuranceStart));
        setInsuranceEnd(convertToDateInput(processedData.insuranceEnd));
        if (incoming.recipientInfo) {
          setRecipientInfo(incoming.recipientInfo);
        }
        if (incoming.nganHangName) {
          setNganHangName(incoming.nganHangName);
        }
      } else {
        // Sử dụng chi nhánh mặc định
        const defaultBranch = getDefaultBranch();
        setBranch(defaultBranch);
        const defaultData = {
          customerName: "",
          contractNumber: "",
          createdAt: "",
          model: "",
          vin: "",
          engineNumber: "",
          vehicleValue: "",
          insuranceValue: "",
          insuranceContract: "",
          insuranceStart: "",
          insuranceEnd: "",
          customerAddress: "",
          showroom: defaultBranch.shortName.toUpperCase(),
        };
        setData(defaultData);
        // Initialize editable fields from default data
        setInsuranceContract(defaultData.insuranceContract);
        setInsuranceValue(defaultData.insuranceValue);
        setInsuranceStart(defaultData.insuranceStart);
        setInsuranceEnd(defaultData.insuranceEnd);
      }
      setLoading(false);
    };

    loadData();
  }, [location.state]);

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VND`;
  };

  // Helper function to convert dd/mm/yyyy to yyyy-mm-dd (for input date)
  const convertToDateInput = (dateString) => {
    if (!dateString) return "";
    // If already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // If in dd/mm/yyyy format, convert to yyyy-mm-dd
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [dd, mm, yyyy] = dateString.split("/");
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    // Try to parse as date
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // If can't parse, return empty
    }
    return "";
  };

  // Helper function to convert yyyy-mm-dd to dd/mm/yyyy (for display)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    // If already in dd/mm/yyyy format, return as is
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) return dateString;
    // If in yyyy-mm-dd format, convert to dd/mm/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [yyyy, mm, dd] = dateString.split("-");
      return `${dd}/${mm}/${yyyy}`;
    }
    // Try to parse as date
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      // If can't parse, return empty
    }
    return dateString;
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
      <div className="flex gap-6 max-w-4xl mx-auto print:max-w-4xl print:mx-auto">
        <div className="flex-1 bg-white p-8" id="printable-content">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">
                  CN {getShowroomShortName(data?.showroom).toUpperCase()} - CÔNG
                  TY
                </p>
                <p className="font-bold text-sm mb-1">
                  CP ĐẦU TƯ TM VÀ DV Ô TÔ
                </p>
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
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nganHangName}
                    onChange={(e) => setNganHangName(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-bold w-full max-w-lg focus:outline-none focus:border-blue-500"
                    placeholder="NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG"
                  />
                </span>
                <span className="hidden print:inline">{nganHangName}</span>
                <br /> –{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={recipientInfo}
                    onChange={(e) => setRecipientInfo(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-full max-w-md focus:outline-none focus:border-blue-500"
                    placeholder="TRUNG TÂM THẾ CHẤP VÙNG 9"
                  />
                </span>
                <span className="hidden print:inline">{recipientInfo}</span>
              </strong>
            </p>
          </div>

          {/* Content */}
          <div className="mb-6 text-sm space-y-4">
            <p>
              Bằng bản này :{" "}
              <strong className="uppercase">
                CN {getShowroomShortName(data?.showroom).toUpperCase()} - CÔNG
                TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN
              </strong>
            </p>

            <p>
              Địa chỉ:{" "}
              {branch
                ? branch.address
                : "Số 682A Trường Chinh, Phường 15, Tp.HCM"}
            </p>

            <p>
              Xác nhận tặng bảo hiểm vật chất xe cho khách{" "}
              <strong>{data.customerName}</strong> theo hợp đồng mua bán số{" "}
              {data.contractNumber} được kí ngày {data.createdAt}.
            </p>

            <div className="space-y-2">
              <p>
                Người được bảo hiểm: <strong>{data.customerName}</strong>
              </p>
              <p>
                Địa chỉ: <strong>{data.customerAddress || ""}</strong>
              </p>
              <p>
                Hiệu xe: <strong>{data?.model || ""}</strong>
              </p>
              <p>
                Số khung: <strong>{data?.vin || ""}</strong>
              </p>
              <p>
                Số máy: <strong>{data?.engineNumber || ""}</strong>
              </p>
              <p>
                Giá trị xe : <strong>{formatCurrency(data?.vehicleValue || "")}</strong>
              </p>
              <p>
                Giá trị hợp đồng bảo hiểm :{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={insuranceValue}
                      onChange={(e) => setInsuranceValue(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-full max-w-md focus:outline-none focus:border-blue-500"
                      placeholder={data.insuranceValue}
                    />
                  </span>
                  <span className="hidden print:inline">
                    {formatCurrency(insuranceValue || data.insuranceValue)}
                  </span>
                </strong>
              </p>
              <p>
                Số hợp đồng bảo hiểm :{" "}
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={insuranceContract}
                      onChange={(e) => setInsuranceContract(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-full max-w-md focus:outline-none focus:border-blue-500"
                      placeholder={data.insuranceContract}
                    />
                  </span>
                  <span className="hidden print:inline">
                    {insuranceContract || data.insuranceContract}
                  </span>
                </strong>
              </p>
              <p>
                Thời hạn bảo hiểm{" "}
                <strong>
                  Từ{" "}
                  <span className="print:hidden inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={startHour}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setStartHour(val);
                      }}
                      className="border-b border-gray-400 px-1 py-1 text-sm w-10 text-center focus:outline-none focus:border-blue-500"
                    />
                    <span>giờ</span>
                    <input
                      type="text"
                      value={startMinute}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setStartMinute(val);
                      }}
                      className="border-b border-gray-400 px-1 py-1 text-sm w-10 text-center focus:outline-none focus:border-blue-500"
                    />
                    <span>phút</span>
                  </span>
                  <span className="hidden print:inline">
                    {startHour || "10"} giờ {startMinute || "00"} phút
                  </span>
                  , ngày{" "}
                  <span className="print:hidden">
                    <input
                      type="date"
                      value={insuranceStart}
                      onChange={(e) => setInsuranceStart(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto max-w-md focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">
                    {formatDateDisplay(insuranceStart) || formatDateDisplay(data?.insuranceStart) || ""}
                  </span>{" "}
                  đến{" "}
                  <span className="print:hidden inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={endHour}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setEndHour(val);
                      }}
                      className="border-b border-gray-400 px-1 py-1 text-sm w-10 text-center focus:outline-none focus:border-blue-500"
                    />
                    <span>giờ</span>
                    <input
                      type="text"
                      value={endMinute}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setEndMinute(val);
                      }}
                      className="border-b border-gray-400 px-1 py-1 text-sm w-10 text-center focus:outline-none focus:border-blue-500"
                    />
                    <span>phút</span>
                  </span>
                  <span className="hidden print:inline">
                    {endHour || "09"} giờ {endMinute || "59"} phút
                  </span>
                  , ngày{" "}
                  <span className="print:hidden">
                    <input
                      type="date"
                      value={insuranceEnd}
                      onChange={(e) => setInsuranceEnd(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm font-normal w-auto max-w-md focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">
                    {formatDateDisplay(insuranceEnd) || formatDateDisplay(data?.insuranceEnd) || ""}
                  </span>
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
