// components/Invite.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Copy, X, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Invite({ setTab, userId, isLoggedIn }) {
  const [referralCode, setReferralCode] = useState("");
  const [downlineCount, setDownlineCount] = useState(0);
  const [downlineUsers, setDownlineUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  // Copy invitation code
  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Invitation code copied!");
  };

  // Mask phone: 138****5678
  const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(-4);
  };

  // Initial load: code + count + list
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const { data: userData, error: userErr } = await supabase
          .from("users")
          .select("referral_code")
          .eq("id", userId)
          .single();

        if (userErr) throw userErr;
        setReferralCode(userData.referral_code || "N/A");

        await fetchDownline();
      } catch (err) {
        console.error("Initial load error:", err);
        setReferralCode("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId, isLoggedIn]);

  // Fetch downline data
  const fetchDownline = async () => {
    try {
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("invited_by", userId);

      setDownlineCount(count || 0);

      const { data, error } = await supabase
        .from("users")
        .select("phone_number, created_at")
        .eq("invited_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDownlineUsers(data || []);
    } catch (err) {
      console.error("Fetch downline error:", err);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const channel = supabase
      .channel(`invite-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "users",
          filter: `invited_by=eq.${userId}`,
        },
        (payload) => {
          const newUser = payload.new;
          setDownlineCount((prev) => prev + 1);
          setDownlineUsers((prev) => [
            {
              phone_number: newUser.phone_number,
              created_at: newUser.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isLoggedIn]);

  // Show downline modal
  const handleShowDownline = async () => {
    if (!userId || downlineCount === 0) return;
    setModalLoading(true);
    setShowModal(true);
    await fetchDownline();
    setModalLoading(false);
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto bg-[#f5f7fb] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Invite</h2>
      </div>

      {/* Downline Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm cursor-pointer hover:bg-slate-50 transition"
          onClick={handleShowDownline}
        >
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

      {/* My Invitation Code */}
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

      {/* === Team Level Reward Model (Collapsible) === */}
      <div className="mt-5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowRewards(!showRewards)}
          className="w-full p-4 flex items-center justify-between text-white font-semibold"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span>Team Level Reward Model (₹10,000 Start)</span>
          </div>
          {showRewards ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {showRewards && (
          <div className="bg-white p-4 max-h-96 overflow-y-auto">
            <div className="text-xs text-slate-500 mb-3 text-center">
              Minimum recharge ₹10,000 (≈113 USDT) · Direct referral reward per person · Team size unlocks base reward
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-left font-bold text-orange-600">Rank</th>
                  <th className="py-2 text-center font-bold text-orange-600">Condition</th>
                  <th className="py-2 text-center font-bold text-green-600">Base Reward</th>
                  <th className="py-2 text-center font-bold text-blue-600">Direct Reward</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: "Jawan (जवान)", cond: "Direct 3", base: "30", inr: "2,650", direct: "10" },
                  { rank: "Naik (नायक)", cond: "Direct 4 + Team 9", base: "90", inr: "7,950", direct: "20" },
                  { rank: "Havildar (हविलदार)", cond: "Direct 5 + Team 27", base: "160", inr: "14,130", direct: "30" },
                  { rank: "Naib-Subedar", cond: "Direct 8 + Team 81", base: "350", inr: "30,900", direct: "40" },
                  { rank: "Subedar (सुबेदार)", cond: "Direct 12 + Team 243", base: "700", inr: "61,800", direct: "50" },
                  { rank: "Jemadar (जमादार)", cond: "Direct 20 + Team 729", base: "1,500", inr: "132,420", direct: "70" },
                  { rank: "Rissaldar (रिसालदार)", cond: "Direct 30 + Team 2,187", base: "3,000", inr: "264,840", direct: "90" },
                  { rank: "Subedar-Major", cond: "Direct 40 + Team 6,561", base: "6,000", inr: "529,680", direct: "120" },
                  { rank: "Commandant (कमांडेंट)", cond: "Direct 50 + Team 19,683", base: "12,000", inr: "1,059,360", direct: "150", highlight: true },
                ].map((item, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${item.highlight ? "bg-yellow-50" : ""}`}>
                    <td className="py-2 font-medium">
                      <div className="font-bold text-orange-700">{item.rank.split(" ")[0]}</div>
                      <div className="text-xs text-slate-500">{item.rank.includes("(") ? item.rank.split("(")[1].slice(0, -1) : ""}</div>
                    </td>
                    <td className="py-2 text-center text-slate-600">{item.cond}</td>
                    <td className="py-2 text-center">
                      <div className="font-bold text-green-600">{item.base} USDT</div>
                      <div className="text-xs text-slate-500">₹{item.inr}</div>
                    </td>
                    <td className="py-2 text-center font-medium text-blue-600">{item.direct} USDT</td>
                  </tr>
                ))}
              </tbody>
            </table>
      
          </div>
        )}
      </div>

      {/* Share Prompt */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Share your code to invite friends and earn rewards!
      </div>

      {/* === Downline Users Modal === */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">
                Downline Users ({downlineCount})
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : downlineUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No downline users</div>
              ) : (
                <div className="space-y-3">
                  {downlineUsers.map((user, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="font-mono text-slate-700">
                        {maskPhone(user.phone_number)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(user.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
