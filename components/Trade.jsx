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

  const handleFollow = () => setIsFollowing(true);
  const handleBack = () => setIsFollowing(false);
  const handleRecharge = () => setTab("recharge");

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* 局部样式：仅此组件 */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind:wght@400;500;600&display=swap');

        .india-bg {
          background: linear-gradient(to bottom, #fff8f0, #fff0e6);
          position: relative;
          overflow: hidden;
        }
        .india-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-conic-gradient(from 0deg at 50% 50%, #FFD700 0deg, #FF6B35 30deg, #FFD700 60deg);
          opacity: 0.05;
          pointer-events: none;
          z-index: -1;
        }
        .card-india {
          background: white;
          border: 1px solid #FF9933;
          border-radius: 1.5rem;
          box-shadow: 0 8px 20px rgba(255, 153, 51, 0.15);
          transition: all 0.3s ease;
        }
        .card-india:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(255, 153, 51, 0.25);
        }
        .btn-saffron {
          background: linear-gradient(135deg, #FF9933, #FF6B35);
          color: white;
          font-weight: 600;
          border-radius: 1rem;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .btn-saffron:hover {
          transform: scale(1.05);
        }
        .btn-saffron:active::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          animation: ripple 0.6s ease-out;
        }
        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }
        .input-india {
          border: 2px solid #FF6B35;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          transition: all 0.3s;
        }
        .input-india:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
          outline: none;
        }
        .text-saffron { color: #FF6B35; }
        .text-gold { color: #FFD700; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-hind { font-family: 'Hind', sans-serif; }
      `}</style>

      <div className="india-bg min-h-screen font-hind">
        {isFollowing ? (
          <div className="p-6 space-y-5 animate-in fade-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl font-playfair font-bold text-saffron text-center">Daily Follow</h2>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl card-india">
              <span className="text-sm">Available: <strong className="text-gold">5106.75 USDT</strong></span>
              <button onClick={handleRecharge} className="btn-saffron text-sm">
                Go Recharge
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Following Limit (100 - 9999 USDT)
              </label>
              <input
                type="number"
                className="w-full input-india"
                placeholder="Enter amount in USDT"
                value={followingAmount}
                onChange={(e) => setFollowingAmount(e.target.value)}
              />
            </div>

            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="mr-2 w-5 h-5 accent-saffron" />
              I agree to <a href="#" className="text-saffron underline ml-1">Service Agreement</a>
            </label>

            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium">
                Back
              </button>
              <button className="flex-1 py-3 btn-saffron font-bold text-lg">
                Confirm Follow
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 mb-6 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Traders..."
                className="w-full pl-12 pr-5 py-3 bg-white border-2 border-saffron rounded-full shadow-lg input-india font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,
                  backgroundPosition: "16px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "20px",
                }}
              />
            </div>

            <div className="space-y-4 pb-6">
              {filtered.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center p-4 card-india animate-in slide-in-from-bottom"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <img
                    src={m.img || "/api/placeholder/60/60"}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-saffron ring-opacity-30"
                  />
                  <div className="flex-1 ml-4">
                    <div className="font-playfair font-bold text-lg text-gray-800">{m.name}</div>
                    <div className="text-xs text-saffron">Exp: {m.years} years</div>
                    <div className="text-xs text-gray-500 mt-1">Assets</div>
                    <div className="font-bold text-saffron">
                      {m.assets.toLocaleString()} <span className="text-xs">USDT</span>
                    </div>
                  </div>
                  <button
                    onClick={handleFollow}
                    className="ml-4 px-5 py-2 text-sm font-bold btn-saffron"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
