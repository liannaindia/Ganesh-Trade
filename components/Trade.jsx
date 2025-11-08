// Trade.jsx  (完整可直接替换)
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function Trade({ setTab, balance, userId, isLoggedIn }) {
  const [query, setQuery] = useState("");
  const [mentors, setMentors] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingAmount, setFollowingAmount] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");

  /* ---------- 数据加载 ---------- */
  useEffect(() => {
    if (!userId) return;
    fetchMentors();
    fetchUserPhoneNumber();
  }, [userId]);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("*");
      if (error) throw error;
      setMentors(data || []);
    } catch (e) {
      console.error("Failed to fetch mentors:", e);
    }
  };

  const fetchUserPhoneNumber = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("phone_number")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setUserPhoneNumber(data?.phone_number || "");
    } catch (e) {
      console.error("Failed to fetch phone number:", e);
    }
  };

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------- UI 切换 ---------- */
  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
    setIsFollowing(true);
  };

  /* ---------- 提交跟单 ---------- */
  const handleFollow = async () => {
    // ---------- 基础校验 ----------
    const amount = parseFloat(followingAmount);
    if (!amount || amount <= 0) return alert("Please enter a valid amount.");
    if (amount > balance) return alert("Insufficient balance.");
    if (!selectedMentor) return alert("Please select a mentor.");
    if (!userPhoneNumber) return alert("User phone number is missing.");

    try {
      // 1. 插入 copytrades
      const { data: ct, error: ctErr } = await supabase
        .from("copytrades")
        .insert({
          user_id: userId,
          mentor_id: selectedMentor.id,
          amount,
          status: "pending",
          user_phone_number: userPhoneNumber,
          mentor_commission: selectedMentor.commission,
        })
        .select()
        .single();

      if (ctErr) throw ctErr;

      // 2. 插入 copytrade_details（用于 Positions 显示）
      const { error: dtErr } = await supabase
        .from("copytrade_details")
        .insert({
          user_id: userId,
          mentor_id: selectedMentor.id,
          amount,
          status: "pending",
          order_status: "Unsettled",
          user_phone_number: userPhoneNumber,
          mentor_commission: selectedMentor.commission,
          order_profit_amount: 0,
        });

      if (dtErr) {
        // 回滚 copytrades
        await supabase.from("copytrades").delete().eq("id", ct.id);
        throw dtErr;
      }

      alert("Follow request submitted successfully!");
      setIsFollowing(false);
      setFollowingAmount("");
      setSelectedMentor(null);
    } catch (e) {
      console.error("Follow failed:", e);
      alert("Something went wrong. Please try again.");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* 导师列表 */}
      {!isFollowing ? (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mentors..."
            className="w-full mb-4 py-2 px-3 text-sm rounded-lg border focus:ring-2 focus:ring-yellow-400"
          />

          <div className="space-y-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-500">
                    Experience {m.years} years
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Assets: {m.assets.toLocaleString()} USDT
                  </div>
                  <div className="text-xs text-slate-600">
                    Commission: <span className="text-orange-500 font-bold">{m.commission}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectMentor(m)}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 跟单表单 */
        <>
          <div className="flex items-center gap-2 py-2">
            <ArrowLeft
              className="h-5 w-5 cursor-pointer text-slate-600"
              onClick={() => setIsFollowing(false)}
            />
            <h2 className="font-semibold text-lg text-slate-800">
              Follow {selectedMentor?.name}
            </h2>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-1">
              Amount (USDT) – Limit: 100‑9999
            </label>
            <input
              type="number"
              value={followingAmount}
              onChange={(e) => setFollowingAmount(e.target.value)}
              placeholder="1000"
              className="w-full py-2 px-3 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="mt-4 flex items-center">
            <input type="checkbox" className="mr-2" id="agree" />
            <label htmlFor="agree" className="text-xs text-slate-600">
              I have read and agree to the Service Agreement
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setIsFollowing(false)}
              className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium"
            >
              Back
            </button>
            <button
              onClick={handleFollow}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition"
            >
              Follow
            </button>
          </div>
        </>
      )}
    </div>
  );
}
