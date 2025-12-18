import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  photo: string | null;
  skills: { id: number; skill: { id: number; name: string }; level: string }[];
  experiences: {
    id: number;
    title: string;
    company: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
}

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/talents/${id}/`);
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCV() {
    if (!profile) return;

    try {
      // Dynamically import jsPDF
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add new page if needed
    function checkNewPage(requiredSpace: number) {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    }

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(profile.user_full_name, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(profile.email, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.text(
      `${profile.nim} • ${profile.prodi} • Angkatan ${profile.angkatan}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 15;

    // Headline
    if (profile.headline) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Headline", 20, yPosition);
      yPosition += 7;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const headlineLines = doc.splitTextToSize(profile.headline, pageWidth - 40);
      doc.text(headlineLines, 20, yPosition);
      yPosition += headlineLines.length * 5 + 10;
    }

    // Bio
    if (profile.bio) {
      checkNewPage(15);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Tentang", 20, yPosition);
      yPosition += 7;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const bioLines = doc.splitTextToSize(profile.bio, pageWidth - 40);
      doc.text(bioLines, 20, yPosition);
      yPosition += bioLines.length * 5 + 10;
    }

    // Skills
    if (profile.skills && profile.skills.length > 0) {
      checkNewPage(15);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Skills", 20, yPosition);
      yPosition += 7;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      profile.skills.forEach((skill) => {
        checkNewPage(7);
        doc.text(
          `• ${skill.skill.name} (${skill.level})`,
          25,
          yPosition
        );
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Experiences
    if (profile.experiences && profile.experiences.length > 0) {
      checkNewPage(15);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Pengalaman", 20, yPosition);
      yPosition += 7;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      profile.experiences.forEach((exp) => {
        checkNewPage(25);
        doc.setFont("helvetica", "bold");
        doc.text(exp.title, 25, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        doc.text(exp.company, 25, yPosition);
        yPosition += 6;
        const startDate = new Date(exp.start_date).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        });
        const endDate = exp.end_date
          ? new Date(exp.end_date).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
            })
          : "Sekarang";
        doc.text(`${startDate} - ${endDate}`, 25, yPosition);
        yPosition += 6;
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, pageWidth - 50);
          doc.text(descLines, 25, yPosition);
          yPosition += descLines.length * 5;
        }
        yPosition += 5;
      });
    }

      // Save PDF
      doc.save(`${profile.user_full_name}_CV.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh CV. Pastikan paket jsPDF terpasang.");
    }
  }

  if (loading) {
    return (
      <main
        style={{ backgroundColor: theme.colors.background }}
        className="flex min-h-[calc(100vh-120px)] items-center justify-center"
      >
        <p className="text-gray-600">Memuat profil...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main
        style={{ backgroundColor: theme.colors.background }}
        className="flex min-h-[calc(100vh-120px)] items-center justify-center"
      >
        <div className="text-center">
          <p className="text-red-600">{error || "Profil tidak ditemukan."}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="min-h-[calc(100vh-120px)]"
    >
      <div className="mx-auto max-w-4xl px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Kembali
        </button>

        <div
          style={{ backgroundColor: theme.colors.surface }}
          className="rounded-2xl border border-black/5 p-6"
        >
          {/* Profile Header */}
          <div className="mb-6 flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
            {profile.photo ? (
              <img
                src={`${API_BASE_URL}${profile.photo}`}
                alt={profile.user_full_name}
                className="mb-4 h-32 w-32 rounded-full object-cover border-4 border-white shadow-md md:mb-0 md:mr-6"
              />
            ) : (
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 text-4xl text-gray-500 border-4 border-white shadow-md md:mb-0 md:mr-6">
                {profile.user_full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.user_full_name}</h1>
              <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
              <p className="mt-1 text-sm text-gray-600">
                {profile.nim} • {profile.prodi} • Angkatan {profile.angkatan}
              </p>
              {profile.headline && (
                <p className="mt-3 text-base text-gray-700">{profile.headline}</p>
              )}
            </div>
          </div>

          {/* Download CV Button (only if logged in) */}
          {token && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={downloadCV}
                style={{ backgroundColor: theme.colors.primary }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
              >
                Download CV (PDF)
              </button>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Tentang</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {skill.skill.name} ({skill.level})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experiences */}
          {profile.experiences && profile.experiences.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Pengalaman</h2>
              <div className="space-y-4">
                {profile.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <h3 className="text-base font-semibold text-gray-900">{exp.title}</h3>
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
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!profile.skills || profile.skills.length === 0) &&
            (!profile.experiences || profile.experiences.length === 0) && (
              <p className="text-sm text-gray-600">Belum ada informasi tambahan.</p>
            )}
        </div>
      </div>
    </main>
  );
}

