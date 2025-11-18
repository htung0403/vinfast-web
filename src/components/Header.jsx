import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import VinfastLogo from "../assets/vinfast.svg";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const username = localStorage.getItem("username") || "User";
  const userRole = localStorage.getItem("userRole") || "user";
  const userTeam = localStorage.getItem("userTeam") || "";

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userTeam");
    navigate("/dang-nhap");
  };

  // Don't show navigation on login page
  if (location.pathname === "/dang-nhap") {
    return null;
  }

  return (
    <nav className="bg-primary-200 shadow-lg print:hidden">
      <div className="mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <img
              src={VinfastLogo}
              alt="Logo"
              className="h-10 w-10 rounded-full shadow-md"
            />
            <span className="text-neutral-white text-xl font-bold">
              Vinfast
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/trang-chu"
              className="relative text-neutral-white px-3 py-2 rounded-md text-sm font-medium transition group"
            >
              Trang chủ
              <span className="pointer-events-none absolute left-[-5px] right-[-5px] top-8 h-[2px] bg-secondary-600 rounded opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </Link>
            <Link
              to="/dashboard"
              className="relative text-neutral-white px-3 py-2 rounded-md text-sm font-medium transition group"
            >
              Dashboard
              <span className="pointer-events-none absolute left-[-5px] right-[-5px] top-8 h-[2px] bg-secondary-600 rounded opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </Link>
            <Link
              to="/menu"
              className="relative text-neutral-white px-3 py-2 rounded-md text-sm font-medium transition group"
            >
              Menu
              <span className="pointer-events-none absolute left-[-5px] right-[-5px] top-8 h-[2px] bg-secondary-600 rounded opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </Link>
            {isAuthenticated && (
              <div className="relative ml-4 pl-4">
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((s) => !s)}
                    className="flex items-center gap-2 text-neutral-white px-3 py-2 rounded-md text-sm font-medium transition bg-transparent hover:bg-primary-600"
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                  >
                    <span>👤 {username}</span>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                      <Link
                        to="/ho-so"
                        className="block px-4 py-2 text-sm text-primary-900 hover:bg-primary-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Hồ sơ
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
