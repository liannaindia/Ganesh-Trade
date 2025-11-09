// components/BottomNav.jsx
import React from "react";
import { Home, BarChart2, PlusCircle, ClipboardList, User } from "lucide-react";

const BottomNav = ({ tab, setTab }) => {
  const tabs = [
    { id: "home", icon: <Home size={20} />, label: "Home", aria: "Go to home" },
    { id: "markets", icon: <BarChart2 size={20} />, label: "Markets", aria: "View markets" },
    { id: "trade", icon: <PlusCircle size={20} />, label: "Trade", aria: "Trade" },
    { id: "positions", icon: <ClipboardList size={20} />, label: "Positions", aria: "View positions" },
    { id: "me", icon: <User size={20} />, label: "Me", aria: "My account" },
  ];

  return (
    <nav className="w-full flex justify-between px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex-1 flex flex-col items-center transition-all ${
            tab === t.id ? "text-yellow-200 scale-110" : "text-white"
          }`}
          aria-label={t.aria}
          aria-current={tab === t.id ? "page" : undefined}
        >
          {t.icon}
          <span className="text-xs mt-1 font-medium">{t.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
