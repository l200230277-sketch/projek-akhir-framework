import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Warna Tema (Menggunakan theme atau default dark blue UMS)
const UMS_BLUE = theme?.colors?.primary || "#1e293b";

interface Profile {
  id: number;
  user_full_name: string;
  email: string;
  nim: string;
  prodi: string;
  angkatan: string;
  headline?: string;
  bio?: string;
  photo: string | null;
  photo_url?: string | null;
  cv: string | null; 
  skills: {
    id: number;
    skill: { id: number; name: string };
    level: string;
  }[];
  experiences: {
    id: number;
    title: string;
    company: string;
    start_date: string;
    end_date: string | null;
    description?: string;
  }[];
}

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPhotoSrc = (photo?: string | null, photoUrl?: string | null) =>
    photoUrl || (photo ? `${API_BASE_URL}${photo}` : null);

  const fetchImageAsDataUrl = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      // KEMBALI KE API AWAL KAMU (Tanpa /public/)
      const res = await axios.get(`${API_BASE_URL}/api/talents/${id}/`);
      setProfile(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal mengambil data. Pastikan Anda sudah login atau ID benar.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadDataDiri() {
    if (!profile) return;

    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF();
    let y = 20;
    const photoSrc = getPhotoSrc(profile.photo, profile.photo_url);

    if (photoSrc) {
      try {
        const dataUrl = await fetchImageAsDataUrl(photoSrc);
        const format: "PNG" | "JPEG" = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        const imgWidth = 40;
        const imgHeight = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const x = (pageWidth - imgWidth) / 2;
        doc.addImage(dataUrl, format, x, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (imgErr) {
        console.error("Gagal memuat foto untuk PDF:", imgErr);
      }
    }

    // --- LOGIKA PDF ASLI KAMU ---
    doc.setFontSize(18);
    doc.text(profile.user_full_name, 105, y, { align: "center" });
    y += 10;

    doc.setFontSize(11);
    doc.text(profile.email, 105, y, { align: "center" });
    y += 6;

    doc.text(
      `${profile.nim} • ${profile.prodi} • Angkatan ${profile.angkatan}`,
      105,
      y,
      { align: "center" }
    );

    y += 15;

    doc.setFontSize(14);
    doc.text("Data Diri Mahasiswa", 20, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Nama       : ${profile.user_full_name}`, 20, y); y += 6;
    doc.text(`Email      : ${profile.email}`, 20, y); y += 6;
    doc.text(`NIM        : ${profile.nim}`, 20, y); y += 6;
    doc.text(`Prodi      : ${profile.prodi}`, 20, y); y += 6;
    doc.text(`Angkatan   : ${profile.angkatan}`, 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Keahlian", 20, y);
    y += 7;
    doc.setFontSize(11);
    if (profile.skills.length > 0) {
      profile.skills.forEach((s) => {
        doc.text(`• ${s.skill.name} (${s.level})`, 25, y);
        y += 5;
      });
    } else {
      doc.text("Belum ada data keahlian.", 25, y);
      y += 5;
    }

    y += 8;

    doc.setFontSize(14);
    doc.text("Pengalaman", 20, y);
    y += 7;
    doc.setFontSize(11);
    if (profile.experiences.length > 0) {
      profile.experiences.forEach((exp) => {
        doc.text(exp.title, 25, y);
        y += 5;
        doc.text(exp.company, 25, y);
        y += 5;
        const start = new Date(exp.start_date).toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
        const end = exp.end_date
          ? new Date(exp.end_date).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })
          : "Sekarang";
        doc.text(`${start} – ${end}`, 25, y);
        y += 7;
        if (exp.description) {
          const wrapped = doc.splitTextToSize(exp.description, 160);
          doc.text(wrapped, 25, y);
          y += wrapped.length * 5;
        }
        y += 4;
      });
    } else {
      doc.text("Belum ada data pengalaman.", 25, y);
    }

    doc.save(`Data_Diri_${profile.user_full_name}.pdf`);
  }

  // --- TAMPILAN LOADING ---
  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b' }}>Memuat profil...</p>
      </main>
    );
  }

  // --- TAMPILAN ERROR / TIDAK DITEMUKAN ---
  if (!profile) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>Talenta Tidak Ditemukan</h2>
          <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.5' }}>
            Maaf, profil yang Anda cari mungkin telah dihapus atau ID tidak valid.
          </p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              width: '100%', padding: '14px', backgroundColor: UMS_BLUE, color: 'white', 
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.2s', fontSize: '1rem'
            }}
          >
            Kembali ke Daftar
          </button>
        </div>
      </main>
    );
  }

  // --- TAMPILAN UTAMA (PROFESIONAL) ---
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
      
      {/* TOP BAR */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 0', marginBottom: '40px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'transparent', border: `1px solid #cbd5e1`, 
              color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
              padding: '8px 16px', borderRadius: '99px', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = UMS_BLUE; e.currentTarget.style.color = UMS_BLUE; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* HERO PROFILE CARD */}
        <div style={{ 
          backgroundColor: 'white', borderRadius: '24px', 
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)', 
          border: '1px solid #f1f5f9', padding: '40px',
          display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', marginBottom: '32px'
        }}>
          
          {/* FOTO PROFIL */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '200px', margin: '0 auto' }}>
            {getPhotoSrc(profile.photo, profile.photo_url) ? (
              <img 
                src={getPhotoSrc(profile.photo, profile.photo_url) || undefined} 
                alt={profile.user_full_name} 
                style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '6px solid #f8fafc', boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)' }} 
              />
            ) : (
              <div style={{ 
                width: '180px', height: '180px', borderRadius: '50%', 
                background: `linear-gradient(135deg, ${UMS_BLUE}, #334155)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '4rem', fontWeight: 'bold',
                boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)', border: '6px solid #f8fafc'
              }}>
                {profile.user_full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* INFO UTAMA */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1.2' }}>
              {profile.user_full_name}
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '24px', fontWeight: '500' }}>
              {profile.headline || `${profile.prodi} • ${profile.angkatan}`}
            </p>

            {/* Grid Detail Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{profile.prodi}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Angkatan {profile.angkatan}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{profile.nim}</span>
              </div>
            </div>

            {/* Tombol PDF */}
            <button 
              onClick={downloadDataDiri}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                backgroundColor: UMS_BLUE, color: 'white',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: '600', textDecoration: 'none', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30, 41, 59, 0.25)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download CV (PDF)
            </button>
          </div>
        </div>

        {/* GRID CONTENT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* SKILL */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', height: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
              <span style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              Keahlian
            </h3>
            
            {profile.skills.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>Belum ada skill.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {profile.skills.map((s) => (
                  <div key={s.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.95rem' }}>{s.skill.name}</span>
                    <span style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase' }}>{s.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PENGALAMAN */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', height: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
              <span style={{ width: '32px', height: '32px', backgroundColor: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              Pengalaman
            </h3>

            {profile.experiences.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>Belum ada pengalaman.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {profile.experiences.map((exp) => {
                  const start = new Date(exp.start_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                  const end = exp.end_date ? new Date(exp.end_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "Sekarang";
                  
                  return (
                    <div key={exp.id} style={{ paddingLeft: '24px', borderLeft: `3px solid #e2e8f0`, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-6.5px', top: '6px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: UMS_BLUE }}></div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>{exp.title}</h4>
                      <p style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: '600', margin: '0 0 6px 0' }}>{exp.company}</p>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>{start} — {end}</p>
                      {exp.description && <p style={{ fontSize: '0.95rem', color: '#475569', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', fontStyle: 'italic', margin: 0 }}>"{exp.description}"</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}