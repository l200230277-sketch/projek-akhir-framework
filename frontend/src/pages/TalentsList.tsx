import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// Interface disesuaikan dengan response API
type Talent = {
  id: number;
  user_full_name: string;
  email: string;
  nim: string;
  prodi: string;
  angkatan: string;
  headline: string;
  bio: string;
  photo: string | null;
  photo_url?: string | null;
  skills: { id: number; skill: { id: number; name: string }; level: string }[];
};

export function TalentsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [items, setItems] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getPhotoSrc = (photo?: string | null, photoUrl?: string | null) =>
    photoUrl || (photo ? `${API_BASE_URL}${photo}` : null);

  // Debounce Search Logic
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/talents/public/`, {
          params: {
            ...(search ? { search } : {}),
            ...(skill ? { skill } : {}),
          },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        if (!cancelled) setItems(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Gagal memuat data talenta.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, skill]);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: theme.colors.background, paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* === HEADER SECTION === */}
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.colors.text, marginBottom: '12px' }}>
            Daftar Talenta
          </h1>
          <p style={{ fontSize: '1.125rem', color: theme.colors.muted, maxWidth: '600px', margin: '0 auto' }}>
            Jelajahi seluruh talenta mahasiswa UMS. Gunakan filter di bawah untuk menemukan keahlian spesifik.
          </p>
        </div>

        {/* === FILTER SECTION === */}
        <div 
          className="flex flex-col justify-center gap-4 md:flex-row" 
          style={{ marginBottom: '60px' }} 
        >
          {/* 1. Input Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '16px', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#9ca3af'
            }}>
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 style={{ width: '20px', height: '20px' }} 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor" 
                 strokeWidth={2}
               >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama, NIM, atau prodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '48px' }}
              className="block w-full rounded-full border-0 bg-white py-4 pr-6 text-gray-900 shadow-[0_4px_10px_rgb(0,0,0,0.03)] ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-base transition-all hover:shadow-md"
            />
          </div>

          {/* 2. Input Filter Skill */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
             <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '16px', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#9ca3af'
            }}>
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 style={{ width: '20px', height: '20px' }} 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor" 
                 strokeWidth={2}
               >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter berdasarkan skill (cth: React)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              style={{ paddingLeft: '48px' }}
              className="block w-full rounded-full border-0 bg-white py-4 pr-6 text-gray-900 shadow-[0_4px_10px_rgb(0,0,0,0.03)] ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-base transition-all hover:shadow-md"
            />
          </div>
        </div>

        {/* === ERROR MESSAGE === */}
        {error && (
          <div className="mb-8 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-700 border border-red-100">
            {error}
          </div>
        )}

        {/* === LIST CONTENT === */}
        {loading ? (
           <div className="text-center py-20">
             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
             <p className="mt-4 text-gray-500">Memuat data talenta...</p>
           </div>
        ) : items.length === 0 ? (
          /* BAGIAN YANG DIPERBAIKI: Ikon Sad Face */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 md:p-20 text-center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <svg 
                    style={{ width: '64px', height: '64px', color: '#9ca3af' }} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Talenta tidak ditemukan</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                Maaf, kami tidak dapat menemukan talenta yang sesuai dengan kata kunci atau filter tersebut.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '24px' 
          }}>
            {items.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/profile/${t.id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: `1px solid ${theme.colors.border}`,
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = theme.colors.border;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {getPhotoSrc(t.photo, t.photo_url) ? (
                    <img 
                      src={getPhotoSrc(t.photo, t.photo_url) || undefined} 
                      alt={t.user_full_name} 
                      style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', backgroundColor: '#f3f4f6' }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '80px', height: '80px', borderRadius: '12px', 
                      background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '1.5rem', fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {t.user_full_name ? t.user_full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: theme.colors.text, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.user_full_name || t.email}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: theme.colors.muted, margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.prodi} • {t.angkatan}
                    </p>
                    
                    {t.headline && (
                       <p style={{ fontSize: '0.875rem', color: '#4b5563', fontStyle: 'italic', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                         "{t.headline}"
                       </p>
                    )}
                    
                    {t.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: t.headline ? '0' : '8px' }}>
                        {t.skills.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            style={{ 
                              backgroundColor: '#eff6ff', color: '#1d4ed8', 
                              padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '500' 
                            }}
                          >
                            {s.skill.name}
                          </span>
                        ))}
                        {t.skills.length > 4 && (
                           <span style={{ fontSize: '0.75rem', color: theme.colors.muted, alignSelf: 'center' }}>+{t.skills.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}