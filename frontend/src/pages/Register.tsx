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
    let processedValue = value;
    
    // Client-side validation
    if (name === "full_name") {
      // Only letters, spaces, dots, commas, hyphens, apostrophes
      processedValue = value.replace(/[^a-zA-Z\s\.\,\-\']/g, "");
    } else if (name === "nim") {
      // Only digits, max 10 characters
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "angkatan") {
      // Only digits, max 4 characters
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "prodi") {
      // Only letters, spaces, and some punctuation
      processedValue = value.replace(/[^a-zA-Z\s\.\,\-\(\)]/g, "");
    }
    
    setForm((prev) => ({ ...prev, [name]: processedValue }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Client-side validation
    const errors: string[] = [];
    
    if (!form.full_name.trim()) {
      errors.push("Nama lengkap wajib diisi");
    } else if (!/^[a-zA-Z\s\.\,\-\']+$/.test(form.full_name)) {
      errors.push("Nama hanya boleh berisi huruf, spasi, dan tanda baca");
    }
    
    if (!form.nim.trim()) {
      errors.push("NIM wajib diisi");
    } else if (form.nim.length > 10) {
      errors.push("NIM maksimal 10 karakter");
    } else if (!/^\d+$/.test(form.nim)) {
      errors.push("NIM hanya boleh berisi angka");
    }
    
    if (!form.angkatan.trim()) {
      errors.push("Angkatan wajib diisi");
    } else if (form.angkatan.length !== 4) {
      errors.push("Angkatan harus 4 digit");
    } else if (!/^\d+$/.test(form.angkatan)) {
      errors.push("Angkatan hanya boleh berisi angka");
    }
    
    if (!form.prodi.trim()) {
      errors.push("Program studi wajib diisi");
    } else if (!/^[a-zA-Z\s\.\,\-\(\)]+$/.test(form.prodi)) {
      errors.push("Program studi hanya boleh berisi huruf dan tanda baca");
    }
    
    if (!form.email.trim()) {
      errors.push("Email wajib diisi");
    } else if (!/^[a-zA-Z0-9]+@student\.ums\.ac\.id$/.test(form.email)) {
      errors.push("Email harus menggunakan format: nim@student.ums.ac.id");
    } else {
      // Validate NIM matches email
      const emailNim = form.email.split("@")[0];
      if (emailNim !== form.nim) {
        errors.push("NIM di email harus sama dengan NIM yang diinput");
      }
    }
    
    if (!form.password) {
      errors.push("Password wajib diisi");
    }
    
    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/api/accounts/auth/register/`, form);
      // Auto login after registration
      try {
        const loginRes = await axios.post(`${API_BASE_URL}/api/accounts/auth/login/`, {
          email: form.email,
          password: form.password
        });
        const { access, refresh } = loginRes.data;
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        navigate("/dashboard");
      } catch (loginErr) {
        navigate("/login");
      }
    } catch (err: any) {
      console.error(err);
      // Tampilkan error message yang lebih detail dari backend
      if (err.response?.data) {
        const errorData = err.response.data;
        const errorMessages: string[] = [];
        
        // Format errors clearly
        Object.entries(errorData).forEach(([key, value]: [string, any]) => {
          const messages = Array.isArray(value) ? value.join(", ") : String(value);
          // Translate field names to Indonesian
          const fieldNames: { [key: string]: string } = {
            full_name: "Nama lengkap",
            email: "Email",
            password: "Password",
            nim: "NIM",
            prodi: "Program studi",
            angkatan: "Angkatan",
            non_field_errors: ""
          };
          const fieldName = fieldNames[key] || key;
          if (fieldName) {
            errorMessages.push(`${fieldName}: ${messages}`);
          } else {
            errorMessages.push(messages);
          }
        });
        
        setError(errorMessages.length > 0 ? errorMessages.join(". ") : "Gagal mendaftar, periksa kembali data Anda.");
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
              maxLength={10}
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
              maxLength={4}
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



