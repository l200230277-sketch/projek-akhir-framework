import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface Profile {
  id: number;
  user_full_name: string;
  email: string;
  nim: string;
  prodi: string;
  angkatan: string;
  headline: string;
  bio: string;
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

export function Dashboard() {
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "skills" | "experiences">("profile");
  
  // Skill form
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [skillError, setSkillError] = useState<string | null>(null);
  
  // Experience form
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
  }, [navigate, token]);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/me/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSkill(e: FormEvent) {
    e.preventDefault();
    setSkillError(null);
    try {
      await axios.post(
        `${API_BASE_URL}/api/talents/me/skills/`,
        { skill_name: skillName, level: skillLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkillName("");
      setSkillLevel("Beginner");
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const errorData = err.response.data;
        const errorMsg = Object.entries(errorData)
          .map(([key, value]: [string, any]) => {
            const messages = Array.isArray(value) ? value.join(", ") : value;
            return `${key}: ${messages}`;
          })
          .join("; ");
        setSkillError(errorMsg || "Gagal menambah skill.");
      } else {
        setSkillError("Gagal menambah skill.");
      }
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
      console.error("Error deleting skill:", err);
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
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const errorData = err.response.data;
        const errorMsg = Object.entries(errorData)
          .map(([key, value]: [string, any]) => {
            const messages = Array.isArray(value) ? value.join(", ") : value;
            return `${key}: ${messages}`;
          })
          .join("; ");
        setExpError(errorMsg || "Gagal menambah pengalaman.");
      } else {
        setExpError("Gagal menambah pengalaman.");
      }
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
      console.error("Error deleting experience:", err);
      alert("Gagal menghapus pengalaman.");
    }
  }

  if (loading) {
    return (
      <main
        style={{ backgroundColor: theme.colors.background }}
        className="flex min-h-[calc(100vh-120px)] items-center justify-center"
      >
        <p className="text-gray-600">Memuat data...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main
        style={{ backgroundColor: theme.colors.background }}
        className="flex min-h-[calc(100vh-120px)] items-center justify-center"
      >
        <p className="text-red-600">Gagal memuat profil.</p>
      </main>
    );
  }

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="min-h-[calc(100vh-120px)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Dashboard Mahasiswa</h1>
        <p className="mb-6 text-sm text-gray-700">
          Kelola profil, skill, dan pengalaman Anda di sini.
        </p>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "skills"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Skill ({profile.skills.length})
          </button>
          <button
            onClick={() => setActiveTab("experiences")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "experiences"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pengalaman ({profile.experiences.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div
            style={{ backgroundColor: theme.colors.surface }}
            className="rounded-2xl border border-black/5 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Profil</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nama:</span>{" "}
                <span className="text-gray-900">{profile.user_full_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>{" "}
                <span className="text-gray-900">{profile.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">NIM:</span>{" "}
                <span className="text-gray-900">{profile.nim}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Program Studi:</span>{" "}
                <span className="text-gray-900">{profile.prodi}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Angkatan:</span>{" "}
                <span className="text-gray-900">{profile.angkatan}</span>
              </div>
              {profile.headline && (
                <div>
                  <span className="font-medium text-gray-700">Headline:</span>{" "}
                  <span className="text-gray-900">{profile.headline}</span>
                </div>
              )}
              {profile.bio && (
                <div>
                  <span className="font-medium text-gray-700">Bio:</span>{" "}
                  <span className="text-gray-900">{profile.bio}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            {/* Add Skill Form */}
            <div
              style={{ backgroundColor: theme.colors.surface }}
              className="rounded-2xl border border-black/5 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Tambah Skill</h2>
              {skillError && (
                <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {skillError}
                </div>
              )}
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nama Skill
                  </label>
                  <input
                    type="text"
                    required
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Contoh: Python, JavaScript, React"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.colors.primary }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                >
                  Tambah Skill
                </button>
              </form>
            </div>

            {/* Skills List */}
            <div
              style={{ backgroundColor: theme.colors.surface }}
              className="rounded-2xl border border-black/5 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Daftar Skill</h2>
              {profile.skills.length === 0 ? (
                <p className="text-sm text-gray-600">Belum ada skill yang ditambahkan.</p>
              ) : (
                <div className="space-y-2">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div>
                        <span className="font-medium text-gray-900">{skill.skill.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({skill.level})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === "experiences" && (
          <div className="space-y-6">
            {/* Add Experience Form */}
            <div
              style={{ backgroundColor: theme.colors.surface }}
              className="rounded-2xl border border-black/5 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Tambah Pengalaman</h2>
              {expError && (
                <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {expError}
                </div>
              )}
              <form onSubmit={handleAddExperience} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Judul Posisi
                  </label>
                  <input
                    type="text"
                    required
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Contoh: Web Developer Intern"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Perusahaan/Organisasi
                  </label>
                  <input
                    type="text"
                    required
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Contoh: PT. Contoh Teknologi"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      required
                      value={expStartDate}
                      onChange={(e) => setExpStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tanggal Selesai (opsional)
                    </label>
                    <input
                      type="date"
                      value={expEndDate}
                      onChange={(e) => setExpEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Deskripsi (opsional)
                  </label>
                  <textarea
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Jelaskan tanggung jawab dan pencapaian Anda..."
                  />
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.colors.primary }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                >
                  Tambah Pengalaman
                </button>
              </form>
            </div>

            {/* Experiences List */}
            <div
              style={{ backgroundColor: theme.colors.surface }}
              className="rounded-2xl border border-black/5 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Daftar Pengalaman</h2>
              {profile.experiences.length === 0 ? (
                <p className="text-sm text-gray-600">Belum ada pengalaman yang ditambahkan.</p>
              ) : (
                <div className="space-y-4">
                  {profile.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(exp.start_date).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                            })}{" "}
                            -{" "}
                            {exp.end_date
                              ? new Date(exp.end_date).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                  month: "long",
                                })
                              : "Sekarang"}
                          </p>
                          {exp.description && (
                            <p className="mt-2 text-sm text-gray-700">{exp.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="ml-4 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
