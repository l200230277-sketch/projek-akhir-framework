import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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
        password
      });
      const { access, refresh } = res.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      // Redirect to dashboard immediately
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Email atau password salah.");
    }
  }

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4"
    >
      <div className="w-full max-width-md max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Login Mahasiswa</h1>
        <p className="mb-6 text-sm text-gray-600">
          Masuk untuk mengelola profil talenta Anda.
        </p>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email UMS
            </label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: theme.colors.primary }}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            Masuk
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-blue-700">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}



