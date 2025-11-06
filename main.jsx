// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// 前台组件
import App from "./App";
import Home from "./components/Home.jsx";
import Markets from "./components/Markets.jsx";
import Trade from "./components/Trade.jsx";
import Positions from "./components/Positions.jsx";
import Me from "./components/Me.jsx";
import Recharge from "./components/Recharge.jsx";
import Withdraw from "./components/Withdraw.jsx";
import Invite from "./components/Invite.jsx";

// 后台组件
import AdminLogin from "./Backend/AdminLogin.jsx";
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
        {/* 前台路由 */}
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

        {/* 后台独立登录页 */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* 后台管理面板 */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route
            index
            element={
              <div className="p-8 bg-white rounded-xl shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  欢迎进入后台管理系统
                </h1>
                <p className="text-gray-600">请选择左侧菜单进行操作</p>
              </div>
            }
          />
          <Route path="users" element={<UserManagement />} />
          <Route path="recharge" element={<RechargeManagement />} />
          <Route path="withdraw" element={<WithdrawManagement />} />
          <Route path="channels" element={<RechargeChannel />} />
          <Route path="mentors" element={<MentorManagement />} />
          <Route path="copytrade" element={<CopyTradeAudit />} />
          <Route path="stocks" element={<StockManagement />} />
        </Route>

        {/* 404 页面 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="text-xl text-gray-600 mt-4">页面不存在</p>
                <Link
                  to="/"
                  className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  返回首页
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  </React.StrictMode>
);
