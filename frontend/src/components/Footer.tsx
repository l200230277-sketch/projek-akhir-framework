import { theme } from "../theme";

export function Footer() {
  return (
    <footer style={{ backgroundColor: theme.colors.primary }} className="mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-base md:text-lg text-white">
        © {new Date().getFullYear()} Talenta Mahasiswa UMS. Dibangun untuk Mata
        Kuliah TIF 1336 Pemrograman Web Berbasis Framework.
        <br />
        <span className="font-semibold">
          Universitas Muhammadiyah Surakarta
        </span>
      </div>
    </footer>
  );
}
