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
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
