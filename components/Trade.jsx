import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Trade({ setTab }) {
  const [query, setQuery] = useState("");
  const [mentors, setMentors] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingAmount, setFollowingAmount] = useState("");

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
    setIsFollowing(true);
  };

  const handleBack = () => {
    setIsFollowing(false);
  };

  const handleRecharge = () => {
    setTab("recharge");
  };

  return (
    <div className="min-h-screen px-4 pb-24 max-w-md mx-auto font-hind relative overflow-hidden">
      {/* 印度风背景层 - 仅此页面 */}
      <div
        className="fixed inset-0 -z-10 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="%23FFD700" stroke-width="2"/><path d="M50 15 Q65 30, 65 50 Q65 70, 50 85 Q35 70, 35 50 Q35 30, 50 15" fill="none" stroke="%23FF6B35" stroke-width="1.5"/><circle cx="50" cy="50" r="10" fill="%23FFD700" opacity="0.3"/></svg>')`,
          backgroundSize: "120px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50" />

      {/* 引入印度风字体 */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style jsx>{`
        .font-hind { font-family: 'Hind', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .card-glow {
          box-shadow: 0 8px 25px rgba(255, 183, 0, 0.25), 0 0 15px rgba(255, 107, 53, 0.15);
        }
        .btn-gold {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #1a1a1a;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }
        .btn-gold::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .btn-gold:active::after {
          width: 300px;
          height: 300px;
        }
        .input-india {
          border: 2px solid #FF6B35;
          transition: all 0.3s;
        }
        .input-india:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
          outline: none;
        }
        .text-saffron { color: #FF6B35; }
        .text-gold { color: #FFD700; }
        .bg-saffron { background-color: #FF6B35; }
        .bg-gold { background: linear-gradient(135deg, #FFD700, #FFC107); }
      `}</style>

      {/* 跟单页面 */}
      {isFollowing ? (
        <div className="p-6 animate-fadeIn">
          <h2 className="text-2xl font-playfair font-bold text-saffron mb-5 text-center">
            Daily Follow
          </h2>

          <div className="mb-5 flex justify-between items-center bg-white p-4 rounded-2xl card-glow">
            <span className="text-sm font-medium text-gray-700">
              Available Balance: <span className="font-bold text-gold">5106.75 USDT</span>
            </span>
            <button
              onClick={handleRecharge}
              className="px-5 py-2 bg-gold text-gray-900 rounded-xl font-semibold btn-gold"
            >
              Go Recharge
            </button>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700">
              Following Limit (100 USDT - 9999 USDT)
            </label>
          </div>

          <input
            type="number"
            className="w-full p-3 input-india rounded-xl mb-4 text-lg"
            placeholder="Enter amount in USDT"
            value={followingAmount}
            onChange={(e) => setFollowingAmount(e.target.value)}
          />

          <label className="flex items-center text-sm mb-6 text-gray-600">
            <input type="checkbox" className="mr-2 w-5 h-5 accent-gold" />
            I have read and agree to{" "}
            <a href="#" className="text-saffron underline ml-1">
              Service Agreement
            </a>
          </label>

          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button className="w-full py-3 bg-saffron text-white rounded-xl font-bold text-lg btn-gold hover:bg-orange-600">
              Confirm Follow
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 搜索框 */}
          <div className="relative mt-5 mb-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Traders..."
              className="w-full rounded-full bg-white border-2 border-gold pl-12 pr-5 py-3 text-sm shadow-lg input-india font-medium"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23FFD700" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>')`,
                backgroundPosition: "16px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20px",
              }}
            />
          </div>

          {/* 导师列表 */}
          <div className="space-y-4 pb-6">
            {filtered.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center bg-white border border-amber-200 rounded-3xl p-4 card-glow animate-slideUp"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative">
                  <img
                    src={m.img || "/api/placeholder/60/60"}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-gold ring-opacity-30"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-saffron text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Star
                  </div>
                </div>

                <div className="flex-1 ml-4">
                  <div className="font-playfair font-bold text-lg text-gray-800">
                    {m.name}
                  </div>
                  <div className="text-xs text-amber-700">
                    Experience: <span className="font-semibold">{m.years} years</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Cumulative Assets</div>
                  <div className="text-sm font-bold text-saffron">
                    {m.assets.toLocaleString()} <span className="text-xs">USDT</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollow(m)}
                  className="ml-4 px-5 py-2 bg-gold text-gray-900 font-bold text-sm rounded-xl btn-gold shadow-lg"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 动画 keyframes（不污染全局）
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
  .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
`;
document.head.appendChild(styleSheet);
