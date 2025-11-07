import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // 确保正确导入supabase

export default function Trade({ setTab }) {
  const [query, setQuery] = useState("");
  const [mentors, setMentors] = useState([]); // 从数据库获取的导师数据
  const [isFollowing, setIsFollowing] = useState(false); // 控制是否显示跟单页面
  const [followingAmount, setFollowingAmount] = useState(""); // 跟单金额

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("*");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("获取导师失败:", error);
    }
  };

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleFollow = (mentor) => {
    // 当点击跟单按钮时，显示跟单页面
    setIsFollowing(true);
  };

  const handleBack = () => {
    // 返回导师列表页面
    setIsFollowing(false);
  };

  const handleRecharge = () => {
    // 跳转到充值页面
    setTab("recharge"); // 这里通过 setTab 控制页面切换
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* 如果正在跟单，显示跟单页面 */}
      {isFollowing ? (
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Follow</h2>
          
          {/* 使用 flex 布局使 "Go recharge" 按钮和 "Daily Follow" 同一行 */}
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">Available Balance: 5106.75 USDT</span>
            <button
              onClick={handleRecharge}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
            >
              Go recharge
            </button>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600">
              Following Limit (100 USDT - 9999 USDT)
            </label>
          </div>

          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter Following Amount"
            value={followingAmount}
            onChange={(e) => setFollowingAmount(e.target.value)}
          />
          
          <div className="mb-4">
            <label className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              I have read and agree to{" "}
              <a href="#" className="text-blue-500">
                Service Agreement
              </a>
            </label>
          </div>

          <button
            onClick={handleBack}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Back
          </button>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg mt-4">
            Follow
          </button>
        </div>
      ) : (
        <>
          {/* 搜索框 */}
          <div className="relative flex items-center mt-4 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Traders"
              className="w-full rounded-full bg-slate-100 border border-slate-200 pl-9 pr-20 py-2 text-sm outline-none"
            />
          </div>

          {/* 导师列表 */}
          <div className="space-y-3">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center bg-white border border-slate-200 rounded-2xl p-3 shadow-sm"
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="flex-1 ml-3">
                  <div className="font-semibold text-slate-800">{m.name}</div>
                  <div className="text-[12px] text-slate-500">
                    Investment Experience {m.years} years
                  </div>
                  <div className="mt-1 text-[12px] text-slate-400">
                    Cumulative Assets
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    {m.assets.toLocaleString()} <span className="text-[11px]">USDT</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollow(m)}
                  className="ml-auto bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-sm px-4 py-1.5 rounded-lg shadow"
                >
                  跟单
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
