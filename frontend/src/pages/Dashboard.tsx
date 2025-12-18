import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
      setPhotoPreview(res.data.photo ? `${API_BASE_URL}${res.data.photo}` : null);
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
      const formData = new FormData();
      formData.append("user_full_name", editFullName);
      formData.append("prodi", editProdi);
      formData.append("angkatan", editAngkatan);
      if (editPhoto) {
        formData.append("photo", editPhoto);
      }

      await axios.patch(
        `${API_BASE_URL}/api/talents/me/profile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsEditingProfile(false);
      setEditPhoto(null);
      fetchProfile();
    } catch (err: any) {
      setProfileError("Gagal mengupdate profil.");
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
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
      setSkillError("Gagal menambah skill.");
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

  function getMaxDate(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
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
      setExpError("Gagal menambah pengalaman.");
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
  const UMS_BLUE = "#1e293b"; 

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
        
        {/* === HEADER === */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Dashboard Mahasiswa
          </h1>
          <p style={{ color: '#64748b' }}>
            Selamat datang, <span style={{ fontWeight: '600', color: UMS_BLUE }}>{profile.user_full_name}</span>! Kelola portofolio Anda di sini.
          </p>
        </div>

        {/* === STATISTIK CARDS === */}
        {statistics && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '40px', justifyContent: 'center' }}>
            {/* Card 1 */}
            <div style={statCardStyle}>
              <div style={statIconBoxStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div style={textGroupStyle}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.8, margin: 0 }}>Total Talenta</p>
                <p style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: '1', margin: 0 }}>{statistics.total_talents}</p>
              </div>
            </div>
            {/* Card 2 */}
            <div style={statCardStyle}>
              <div style={statIconBoxStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div style={textGroupStyle}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.8, margin: 0 }}>Total Skill</p>
                <p style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: '1', margin: 0 }}>{statistics.total_skills}</p>
              </div>
            </div>
            {/* Card 3 */}
            <div style={statCardStyle}>
              <div style={statIconBoxStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div style={textGroupStyle}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', opacity: 0.8, margin: 0 }}>Pengalaman</p>
                <p style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: '1', margin: 0 }}>{statistics.total_experiences}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- SEARCH BAR --- */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '20px', pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              placeholder="Cari talenta lain berdasarkan nama atau skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '16px 20px 16px 50px', fontSize: '1rem', borderRadius: '9999px',
                border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', outline: 'none'
              }}
            />
          </div>
        </div>

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
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Informasi Pribadi</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
                    >
                      Edit Profil
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
                      {profile.photo ? (
                        <img src={`${API_BASE_URL}${profile.photo}`} alt="Foto" style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      ) : (
                        <div style={{ width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 'bold', color: '#cbd5e1' }}>
                          {profile.user_full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* BAGIAN DATA: 3 KOLOM x 2 BARIS (Headline dihapus jadi 5 item) */}
                    <div style={{ 
                      flex: '1', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', // 3 Kolom
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
                      {/* Kosong (untuk menyeimbangkan grid) */}
                      <div></div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Nama Lengkap</label>
                      <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Prodi</label>
                        <input type="text" value={editProdi} onChange={e => setEditProdi(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Angkatan</label>
                        <input type="text" value={editAngkatan} onChange={e => setEditAngkatan(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Ganti Foto</label>
                      <input type="file" onChange={handlePhotoChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                      <button type="button" onClick={() => setIsEditingProfile(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Batal</button>
                      <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Simpan Perubahan</button>
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
                  <form onSubmit={handleAddSkill} style={{ display: 'grid', gap: '16px' }}>
                    <input type="text" placeholder="Nama Skill" value={skillName} onChange={e => setSkillName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                    </select>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Tambah</button>
                  </form>
                </div>
                
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.skills.length === 0 ? <p style={{ color: '#64748b' }}>Belum ada skill.</p> : profile.skills.map(skill => (
                    <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div>
                        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{skill.skill.name}</p>
                        <span style={{ fontSize: '0.8rem', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', marginTop: '6px', display: 'inline-block' }}>{skill.level}</span>
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
                  <form onSubmit={handleAddExperience} style={{ display: 'grid', gap: '16px' }}>
                    <input type="text" placeholder="Posisi (cth: Web Developer)" value={expTitle} onChange={e => setExpTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <input type="text" placeholder="Perusahaan" value={expCompany} onChange={e => setExpCompany(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input type="date" value={expStartDate} onChange={e => setExpStartDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      <input type="date" value={expEndDate} onChange={e => setExpEndDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <textarea placeholder="Deskripsi singkat..." value={expDescription} onChange={e => setExpDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Simpan</button>
                  </form>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {profile.experiences.length === 0 ? <p style={{ color: '#64748b' }}>Belum ada pengalaman.</p> : profile.experiences.map(exp => (
                    <div key={exp.id} style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{exp.title}</h4>
                      <p style={{ color: '#2563eb', fontWeight: '600', marginBottom: '6px' }}>{exp.company}</p>
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
                      {talent.photo ? (
                        <img src={`${API_BASE_URL}${talent.photo}`} alt={talent.user_full_name} className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                          {talent.user_full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
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