// components/Invite.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Invite({ setTab, userId, isLoggedIn }) {
  const [referralCode, setReferralCode] = useState("");
  const [downlineCount, setDownlineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 复制邀请码
  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Invitation code copied!");
  };

  // 加载我的邀请码 + 下级人数
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setLoading(false);
      return;
    }

    const fetchInviteData = async () => {
      try {
        setLoading(true);

        // 1. 获取当前用户的邀请码
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("referral_code")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        setReferralCode(userData.referral_code || "N/A");

        // 2. 获取下级人数（invited_by = userId）
        const { count, error: countError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("invited_by", userId);

        if (countError) throw countError;
        setDownlineCount(count || 0);
      } catch (err) {
        console.error("Error loading invite data:", err);
        setReferralCode("Error");
        setDownlineCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [userId, isLoggedIn]);

  return (
    <div className="px-4 pb-24 max-w-md mx-auto bg-[#f5f7fb] min-h-screen">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Invite</h2>
      </div>

      {/* 下级人数统计 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <div className="text-sm text-slate-600">Downline Users</div>
          <div className="text-2xl font-bold text-yellow-500">
            {loading ? "..." : downlineCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <div className="text-sm text-slate-600">Effective Users</div>
          <div className="text-2xl font-bold text-yellow-500">
            {loading ? "..." : downlineCount}
          </div>
        </div>
      </div>

      {/* 我的邀请码 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="text-sm text-slate-600 mb-1">My Invitation Code</div>
        <div className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
          <span className="text-lg font-mono text-slate-700 tracking-wider">
            {loading ? "Loading..." : referralCode}
          </span>
          <button
            onClick={copyCode}
            disabled={loading || !referralCode || referralCode === "N/A"}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 提示文字 */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Share your code to invite friends and earn rewards!
      </div>
    </div>
  );
}
