import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { TalentsList } from "./pages/TalentsList";
import { PublicDashboard } from "./pages/PublicDashboard";
import { ProfileDetail } from "./pages/ProfileDetail";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/talents" element={<TalentsList />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;



