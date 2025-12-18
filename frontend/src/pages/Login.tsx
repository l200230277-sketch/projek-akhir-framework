import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { theme } from "../theme";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/accounts/auth/login/`, {
        email,
        password,
      });
      const { access, refresh } = res.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Email atau password salah.");
    }
  }

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="flex min-h-screen items-center justify-center px-4 py-8"
    >
      <div
        className="w-full max-w-md md:max-w-lg rounded-3xl bg-white p-10 md:p-12 shadow-xl"
        style={{ borderColor: theme.colors.border }}
      >
        {/* Judul */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">
          Login Mahasiswa
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 text-center">
          Masuk untuk mengelola profil talenta Anda
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm md:text-base text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            required
            placeholder="nama@ums.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-5 py-3 md:py-4 text-base md:text-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600"
            style={{ borderColor: theme.colors.border }}
          />
          <input
            type="password"
            required
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-5 py-3 md:py-4 text-base md:text-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600"
            style={{ borderColor: theme.colors.border }}
          />
          <button
            type="submit"
            className="w-full rounded-xl px-5 py-3 md:py-4 font-semibold text-white text-base md:text-lg shadow-md hover:brightness-110 transition duration-200"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Masuk
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm md:text-base text-gray-600">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-blue-700">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
