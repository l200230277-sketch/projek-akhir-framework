import { theme } from "../theme";

export function TalentsList() {
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
              className="min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              placeholder="Filter skill (mis. React, Django)"
              className="min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div
          style={{ backgroundColor: theme.colors.surface }}
          className="rounded-2xl border border-black/5 p-6 text-sm text-gray-700"
        >
          Di sini nanti akan dilakukan pemanggilan ke endpoint{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
            /api/talents/public?search=&amp;skill=&amp;prodi=
          </code>{" "}
          menggunakan React Query, lalu menampilkan kartu-kartu profil talenta.
        </div>
      </div>
    </main>
  );
}



