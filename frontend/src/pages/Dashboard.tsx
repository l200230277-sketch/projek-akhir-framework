import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme"; // Pastikan path ini sesuai dengan struktur projectmu

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
  
  // State Data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [topTalents, setTopTalents] = useState<TopTalent[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<TopTalent[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "skills" | "experiences">("profile");
  
  // Profile Edit Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editProdi, setEditProdi] = useState("");
  const [editAngkatan, setEditAngkatan] = useState("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Skill Form State
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [skillError, setSkillError] = useState<string | null>(null);
  
  // Experience Form State
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expDescription, setExpDescription] = useState("");
  const [expError, setExpError] = useState<string | null>(null);

  // --- USE EFFECTS ---
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

  // --- API CALLS ---
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
      setStatistics(res.data);
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

  // --- ACTION HANDLERS ---
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
      console.error(err);
      setProfileError("Gagal mengupdate profil.");
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
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

  if (loading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Memuat dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-10">
        
        {/* === HEADER DASHBOARD === */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Dashboard Mahasiswa
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Kelola profil profesionalmu dan temukan talenta terbaik di UMS.
          </p>
        </div>

        {/* === STATISTIK CARDS (Sesuai Request) === */}
        {statistics && (
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Card 1: Pendaftar */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all hover:-translate-y-1 hover:shadow-lg border border-gray-100">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Pendaftar</p>
                  <p className="text-3xl font-extrabold text-gray-900">{statistics.total_talents}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Total Skill */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all hover:-translate-y-1 hover:shadow-lg border border-gray-100">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Total Skill</p>
                  <p className="text-3xl font-extrabold text-gray-900">{statistics.total_skills}</p>
                </div>
              </div>
            </div>

            {/* Card 3: Pengalaman */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all hover:-translate-y-1 hover:shadow-lg border border-gray-100">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Pengalaman</p>
                  <p className="text-3xl font-extrabold text-gray-900">{statistics.total_experiences}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SEARCH BAR CENTERED & MODERN (Sesuai Request) === */}
        <div className="mb-12 flex justify-center">
          <div className="group relative w-full max-w-3xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari talenta berdasarkan nama, NIM, atau skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-2xl border-0 bg-white py-4 pl-14 pr-6 text-gray-900 shadow-[0_4px_10px_rgb(0,0,0,0.03)] ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-base transition-all hover:shadow-md"
            />
          </div>
        </div>

        {/* === HASIL PENCARIAN & TOP TALENTA === */}
        {/* Logic: Tampilkan hasil search jika ada, jika tidak tampilkan top talent */}
        {(showSearchResults || (!showSearchResults && topTalents.length > 0)) && (
          <div className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              {showSearchResults ? `Hasil Pencarian (${searchResults.length})` : "Top Talenta Mahasiswa"}
            </h2>
            
            {showSearchResults && searchResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                Tidak ada talenta yang cocok dengan pencarianmu.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {(showSearchResults ? searchResults : topTalents).map((talent) => (
                  <div
                    key={talent.id}
                    onClick={() => navigate(`/profile/${talent.id}`)}
                    className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {talent.photo ? (
                        <img src={`${API_BASE_URL}${talent.photo}`} alt={talent.user_full_name} className="h-20 w-20 rounded-2xl object-cover shadow-sm" />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-sm">
                          {talent.user_full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <h3 className="truncate text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {talent.user_full_name}
                        </h3>
                        <p className="truncate text-sm font-medium text-gray-500">
                          {talent.prodi} • Angkatan {talent.angkatan}
                        </p>
                        {talent.headline && (
                          <p className="mt-1 line-clamp-1 text-sm text-gray-600 italic">"{talent.headline}"</p>
                        )}
                        {/* Tags Skill Kecil */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {talent.skills?.slice(0, 3).map(s => (
                            <span key={s.id} className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {s.skill.name}
                            </span>
                          ))}
                          {talent.skills && talent.skills.length > 3 && (
                            <span className="text-xs text-gray-400 self-center">+{talent.skills.length - 3} lainnya</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === TAB NAVIGASI === */}
        <div className="mb-6 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Profil Saya
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "skills" ? "border-b-2 border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Skill & Keahlian
          </button>
          <button
            onClick={() => setActiveTab("experiences")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "experiences" ? "border-b-2 border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pengalaman Kerja
          </button>
        </div>

        {/* === ISI KONTEN TAB === */}
        
        {/* 1. TAB PROFILE */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Informasi Pribadi</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Edit Profil
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                {profile.photo && (
                  <div className="sm:col-span-2 flex justify-center pb-4">
                    <img src={`${API_BASE_URL}${profile.photo}`} alt="Profile" className="h-32 w-32 rounded-full object-cover ring-4 ring-gray-50" />
                  </div>
                )}
                <div className="border-b border-gray-100 pb-2">
                  <div className="text-sm text-gray-500">Nama Lengkap</div>
                  <div className="font-medium text-gray-900">{profile.user_full_name}</div>
                </div>
                <div className="border-b border-gray-100 pb-2">
                  <div className="text-sm text-gray-500">NIM</div>
                  <div className="font-medium text-gray-900">{profile.nim}</div>
                </div>
                <div className="border-b border-gray-100 pb-2">
                  <div className="text-sm text-gray-500">Program Studi</div>
                  <div className="font-medium text-gray-900">{profile.prodi}</div>
                </div>
                <div className="border-b border-gray-100 pb-2">
                  <div className="text-sm text-gray-500">Angkatan</div>
                  <div className="font-medium text-gray-900">{profile.angkatan}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                 {/* FORM EDIT PROFILE SAMA SEPERTI SEBELUMNYA */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prodi</label>
                        <input type="text" value={editProdi} onChange={e => setEditProdi(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Angkatan</label>
                        <input type="text" value={editAngkatan} onChange={e => setEditAngkatan(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Foto</label>
                    <input type="file" onChange={handlePhotoChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Simpan</button>
                 </div>
              </form>
            )}
          </div>
        )}

        {/* 2. TAB SKILLS */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-gray-900">Tambah Skill</h3>
                <form onSubmit={handleAddSkill} className="space-y-4">
                   <input type="text" placeholder="Nama Skill (cth: React)" value={skillName} onChange={e => setSkillName(e.target.value)} className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
                   <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                   </select>
                   <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Tambah</button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2">
               <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-bold text-gray-900">Daftar Skill</h3>
                  {profile.skills.length === 0 ? <p className="text-gray-500">Belum ada skill.</p> : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                       {profile.skills.map(skill => (
                          <div key={skill.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                             <div>
                                <div className="font-semibold">{skill.skill.name}</div>
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">{skill.level}</div>
                             </div>
                             <button onClick={() => handleDeleteSkill(skill.id)} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                          </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* 3. TAB EXPERIENCES */}
        {activeTab === "experiences" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
             <div className="lg:col-span-1">
                <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                   <h3 className="mb-4 font-bold text-gray-900">Tambah Pengalaman</h3>
                   <form onSubmit={handleAddExperience} className="space-y-4">
                      <input type="text" placeholder="Posisi" value={expTitle} onChange={e => setExpTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                      <input type="text" placeholder="Perusahaan" value={expCompany} onChange={e => setExpCompany(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                         <input type="date" value={expStartDate} onChange={e => setExpStartDate(e.target.value)} className="w-full rounded-lg border px-2 py-2 text-xs" />
                         <input type="date" value={expEndDate} onChange={e => setExpEndDate(e.target.value)} className="w-full rounded-lg border px-2 py-2 text-xs" />
                      </div>
                      <textarea placeholder="Deskripsi" value={expDescription} onChange={e => setExpDescription(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" rows={3}></textarea>
                      <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Simpan</button>
                   </form>
                </div>
             </div>
             <div className="lg:col-span-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                   <h3 className="mb-4 font-bold text-gray-900">Riwayat Pengalaman</h3>
                   <div className="space-y-4">
                      {profile.experiences.map(exp => (
                         <div key={exp.id} className="relative rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-colors">
                            <h4 className="font-bold text-gray-900">{exp.title}</h4>
                            <p className="text-sm font-medium text-blue-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">{exp.start_date} - {exp.end_date || "Sekarang"}</p>
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">{exp.description}</p>
                            <button onClick={() => handleDeleteExperience(exp.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </main>
  );
}