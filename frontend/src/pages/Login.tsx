import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Base URL (Sesuai kode lama)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const UMS_BLUE = "#1e293b"; // Warna tema profesional

export function Login() {
  const navigate = useNavigate();
  
  // State Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  // --- LOGIKA LOGIN (DIPERBAIKI SESUAI KODE LAMA) ---
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // PERBAIKAN URL: Tambahkan /auth/ di tengah
      const res = await axios.post(`${API_BASE_URL}/api/accounts/auth/login/`, {
        email,
        password,
      });

      // Ambil token dari respon
      const { access, refresh } = res.data;

      // Simpan token (Sesuai kode lama)
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      
      // Trigger event agar komponen lain tahu user sudah login (Opsional tapi bagus)
      window.dispatchEvent(new Event("authChanged"));
      
      // Redirect ke dashboard
      navigate("/dashboard");
      
    } catch (err: any) {
      console.error("Login Gagal:", err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          const messages = Object.values(data)
            .map((msg: any) => (Array.isArray(msg) ? msg.join(" ") : String(msg)))
            .join(" | ");
          setError(messages || "Email atau password salah. Silakan coba lagi.");
        }
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc', // Background bersih
      padding: '20px'
    }}>
      
      <div style={{ 
        backgroundColor: 'white', 
        width: '80%', 
        maxWidth: '450px', 
        padding: '48px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
        border: '1px solid #f1f5f9'
      }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Login Mahasiswa
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Masuk untuk mengelola profil talenta Anda
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', border: '1px solid #fee2e2', 
            color: '#ef4444', padding: '12px', borderRadius: '12px', 
            fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' 
          }}>
            {error}
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* INPUT EMAIL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Email / Identitas
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusEmail ? UMS_BLUE : '#94a3b8', transition: 'color 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
              <input
                type="email" // Tipe email agar validasi jalan
                required
                placeholder="nim@student.ums.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px', // Padding kiri besar
                  borderRadius: '12px',
                  border: `1px solid ${focusEmail ? UMS_BLUE : '#cbd5e1'}`,
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  backgroundColor: focusEmail ? 'white' : '#f8fafc'
                }}
              />
            </div>
          </div>

          {/* INPUT PASSWORD */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusPassword ? UMS_BLUE : '#94a3b8', transition: 'color 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <input
                type="password"
                required
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusPassword(true)}
                onBlur={() => setFocusPassword(false)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  border: `1px solid ${focusPassword ? UMS_BLUE : '#cbd5e1'}`,
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  backgroundColor: focusPassword ? 'white' : '#f8fafc'
                }}
              />
            </div>
          </div>

          {/* TOMBOL LOGIN */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: UMS_BLUE,
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)',
              transition: 'background-color 0.2s, transform 0.1s'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0f172a')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = UMS_BLUE)}
          >
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>

        </form>

        {/* LINK DAFTAR */}
        <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b', fontSize: '0.95rem' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: UMS_BLUE, fontWeight: '600', textDecoration: 'none' }}>
            Daftar di sini
          </Link>
        </p>

      </div>
    </main>
  );
}