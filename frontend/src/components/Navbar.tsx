import { Link, NavLink, useNavigate } from "react-router-dom";
import { theme } from "../theme";
import logo from "../assets/logo-ums.png";
import { useEffect, useState } from "react";

const navLinkClass =
  "px-4 py-2 rounded-full text-base font-medium hover:bg-white/20 transition-colors";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    const handleStorageChange = () => {
      const newToken = localStorage.getItem("accessToken");
      setIsLoggedIn(!!newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    navigate("/");
  }

  return (
    <header
      style={{ backgroundColor: theme.colors.primary }}
      className="shadow-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-white">
        {/* Logo + Nama */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo Universitas Muhammadiyah Surakarta"
            className="h-10 w-10 bg-white rounded-full p-1"
          />
          <div className="leading-tight">
            <div className="text-sm uppercase tracking-wider opacity-90">
              Universitas Muhammadiyah Surakarta
            </div>
            <div className="text-xl font-bold">Talenta Mahasiswa UMS</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/talents" className={navLinkClass}>
                Cari Talenta
              </NavLink>

              <button
                onClick={handleLogout}
                className={`${navLinkClass} hover:bg-white/30`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={navLinkClass}>
                Beranda
              </NavLink>

              <NavLink to="/talents" className={navLinkClass}>
                Daftar Talenta
              </NavLink>

              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={`${navLinkClass} bg-white font-semibold`}
                style={{ color: theme.colors.primary }}
              >
                Daftar Mahasiswa
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
