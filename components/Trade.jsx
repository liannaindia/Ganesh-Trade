import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Trade({ setTab, balance, userId, isLoggedIn }) {
  const [query, setQuery] = useState(""); // 搜索框
  const [mentors, setMentors] = useState([]); // 导师列表
  const [isFollowing, setIsFollowing] = useState(false); // 判断是否在跟单页面
  const [followingAmount, setFollowingAmount] = useState(""); // 跟单金额
  const [selectedMentor, setSelectedMentor] = useState(null); // 选择的导师
  const [userPhoneNumber, setUserPhoneNumber] = useState(""); // 用户手机号码

  // 确保 `useEffect` 只在 `isLoggedIn` 和 `userId` 更新时重新执行
  useEffect(() => {
    if (!isLoggedIn || !userId) return; // 如果用户没有登录或没有userId则跳过
    fetchMentors();
    fetchUserPhoneNumber(); // 获取用户手机号码
  }, [isLoggedIn, userId]); // 依赖 `isLoggedIn` 和 `userId`

  // 获取导师列表
  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("*");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("获取导师失败:", error);
    }
  };

  // 获取用户手机号码
  const fetchUserPhoneNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserPhoneNumber(data?.phone_number || "");
    } catch (error) {
      console.error("获取用户手机号码失败:", error);
    }
  };

  // 搜索过滤导师
  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  // 选择导师后跳转到跟单页面
  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor); // 设置选择的导师
    setIsFollowing(true); // 设置跟单页面状态
  };

  // 提交跟单请求
  const handleFollow = async () => {
    if (!followingAmount || parseFloat(followingAmount) <= 0) {
      alert("请输入有效金额");
      return;
    }

    if (parseFloat(followingAmount) > balance) {
      alert("余额不足");
      return;
    }

    if (!selectedMentor) {
      alert("请选择导师");
      return;
    }

    // 插入数据到 `copytrades` 表
    try {
      const { data, error } = await supabase.from("copytrades").insert([{
        user_id: userId,
        mentor_id: selectedMentor.id,
        amount: parseFloat(followingAmount),
        status: "pending",  // 初始状态为 pending
        mentor_commission: selectedMentor.commission, // 新增导师佣金率
      }]);

      if (error) throw error;

      alert("跟单请求已提交，等待审批");
      setIsFollowing(false); // 跳回导师选择页面
      setFollowingAmount(""); // 清空金额
      setSelectedMentor(null);  // 清空导师选择
    } catch (error) {
      console.error("跟单请求失败:", error);
      alert("请求失败，请重试");
    }
  };

  // 返回到导师选择页面
  const handleBack = () => {
    setIsFollowing(false);
    setSelectedMentor(null);  // 清空选择的导师
  };

  // 跳转到充值页面
  const handleRecharge = () => {
    setTab("recharge");
  };

  return (
    <div
      style={{
        padding: "0 16px 96px 16px",
        maxWidth: "448px",
        margin: "0 auto",
        background: "linear-gradient(to bottom, #fff8f0, #fff0e6)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 印度风背景纹饰（内联 SVG，半透明曼荼罗） */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="%23FFD700" stroke-width="2"/><path d="M50 15 Q65 30, 65 50 Q65 70, 50 85 Q35 70, 35 50 Q35 30, 50 15" fill="none" stroke="%23FF6B35" stroke-width="1.5"/><circle cx="50" cy="50" r="10" fill="%23FFD700" opacity="0.3"/></svg>')`,
          backgroundSize: "120px",
          backgroundRepeat: "repeat",
          opacity: 0.1,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      {/* 跟单页面 */}
      {isFollowing ? (
        <div style={{ padding: "24px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#FF6B35",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Daily Follow
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FFFFFF",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 8px 20px rgba(255, 107, 53, 0.15)",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#374151" }}>
              Available Balance:{" "}
              <span style={{ fontWeight: "bold", color: "#FFD700" }}>
                {balance.toFixed(2)} USDT
              </span>
            </span>
            <button
              onClick={handleRecharge}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #FFD700, #FF6B35)",
                color: "#1A1A1A",
                fontWeight: "bold",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Go Recharge
            </button>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "14px",
                color: "#374151",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Following Limit (100 USDT - 9999 USDT)
            </label>
            <input
              type="number"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #FF6B35",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              placeholder="Enter Following Amount"
              value={followingAmount}
              onChange={(e) => setFollowingAmount(e.target.value)}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              color: "#6B7280",
              marginBottom: "24px",
            }}
          >
            <input
              type="checkbox"
              style={{
                marginRight: "8px",
                width: "20px",
                height: "20px",
                accentColor: "#FFD700",
              }}
            />
            I have read and agree to{" "}
            <a
              href="#"
              style={{
                color: "#FF6B35",
                textDecoration: "underline",
                marginLeft: "4px",
              }}
            >
              Service Agreement
            </a>
          </label>

          <button
            onClick={handleBack}
            style={{
              width: "100%",
              padding: "12px",
              background: "#6B7280",
              color: "#FFFFFF",
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
            Back
          </button>

          <button
            onClick={handleFollow} // 触发跟单操作
            style={{
              width: "100%",
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
            Follow
          </button>
        </div>
      ) : (
        <>
          {/* 搜索框 */}
          <div style={{ position: "relative", margin: "20px 0" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Traders"
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

          {/* 导师列表 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((m) => (
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
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2937" }}>{m.name}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Investment Experience {m.years} years</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>Cumulative Assets</div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FF6B35" }}>
                    {m.assets.toLocaleString()} <span style={{ fontSize: "11px" }}>USDT</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>
                    Commission Rate: <span style={{ fontWeight: "bold", color: "#FF6B35" }}>{m.commission}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectMentor(m)} // 选择导师
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
                  Select Mentor
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
