import React, { useState, useEffect } from "react";
import { Home, BarChart2, PlusCircle, PieChart, User } from "lucide-react";
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    document.documentElement.style.background = "#f5f7fb";
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case "markets":
        return <MarketsPage />;
      case "trade":
        return <TradePage />;
      case "positions":
        return <PositionsPage />;
      case "me":
        return <MePage />;
      default:
        return <HomePage />;
    }
  };

  const BottomItem = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center flex-1 py-2 text-xs ${
        activeTab === id ? "text-indigo-600" : "text-slate-500"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* 动态内容 */}
      <div className="max-w-md mx-auto pb-20">{renderPage()}</div>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto flex">
          <BottomItem id="home" icon={<Home size={20} />} label="Home" />
          <BottomItem id="markets" icon={<BarChart2 size={20} />} label="Markets" />
          <BottomItem id="trade" icon={<PlusCircle size={20} />} label="Trade" />
          <BottomItem id="positions" icon={<PieChart size={20} />} label="Positions" />
          <BottomItem id="me" icon={<User size={20} />} label="Me" />
        </div>
      </nav>
    </div>
  );
}
