import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type Talent = {
  id: number;
  user_full_name: string;
  email: string;
  nim: string;
  prodi: string;
  angkatan: string;
  headline: string;
  bio: string;
  skills: { id: number; skill: { id: number; name: string }; level: string }[];
};

export function TalentsList() {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [items, setItems] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    }, 350); // debounce typing

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, skill]);

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="min-h-[calc(100vh-120px)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Talenta</h1>
            <p className="text-sm text-gray-700">
              Jelajahi talenta mahasiswa UMS dan gunakan filter berdasarkan nama,
              skill, atau program studi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Cari nama / NIM / prodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              placeholder="Filter skill (mis. React, Django)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div
          style={{ backgroundColor: theme.colors.surface }}
          className="rounded-2xl border border-black/5 p-6"
        >
          {loading ? (
            <p className="text-sm text-gray-700">Memuat...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-700">Tidak ada talenta yang cocok.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((t) => (
                <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {t.user_full_name || t.email}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {t.nim} • {t.prodi} • {t.angkatan}
                      </p>
                      {t.headline && (
                        <p className="mt-2 text-sm text-gray-700">{t.headline}</p>
                      )}
                    </div>
                  </div>
                  {t.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.skills.slice(0, 6).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                        >
                          {s.skill.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



