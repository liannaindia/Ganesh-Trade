import React, { useState } from "react";
import { ArrowLeft, Headphones } from "lucide-react";

export default function Register({ setTab }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  const handleRegister = () => {
    if (password === retypePassword) {
      console.log("Registering with phone:", phoneNumber);
    } else {
      console.log("Passwords do not match");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Welcome to Register</h2>
      </div>

      <div className="px-4 mt-8">
        <div className="mb-4">
          <label className="text-sm text-slate-500">Phone Number</label>
          <div className="flex items-center border border-slate-200 rounded-lg">
            <span className="text-sm text-slate-500 px-3">+91</span>
            <input
              type="text"
              className="w-full py-2 px-3 text-sm text-slate-700"
              placeholder="Enter the phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-500">Set Login Password</label>
          <input
            type="password"
            className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700"
            placeholder="Set login password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-500">Retype Password</label>
          <input
            type="password"
            className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700"
            placeholder="Retype password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-slate-500">
            <input type="checkbox" className="mr-2" />
            <span>
              I have read and agree to <a href="#">User Agreement</a> and{" "}
              <a href="#">Privacy Policy</a>
            </span>
          </div>
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl"
        >
          Register
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500">
        <span>
          Already have an account?{" "}
          <button
            onClick={() => setTab("login")}
            className="text-yellow-500 font-semibold"
          >
            Login now
          </button>
        </span>
      </div>

      <div className="mt-3 text-center">
        <button
          onClick={() => window.open("https://t.me/ganeshsupport", "_blank")}
          className="flex justify-center items-center gap-2 text-slate-500 hover:text-yellow-500"
        >
          <Headphones className="w-5 h-5" />
          <span>Contact Support</span>
        </button>
      </div>
    </div>
  );
}
