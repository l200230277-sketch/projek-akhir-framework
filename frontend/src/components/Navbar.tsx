import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo-ums.png"; // Import logo sesuai kode awalmu

// Warna Tema (Biru Dongker UMS - disesuaikan agar elegan)
const UMS_BLUE = "#1e293b"; 

export function Navbar() {
  const navigate = useNavigate();
  // Cek status login dari localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));

  // Listener untuk update status login otomatis (tanpa refresh)
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("accessToken"));
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    }
  }

  // Style untuk Link Navigasi
  const navLinkStyle: React.CSSProperties = {
    color: '#cbd5e1', // Abu-abu terang agar kontras dengan biru dongker
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
    cursor: 'pointer'
  };

  return (
    <nav style={{ 
      backgroundColor: UMS_BLUE, 
      color: 'white', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Shadow halus
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      
      {/* CONTAINER UTAMA (Kunci agar tidak mepet pinggir) */}
      <div style={{ 
        maxWidth: '1200px', // Lebar maksimal konten
        margin: '0 auto',   // Posisi di tengah layar
        padding: '12px 24px', // Jarak dalam agar logo ga nempel tepi
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        
        {/* BAGIAN KIRI: LOGO & JUDUL */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo dari Import */}
          <img 
            src={logo} 
            alt="Logo UMS" 
            style={{ height: '48px', width: 'auto' }} 
            onError={(e) => e.currentTarget.style.display = 'none'} 
          />
          
          {/* Teks Judul Vertikal (Lebih Profesional) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, color: '#94a3b8' }}>
              Universitas Muhammadiyah Surakarta
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
              Talenta Mahasiswa UMS
            </span>
          </div>
        </Link>

        {/* BAGIAN KANAN: MENU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          
          {/* Menu Umum */}
          <Link to="/" style={navLinkStyle} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}>
            Beranda
          </Link>
          
          <Link to="/talents" style={navLinkStyle} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}>
            Daftar Talenta
          </Link>
          
          {/* Kondisi Login / Logout */}
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" style={navLinkStyle} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                style={{ 
                  backgroundColor: 'white', 
                  color: UMS_BLUE, 
                  padding: '8px 20px', 
                  borderRadius: '99px', 
                  fontWeight: '700', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'; }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link to="/login" style={navLinkStyle} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                Login
              </Link>
              <Link 
                to="/register" 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                Daftar Mahasiswa
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}