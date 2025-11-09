// components/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, call } from '../supabaseClient';

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const { data } = await call(
      supabase.auth.signInWithPassword({
        email: username,
        password,
      })
    );

    const { data: profile, error: profileError } = await call(
      supabase.from("users").select("role").eq("id", data.user.id).single()
    );

    if (profileError || !profile?.role || profile.role !== "admin") {
      setError("Access denied");
      return;
    }

    localStorage.setItem("adminLoggedIn", "true");
    navigate("/admin", { replace: true });
  } catch (err) {
    setError("Invalid credentials");
  }
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border-2 border-orange-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white font-bold">GT</span>
          </div>
          <h2 className="text-3xl font-bold text-orange-800 tracking-tight">Ganesh Trade Admin</h2>
          <p className="text-orange-600 mt-2">Enter admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-orange-700 mb-2">Email</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              placeholder="admin@ganesh.trade"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-orange-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition-all"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-yellow-600 transform transition-all hover:scale-105 shadow-lg"
          >
            Login to Admin
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-orange-600">
          <p>Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}
