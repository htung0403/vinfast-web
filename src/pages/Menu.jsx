import { Link } from 'react-router-dom';
import { Users, FileText, Briefcase, DollarSign, FileCheck } from 'lucide-react';
import VinfastLogo from '../assets/vinfast.svg';

export default function Menu() {
  const cards = [
    { to: '/nhan-su', label: 'Nhân sự', color: 'primary', icon: Users, isExternal: false },
    { to: '/hop-dong', label: 'Hợp đồng', color: 'secondary', icon: FileText, isExternal: false },
    { to: '/hop-dong-da-xuat', label: 'Hợp đồng đã xuất', color: 'accent', icon: FileCheck, isExternal: false },
    { to: '/quan-ly-khach-hang', label: 'Khách hàng', color: 'accent', icon: Briefcase, isExternal: false },
    { to: '/bao-gia', label: 'Báo giá', color: 'primary', icon: DollarSign, isExternal: false },
  ];

  return (
    <div className="max-w mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-slate-50 to-slate-300 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 text-center sm:text-left">
        <div className="relative flex-shrink-0">
          <img
            src={VinfastLogo}
            alt="Vinfast Logo"
            className="h-12 w-12 drop-shadow-md"
          />
          <div className="absolute inset-0 bg-slate-200/20 rounded-full blur-md scale-110 -z-10"></div>
        </div>
        <div className="flex-grow">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Bảng Điều Khiển</h1>
          <p className="text-gray-600 mt-1">Truy cập nhanh các chức năng quản lý</p>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const CardContent = (
            <div
              className="group relative overflow-hidden rounded-xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Content */}
              <div className="relative flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                  <Icon className="h-5 w-5 text-gray-700" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{card.label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Quản lý và theo dõi {card.label.toLowerCase()}</p>
                </div>
              </div>
            </div>
          );

          return card.isExternal ? (
            <a
              key={card.to}
              href={card.to}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CardContent}
            </a>
          ) : (
            <Link key={card.to} to={card.to}>
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}