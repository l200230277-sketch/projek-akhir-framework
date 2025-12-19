import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- INTERFACES ---
interface Profile {
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
  skills: Skill[];
  experiences: Experience[];
}

interface Skill {
  id: number;
  skill: { id: number; name: string };
  level: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

interface Statistics {
  total_talents: number;
  total_skills: number;
  total_experiences: number;
}

interface TopTalent {
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

export function Dashboard() {
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  
  // Data State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [topTalents, setTopTalents] = useState<TopTalent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<TopTalent[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "skills" | "experiences">("profile");
  
  // Statistik State
  const [statistics, setStatistics] = useState<Statistics>({
    total_talents: 0,
    total_skills: 0,
    total_experiences: 0
  });
  
  // Forms State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editProdi, setEditProdi] = useState("");
  const [editAngkatan, setEditAngkatan] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [skillError, setSkillError] = useState<string | null>(null);
  
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expDescription, setExpDescription] = useState("");
  const [expError, setExpError] = useState<string | null>(null);

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

  const extractErrorMessage = (err: any): string | null => {
    const data = err?.response?.data;
    if (!data) return err?.message ?? null;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.join(" ");
    return Object.entries(data)
      .map(
        ([field, msg]) =>
          `${field}: ${Array.isArray(msg) ? msg.join(" ") : String(msg)}`
      )
      .join(" | ");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchTopTalents();
    fetchStatistics();
  }, [navigate, token]);

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

