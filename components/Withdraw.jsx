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
      if (error) setError("Failed to load wallet.");
      else if (data?.wallet_address) setWalletAddress(data.wallet_address);
    };
    fetchWalletAddress();
  }, [userId]);

  const handleRequestWithdraw = async () => {
    if (loading) return;
    setLoading(true); setError("");
    try {
      if (!walletAddress) return setError("No wallet saved.");
      if (!walletAddress.startsWith("T") || walletAddress.length !== 34)
        return setError("Invalid TRC20 address.");
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount < 100 || amount > 9999 || amount > balance)
        return setError("Amount must be 100–9999 USDT and ≤ balance.");

      const { error } = await supabase
        .from("withdraws")
        .insert({ user_id: userId, amount, wallet_address: walletAddress, status: "pending" });
      if (error) setError("Submit failed.");
      else { setWithdrawAmount(""); alert("Submitted!"); }
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  const handleSaveAddress = async () => {
    if (loading) return;
    setLoading(true); setError("");
    const addr = newAddress.trim();
    if (!addr) return setError("Enter address."), setLoading(false);
    if (!addr.startsWith("T") || addr.length !== 34)
      return setError("Invalid TRC20 address."), setLoading(false);

    const { error } = await supabase
      .from("users")
      .update({ wallet_address: addr })
      .eq("id", userId);
    if (error) setError("Save failed.");
    else { setWalletAddress(addr); setNewAddress(""); alert("Saved!"); }
    setLoading(false);
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind:wght@400;500;600&display=swap');

        .withdraw-bg {
          background: linear-gradient(to bottom, #fff8f0, #fef3e6);
          position: relative;
        }
        .withdraw-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 80%, #FFD700 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, #FF6B35 0%, transparent 50%);
          opacity: 0.08;
          pointer-events: none;
          z-index: -1;
        }
        .card-w {
          background: white;
          border: 2px solid #FF9933;
          border-radius: 1.5rem;
          box-shadow: 0 8px 25px rgba(255, 153, 51, 0.2);
          transition: all 0.3s;
        }
        .card-w:hover { transform: translateY(-3px); }
        .btn-w {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #1a1a1a;
          font-weight: 600;
          border-radius: 1.25rem;
          padding: 1rem;
          transition: all 0.3s;
        }
        .btn-w:hover { transform: scale(1.03); }
        .input-w {
          border: 2px solid #FF6B35;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          transition: all 0.3s;
        }
        .input-w:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
          outline: none;
        }
        .tab-active {
          border-bottom: 3px solid #FF6B35;
          color: #FF6B35;
          font-weight: 600;
        }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-hind { font-family: 'Hind', sans-serif; }
        .text-saffron { color: #FF6B35; }
      `}</style>

      <div className="withdraw-bg min-h-screen font-hind p-1">
        <div className="flex items-center gap-3 py-4">
          <ArrowLeft className="h-6 w-6 text-saffron cursor-pointer" onClick={() => setTab("home")} />
          <h2 className="font-playfair font-bold text-2xl text-saffron">Withdraw</h2>
        </div>

        <div className="flex border-b border-amber-200 mb-5">
          <button onClick={() => setTabState("request")} className={`flex-1 py-3 text-sm font-medium ${tab === "request" ? "tab-active" : "text-gray-600"}`}>
            Request
          </button>
          <button onClick={() => setTabState("address")} className={`flex-1 py-3 text-sm font-medium ${tab === "address" ? "tab-active" : "text-gray-600"}`}>
            Address
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 text-red-700 text-sm rounded-2xl card-w">
            {error}
          </div>
        )}

        {tab === "request" ? (
          <div className="space-y-5">
            <div className="p-5 card-w text-center">
              <div className="text-sm text-gray-600">Balance</div>
              <div className="text-3xl font-playfair font-bold text-saffron">
                {balance} <span className="text-lg text-gray-600">USDT</span>
              </div>
            </div>

            <div className="card-w p-5 space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">Account</div>
                <div className="p-3 bg-gray-50 border border-amber-300 rounded-xl font-mono text-xs break-all">
                  {walletAddress || "No address"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Amount (100–9999 USDT)</div>
                <input
                  type="number"
                  className="w-full input-w text-lg"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">Fee: <strong className="text-saffron">0 USDT</strong></div>
            </div>

            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-sm text-amber-800 card-w">
              <strong>Reminder:</strong> Fee deducted from amount. Final depends on network.
            </div>

            <button
              onClick={handleRequestWithdraw}
              disabled={loading || !walletAddress}
              className={`w-full py-4 font-bold text-lg btn-w ${loading || !walletAddress ? "opacity-60" : ""}`}
            >
              {loading ? "Submitting..." : "Continue"}
            </button>
          </div>
        ) : (
          <div className="card-w p-5 space-y-5">
            <div>
              <div className="text-sm text-gray-600">Current Address</div>
              <div className="text-sm font-bold text-saffron mb-2">USDT (TRC20)</div>
              <div className="p-3 bg-gray-50 border border-amber-300 rounded-xl font-mono text-xs break-all">
                {walletAddress || "None"}
              </div>
            </div>
            <div>
              <input
                type="text"
                className="w-full input-w text-lg"
                placeholder="Starts with T, 34 chars"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                maxLength="34"
              />
              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className={`w-full mt-3 py-4 font-bold text-lg btn-w ${loading ? "opacity-60" : ""}`}
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
