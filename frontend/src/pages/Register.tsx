import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { theme } from "../theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    nim: "",
    prodi: "",
    angkatan: ""
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/accounts/auth/register/`, form);
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      // Tampilkan error message yang lebih detail dari backend
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.password) {
          // Jika error password validation, tampilkan detailnya
          const passwordErrors = Array.isArray(errorData.password) 
            ? errorData.password.join(", ") 
            : errorData.password;
          setError(`Password: ${passwordErrors}`);
        } else if (errorData.email) {
          setError(`Email: ${Array.isArray(errorData.email) ? errorData.email.join(", ") : errorData.email}`);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(", ") : errorData.non_field_errors);
        } else {
          // Tampilkan semua error yang ada
          const errorMessages = Object.entries(errorData)
            .map(([key, value]: [string, any]) => {
              const messages = Array.isArray(value) ? value.join(", ") : value;
              return `${key}: ${messages}`;
            })
            .join("; ");
          setError(errorMessages || "Gagal mendaftar, periksa kembali data Anda.");
        }
      } else {
        setError("Gagal mendaftar, periksa kembali data Anda.");
      }
    }
  }

  return (
    <main
      style={{ backgroundColor: theme.colors.background }}
      className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Daftar Talenta</h1>
        <p className="mb-6 text-sm text-gray-600">
          Buat akun menggunakan email UMS Anda, kemudian lengkapi profil di
          dashboard.
        </p>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              NIM
            </label>
            <input
              name="nim"
              value={form.nim}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Program Studi
            </label>
            <input
              name="prodi"
              value={form.prodi}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Angkatan
            </label>
            <input
              name="angkatan"
              value={form.angkatan}
              onChange={handleChange}
              placeholder="2022"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email UMS
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              style={{ backgroundColor: theme.colors.primary }}
              className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              Daftar
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-blue-700">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}



