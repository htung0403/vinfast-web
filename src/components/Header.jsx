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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // Close menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      // Check if click is outside mobile menu AND hamburger button
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
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

  const navigationLinks = [
    { to: "/trang-chu", label: "Trang chủ" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/menu", label: "Menu" },
  ];

  return (
    <nav className="bg-primary-200 shadow-lg print:hidden">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img
              src={VinfastLogo}
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-md"
            />
            <span className="text-neutral-white text-lg sm:text-xl font-bold">
              Vinfast
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-neutral-white px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition group"
              >
                {link.label}
                <span className="pointer-events-none absolute left-[-5px] right-[-5px] top-8 h-[2px] bg-secondary-600 rounded opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
              </Link>
            ))}
            {isAuthenticated && (
              <div className="relative ml-2 lg:ml-4 lg:pl-4">
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((s) => !s)}
                    className="flex items-center gap-1 lg:gap-2 text-neutral-white px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition bg-transparent hover:bg-primary-600"
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                  >
                    <span className="hidden lg:inline">👤 </span>
                    <span className="text-xs lg:text-sm truncate max-w-[100px] lg:max-w-none">
                      {username}
                    </span>
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

          {/* Mobile Menu Button & Profile */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center gap-1 text-neutral-white px-2 py-2 rounded-md text-sm font-medium transition bg-transparent hover:bg-primary-600"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <span className="text-xs truncate max-w-[80px]">
                    {username}
                  </span>
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
            )}
            <button
              ref={hamburgerButtonRef}
              onClick={() => setMobileMenuOpen((s) => !s)}
              className="text-neutral-white p-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-primary-300"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-neutral-white px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/dang-nhap"
                  className="block text-neutral-white px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
