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
      </Routes>
    </Router>
  </React.StrictMode>
);
