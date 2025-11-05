import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Login({ setTab, setIsLoggedIn }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    // Prop 检查（调试用）
    if (typeof setIsLoggedIn !== 'function') {
      console.error('setIsLoggedIn is not a function!', setIsLoggedIn);
      setError('Internal error: Invalid login state handler');
      setIsLoading(false);
      return;
    }
    if (typeof setTab !== 'function') {
      console.error('setTab is not a function!', setTab);
      setError('Internal error: Invalid tab handler');
      setIsLoading(false);
      return;
    }

    if (phoneNumber.length < 10) {
      setError("Phone number must be at least 10 digits");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('phone_number', phoneNumber)
        .single();

      if (queryError || !data) {
        console.error("Supabase query error:", queryError);
        setError("User not found");
        setIsLoading(false);
        return;
      }

      if (password === data.password_hash) { // TODO: 生产环境用 bcrypt.compare
        console.log("Login successful:", data); // 调试
        localStorage.setItem('phone_number', phoneNumber);
        setIsLoggedIn(true);
        setTab("home");
      } else {
        setError("Incorrect password");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setError("An error occurred during login: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Login</h2>
      </div>

      <div className="px-4 mt-8 space-y-4">
        <div>
          <label className="text-sm text-slate-500">Phone Number</label>
          <input
            type="text"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Password</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full text-slate-900 font-semibold py-3 rounded-xl mt-4 transition ${
            isLoading ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          <span>
            Don't have an account?{" "}
            <button
              onClick={() => setTab("register")}
              className="text-yellow-500 font-semibold"
              disabled={isLoading}
            >
              Create an account
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
