import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./components/Home.jsx";
import Markets from "./components/Markets.jsx";
import Trade from "./components/Trade.jsx";
import Positions from "./components/Positions.jsx";
import Me from "./components/Me.jsx";
import Recharge from "./components/Recharge.jsx";
import Withdraw from "./components/Withdraw.jsx";
import Invite from "./components/Invite.jsx";

// 新增后台管理导入（路径改为 Backend/）
import AdminDashboard from "./Backend/AdminDashboard.jsx";
import UserManagement from "./Backend/UserManagement.jsx";
import RechargeManagement from "./Backend/RechargeManagement.jsx";
import WithdrawManagement from "./Backend/WithdrawManagement.jsx";
import RechargeChannel from "./Backend/RechargeChannel.jsx";
import MentorManagement from "./Backend/MentorManagement.jsx";
import CopyTradeAudit from "./Backend/CopyTradeAudit.jsx";
import StockManagement from "./Backend/StockManagement.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="markets" element={<Markets />} />
          <Route path="trade" element={<Trade />} />
          <Route path="positions" element={<Positions />} />
          <Route path="me" element={<Me />} />
          <Route path="recharge" element={<Recharge />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="invite" element={<Invite />} />
        </Route>
        {/* 新增后台管理路由 */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<div className="p-8"><h1 className="text-2xl font-bold">后台管理首页</h1><p>请选择左侧菜单。</p></div>} />
          <Route path="users" element={<UserManagement />} />
          <Route path="recharge" element={<RechargeManagement />} />
          <Route path="withdraw" element={<WithdrawManagement />} />
          <Route path="channels" element={<RechargeChannel />} />
          <Route path="mentors" element={<MentorManagement />} />
          <Route path="copytrade" element={<CopyTradeAudit />} />
          <Route path="stocks" element={<StockManagement />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
