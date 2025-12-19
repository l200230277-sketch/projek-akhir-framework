import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme"; 


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Talent {
  id: number;
  user_full_name: string;
  email: string;
  nim: string;
  prodi: string;
  angkatan: string;
  headline: string;
  photo: string | null;
  photo_url?: string | null;
  skills: { id: number; skill: { id: number; name: string }; level: string }[];
  experiences: { id: number; title: string; company: string }[];
}

interface Statistics {
  total_talents: number;
  total_skills: number;
  total_experiences: number;
}

export function PublicDashboard() {
  const navigate = useNavigate();
  
  // State
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Talent[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latestTalents, setLatestTalents] = useState<Talent[]>([]);

  const getPhotoSrc = (photo?: string | null, photoUrl?: string | null) => {
    // Prioritaskan photoUrl jika sudah ada (biasanya sudah full URL dari API)
    if (photoUrl) {
      // Jika photoUrl sudah full URL (http/https), periksa apakah masih menggunakan /media/
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        // Jika URL masih menggunakan /media/, konversi ke endpoint khusus
        if (photoUrl.includes('/media/')) {
          const filePath = photoUrl.split('/media/')[1];
          const baseUrl = photoUrl.split('/media/')[0];
          return `${baseUrl}/api/talents/media/${filePath}`;
        }
        return photoUrl;
      }
      // Jika photoUrl adalah path relatif yang sudah menggunakan endpoint khusus
      if (photoUrl.startsWith('/api/talents/media/')) {
        return `${API_BASE_URL}${photoUrl}`;
      }
      // Jika photoUrl adalah path relatif dengan /media/, konversi ke endpoint khusus
      if (photoUrl.startsWith('/media/')) {
        const filePath = photoUrl.replace('/media/', '');
        return `${API_BASE_URL}/api/talents/media/${filePath}`;
      }
      // Jika photoUrl adalah path relatif lainnya, tambahkan API_BASE_URL
      if (photoUrl.startsWith('/')) {
        return `${API_BASE_URL}${photoUrl}`;
      }
      return photoUrl;
    }
    
    // Jika tidak ada photoUrl, gunakan photo
    if (photo) {
      // Jika photo sudah full URL, periksa apakah masih menggunakan /media/
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        // Jika URL masih menggunakan /media/, konversi ke endpoint khusus
        if (photo.includes('/media/')) {
          const filePath = photo.split('/media/')[1];
          const baseUrl = photo.split('/media/')[0];
          return `${baseUrl}/api/talents/media/${filePath}`;
        }
        return photo;
      }
      // Jika photo adalah path relatif dengan /media/, konversi ke endpoint khusus
      if (photo.startsWith('/media/')) {
        const filePath = photo.replace('/media/', '');
        return `${API_BASE_URL}/api/talents/media/${filePath}`;
      }
      // Jika photo adalah path relatif lainnya, tambahkan API_BASE_URL
      if (photo.startsWith('/')) {
        return `${API_BASE_URL}${photo}`;
      }
      return `${API_BASE_URL}${photo}`;
    }
    return null;
  };

  useEffect(() => {
    fetchStatistics();
    fetchLatestTalents();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const timer = setTimeout(() => {
        performSearch();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [search]);

  async function fetchStatistics() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/statistics/`);
      setStatistics(res.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLatestTalents() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/latest/`);
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setLatestTalents(data);
    } catch (err) {
      console.error("Error fetching latest talents:", err);
    }
  }

  async function performSearch() {
    if (!search.trim()) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/public/`, {
        params: { search: search.trim() },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error searching talents:", err);
    }
  }

  if (loading) {
    return (
      <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <p style={{ color: '#6b7280' }}>Memuat data...</p>
      </main>
    );
  }

  // --- STYLE OBJECTS (Presisi Flexbox) ---
  
  const cardStyle: React.CSSProperties = {
    flex: '1', 
    minWidth: '280px',
    backgroundColor: theme.colors.primary, // Warna Biru Gelap UMS
    borderRadius: '16px', 
    padding: '24px 32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center', // Kunci agar lurus vertikal
    gap: '24px',
    color: 'white',
    height: '130px' // Tinggi fix agar konsisten
  };

  const iconBoxStyle: React.CSSProperties = {
    width: '64px', 
    height: '64px', 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Latar transparan ikon
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0 // Agar ikon tidak mengecil
  };

  const textGroupStyle: React.CSSProperties = {
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', // Luruskan teks secara vertikal dalam grupnya
    height: '100%' 
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: theme.colors.background, paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* === HEADER SECTION === */}
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
            Platform Talenta Mahasiswa
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Temukan talenta terbaik mahasiswa UMS dengan berbagai keahlian dan pengalaman profesional.
          </p>
        </div>

        {/* === STATISTIK CARDS === */}
        {statistics && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '24px', 
            marginBottom: '60px',
            justifyContent: 'center' 
          }}>
            
            {/* Card 1: Pendaftar */}
            <div style={cardStyle}>
              <div style={iconBoxStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div style={textGroupStyle}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.9, margin: 0, paddingBottom: '4px' }}>
                  Total Talenta
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1', margin: 0 }}>
                  {statistics.total_talents}
                </p>
              </div>
            </div>

            {/* Card 2: Skill */}
            <div style={cardStyle}>
              <div style={iconBoxStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={textGroupStyle}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.9, margin: 0, paddingBottom: '4px' }}>
                  Skill Terdaftar
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1', margin: 0 }}>
                  {statistics.total_skills}
                </p>
              </div>
            </div>

            {/* Card 3: Pengalaman */}
            <div style={cardStyle}>
              <div style={iconBoxStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div style={textGroupStyle}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.9, margin: 0, paddingBottom: '4px' }}>
                  Pengalaman
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1', margin: 0 }}>
                  {statistics.total_experiences}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* === SEARCH BAR === */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              left: '24px', // Jarak ikon dari kiri
              display: 'flex', 
              alignItems: 'center', 
              pointerEvents: 'none' 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            
            <input
              type="text"
              placeholder="Cari talenta berdasarkan nama, NIM, atau skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 24px 18px 64px', // Padding kiri besar agar teks tidak nabrak ikon
                fontSize: '1rem',
                borderRadius: '9999px',
                border: '1px solid #d1d5db',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        {/* === HASIL PENCARIAN (HANYA MUNCUL JIKA MENCARI) === */}
        {showSearchResults && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Hasil Pencarian ({searchResults.length})
            </h2>
            
            {searchResults.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                 <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#4b5563' }}>Tidak ada talenta ditemukan</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '24px' 
              }}>
                {searchResults.map((talent) => (
                  <div
                    key={talent.id}
                    onClick={() => navigate(`/profile/${talent.id}`)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ 
                        width: '80px', height: '80px', borderRadius: '12px', 
                        background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '1.5rem', fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {talent.user_full_name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {talent.user_full_name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {talent.prodi} • {talent.angkatan}
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {talent.skills?.slice(0, 3).map(s => (
                            <span key={s.id} style={{ 
                              backgroundColor: '#eff6ff', color: '#1d4ed8', 
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' 
                            }}>
                              {s.skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === TALENTA TERBARU (5) === */}
        <section style={{ marginTop: showSearchResults ? '60px' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>Talenta Terbaru</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>5 talenta terbaru yang dibuka publik.</p>
            </div>
          </div>
          {latestTalents.length === 0 ? (
            <div style={{ padding: '32px', borderRadius: '16px', border: '1px dashed #e5e7eb', backgroundColor: 'white', textAlign: 'center', color: '#6b7280' }}>
              Belum ada talenta publik yang dapat ditampilkan.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {latestTalents.map((talent) => (
                <div
                  key={talent.id}
                  onClick={() => navigate(`/profile/${talent.id}`)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '14px',
                    border: '1px solid #e5e7eb',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                      {talent.user_full_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{talent.user_full_name}</p>
                      <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{talent.prodi} • {talent.angkatan}</p>
                    </div>
                  </div>
                  {talent.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {talent.skills.slice(0, 3).map((s) => (
                        <span key={s.id} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {s.skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}