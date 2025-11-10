import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Trade({ setTab, balance, userId, isLoggedIn }) {
  const [query, setQuery] = useState(""); // 搜索框
  const [mentors, setMentors] = useState([]); // 导师列表
  const [isFollowing, setIsFollowing] = useState(false); // 判断是否在跟单页面
  const [followingAmount, setFollowingAmount] = useState(""); // 跟单金额
  const [selectedMentor, setSelectedMentor] = useState(null); // 选择的导师

  useEffect(() => {
    if (!isLoggedIn || !userId) return; // 检查是否登录
    fetchMentors();
  }, [isLoggedIn, userId]); // 依赖 isLoggedIn 和 userId

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

  // 选择导师后跳转到跟单页面
  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor); // 设置选择的导师
    setIsFollowing(true); // 设置跟单页面状态
  };

  // 提交跟单请求
  const handleFollow = async () => {
    if (!followingAmount || parseFloat(followingAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (parseFloat(followingAmount) > balance) {
      alert("You do not have enough balance.");
      return;
    }

    if (!selectedMentor) {
      alert("Please select a mentor to follow.");
      return;
    }

    // 插入数据到 copytrades 表
    try {
      const { data, error } = await supabase.from("copytrades").insert([{
        user_id: userId,
        mentor_id: selectedMentor.id,
        amount: parseFloat(followingAmount),
        status: "pending",  // 初始状态为 pending
        mentor_commission: selectedMentor.commission, // 新增导师佣金率
      }]);

      if (error) throw error;

      alert("Follow request submitted. Waiting for approval.");
      setIsFollowing(false); // 跳回导师选择页面
      setFollowingAmount(""); // 清空金额
      setSelectedMentor(null);  // 清空导师选择
    } catch (error) {
      console.error("Follow request failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // 返回到导师选择页面
  const handleBack = () => {
    setIsFollowing(false);
    setSelectedMentor(null);  // 清空选择的导师
  };

  return (
    <div style={{ padding: "0 16px 96px 16px", maxWidth: "448px", margin: "0 auto", background: "linear-gradient(to bottom, #fff8f0, #fff0e6)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* 跟单页面 */}
      {isFollowing ? (
        <div style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#FF6B35", marginBottom: "16px", textAlign: "center" }}>Daily Follow</h2>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", padding: "16px", borderRadius: "16px", boxShadow: "0 8px 20px rgba(255, 107, 53, 0.15)", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", color: "#374151" }}>Available Balance: <span style={{ fontWeight: "bold", color: "#FFD700" }}>{balance.toFixed(2)} USDT</span></span>
          </div>

          {/* 跟单金额 */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "14px", color: "#374151", display: "block", marginBottom: "8px" }}>Following Limit (100 USDT - 9999 USDT)</label>
            <input
              type="number"
              style={{ width: "100%", padding: "12px", border: "2px solid #FF6B35", borderRadius: "12px", fontSize: "16px", outline: "none", transition: "border-color 0.3s, box-shadow 0.3s" }}
              placeholder="Enter Following Amount"
              value={followingAmount}
              onChange={(e) => setFollowingAmount(e.target.value)}
            />
          </div>

          <button onClick={handleFollow} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #FF6B35, #FFD700)", color: "#1A1A1A", fontWeight: "bold", fontSize: "18px", borderRadius: "12px", border: "none", cursor: "pointer" }}>
            Follow
          </button>
        </div>
      ) : (
        <>
          {/* 搜索框 */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Traders"
            style={{ width: "100%", padding: "12px", border: "2px solid #FFD700", borderRadius: "9999px", fontSize: "14px", outline: "none", boxShadow: "0 4px 10px rgba(255, 215, 0, 0.2)" }}
          />
          {/* 导师列表 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mentors.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())).map((mentor) => (
              <div key={mentor.id} style={{ display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #FF9933", borderRadius: "16px", padding: "12px", boxShadow: "0 8px 15px rgba(255, 153, 51, 0.15)" }}>
                <img src={mentor.img} alt={mentor.name} style={{ width: "48px", height: "48px", borderRadius: "9999px", objectFit: "cover", marginRight: "12px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2937" }}>{mentor.name}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Investment Experience {mentor.years} years</div>
                  <button onClick={() => handleSelectMentor(mentor)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #FFD700, #FF6B35)", color: "#1A1A1A", fontWeight: "bold", fontSize: "14px", borderRadius: "12px", border: "none", cursor: "pointer" }}>
                    Select Mentor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