  // --- API FUNCTIONS ---
  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/me/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setEditFullName(res.data.user_full_name);
      setEditProdi(res.data.prodi);
      setEditAngkatan(res.data.angkatan);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopTalents() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/top-talents/`);
      setTopTalents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching top talents:", err);
    }
  }

  async function fetchStatistics() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/statistics/`);
      if(res.data) setStatistics(res.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
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

  // --- HANDLERS ---
  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    try {
      const angkatanClean = editAngkatan.trim();
      const yearMax = 2025;
      if (angkatanClean && (!/^\d{4}$/.test(angkatanClean) || parseInt(angkatanClean, 10) > yearMax)) {
        setProfileError(`Angkatan harus 4 digit angka dan maksimal ${yearMax}.`);
        return;
      }
      if (!editFullName.trim()) {
        setProfileError("Nama lengkap wajib diisi.");
        return;
      }
      await axios.patch(
        `${API_BASE_URL}/api/talents/me/profile/`,
        {
          user_full_name: editFullName.trim(),
          prodi: editProdi,
          angkatan: angkatanClean,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsEditingProfile(false);
      fetchProfile();
    } catch (err: any) {
      setProfileError(extractErrorMessage(err) || "Gagal mengupdate profil.");
    }
  }


  async function handleAddSkill(e: FormEvent) {
    e.preventDefault();
    setSkillError(null);
    if (!skillName.trim()) {
      setSkillError("Nama skill wajib diisi.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/talents/me/skills/`,
        { skill_name: skillName.trim(), level: skillLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkillName("");
      setSkillLevel("Beginner");
      await fetchProfile();
    } catch (err: any) {
      setSkillError(extractErrorMessage(err) || "Gagal menambah skill.");
    }
  }

  async function handleDeleteSkill(skillId: number) {
    if (!confirm("Yakin ingin menghapus skill ini?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/talents/me/skills/${skillId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (err) {
      alert("Gagal menghapus skill.");
    }
  }

  async function handleAddExperience(e: FormEvent) {
    e.preventDefault();
    setExpError(null);
    try {
      await axios.post(
        `${API_BASE_URL}/api/talents/me/experiences/`,
        {
          title: expTitle,
          company: expCompany,
          start_date: expStartDate,
          end_date: expEndDate || null,
          description: expDescription,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpTitle("");
      setExpCompany("");
      setExpStartDate("");
      setExpEndDate("");
      setExpDescription("");
      await fetchProfile();
    } catch (err: any) {
      setExpError(extractErrorMessage(err) || "Gagal menambah pengalaman.");
    }
  }

  async function handleDeleteExperience(expId: number) {
    if (!confirm("Yakin ingin menghapus pengalaman ini?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/talents/me/experiences/${expId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (err) {
      alert("Gagal menghapus pengalaman.");
    }
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: '#f8fafc', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Memuat data...</p>
      </main>
    );
  }

  if (!profile) return null;

  // --- STYLES ---
  const UMS_BLUE = "#334155";

  const statCardStyle: React.CSSProperties = {
    flex: '1', 
    minWidth: '240px',
    backgroundColor: UMS_BLUE, 
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    color: 'white',
    height: '100px',
    border: '1px solid rgba(255,255,255,0.1)'
  };

  const statIconBoxStyle: React.CSSProperties = {
    width: '48px', height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  };

  const textGroupStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' 
  };

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* --- TABS NAVIGASI --- */}
        {!showSearchResults && (
          <>
            <div style={{ 
              display: 'flex', 
              gap: '40px', 
              borderBottom: '2px solid #e2e8f0', 
              marginBottom: '32px' 
            }}>
              {[
                { id: 'profile', label: 'Profil Saya' },
                { id: 'skills', label: `Skill & Keahlian (${profile.skills.length})` },
                { id: 'experiences', label: `Pengalaman (${profile.experiences.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    paddingBottom: '16px', 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    color: activeTab === tab.id ? UMS_BLUE : '#94a3b8',
                    borderBottom: activeTab === tab.id ? `3px solid ${UMS_BLUE}` : '3px solid transparent',
                    background: 'none',
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    marginBottom: '-2px'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB PROFILE */}
            {activeTab === "profile" && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {isEditingProfile ? 'Edit Profil' : 'Informasi Pribadi'}
                  </h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      style={{ backgroundColor: '#334155', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
                    >
                      Edit Profil
                    </button>
                  )}
                </div>
                {profileError && (
                  <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontWeight: 600 }}>
                    {profileError}
                  </div>
                )}

                {!isEditingProfile ? (
                  // --- MODE LIHAT (VIEW) ---
                  <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
                      <div 
                        style={{ 
                          width: '160px', 
                          height: '160px', 
                          borderRadius: '50%', 
                          backgroundColor: '#f1f5f9', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '3.5rem', 
                          fontWeight: 'bold', 
                          color: '#cbd5e1',
                          margin: '0 auto',
                          border: '4px solid white',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}
                      >
                        {profile.user_full_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {/* BAGIAN DATA: 3 KOLOM x 2 BARIS */}
                    <div style={{ 
                      flex: '1', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '32px 40px' 
                    }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Nama Lengkap</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{profile.user_full_name}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Email</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{profile.email}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>NIM</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{profile.nim}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Program Studi</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{profile.prodi}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Angkatan</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{profile.angkatan}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // --- MODE EDIT (FORM PROFESIONAL & NIM DITAMBAHKAN) ---
                  <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
                    
                    {/* BAGIAN FOTO (KIRI) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '160px', height: '160px' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '3.5rem', fontWeight: 'bold', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                          {profile.user_full_name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN INPUT (KANAN) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Nama Lengkap */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap</label>
                        <input 
                          type="text" 
                          value={editFullName} 
                          onChange={e => setEditFullName(e.target.value)} 
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                          onFocus={(e) => e.target.style.borderColor = UMS_BLUE}
                          onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                      </div>

                      {/* Grid Prodi & Angkatan */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prodi</label>
                          <input 
                            type="text" 
                            value={editProdi} 
                            onChange={e => setEditProdi(e.target.value)} 
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = UMS_BLUE}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Angkatan</label>
                          <input 
                            type="text" 
                            value={editAngkatan} 
                            maxLength={4}
                            onChange={e => setEditAngkatan(e.target.value.replace(/[^\d]/g, "").slice(0, 4))} 
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = UMS_BLUE}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                          />
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                        <button 
                          type="button" 
                          onClick={() => setIsEditingProfile(false)} 
                          style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          Batal
                        </button>
                        <button 
                          type="submit" 
                          style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: UMS_BLUE, color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = UMS_BLUE}
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB SKILLS */}
            {activeTab === "skills" && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>Tambah Skill Baru</h3>
                  {skillError && (
                    <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontWeight: 600 }}>
                      {skillError}
                    </div>
                  )}
                  <form onSubmit={handleAddSkill} style={{ display: 'grid', gap: '16px' }}>
                    <input type="text" placeholder="Nama Skill" value={skillName} onChange={e => setSkillName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                    </select>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#334155', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Tambah</button>
                  </form>
                </div>
                
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.skills.length === 0 ? <p style={{ color: '#64748b' }}>Belum ada skill.</p> : profile.skills.map(skill => (
                    <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div>
                        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{skill.skill.name}</p>
                        <span style={{ fontSize: '0.8rem', backgroundColor: '#eff6ff', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', marginTop: '6px', display: 'inline-block' }}>{skill.level}</span>
                      </div>
                      <button onClick={() => handleDeleteSkill(skill.id)} style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>Hapus</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB EXPERIENCES */}
            {activeTab === "experiences" && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>Tambah Pengalaman</h3>
                  {expError && (
                    <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontWeight: 600 }}>
                      {expError}
                    </div>
                  )}
                  <form onSubmit={handleAddExperience} style={{ display: 'grid', gap: '16px' }}>
                    <input type="text" placeholder="Posisi (cth: Web Developer)" value={expTitle} onChange={e => setExpTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <input type="text" placeholder="Perusahaan" value={expCompany} onChange={e => setExpCompany(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input type="date" value={expStartDate} onChange={e => setExpStartDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      <input type="date" value={expEndDate} onChange={e => setExpEndDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <textarea placeholder="Deskripsi singkat..." value={expDescription} onChange={e => setExpDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#334155', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Simpan</button>
                  </form>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {profile.experiences.length === 0 ? <p style={{ color: '#64748b' }}>Belum ada pengalaman.</p> : profile.experiences.map(exp => (
                    <div key={exp.id} style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{exp.title}</h4>
                      <p style={{ color: '#0f172a', fontWeight: '600', marginBottom: '6px' }}>{exp.company}</p>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>{exp.start_date} — {exp.end_date || 'Sekarang'}</p>
                      {exp.description && <p style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>{exp.description}</p>}
                      <button onClick={() => handleDeleteExperience(exp.id)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#ef4444', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Hapus</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- HASIL PENCARIAN --- */}
        {showSearchResults && (
          <div style={{ backgroundColor: theme.colors.surface }} className="mb-6 rounded-2xl border border-black/5 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Hasil Pencarian ({searchResults.length})
            </h2>
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-600">Tidak ada talenta yang cocok.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {searchResults.map((talent) => (
                  <div key={talent.id} onClick={() => navigate(`/profile/${talent.id}`)} className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                        {talent.user_full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{talent.user_full_name}</h3>
                        <p className="text-sm text-gray-500">{talent.prodi} • {talent.angkatan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}