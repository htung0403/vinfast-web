import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBranchByShowroomName, getDefaultBranch } from "../../data/branchData";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";

const GiayXacNhan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState(
    "Trung tâm thế chấp vùng 9"
  );
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    const loadShowroom = async () => {
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
          console.error("Error loading showroom from contracts:", err);
        }
      }
      
      // Lấy thông tin chi nhánh
      const branchInfo = getBranchByShowroomName(showroomName) || getDefaultBranch();
      setBranch(branchInfo);

      if (location.state) {
        const incoming = location.state;
        const processedData = {
          customerName: incoming.customerName || incoming["Tên Kh"] || incoming["Tên KH"] || "",
          phone: incoming.phone || incoming["Số Điện Thoại"] || "",
          address: incoming.address || incoming["Địa Chỉ"] || "",
          cccd: incoming.cccd || incoming.CCCD || "",
          issueDate: incoming.issueDate || incoming.ngayCap || incoming["Ngày Cấp"] || "",
          issuePlace: incoming.issuePlace || incoming.noiCap || incoming["Nơi Cấp"] || "",
          model: incoming.model || incoming.dongXe || incoming["Dòng xe"] || "",
          contractPrice: incoming.contractPrice || incoming.giaHD || incoming["Giá Hợp Đồng"] || incoming.giaHopDong || "",
          soKhung:
            incoming.soKhung ||
            incoming["Số Khung"] ||
            incoming.chassisNumber ||
            incoming.vin ||
            "",
          soMay:
            incoming.soMay || incoming["Số Máy"] || incoming.engineNumber || "",
          Email: incoming.Email || incoming.email || "",
          representativeName: incoming.representativeName || incoming.tvbh || incoming.TVBH || "",
        };
        setData(processedData);
        if (incoming.recipientInfo) {
          setRecipientInfo(incoming.recipientInfo);
        }
      } else {
        // Dữ liệu mẫu
        setData({
          customerName: "Ông Ma Văn Thuận",
          phone: "0879333668",
          address: "Thôn Tổng Moọc, Yên Lập, Chiêm Hóa, Tuyên Quang",
          cccd: "008094007264",
          issueDate: "21/01/2025",
          issuePlace: "Bộ Công An",
          model: "VINFAST VF 5",
          contractPrice: "540000000",
          soKhung: "",
          soMay: "",
          Email: "",
          representativeName: "",
        });
      }
      setLoading(false);
    };
    
    loadShowroom();
  }, [location.state]);

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

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);

    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} vnđ`;
  };

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
          <p className="text-red-600 mb-4">Không có dữ liệu hợp đồng</p>
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
        <div className="flex-1 bg-white" id="printable-content">
          {/* Header */}
          <div className="mb-4">
            <div className="border-2 border-black">
              <div className="flex">
                {/* Bên trái - Thông tin công ty */}
                <div className="flex-1 border-r-2 border-black p-2">
                  <p className="text-[10px] font-bold uppercase leading-tight mb-0.5">
                    CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ
                  </p>
                  <p className="text-[10px] font-bold uppercase leading-tight mb-0.5">
                    ĐÔNG SÀI GÒN - CHI NHÁNH {branch ? branch.shortName.toUpperCase() : "TRƯỜNG CHINH"}
                  </p>
                  <p className="text-[10px] font-bold leading-tight">
                    {branch ? branch.address : "682A Trương Chinh, Phường 15, Tân Bình, Hồ Chí Minh"}
                  </p>
                </div>

                {/* Bên phải - Quốc hiệu */}
                <div className="flex-1 text-center p-2 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase leading-tight">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="text-[10px] font-bold leading-tight">
                    Độc Lập – Tự Do – Hạnh Phúc
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-center mb-4">GIẤY XÁC NHẬN</h1>

          {/* Recipient */}
          <p className="text-sm mb-3">
            <span className="font-bold">
              Kính gửi: Ngân Hàng TMCP Việt Nam Thịnh Vượng –{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm font-bold w-full max-w-md focus:outline-none focus:border-blue-500"
                  placeholder="Trung tâm thế chấp vùng 9"
                />
              </span>
              <span className="hidden print:inline">{recipientInfo}</span>
            </span>
          </p>

          {/* Company Information - Bên Bán */}
          <div className="mb-3 text-sm text-red-600">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-0.5 font-bold w-20 align-top underline">
                    BÊN BÁN
                  </td>
                  <td className="py-0.5 w-4 text-center align-top">:</td>
                  <td className="py-0.5 font-bold">
                    CHI NHÁNH {branch ? branch.shortName.toUpperCase() : "TRƯỜNG CHINH"}-CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH
                    VỤ Ô TÔ ĐÔNG SÀI GÒN
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Địa chỉ</td>
                  <td className="py-0.5 text-center align-top">:</td>
                  <td className="py-0.5">
                    {branch ? branch.address : "682A Trường Chinh, Phường Tân Bình, Tp Hồ Chí Minh"}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Đại diện bởi</td>
                  <td className="py-0.5 text-center align-top">:</td>
                  <td className="py-0.5">
                    <strong>
                      Ông {branch ? branch.representativeName : "Nguyễn Thành Trai"}
                    </strong>{" "}
                    <span className="font-bold ml-10">
                      Chức vụ : {branch ? branch.position : "Tổng Giám đốc"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tài khoản</td>
                  <td className="py-0.5 text-center align-top">:</td>
                  <td className="py-0.5">{branch ? `${branch.bankAccount} – tại ${branch.bankName}` : "288999 – tại VP Bank"}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Mã số thuế</td>
                  <td className="py-0.5 text-center align-top">:</td>
                  <td className="py-0.5">{branch ? branch.taxCode : "0316801817-002"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Customer Information */}
          <div className="mb-3">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-0.5 font-semibold w-24">BÊN MUA</td>
                  <td className="py-0.5 font-bold">: {data.customerName}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Địa chỉ</td>
                  <td className="py-0.5">: {data.address}</td>
                </tr>
                <tr>
                  <td className="py-0.5">CCCD</td>
                  <td className="py-0.5">
                    : {data.cccd} cấp ngày {formatDate(data.issueDate)} bởi{" "}
                    {data.issuePlace}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5">Điện thoại</td>
                  <td className="py-0.5">: {data.phone}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Email</td>
                  <td className="py-0.5">
                    : {data.Email}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Purchase Information */}
          <p className="text-sm mb-2">
            Bên Bán xác nhận Bên Mua có mua 1 chiếc ô tô của Bên Bán :
          </p>

          <div className="mb-4">
            <table className="w-full text-sm border border-black">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 w-32">
                    Hiệu xe
                  </td>
                  <td className="border border-black px-2 py-1 w-8 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-1 uppercase">
                    {data.model || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1">Số khung</td>
                  <td className="border border-black px-2 py-1 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-1 uppercase font-bold text-red-600">
                    {data.soKhung || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1">Số máy</td>
                  <td className="border border-black px-2 py-1 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-1">
                    {data.soMay || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1">
                    Giá trị khai báo
                  </td>
                  <td className="border border-black px-2 py-1 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-1 font-semibold">
                    {formatCurrency(data.contractPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature */}
          <div className="text-right mt-8">
            <p className="text-sm font-bold mb-8">ĐẠI DIỆN BÊN BÁN</p>
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
            padding: 10mm 15mm 8mm 15mm;
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
          
          table {
            page-break-inside: avoid;
          }
          
          h1 {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
          }

          /* Đảm bảo header hiển thị đầy đủ khi in */
          #printable-content .border-2 {
            border: 2px solid black !important;
          }
          
          #printable-content .flex > div {
            min-height: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          #printable-content .text-\\[10px\\] {
            font-size: 10px !important;
            line-height: 1.2;
          }
        }

        /* CSS cho màn hình */
        .text-\\[10px\\] {
          font-size: 10px;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
};

export default GiayXacNhan;
