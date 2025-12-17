import { Link } from "react-router-dom";
import { theme } from "../theme";

export function Home() {
  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="min-h-[calc(100vh-120px)]"
    >
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-center">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Jelajahi <span style={{ color: theme.colors.primary }}>Talenta</span>{" "}
            Terbaik Mahasiswa UMS
          </h1>
          <p className="max-w-xl text-gray-700">
            Platform resmi untuk menampilkan profil, skill, portofolio, dan
            pengalaman mahasiswa Universitas Muhammadiyah Surakarta kepada
            dunia industri dan masyarakat luas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/talents"
              className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Lihat Daftar Talenta
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-blue-700 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Daftarkan Profilmu
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div
            style={{ backgroundColor: theme.colors.surface }}
            className="rounded-3xl border border-black/5 p-6 shadow-sm"
          >
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Talenta Terbaru
            </h2>
            <p className="text-sm text-gray-600">
              Nanti di sini akan tampil 5 talenta terbaru dari endpoint{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
                /api/talents/latest/
              </code>{" "}
              (bisa diisi dengan fetch data menggunakan React Query).
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}



