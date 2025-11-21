import { useEffect, useState } from "react";
import VinfastLogo from "../assets/vinfast.svg";

function Home() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <img
            src={VinfastLogo}
            alt="VinFast Logo"
            className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-700">
              Báo giá & Cấu hình xe VinFast
            </h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1 sm:mt-2">{currentDate}</p>
          </div>
        </div>
      </div>

      {/* Models / Quick Quote Section */}
      <div className="bg-neutral-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4">
          Nhận báo giá nhanh cho các mẫu xe nổi bật
        </h2>
        <p className="text-sm sm:text-base text-secondary-600 mb-3 sm:mb-4">
          Chọn mẫu xe, cấu hình và gói dịch vụ để nhận báo giá chi tiết, bao gồm chi
          phí lăn bánh và các chương trình ưu đãi.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-4 sm:mt-6">
          <div className="bg-primary-50 p-4 sm:p-5 lg:p-6 rounded-lg border-l-4 border-primary-500">
            <h3 className="text-base sm:text-lg font-semibold text-primary-700 mb-2">VF e34</h3>
            <p className="text-xs sm:text-sm text-secondary-600">SUV điện đô thị, phù hợp di chuyển hàng ngày.</p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-secondary-600">Từ 750.000.000 VNĐ</p>
          </div>
          <div className="bg-primary-50 p-4 sm:p-5 lg:p-6 rounded-lg border-l-4 border-primary-500">
            <h3 className="text-base sm:text-lg font-semibold text-primary-700 mb-2">VF 8</h3>
            <p className="text-xs sm:text-sm text-secondary-600">SUV cỡ lớn, tầm hoạt động dài, tiện nghi cao cấp.</p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-secondary-600">Từ 1.200.000.000 VNĐ</p>
          </div>
          <div className="bg-primary-50 p-4 sm:p-5 lg:p-6 rounded-lg border-l-4 border-primary-500 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-primary-700 mb-2">VF 9</h3>
            <p className="text-xs sm:text-sm text-secondary-600">Flagship - công nghệ tiên tiến, trải nghiệm hạng sang.</p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-secondary-600">Liên hệ để nhận báo giá</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-neutral-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4">Dịch vụ & Ưu đãi</h2>
        <ul className="space-y-2 sm:space-y-3">
          <li className="flex items-start">
            <span className="text-primary-700 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
            <div className="text-sm sm:text-base">
              <strong className="text-secondary-900">Bảo hành & Hậu mãi:</strong>
              <span className="text-secondary-600"> 5 năm / 100.000 km cho xe điện.</span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary-700 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
            <div className="text-sm sm:text-base">
              <strong className="text-secondary-900">Gói tài chính:</strong>
              <span className="text-secondary-600"> Hỗ trợ vay ưu đãi cùng ngân hàng đối tác.</span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary-700 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
            <div className="text-sm sm:text-base">
              <strong className="text-secondary-900">Lắp đặt & Giao xe:</strong>
              <span className="text-secondary-600"> Dịch vụ giao xe tận nơi và đăng ký biển số.</span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary-700 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
            <div className="text-sm sm:text-base">
              <strong className="text-secondary-900">Ưu đãi khách hàng thân thiết:</strong>
              <span className="text-secondary-600"> Ưu đãi đặc biệt cho khách hàng doanh nghiệp và đại lý.</span>
            </div>
          </li>
        </ul>
      </div>

      {/* CTA Section */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-primary-500 to-accent-ocean rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-white mb-3 sm:mb-4">Nhận báo giá ngay</h2>
        <p className="text-sm sm:text-base text-neutral-white mb-4 sm:mb-6">Chọn mẫu xe và cấu hình để nhận báo giá chi tiết trong 24h.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <a
            href="/bang-gia"
            className="inline-block bg-neutral-white text-primary-700 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:brightness-95 transition shadow-md text-sm sm:text-base text-center"
          >
            � Xem bảng giá
          </a>
          <a
            href="/lien-he"
            className="inline-block bg-neutral-white text-primary-700 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:brightness-95 transition shadow-md text-sm sm:text-base text-center"
          >
            ✉️ Liên hệ tư vấn
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
