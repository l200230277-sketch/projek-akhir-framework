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

    // Validasi sederhana di sisi client
    if (!email.endsWith("@student.ums.ac.id") && !email.endsWith("@ums.ac.id")) {
      setError("Gunakan email resmi UMS (@student.ums.ac.id atau @ums.ac.id).");
      setLoading(false);
      return;
    }

    try {
      // Request ke backend endpoint register
      await axios.post(`${API_BASE_URL}/api/accounts/register/`, {
        user_full_name,
        nim,
        prodi,
        angkatan,
        email,
        password,
      });
      
      // Jika sukses, tampilkan alert dan redirect ke login
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
      
    } catch (err: any) {
      console.error("Register Error:", err);
      // Menangkap pesan error spesifik dari backend jika ada
      if (err.response && err.response.data) {
        // Mengambil pesan error pertama dari object error (misal: "Email sudah terdaftar")
        const firstErrorKey = Object.keys(err.response.data)[0];
        const errorMessage = Array.isArray(err.response.data[firstErrorKey]) 
          ? err.response.data[firstErrorKey][0] 
          : err.response.data[firstErrorKey] || "Gagal mendaftar. Periksa kembali data Anda.";
        setError(errorMessage);
      } else {
        setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Style umum untuk label input
  const labelStyle = {
    display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px'
  };

  // Style umum untuk input field
  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem',
    transition: 'border-color 0.2s, background-color 0.2s',
    backgroundColor: '#f8fafc'
  };

  // Fungsi helper untuk efek fokus pada input
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
      backgroundColor: '#f8fafc', // Background abu-abu terang yang bersih
      padding: '40px 20px'
    }}>
      
      {/* Card Container Utama */}
      <div style={{ 
        backgroundColor: 'white', 
        width: '100%', 
        maxWidth: '600px', // Sedikit lebih lebar dari login untuk mengakomodasi input bersebelahan
        padding: '48px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', // Shadow halus profesional
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
            <input type="text" required placeholder="Contoh: Amelia Putricia Wardani" value={user_full_name} onChange={(e) => setFullName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Grid untuk NIM dan Prodi (Bersebelahan) */}
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

          {/* Input Angkatan (Menggunakan Select agar lebih rapi) */}
          <div>
            <label style={labelStyle}>Angkatan</label>
             <select required value={angkatan} onChange={(e) => setAngkatan(e.target.value)} style={{...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}} onFocus={handleFocus} onBlur={handleBlur}>
                <option value="" disabled>Pilih Angkatan</option>
                {/* Menghasilkan opsi tahun dari 5 tahun lalu sampai tahun depan */}
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 4 + i).reverse().map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
          </div>

          {/* Input Email UMS */}
          <div>
            <label style={labelStyle}>Email UMS</label>
            <input type="email" required placeholder="nim@student.ums.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Gunakan email berakhiran @student.ums.ac.id atau @ums.ac.id</p>
          </div>

          {/* Input Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" required placeholder="Buat password yang aman" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Tombol Submit Profesional */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', backgroundColor: UMS_BLUE, color: 'white', // Warna tema UMS
              fontSize: '1rem', fontWeight: '700', border: 'none', borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '24px',
              boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)', // Efek shadow pada tombol
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0f172a', e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = UMS_BLUE, e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? "Memproses Pendaftaran..." : "Daftar Sekarang"}
          </button>

        </form>

        {/* Link Footer ke Login */}
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