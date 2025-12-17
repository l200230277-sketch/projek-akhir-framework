import { theme } from "../theme";

export function Footer() {
  return (
    <footer
      style={{ backgroundColor: theme.colors.surface }}
      className="mt-12 border-t border-black/5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-gray-700 md:flex-row md:items-center md:justify-between">
        <div>
          © {new Date().getFullYear()} Talenta Mahasiswa UMS. Dibangun untuk
          Mata Kuliah TIF 1336 Pemrograman Web Berbasis Framework.
        </div>
        <div className="flex gap-4">
          <span className="font-medium">Universitas Muhammadiyah Surakarta</span>
        </div>
      </div>
    </footer>
  );
}



