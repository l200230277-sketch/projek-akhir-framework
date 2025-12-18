import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { theme } from "../theme";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";


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

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/${id}/`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadDataDiri() {
    if (!profile) return;

    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF();
    let y = 20;

    // Nama
    doc.setFontSize(18);
    doc.text(profile.user_full_name, 105, y, { align: "center" });
    y += 10;

    // Email
    doc.setFontSize(11);
    doc.text(profile.email, 105, y, { align: "center" });
    y += 6;

    // NIM • Prodi • Angkatan
    doc.text(
      `${profile.nim} • ${profile.prodi} • Angkatan ${profile.angkatan}`,
      105,
      y,
      { align: "center" }
    );

    y += 15;

    // Judul Data Diri
    doc.setFontSize(14);
    doc.text("Data Diri Mahasiswa", 20, y);
    y += 8;

    // Isi Data Diri
    doc.setFontSize(11);
    doc.text(`Nama       : ${profile.user_full_name}`, 20, y); y += 6;
    doc.text(`Email      : ${profile.email}`, 20, y); y += 6;
    doc.text(`NIM        : ${profile.nim}`, 20, y); y += 6;
    doc.text(`Prodi      : ${profile.prodi}`, 20, y); y += 6;
    doc.text(`Angkatan   : ${profile.angkatan}`, 20, y);
    y += 10;

    // Keahlian
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

    // Pengalaman
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
        // tanggal di baris terpisah di bawah company
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

  if (loading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Memuat profil...</p>
      </main>
    );
  }

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="min-h-screen flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-xl">
        <div
          style={{ backgroundColor: theme.colors.surface }}
          className="rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex flex-col items-center text-center px-6 py-8 border-b border-slate-100">
            {profile.photo ? (
              <img
                src={`${API_BASE_URL}${profile.photo}`}
                alt={profile.user_full_name}
                className="h-28 w-28 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-500">
                {profile.user_full_name.charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
               {profile.user_full_name}
            </h1>

            <div className="mt-1 leading-tight text-sm text-slate-500">
               <p>{profile.email}</p>
               <p className="opacity-90">
                  {profile.nim} • {profile.prodi} • Angkatan {profile.angkatan}
               </p>
            </div>


            {profile.headline && (
              <p className="mt-4 max-w-xl text-slate-700">
                {profile.headline}
              </p>
            )}

            {/* BUTTONS */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={downloadDataDiri}
                style={{ backgroundColor: "#334155" }}
                className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition"
              >
                ⬇ Download CV Mahasiswa
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-6 py-8 space-y-6">

            {/* SKILLS */}
            {profile.skills.length > 0 && (
              <section className="pt-1 border-b border-slate-100 pb-4">
                <div className="rounded-2xl bg-white/80 border border-slate-200 px-5 py-4">
                  <h2 className="mb-2 text-lg font-semibold text-slate-700 pl-1">
                    Keahlian
                  </h2>
                  <ul className="space-y-1 text-sm text-slate-700 pl-3">

                    {profile.skills.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-full bg-slate-100 px-4 py-1.5 text-sm"
                      >
                        {s.skill.name} ({s.level})
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* EXPERIENCE */}
            {profile.experiences.length > 0 && (
              <section className="pt-1">
                <div className="rounded-2xl bg-white/80 border border-slate-200 px-5 py-4">
                  <h2 className="mb-2 text-lg font-semibold text-slate-700 pl-1">
                    Pengalaman
                  </h2>
                  <ul className="space-y-4 text-sm text-slate-700">
                    {profile.experiences.map((exp) => {
                      const start = new Date(
                        exp.start_date
                      ).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      });
                      const end = exp.end_date
                        ? new Date(exp.end_date).toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Sekarang";
                      return (
                        <li key={exp.id} className="space-y-1">
                          <div className="font-medium text-slate-800">
                            {exp.title} — {exp.company}
                          </div>
                          <div className="ml-4 mt-0.5 text-xs text-slate-500">
                            {start} – {end}
                          </div>
                          {exp.description && (
                            <div className="ml-4 mt-0.5 text-slate-700">
                              {exp.description}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            )}

            {/* BACK */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Kembali
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
