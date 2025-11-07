import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Withdraw({ setTab, userId, balance }) {
  const [tab, setTabState] = useState("request");
  const [walletAddress, setWalletAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch wallet:", error);
        setError("Failed to load wallet address.");
      } else if (data?.wallet_address) {
        setWalletAddress(data.wallet_address);
      }
    };

    fetchWalletAddress();
  }, [userId]);

  const handleRequestWithdraw = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      if (!walletAddress) {
        setError("No wallet address saved. Please set it in 'Receiving Address'.");
        return;
      }

      const isValidTRC20 = walletAddress.startsWith("T") && walletAddress.length === 34;
      if (!isValidTRC20) {
        setError("Saved wallet address is invalid (must be TRC20).");
        return;
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount < 100 || amount > 9999 || amount > balance) {
        setError("Amount must be 100–9999 USDT and not exceed your balance.");
        return;
      }

      const { error } = await supabase
        .from("withdraws")
        .insert({
          user_id: userId,
          amount: amount,
          wallet_address: walletAddress,
          status: "pending",
        });

      if (error) {
        console.error("Withdraw error:", error);
        setError("Failed to submit request. Please try again.");
      } else {
        setWithdrawAmount("");
        alert("Withdraw request submitted successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    const trimmed = newAddress.trim();
    if (!trimmed) {
      setError("Please enter a wallet address.");
      setLoading(false);
      return;
    }

    const isValidTRC20 = trimmed.startsWith("T") && trimmed.length === 34;
    if (!isValidTRC20) {
      setError("Invalid TRC-20 address. Must start with 'T' and be 34 characters.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ wallet_address: trimmed })
        .eq("id", userId);

      if (error) {
        console.error("Save address error:", error);
        setError("Failed to save address. Please try again.");
      } else {
        setWalletAddress(trimmed);
        setNewAddress("");
        alert("Wallet address saved successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
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
          transition: all 0.3s ease;
        }
        .card-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 215, 0, 0.3);
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
          border-radius: 1rem;
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
        .tab-active {
          border-bottom: 3px solid #FF6B35 !important;
          color: #FF6B35 !important;
          font-weight: 600;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 顶部导航 */}
      <div className="flex items-center gap-3 py-4 animate-fadeIn">
        <ArrowLeft
          className="h-6 w-6 text-saffron cursor-pointer hover:scale-110 transition"
          onClick={() => setTab("home")}
        />
        <h2 className="font-playfair font-bold text-2xl text-saffron">Withdraw</h2>
      </div>

      {/* 标签页切换 */}
      <div className="flex border-b border-amber-200 mb-5">
        <button
          onClick={() => setTabState("request")}
          className={`flex-1 py-3 text-sm font-semibold transition-all ${
            tab === "request" ? "tab-active" : "text-gray-600"
          }`}
        >
          Request Withdraw
        </button>
        <button
          onClick={() => setTabState("address")}
          className={`flex-1 py-3 text-sm font-semibold transition-all ${
            tab === "address" ? "tab-active" : "text-gray-600"
          }`}
        >
          Receiving Address
        </button>
      </div>

      {/* 统一错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-2xl card-glow animate-fadeIn">
          {error}
        </div>
      )}

      {/* Request Withdraw 页面 */}
      {tab === "request" ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 card-glow">
            <div className="text-sm font-medium text-gray-600">Available Balance</div>
            <div className="text-3xl font-playfair font-bold text-saffron mt-1">
              {balance} <span className="text-lg text-gray-600">USDT</span>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 card-glow space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Withdraw Account</div>
              <div className="w-full bg-gray-50 border border-amber-200 rounded-2xl p-3 text-sm font-mono text-gray-800 break-all">
                {walletAddress || "No wallet address saved"}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">
                Withdraw Amount <span className="text-xs text-gray-500">(100–9999 USDT)</span>
              </div>
              <input
                type="number"
                className="w-full p-4 input-india rounded-2xl text-lg font-medium"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="100"
                max="9999"
                step="0.01"
              />
            </div>

            <div className="text-sm text-gray-600">
              Withdraw Fee: <span className="font-bold text-saffron">0 USDT</span>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-sm text-amber-800 card-glow">
            <strong>Important Reminder:</strong><br />
            A withdraw fee will be deducted from the withdraw amount.<br />
            The final amount depends on network conditions.
          </div>

          <button
            onClick={handleRequestWithdraw}
            disabled={loading || !walletAddress}
            className={`mt-5 w-full py-4 rounded-2xl font-bold text-lg transition-all btn-gold ${
              loading || !walletAddress
                ? "opacity-60 cursor-not-allowed"
                : "hover:scale-[1.02]"
            }`}
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </div>
      ) : (
        /* Receiving Address 页面 */
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 card-glow space-y-5 animate-fadeIn">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Current Receiving Address</div>
            <div className="text-sm font-bold text-saffron mb-3">USDT (TRC20)</div>
            <div className="w-full bg-gray-50 border border-amber-200 rounded-2xl p-3 text-sm font-mono text-gray-800 break-all">
              {walletAddress || "No address saved yet"}
            </div>
          </div>

          <div>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full p-4 input-india rounded-2xl text-lg font-medium"
              placeholder="Enter new USDT TRC20 address (starts with T)"
              maxLength="34"
            />
            <button
              onClick={handleSaveAddress}
              disabled={loading}
              className={`mt-3 w-full py-4 rounded-2xl font-bold text-lg transition-all btn-gold ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
