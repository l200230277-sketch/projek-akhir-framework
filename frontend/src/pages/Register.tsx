import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Definisi Base URL dan Warna Tema
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const UMS_BLUE = "#1e293b"; // Warna biru dongker profesional UMS

export function Register() {
  const navigate = useNavigate();
  
  // State untuk data form
  const [user_full_name, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State untuk UI (Loading & Error)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi Handler Submit Form
  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const yearMax = 2026;
    // Validasi sederhana email UMS
    if (!email.endsWith("@student.ums.ac.id")) {
      setError("Gunakan email resmi @student.ums.ac.id sesuai aturan kampus.");
      setLoading(false);
      return;
    }
    // Validasi angkatan: hanya angka 4 digit dan maksimal yearMax
    const angkatanTrim = angkatan.trim();
    if (angkatanTrim.length !== 4 || !/^\d{4}$/.test(angkatanTrim)) {
      setError("Angkatan harus 4 digit angka.");
      setLoading(false);
      return;
    }
    if (parseInt(angkatanTrim, 10) > yearMax) {
      setError(`Angkatan maksimal ${yearMax}.`);
      setLoading(false);
      return;
    }

    try {
      // PERBAIKAN PENTING: Tambahkan /auth/ di URL agar sesuai dengan Login
      const url = `${API_BASE_URL}/api/accounts/auth/register/`;
      console.log("Mencoba register ke:", url); // Cek console browser (F12)

      await axios.post(url, {
        full_name: user_full_name,
        nim,
        prodi,
        angkatan: angkatanTrim,
        email,
        password,
      });
      
      // Jika sukses
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
      
    } catch (err: any) {
      console.error("Register Error Detail:", err); // Cek detail error di console

      // Handling Error yang Lebih Kuat
      if (err.response) {
        // Server merespon tapi dengan kode error (4xx, 5xx)
        const data = err.response.data;
        
        if (typeof data === 'object') {
          // Gabungkan semua error supaya jelas
          const messages = Object.entries(data).map(([field, msg]) => {
            const text = Array.isArray(msg) ? msg.join(" ") : String(msg);
            return `${field.toUpperCase()}: ${text}`;
          });
          setError(messages.join(" | ") || "Terjadi kesalahan validasi data.");
        } else {
          // Jika error berupa string atau HTML (Server Error / 404 URL Salah)
          setError("Gagal menghubungi server. Pastikan URL API benar.");
        }
      } else if (err.request) {
        // Tidak ada respon dari server (Server mati / Internet putus)
        setError("Tidak dapat terhubung ke server backend.");
      } else {
        setError("Terjadi kesalahan sistem.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Style umum untuk label input
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px'
  };

  // Style umum untuk input field
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem',
    transition: 'border-color 0.2s, background-color 0.2s',
    backgroundColor: '#f8fafc'
  };

  // Helper focus effect
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = UMS_BLUE;
    e.target.style.backgroundColor = 'white';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#cbd5e1';
    e.target.style.backgroundColor = '#f8fafc';
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc', 
      padding: '40px 20px'
    }}>
      
      {/* Card Container Utama */}
      <div style={{ 
        backgroundColor: 'white', 
        width: '100%', 
        maxWidth: '600px', 
        padding: '48px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
        border: '1px solid #f1f5f9'
      }}>
        
        {/* Header Card */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Daftar Talenta Baru
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Lengkapi profil Anda untuk bergabung dengan komunitas talenta UMS.
          </p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', border: '1px solid #fee2e2', 
            color: '#ef4444', padding: '12px', borderRadius: '12px', 
            fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' 
          }}>
            {error}
          </div>
        )}

        {/* Form Registrasi */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Input Nama Lengkap */}
          <div>
            <label style={labelStyle}>Nama Lengkap</label>
            <input type="text" required placeholder="Contoh: Adinda Putri" value={user_full_name} onChange={(e) => setFullName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Grid untuk NIM dan Prodi */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>NIM</label>
              <input type="text" required placeholder="Contoh: L200230..." value={nim} onChange={(e) => setNim(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Program Studi</label>
              <input type="text" required placeholder="Contoh: Teknik Informatika" value={prodi} onChange={(e) => setProdi(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Input Angkatan */}
          <div>
            <label style={labelStyle}>Angkatan</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              required
              placeholder="Contoh: 2020 (maksimal 2026)"
              value={angkatan}
              onChange={(e) => setAngkatan(e.target.value.replace(/[^\d]/g, ""))}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Input Email UMS */}
          <div>
            <label style={labelStyle}>Email UMS</label>
            <input type="email" required placeholder="nim@student.ums.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Gunakan email berakhiran @student.ums.ac.id</p>
          </div>

          {/* Input Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" required placeholder="Buat password yang aman" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', backgroundColor: UMS_BLUE, color: 'white',
              fontSize: '1rem', fontWeight: '700', border: 'none', borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '24px',
              boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0f172a')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = UMS_BLUE)}
          >
            {loading ? "Memproses Pendaftaran..." : "Daftar Sekarang"}
          </button>

        </form>

        {/* Link Footer */}
        <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b', fontSize: '0.95rem' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: UMS_BLUE, fontWeight: '600', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'} onMouseOut={(e) => e.currentTarget.style.color = UMS_BLUE}>
            Login di sini
          </Link>
        </p>

      </div>
    </main>
  );
}