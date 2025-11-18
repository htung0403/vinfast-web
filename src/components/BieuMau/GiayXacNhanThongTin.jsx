import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBranchByShowroomName } from "../../data/branchData";

const GiayXacNhanThongTin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get shortName from showroom
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
      const processedData = {
        contractNumber: incoming.vso || "S00901-VSO-24-10-0042",
        customerName: incoming.customerName || incoming["Tên KH"] || "BÙI THỊ KIM OANH",
        contractDate: incoming.contractDate || incoming.createdAt || "2022-10-08",
        model: incoming.model || incoming.dongXe || "VINFAST VF5",
        variant: incoming.variant || "VF 5",
        showroom: incoming.showroom || "Chi Nhánh Trường Chinh",
      };
      setData(processedData);
    } else {
      setData({
        contractNumber: "S00901-VSO-24-10-0042",
        customerName: "BÙI THỊ KIM OANH",
        contractDate: "2022-10-08",
        model: "VINFAST VF5",
        variant: "S",
        showroom: "Chi Nhánh Trường Chinh",
      });
    }
    setLoading(false);
  }, [location.state]);

  const formatDate = (dateStr) => {
    if (!dateStr) return { formatted: "08 tháng 10 năm 2024" };
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { formatted: "08 tháng 10 năm 2024" };
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return {
        formatted: `${day} tháng ${month} năm ${year}`
      };
    } catch {
      return { formatted: "08 tháng 10 năm 2024" };
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "08/10/2024";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "08/10/2024";
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return "08/10/2024";
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: 'Times New Roman' }}>
        <div className="text-center">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: 'Times New Roman' }}>
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

  const dateInfo = formatDate(data.contractDate);

  return (
    <div className="min-h-screen bg-white p-8" style={{ fontFamily: 'Times New Roman' }}>
      <div className="max-w-4xl mx-auto bg-white" id="printable-content">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold mb-2">GIẤY XÁC NHẬN THÔNG TIN</h1>
          <p className="text-sm mb-8">Áp dụng đối với trường hợp cần xác nhận thông tin PTVT</p>
        </div>

        {/* Nội dung */}
        <div className="space-y-6 text-sm">
          {/* Đoạn văn bản */}
          <div className="space-y-4">
            <p>
              Căn cứ vào Hợp đồng mua bán số <strong>{data.contractNumber}</strong> giữa <strong>CHI NHÁNH {getShowroomShortName(data?.showroom).toUpperCase()}-CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN</strong> và Ông/Bà <strong>{data.customerName}</strong> về việc thỏa thuận ký kết hợp đồng mua bán xe ngày {formatDateShort(data.contractDate)}
            </p>
            
            <p>
              Xác nhận ô tô trong hợp đồng mua bán nêu trên và một số thông tin bên dưới là cùng một số loại xe của nhà sản xuất.
            </p>
          </div>

          {/* Bảng thông tin */}
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1">STT</th>
                <th className="border border-black px-2 py-1">Đặc điểm của xe</th>
                <th className="border border-black px-2 py-1">Thông tin trên HĐMB và nghị quyết</th>
                <th className="border border-black px-2 py-1">Thông tin trên TBPD</th>
                <th className="border border-black px-2 py-1">Thông tin trên giấy xác nhận SK, SM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 text-center">1</td>
                <td className="border border-black px-2 py-1">Số Loại (Model Code)</td>
                <td className="border border-black px-2 py-1">VINFAST {data.model} {data.variant}</td>
                <td className="border border-black px-2 py-1">VINFAST, {data.model} {data.variant}</td>
                <td className="border border-black px-2 py-1">{data.model} {data.variant}</td>
              </tr>
            </tbody>
          </table>

          {/* Cam kết trách nhiệm */}
          <p className="mt-6">
            Tôi hoàn toàn chịu trách nhiệm cho các xác nhận nêu trên, trong trường hợp phát hiện ra các sai phạm và gây thiệt hại cho VPBank sẽ chịu mọi hình thức xử lý kỷ luật theo quy định của VPBank từng thời kỳ.
          </p>

          {/* Ngày tháng và chữ ký */}
          <div className="mt-12">
            <p className="text-right mb-4">TP. Hồ Chí Minh, Ngày {dateInfo.formatted}</p>
            <div className="text-justify w-[280px] ml-auto">
              <p className="font-bold">CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN - CHI NHÁNH {getShowroomShortName(data?.showroom).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
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
          In Giấy Xác Nhận
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 20mm;
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

export default GiayXacNhanThongTin;