import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface Statistics {
  total_talents: number;
  total_skills: number;
  total_experiences: number;
}

interface Talent {
  id: number;
  user_full_name: string;
  email: string;
  nim: string;
  prodi: string;
  angkatan: string;
  headline: string;
  bio: string;
  photo: string | null;
  skills: { id: number; skill: { id: number; name: string }; level: string }[];
  experiences: { id: number; title: string; company: string; start_date: string; end_date: string | null }[];
}

export function PublicDashboard() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [search, setSearch] = useState("");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const timer = setTimeout(() => {
        performSearch();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setTalents([]);
      setShowResults(false);
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

  async function performSearch() {
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/public/`, {
        params: { search: search.trim() },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setTalents(data);
      setShowResults(true);
    } catch (err) {
      console.error("Error searching talents:", err);
    } finally {
      setSearchLoading(false);
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

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="min-h-[calc(100vh-120px)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Hero section */}
        <section className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Jelajahi{" "}
              <span style={{ color: theme.colors.primary }}>Talenta Mahasiswa UMS</span>
            </h1>
            <p className="max-w-xl text-sm text-gray-700 md:text-base">
              Temukan profil, skill, dan pengalaman terbaik mahasiswa Universitas Muhammadiyah
              Surakarta dalam satu dashboard modern.
            </p>
          </div>
          {/* Statistics cards horizontal */}
          {!showResults && statistics && (
            <div className="grid w-full grid-cols-1 gap-3 md:w-auto md:grid-cols-3">
              <div
                style={{ backgroundColor: theme.colors.surface }}
                className="flex items-center gap-3 rounded-2xl border border-black/5 px-4 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  {/* Ikon orang sederhana */}
                  <span className="text-lg font-bold">👤</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {statistics.total_talents}
                  </div>
                  <div className="text-xs text-gray-600">Pendaftar Talenta</div>
                </div>
              </div>
              <div
                style={{ backgroundColor: theme.colors.surface }}
                className="flex items-center gap-3 rounded-2xl border border-black/5 px-4 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  {/* Ikon skill (bintang) */}
                  <span className="text-lg font-bold">⭐</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {statistics.total_skills}
                  </div>
                  <div className="text-xs text-gray-600">Total Skill</div>
                </div>
              </div>
              <div
                style={{ backgroundColor: theme.colors.surface }}
                className="flex items-center gap-3 rounded-2xl border border-black/5 px-4 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  {/* Ikon pengalaman (briefcase) */}
                  <span className="text-lg font-bold">💼</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {statistics.total_experiences}
                  </div>
                  <div className="text-xs text-gray-600">Total Pengalaman</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari talenta berdasarkan nama, NIM, program studi, atau skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchLoading && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                Memuat...
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div
            style={{ backgroundColor: theme.colors.surface }}
            className="rounded-2xl border border-black/5 p-6"
          >
            {searchLoading ? (
              <p className="text-sm text-gray-600">Mencari...</p>
            ) : talents.length === 0 ? (
              <p className="text-sm text-gray-600">
                Tidak ada talenta yang cocok dengan pencarian Anda.
              </p>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hasil Pencarian ({talents.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {talents.map((talent) => (
                    <div
                      key={talent.id}
                      onClick={() => navigate(`/profile/${talent.id}`)}
                      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        {talent.photo ? (
                          <img
                            src={`${API_BASE_URL}${talent.photo}`}
                            alt={talent.user_full_name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                            {talent.user_full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {talent.user_full_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {talent.nim} • {talent.prodi} • {talent.angkatan}
                          </p>
                          {talent.headline && (
                            <p className="mt-1 text-sm text-gray-700">{talent.headline}</p>
                          )}
                        </div>
                      </div>
                      {talent.skills && talent.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {talent.skills.slice(0, 5).map((s) => (
                            <span
                              key={s.id}
                              className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                            >
                              {s.skill.name}
                            </span>
                          ))}
                          {talent.skills.length > 5 && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              +{talent.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      {talent.experiences && talent.experiences.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {talent.experiences.length} pengalaman
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call to Action when no search */}
        {!showResults && (
          <div
            style={{ backgroundColor: theme.colors.surface }}
            className="rounded-2xl border border-black/5 p-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Gunakan kotak pencarian di atas untuk menemukan talenta yang Anda cari.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}


