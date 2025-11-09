// components/Trade.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";
import { Search, TrendingUp, TrendingDown, Star } from "lucide-react";

export default function Trade({ setTab, balance, userId, isLoggedIn }) {
  const [query, setQuery] = useState("");
  const [mentors, setMentors] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingAmount, setFollowingAmount] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 初始化加载导师
  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const data = await call(supabase.from("mentors").select("*"));
      setMentors(data || []);
    } catch (err) {
      setError("Failed to load mentors");
    }
  };

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
    setIsFollowing(true);
    setError("");
  };

  const handleFollow = async () => {
    if (!isLoggedIn || !userId) {
      setError("Please login first");
      return;
    }
    if (!followingAmount || parseFloat(followingAmount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (parseFloat(followingAmount) > balance) {
      setError("Insufficient balance");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await call(
        supabase.from("copytrades").insert({
          user_id: userId,
          mentor_id: selectedMentor.id,
          amount: parseFloat(followingAmount),
          status: "pending",
          mentor_commission: selectedMentor.commission,
        })
      );
      setFollowingAmount("");
      setIsFollowing(false);
      setSelectedMentor(null);
      alert("Follow request submitted!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing && selectedMentor) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 pb-24 min-h-screen">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
          <button onClick={() => setIsFollowing(false)} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-bold text-lg">Follow {selectedMentor.name}</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* 导师卡片 */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {selectedMentor.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedMentor.name}</h3>
                <p className="text-sm text-orange-700">{selectedMentor.years} years experience</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Assets</p>
                <p className="font-bold text-orange-600">{selectedMentor.assets.toLocaleString()} USDT</p>
              </div>
              <div>
                <p className="text-gray-600">Commission</p>
                <p className="font-bold text-orange-600">{selectedMentor.commission}%</p>
              </div>
            </div>
          </div>

          {/* 金额输入 */}
          <div>
            <label className="text-sm font-medium text-orange-700">Amount (USDT)</label>
            <input
              type="number"
              value={followingAmount}
              onChange={(e) => setFollowingAmount(e.target.value)}
              className="w-full py-3 px-4 mt-1 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="Enter amount"
            />
            <p className="text-xs text-gray-600 mt-1">Available: {balance.toFixed(2)} USDT</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 hover:scale-105'
            }`}
          >
            {loading ? 'Submitting...' : 'Confirm Follow'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 pb-24 min-h-screen">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white sticky top-0 z-10">
        <h2 className="font-bold text-lg flex-1 text-center">Select Mentor</h2>
      </div>

      {/* 搜索框 */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-orange-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="Search mentors..."
          />
        </div>
      </div>

      {/* 导师列表 */}
      <div className="px-4 space-y-3 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No mentors found</div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-4 shadow-lg border-2 border-orange-100 hover:border-orange-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    {m.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{m.name}</h3>
                    <p className="text-sm text-orange-700">{m.years} years experience</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Assets</p>
                  <p className="font-bold text-orange-600">{m.assets.toLocaleString()} USDT</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-orange-600">{m.commission}% Commission</span>
                </div>
                <button
                  onClick={() => handleSelectMentor(m)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full font-bold text-sm hover:scale-105 transition-all shadow-md"
                >
                  Select
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
