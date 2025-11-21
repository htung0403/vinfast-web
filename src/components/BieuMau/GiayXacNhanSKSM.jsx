import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/config";
import {
  getBranchByShowroomName,
  getDefaultBranch,
} from "../../data/branchData";

const GiayXacNhanSKSM = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);

  // Editable fields
  const [maSoThue, setMaSoThue] = useState("0316801817-002");
  const [hieuxe, setHieuxe] = useState("LIMO GREEN");
  const [soKhung, setSoKhung] = useState("RLLVFPNT9SH858285");
  const [soMay, setSoMay] = useState("");
  const [giaTriKhaiBao, setGiaTriKhaiBao] = useState("719.040.000 vnđ");
  const [customerName, setCustomerName] = useState("NGÔ NGUYÊN HOÀI NAM");
  const [customerAddress, setCustomerAddress] = useState(
    "Số 72/14 Đường tỉnh lộ 7, Ấp Bình Hạ, Thái Mỹ, Củ Chi, Tp Hồ Chí Minh"
  );
  const [customerCCCD, setCustomerCCCD] = useState(
    "Số 079 099 014 151 cấp ngày 18/12/2024  bởi Bộ Công An"
  );
  const [customerPhone, setCustomerPhone] = useState("093 412 2178");
  const [customerEmail, setCustomerEmail] = useState("hoainam191099@gmail.com");
  const [taiKhoan, setTaiKhoan] = useState("288999 – tại VP Bank");
  const [nganHangNhan, setNganHangNhan] = useState(
    "Ngân Hàng TMCP Việt Nam Thịnh Vượng – Trung tâm thế chấp vùng 9"
  );

  const formatCurrency = (amount) => {
    if (!amount) return "";
    const numericAmount =
      typeof amount === "string" ? amount.replace(/\D/g, "") : String(amount);
    if (!numericAmount) return "";
    return `${numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} vnđ`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Nếu đã là định dạng dd/mm/yyyy hoặc dd-mm-yyyy thì giữ nguyên
    if (
      dateString.includes("/") ||
      (dateString.includes("-") && dateString.split("-")[0].length <= 2)
    ) {
      return dateString;
    }
    // Nếu là ISO date (yyyy-mm-dd)
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      // Nếu không parse được, trả về nguyên bản
    }
    return dateString;
  };

  useEffect(() => {
    const loadData = async () => {
      let showroomName = location.state?.showroom || "Chi Nhánh Trường Chinh";
      let showroomLoadedFromContracts = false;

      // Nếu có firebaseKey, thử lấy showroom từ contracts trước
      if (location.state?.firebaseKey) {
        try {
          const contractId = location.state.firebaseKey;
          const contractsRef = ref(database, `contracts/${contractId}`);
          const snapshot = await get(contractsRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            console.log("Loaded from contracts:", contractData);
            if (contractData.showroom) {
              showroomName = contractData.showroom;
              showroomLoadedFromContracts = true;
              console.log("Showroom loaded from contracts:", showroomName);

              // Cập nhật branch info ngay khi load được showroom từ contracts
              const branchInfo =
                getBranchByShowroomName(showroomName) || getDefaultBranch();
              setBranch(branchInfo);

              // Set mã số thuế từ branch
              if (branchInfo && branchInfo.taxCode) {
                setMaSoThue(branchInfo.taxCode);
              }

              // Set tài khoản từ branch
              if (branchInfo && branchInfo.bankAccount) {
                setTaiKhoan(
                  `${branchInfo.bankAccount} – tại ${
                    branchInfo.bankName || "VP Bank"
                  }`
                );
              }
            }
          } else {
            console.log("Contract not found in contracts path");
          }
        } catch (error) {
          console.error("Error loading showroom from contracts:", error);
        }
      }

      // Set branch info nếu chưa load được từ contracts
      if (!showroomLoadedFromContracts) {
        const branchInfo =
          getBranchByShowroomName(showroomName) || getDefaultBranch();
        setBranch(branchInfo);

        // Set mã số thuế từ branch
        if (branchInfo && branchInfo.taxCode) {
          setMaSoThue(branchInfo.taxCode);
        }

        // Set tài khoản từ branch
        if (branchInfo && branchInfo.bankAccount) {
          setTaiKhoan(
            `${branchInfo.bankAccount} – tại ${
              branchInfo.bankName || "VP Bank"
            }`
          );
        }
      }

      // Load dữ liệu từ exportedContracts
      if (location.state?.firebaseKey) {
        try {
          const contractRef = ref(
            database,
            `exportedContracts/${location.state.firebaseKey}`
          );
          const snapshot = await get(contractRef);
          if (snapshot.exists()) {
            const contractData = snapshot.val();
            console.log("Loaded from exportedContracts:", contractData);

            // Load showroom nếu chưa có từ contracts
            if (contractData.showroom && !showroomLoadedFromContracts) {
              showroomName = contractData.showroom;
              const updatedBranchInfo =
                getBranchByShowroomName(showroomName) || getDefaultBranch();
              setBranch(updatedBranchInfo);
              if (updatedBranchInfo && updatedBranchInfo.taxCode) {
                setMaSoThue(updatedBranchInfo.taxCode);
              }
              if (updatedBranchInfo && updatedBranchInfo.bankAccount) {
                setTaiKhoan(
                  `${updatedBranchInfo.bankAccount} – tại ${
                    updatedBranchInfo.bankName || "VP Bank"
                  }`
                );
              }
            }

            // Hiệu xe
            if (
              contractData.dongXe ||
              contractData.model ||
              contractData["Dòng xe"]
            ) {
              setHieuxe(
                contractData.dongXe ||
                  contractData.model ||
                  contractData["Dòng xe"] ||
                  ""
              );
            }

            // Số khung
            if (
              contractData.soKhung ||
              contractData["Số Khung"] ||
              contractData.chassisNumber
            ) {
              setSoKhung(
                contractData.soKhung ||
                  contractData["Số Khung"] ||
                  contractData.chassisNumber ||
                  ""
              );
            }

            // Số máy
            if (
              contractData.soMay ||
              contractData["Số Máy"] ||
              contractData.engineNumber
            ) {
              setSoMay(
                contractData.soMay ||
                  contractData["Số Máy"] ||
                  contractData.engineNumber ||
                  ""
              );
            }

            // Giá trị khai báo
            if (
              contractData.giaHopDong ||
              contractData["Giá Hợp Đồng"] ||
              contractData.contractPrice ||
              contractData.giaHD ||
              contractData["Giá HD"]
            ) {
              const price =
                contractData.giaHopDong ||
                contractData["Giá Hợp Đồng"] ||
                contractData.contractPrice ||
                contractData.giaHD ||
                contractData["Giá HD"] ||
                "";
              if (price) {
                setGiaTriKhaiBao(formatCurrency(price.toString()));
              }
            }

            // Thông tin khách hàng
            // Tên khách hàng
            if (
              contractData.customerName ||
              contractData["Tên KH"] ||
              contractData["Tên Kh"]
            ) {
              setCustomerName(
                contractData.customerName ||
                  contractData["Tên KH"] ||
                  contractData["Tên Kh"] ||
                  ""
              );
            }

            // Địa chỉ khách hàng
            if (
              contractData.address ||
              contractData["Địa Chỉ"] ||
              contractData["Địa chỉ"]
            ) {
              setCustomerAddress(
                contractData.address ||
                  contractData["Địa Chỉ"] ||
                  contractData["Địa chỉ"] ||
                  ""
              );
            }

            // Email
            if (contractData.email || contractData.Email) {
              setCustomerEmail(contractData.email || contractData.Email || "");
            }

            // Điện thoại
            if (
              contractData.phone ||
              contractData["Số Điện Thoại"] ||
              contractData["Số điện thoại"]
            ) {
              setCustomerPhone(
                contractData.phone ||
                  contractData["Số Điện Thoại"] ||
                  contractData["Số điện thoại"] ||
                  ""
              );
            }

            // CCCD - format với ngày cấp và nơi cấp
            const cccdNumber =
              contractData.cccd ||
              contractData.CCCD ||
              contractData.customerCCCD ||
              "";
            const ngayCap =
              contractData.ngayCap ||
              contractData.issueDate ||
              contractData["Ngày Cấp"] ||
              contractData["Ngày cấp"] ||
              "";
            const noiCap =
              contractData.noiCap ||
              contractData.issuePlace ||
              contractData["Nơi Cấp"] ||
              contractData["Nơi cấp"] ||
              "";

            if (cccdNumber) {
              let cccdFormatted = `Số ${cccdNumber}`;
              if (ngayCap) {
                cccdFormatted += ` cấp ngày ${formatDate(ngayCap)}`;
              }
              if (noiCap) {
                cccdFormatted += `  bởi ${noiCap}`;
              }
              setCustomerCCCD(cccdFormatted);
            }
          }
        } catch (error) {
          console.error(
            "Error loading contract data from exportedContracts:",
            error
          );
        }
      }

      if (location.state) {
        const stateData = location.state;
        setData(stateData);

        // Auto-fill từ location.state nếu có (override database nếu cần)
        if (stateData.soKhung) setSoKhung(stateData.soKhung);
        if (stateData.soMay) setSoMay(stateData.soMay);
        if (stateData.hieuxe) setHieuxe(stateData.hieuxe);
        if (stateData.customerName) setCustomerName(stateData.customerName);
        if (stateData.customerAddress)
          setCustomerAddress(stateData.customerAddress);
        if (stateData.customerCCCD) setCustomerCCCD(stateData.customerCCCD);
        if (stateData.customerPhone) setCustomerPhone(stateData.customerPhone);
        if (stateData.customerEmail) setCustomerEmail(stateData.customerEmail);
        if (stateData.contractPrice)
          setGiaTriKhaiBao(formatCurrency(stateData.contractPrice));
      } else {
        // Default data structure
        setData({
          contractNumber: "",
          contractDate: "",
          customerName: "",
          customerAddress: "",
          soKhung: "",
          soMay: "",
          hieuxe: "",
          contractPrice: "",
        });
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
          {/* Header */}
          <div className="mb-6">
            <table className="w-full border-2 border-black">
              <tbody>
                <tr>
                  {/* Left Column - Company info */}
                  <td
                    className="border-r-2 border-black p-3 align-top"
                    style={{ width: "50%" }}
                  >
                    <div className="text-sm leading-relaxed">
                      <span className="font-bold text-red-600 mb-2">
                        CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG
                        SÀI GÒN- CHI NHÁNH{" "}
                        {branch?.shortName?.toUpperCase() || "TRƯỜNG CHINH"}
                      </span>
                      <p className="font-bold text-red-600">
                        {branch?.address ||
                          "682A Trường Chinh, Phường 15, Tân Bình, Hồ Chí Minh"}
                      </p>
                    </div>
                  </td>

                  {/* Right Column - Title */}
                  <td
                    className="p-3 align-middle text-center"
                    style={{ width: "50%" }}
                  >
                    <div className="font-bold text-xs">
                      <p className="mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="mt-4">Độc Lập – Tự Do – Hạnh Phúc</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase mb-4">GIẤY XÁC NHẬN</h1>
          </div>

          {/* Main Content */}
          <div className="text-sm space-y-3">
            {/* Kính gửi */}
            <p>
              <strong>
                Kính gửi:{" "}
                <span className="print:hidden">
                  <input
                    type="text"
                    value={nganHangNhan}
                    onChange={(e) => setNganHangNhan(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-full max-w-xl focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{nganHangNhan}</span>
              </strong>
            </p>

            {/* Bên bán */}
            <div className="space-y-1">
              <p>
                <strong className="text-red-600">BÊN BÁN</strong>
                <span className="ml-4">: </span>
                <strong className="text-red-600">
                  CHI NHÁNH {branch?.shortName?.toUpperCase() || "TRƯỜNG CHINH"}
                  -CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ
                </strong>
              </p>
              <p>
                <strong className="text-red-600">
                  DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN
                </strong>
              </p>
              <p>
                <span>Địa chỉ</span>
                <span className="ml-12">
                  :{" "}
                  {branch?.address ||
                    "682A Trường Chinh, Phường Tân Bình, Tp Hồ Chí Minh"}
                </span>
              </p>
              <p>
                <span>Đại diện bởi</span>
                <span className="ml-4">: </span>
                <strong>Ông Nguyễn Thành Trai</strong>
                <span className="ml-8">Chức vụ : </span>
                <strong>Tổng Giám đốc</strong>
              </p>
              <p>
                <span>Tài khoản</span>
                <span className="ml-8">: </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={taiKhoan}
                    onChange={(e) => setTaiKhoan(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{taiKhoan}</span>
              </p>
            </div>

            {/* Bên mua */}
            <div className="space-y-1 mt-4">
              <p>
                <strong>BÊN MUA</strong>
                <span className="ml-8">: </span>
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-96 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{customerName}</span>
                </strong>
              </p>
              <p>
                <span>Địa chỉ</span>
                <span className="ml-12">: </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-full focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{customerAddress}</span>
              </p>
              <p>
                <span>CCCD</span>
                <span className="ml-14">: </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={customerCCCD}
                    onChange={(e) => setCustomerCCCD(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-full focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{customerCCCD}</span>
              </p>
              <p>
                <span>Điện thoại</span>
                <span className="ml-8">: </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{customerPhone}</span>
              </p>
              <p>
                <span>Email</span>
                <span className="ml-14">: </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{customerEmail}</span>
              </p>
            </div>

            {/* Mã số thuế */}
            <p className="mt-3">
              <strong>Mã số thuế</strong>
              <span className="ml-4">: </span>
              <strong className="text-red-600">
                <span className="print:hidden">
                  <input
                    type="text"
                    value={maSoThue}
                    onChange={(e) => setMaSoThue(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{maSoThue}</span>
              </strong>
              <p className="text-sm mt-2">
                Bên Bán xác nhân Bên Mua có mua 1 chiếc ô tô của Bên Bán
              </p>
            </p>

            {/* Thông tin xe */}
            <div className="space-y-1 mt-4">
              <p>
                <span className="ml-12">Hiệu xe</span>
                <span className="ml-8">: </span>
                <strong>
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={hieuxe}
                      onChange={(e) => setHieuxe(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{hieuxe}</span>
                </strong>
              </p>
              <p>
                <span className="ml-12">Số khung</span>
                <span className="ml-8">: </span>
                <strong className="text-red-600">
                  <span className="print:hidden">
                    <input
                      type="text"
                      value={soKhung}
                      onChange={(e) => setSoKhung(e.target.value)}
                      className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                    />
                  </span>
                  <span className="hidden print:inline">{soKhung}</span>
                </strong>
              </p>
              <p>
                <span className="ml-12">Số máy</span>
                <span className="ml-10">: </span>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={soMay}
                    onChange={(e) => setSoMay(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{soMay}</span>
              </p>
            </div>

            {/* Giá trị khai báo */}
            <p className="mt-4">
              <span>Giá trị khai báo</span>
              <span className="ml-4">: </span>
              <strong>
                <span className="print:hidden">
                  <input
                    type="text"
                    value={giaTriKhaiBao}
                    onChange={(e) => setGiaTriKhaiBao(e.target.value)}
                    className="border-b border-gray-400 px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
                  />
                </span>
                <span className="hidden print:inline">{giaTriKhaiBao}</span>
              </strong>
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-12 mb-8">
            <div className="text-right mr-16">
              <p className="font-bold text-sm mb-20">ĐẠI DIỆN BÊN BÁN</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 w-full text-right mr-16 border-t border-black print:mt-auto print:pt-4">
            <p className="text-sm italic">
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
          In Giấy Xác Nhận
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

export default GiayXacNhanSKSM;
