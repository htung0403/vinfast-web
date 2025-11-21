import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";

const PhieuRutCoc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);

  // Editable fields
  const [soPhieu, setSoPhieu] = useState("");
  const [ngayDeNghi, setNgayDeNghi] = useState("18/11/2025");
  const [nguoiDeNghi, setNguoiDeNghi] = useState("TẠ CÔNG TRÍ");
  const [boPhan, setBoPhan] = useState("P.KD");
  const [phieuCLXX, setPhieuCLXX] = useState("PHIẾU CLXX");

  // Table rows (có thể có nhiều xe)
  const [tableRows, setTableRows] = useState([
    {
      stt: "1",
      soKhung: "RLLVFPNT9SH858285",
      soHopDong: "S00901-VSO-25-09-0039",
      model: "LIMO GREEN",
    },
    { stt: "", soKhung: "", soHopDong: "", model: "" },
    { stt: "", soKhung: "", soHopDong: "", model: "" },
    { stt: "", soKhung: "", soHopDong: "", model: "" },
  ]);

  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";

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

      // Set default date
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setNgayDeNghi(
        `${pad(today.getDate())}/${pad(
          today.getMonth() + 1
        )}/${today.getFullYear()}`
      );

      if (location.state) {
        const stateData = location.state;
        setData(stateData);

        // Auto-fill first row với dữ liệu từ location.state
        if (stateData.soKhung || stateData.contractNumber || stateData.hieuxe) {
          const newRows = [...tableRows];
          newRows[0] = {
            stt: "1",
            soKhung: stateData.soKhung || "RLLVFPNT9SH858285",
            soHopDong: stateData.contractNumber || "S00901-VSO-25-09-0039",
            model: stateData.hieuxe || "LIMO GREEN",
          };
          setTableRows(newRows);
        }
      } else {
        setData({
          contractNumber: "",
          soKhung: "",
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

  const handleRowChange = (index, field, value) => {
    const newRows = [...tableRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setTableRows(newRows);
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
          {/* Header Table */}
          <div className="mb-6">
            <table className="w-full border-2 border-black">
              <tbody>
                <tr>
                  <td
                    className="border-r-2 border-black p-2 align-middle text-center font-bold text-sm"
                    style={{ width: "30%" }}
                  >
                    CN TRƯỜNG CHINH -<br />
                    CÔNG TY CỔ PHẦN
                    <br />
                    ĐẦU TƯ TMDV Ô TÔ
                    <br />
                    ĐÔNG SÀI GÒN
                  </td>
                  <td
                    className="border-r-2 border-black p-2 align-middle text-center font-bold text-lg"
                    style={{ width: "40%" }}
                  >
                    PHIẾU ĐỀ XUẤT
                    <br />
                    <span className="text-base">RÚT PHIẾU CLXX</span>
                  </td>
                  <td
                    className="p-2 align-middle text-sm"
                    style={{ width: "30%" }}
                  >
                    <div>
                      <span>Số: </span>
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={soPhieu}
                          onChange={(e) => setSoPhieu(e.target.value)}
                          className="border-b border-gray-400 px-1 w-24 focus:outline-none focus:border-blue-500"
                        />
                      </span>
                      <span className="hidden print:inline">{soPhieu}</span>
                    </div>
                    <div className="mt-2 italic">
                      <span>Ngày đề nghị: </span>
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={ngayDeNghi}
                          onChange={(e) => setNgayDeNghi(e.target.value)}
                          className="border-b border-gray-400 px-1 w-28 focus:outline-none focus:border-blue-500"
                        />
                      </span>
                      <span className="hidden print:inline">{ngayDeNghi}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Kính gửi */}
          <div className="text-sm space-y-3 mb-4">
            <p className="italic">
              <strong>Kính gửi:</strong> - <strong>Ban Giám đốc;</strong>
            </p>
            <p className="ml-16 italic">
              - <strong>Phòng Tài chính - Kế toán.</strong>
            </p>
          </div>

          {/* Thông tin người đề nghị */}
          <div className="text-sm space-y-2 mb-4">
            <p>
              Họ và tên người đề nghị:{" "}
              <strong>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nguoiDeNghi}
                    onChange={(e) => setNguoiDeNghi(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{nguoiDeNghi}</span>
              </strong>
            </p>
            <p>
              Bộ phận:{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={boPhan}
                  onChange={(e) => setBoPhan(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{boPhan}</span>
            </p>
            <p>
              Phòng Kinh doanh đề xuất rút{" "}
              <span className="print:hidden">
                <input
                  type="text"
                  value={phieuCLXX}
                  onChange={(e) => setPhieuCLXX(e.target.value)}
                  className="border-b border-gray-400 px-2 py-1 text-sm w-32 focus:outline-none focus:border-blue-500"
                />
              </span>
              <span className="hidden print:inline">{phieuCLXX}</span> như sau:
            </p>
            <p>Thời gian dự kiến giao xe:</p>
          </div>

          {/* Table */}
          <div className="mb-6">
            <table className="w-full border-2 border-black text-sm">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="border-r border-black p-2 font-bold text-center w-12">
                    STT
                  </th>
                  <th className="border-r border-black p-2 font-bold text-center">
                    Số khung
                  </th>
                  <th className="border-r border-black p-2 font-bold text-center">
                    Số hợp đồng
                  </th>
                  <th className="p-2 font-bold text-center">Model</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr
                    key={index}
                    className={
                      index < tableRows.length - 1
                        ? "border-b border-black"
                        : ""
                    }
                  >
                    <td className="border-r border-black p-2 text-center">
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={row.stt}
                          onChange={(e) =>
                            handleRowChange(index, "stt", e.target.value)
                          }
                          className="border-b border-gray-400 px-1 w-full text-center focus:outline-none focus:border-blue-500"
                        />
                      </span>
                      <span className="hidden print:inline">{row.stt}</span>
                    </td>
                    <td className="border-r border-black p-2 text-center font-bold text-red-600">
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={row.soKhung}
                          onChange={(e) =>
                            handleRowChange(index, "soKhung", e.target.value)
                          }
                          className="border-b border-gray-400 px-1 w-full text-center focus:outline-none focus:border-blue-500 font-bold text-red-600"
                        />
                      </span>
                      <span className="hidden print:inline">{row.soKhung}</span>
                    </td>
                    <td className="border-r border-black p-2 text-center font-bold text-red-600">
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={row.soHopDong}
                          onChange={(e) =>
                            handleRowChange(index, "soHopDong", e.target.value)
                          }
                          className="border-b border-gray-400 px-1 w-full text-center focus:outline-none focus:border-blue-500 font-bold text-red-600"
                        />
                      </span>
                      <span className="hidden print:inline">
                        {row.soHopDong}
                      </span>
                    </td>
                    <td className="p-2 text-center font-bold text-red-600">
                      <span className="print:hidden">
                        <input
                          type="text"
                          value={row.model}
                          onChange={(e) =>
                            handleRowChange(index, "model", e.target.value)
                          }
                          className="border-b border-gray-400 px-1 w-full text-center focus:outline-none focus:border-blue-500 font-bold text-red-600"
                        />
                      </span>
                      <span className="hidden print:inline">{row.model}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="mt-8 mb-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-center font-bold p-4 w-1/4">
                    <p className="mb-20">Người đề nghị</p>
                  </td>
                  <td className="text-center font-bold p-4 w-1/4">
                    <p className="mb-20">TP. Kế toán</p>
                  </td>
                  <td className="text-center font-bold p-4 w-1/4">
                    <p className="mb-20">TP. Kinh doanh</p>
                  </td>
                  <td className="text-center font-bold p-4 w-1/4">
                    <p className="mb-20">Tổng Giám Đốc</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-auto text-right text-sm italic">
            <p>VinFast Đông Sài Gòn</p>
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
          In Phiếu
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

export default PhieuRutCoc;
