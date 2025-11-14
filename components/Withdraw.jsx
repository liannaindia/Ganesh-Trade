// components/Withdraw.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useLanguage } from "../context/LanguageContext"; // 新增

export default function Withdraw({ setTab, userId, balance, availableBalance }) {
  const { t } = useLanguage(); // 新增

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
        setError(t("withdraw.errors.loadAddress"));
      } else if (data?.wallet_address) {
        setWalletAddress(data.wallet_address);
      }
    };

    fetchWalletAddress();
  }, [userId, t]);

  const handleRequestWithdraw = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      if (!walletAddress) {
        setError(t("withdraw.errors.noAddress"));
        return;
      }

      const isValidTRC20 = walletAddress.startsWith("T") && walletAddress.length === 34;
      if (!isValidTRC20) {
        setError(t("withdraw.errors.invalidSavedAddress"));
        return;
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount < 100 || amount > 9999) {
        setError(t("withdraw.errors.amountRange"));
        return;
      }

      if (amount > availableBalance) {
        setError(t("withdraw.errors.insufficientBalance"));
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
        setError(t("withdraw.errors.submitFailed"));
      } else {
        setWithdrawAmount("");
        alert(t("withdraw.success"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t("withdraw.errors.networkError"));
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
      setError(t("withdraw.errors.enterAddress"));
      setLoading(false);
      return;
    }

    const isValidTRC20 = trimmed.startsWith("T") && trimmed.length === 34;
    if (!isValidTRC20) {
      setError(t("withdraw.errors.invalidTRC20"));
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
        setError(t("withdraw.errors.saveFailed"));
      } else {
        setWalletAddress(trimmed);
        setNewAddress("");
        alert(t("withdraw.addressSaved"));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t("withdraw.errors.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        paddingBottom: "96px",
        maxWidth: "448px",
        margin: "0 auto",
        background: "linear-gradient(to bottom, #fff8f0, #fff0e6)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 印度风背景纹饰 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="%23FFD700" stroke-width="2"/><path d="M50 15 Q65 30, 65 50 Q65 70, 50 85 Q35 70, 35 50 Q35 30, 50 15" fill="none" stroke="%23FF6B35" stroke-width="1.5"/><circle cx="50" cy="50" r="10" fill="%23FFD700" opacity="0.3"/></svg>')`,
          backgroundSize: "100px 100px",
          backgroundRepeat: "repeat",
          opacity: 0.05,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 0",
          position: "sticky",
          top: 0,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          zIndex: 10,
          borderBottom: "1px solid #FED7AA",
        }}
      >
        <ArrowLeft
          style={{ width: "24px", height: "24px", color: "#EA580C", cursor: "pointer" }}
          onClick={() => setTab("me")}
        />
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#7C2D12" }}>
          {t("withdraw.title")}
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "16px 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <button
          onClick={() => setTabState("request")}
          style={{
            flex: 1,
            padding: "12px",
            background: tab === "request" ? "linear-gradient(135deg, #FFD700, #FF6B35)" : "#FFFFFF",
            color: tab === "request" ? "#1A1A1A" : "#6B7280",
            fontWeight: "bold",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {t("withdraw.tabs.request")}
        </button>
        <button
          onClick={() => setTabState("address")}
          style={{
            flex: 1,
            padding: "12px",
            background: tab === "address" ? "linear-gradient(135deg, #FFD700, #FF6B35)" : "#FFFFFF",
            color: tab === "address" ? "#1A1A1A" : "#6B7280",
            fontWeight: "bold",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {t("withdraw.tabs.address")}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            margin: "12px 0",
            backgroundColor: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            padding: "12px",
            borderRadius: "12px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {tab === "request" ? (
        /* Withdraw Request */
        <>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 8px 20px rgba(255, 153, 51, 0.15)",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>
              {t("withdraw.available")}: <strong style={{ color: "#FF6B35" }}>{availableBalance.toFixed(2)} USDT</strong>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={t("withdraw.amountPlaceholder")}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #FF9933",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#EA580C",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              min="100"
              max="9999"
              step="0.01"
              onFocus={(e) => (e.target.style.borderColor = "#FFD700")}
              onBlur={(e) => (e.target.style.borderColor = "#FF9933")}
            />
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px", textAlign: "right" }}>
              {t("withdraw.amountRange")}
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 8px 20px rgba(255, 153, 51, 0.15)",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>
              {t("withdraw.receivingAddress")}
            </div>
            <div
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #FF9933",
                borderRadius: "12px",
                fontSize: "14px",
                color: "#1F2937",
                wordBreak: "break-all",
                background: walletAddress ? "#FFFBEB" : "#F3F4F6",
              }}
            >
              {walletAddress || t("withdraw.noAddressSet")}
            </div>
          </div>

          <button
            onClick={handleRequestWithdraw}
            disabled={loading || !walletAddress}
            style={{
              width: "100%",
              padding: "16px",
              background: loading || !walletAddress
                ? "#D1D5DB"
                : "linear-gradient(135deg, #FFD700, #FF6B35)",
              color: loading || !walletAddress ? "#6B7280" : "#1A1A1A",
              fontWeight: "bold",
              fontSize: "18px",
              borderRadius: "16px",
              border: "none",
              cursor: loading || !walletAddress ? "not-allowed" : "pointer",
              transition: "transform 0.2s",
              boxShadow: "0 8px 15px rgba(255, 107, 53, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (!(loading || !walletAddress)) e.target.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            {loading ? t("withdraw.submitting") : t("withdraw.continue")}
          </button>
        </>
      ) : (
        /* Receiving Address */
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #FF9933",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 8px 20px rgba(255, 153, 51, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            transition: "transform 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "translateY(-4px)")}
          onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
          <div>
            <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "4px" }}>
              {t("withdraw.currentAddress")}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FF6B35", marginBottom: "8px" }}>
              USDT (TRC20)
            </div>
            <div
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #FF9933",
                borderRadius: "12px",
                fontSize: "14px",
                color: "#1F2937",
                wordBreak: "break-all",
              }}
            >
              {walletAddress || t("withdraw.noAddress")}
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #FF6B35",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              placeholder={t("withdraw.newAddressPlaceholder")}
              maxLength="34"
              onFocus={(e) => {
                e.target.style.borderColor = "#FFD700";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 215, 0, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#FF6B35";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleSaveAddress}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading
                  ? "#D1D5DB"
                  : "linear-gradient(135deg, #FFD700, #FF6B35)",
                color: loading ? "#6B7280" : "#1A1A1A",
                fontWeight: "bold",
                fontSize: "18px",
                borderRadius: "16px",
                border: "none",
                marginTop: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "transform 0.2s",
                boxShadow: "0 8px 15px rgba(255, 107, 53, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              {loading ? t("withdraw.saving") : t("withdraw.saveAddress")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
