// components/Trade.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useLanguage } from "../context/LanguageContext"; // 新增

export default function Trade({ setTab, balance, userId, isLoggedIn }) {
  const { t } = useLanguage(); // 新增

  const [query, setQuery] = useState("");
  const [mentors, setMentors] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingAmount, setFollowingAmount] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);

  const subscriptionRef = useRef(null);

  // 初始化：加载导师、手机号、可用余额
  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    fetchMentors();
    fetchUserPhoneNumber();
    fetchAvailableBalance();
  }, [isLoggedIn, userId]);

  // 实时订阅 available_balance
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      return;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`user-balance-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && 'available_balance' in payload.new) {
            setAvailableBalance(parseFloat(payload.new.available_balance) || 0);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active for user:', userId);
        }
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId, isLoggedIn]);

  const fetchAvailableBalance = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("available_balance")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setAvailableBalance(parseFloat(data?.available_balance) || 0);
    } catch (error) {
      console.error("Failed to load available balance:", error);
      setAvailableBalance(0);
    }
  };

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("*");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Failed to load mentors:", error);
    }
  };

  const fetchUserPhoneNumber = async () => {
    try {
      const { data, error } | await supabase
        .from("users")
        .select("phone_number")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setUserPhoneNumber(data?.phone_number || "");
    } catch (error) {
      console.error("Failed to load phone number:", error);
    }
  };

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
    setIsFollowing(true);
  };

  const handleFollow = async () => {
    const amount = parseFloat(followingAmount);
    if (!followingAmount || amount <= 0) {
      alert(t("trade.errors.invalidAmount"));
      return;
    }
    if (amount > availableBalance) {
      alert(t("trade.errors.insufficientBalance"));
      return;
    }
    if (!selectedMentor) {
      alert(t("trade.errors.selectMentor"));
      return;
    }

    try {
      const { error } = await supabase.from("copytrades").insert([{
        user_id: userId,
        mentor_id: selectedMentor.id,
        amount,
        status: "pending",
        mentor_commission: selectedMentor.commission,
      }]);

      if (error) throw error;

      alert(t("trade.success"));
      setIsFollowing(false);
      setFollowingAmount("");
      setSelectedMentor(null);
    } catch (error) {
      console.error("Follow request failed:", error);
      alert(t("trade.errors.submitFailed"));
    }
  };

  const handleBack = () => {
    setIsFollowing(false);
    setSelectedMentor(null);
  };

  const handleRecharge = () => {
    setTab("recharge");
  };

  return (
    <div
      style={{
        padding: "0 16px 96px 16px",
        maxWidth: "448px",
        margin: "0 auto",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 背景 SVG 省略，保持不变 */}
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

      {/* 标题 */}
      <div style={{ textAlign: "center", margin: "20px 0", position: "relative", zIndex: 10 }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1F2937" }}>
          {t("trade.title")}
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
          {t("trade.subtitle")}
        </p>
      </div>

      {/* 可用余额卡片 */}
      <div
        style={{
          background: "linear-gradient(135deg, #FFD700, #FF6B35)",
          color: "#1A1A1A",
          padding: "16px",
          borderRadius: "16px",
          margin: "16px 0",
          textAlign: "center",
          boxShadow: "0 10px 20px rgba(255, 107, 53, 0.2)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "600" }}>{t trade.availableBalance")}</div>
        <div style={{ fontSize: "28px", fontWeight: "bold", margin: "8px 0" }}>
          {availableBalance.toFixed(2)} USDT
        </div>
        <button
          onClick={handleRecharge}
          style={{
            background: "#1A1A1A",
            color: "#FFD700",
            padding: "8px 16px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t("trade.recharge")}
        </button>
      </div>

      {isFollowing ? (
        <div style={{ marginTop: "24px", position: "relative", zIndex: 10 }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <img
              src={selectedMentor.img}
              alt={selectedMentor.name}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "9999px",
                margin: "0 auto 12px",
                boxShadow: "0 0 0 4px #FFD700",
              }}
            />
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1F2937" }}>
              {selectedMentor.name}
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0" }}>
              {t("trade.experience", { years: selectedMentor.years })}
            </div>
            <div style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "8px" }}>
              {t("trade.commission")}:{" "}
              <span style={{ fontWeight: "bold", color: "#FF6B35" }}>
                {selectedMentor.commission}%
              </span>
            </div>

            <div style={{ margin: "20px 0" }}>
              <input
                type="number"
                value={followingAmount}
                onChange={(e) => setFollowingAmount(e.target.value)}
                placeholder={t("trade.amountPlaceholder")}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #FFD700",
                  borderRadius: "12px",
                  fontSize: "16px",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                {t("trade.available")}: {availableBalance.toFixed(2)} USDT
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#6B7280",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  border: "none",
                  marginBottom: "12px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#4B5563")}
                onMouseLeave={(e) => (e.target.style.background = "#6B7280")}
              >
                {t("trade.back")}
              </button>

              <button
                onClick={handleFollow}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #FF6B35, #FFD700)",
                  color: "#1A1A1A",
                  fontWeight: "bold",
                  fontSize: "18px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                {t("trade.follow")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ position: "relative", margin: "20px 0" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("trade.searchPlaceholder")}
              style={{
                width: "100%",
                padding: "12px 48px 12px 48px",
                background: "#FFFFFF",
                border: "2px solid #FFD700",
                borderRadius: "9999px",
                fontSize: "14px",
                outline: "none",
                boxShadow: "0 4px 10px rgba(255, 215, 0, 0.2)",
                transition: "border-color 0.3s, box-shadow 0.3s",
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23FF6B35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>')`,
                backgroundPosition: "16px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF6B35";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#FFD700";
                e.target.style.boxShadow = "0 4px 10px rgba(255, 215, 0, 0.2)";
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF" }}>
                {t("trade.noResults")}
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#FFFFFF",
                    border: "1px solid #FF9933",
                    borderRadius: "16px",
                    padding: "12px",
                    boxShadow: "0 8px 15px rgba(255, 153, 51, 0.15)",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  <img
                    src={m.img}
                    alt={m.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "9999px",
                      objectFit: "cover",
                      marginRight: "12px",
                      boxShadow: "0 0 0 4px rgba(255, 215, 0, 0.3)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2937" }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6B7280" }}>
                      {t("trade.experience", { years: m.years })}
                    </div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                      {t("trade.cumulativeAssets")}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FF6B35" }}>
                      {m.assets.toLocaleString()} <span style={{ fontSize: "11px" }}>USDT</span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>
                      {t("trade.commissionRate")}:{" "}
                      <span style={{ fontWeight: "bold", color: "#FF6B35" }}>{m.commission}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectMentor(m)}
                    style={{
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #FFD700, #FF6B35)",
                      color: "#1A1A1A",
                      fontWeight: "bold",
                      fontSize: "14px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    {t("trade.selectMentor")}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
