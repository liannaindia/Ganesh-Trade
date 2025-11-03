import React from "react";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Markets from "./components/Markets";
import Trade from "./components/Trade";
import Positions from "./components/Positions";
import Me from "./components/Me";

const App = () => {
  const navigate = useNavigate();

  return (
    <div>
      <nav>
        <ul>
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/markets")}>Markets</li>
          <li onClick={() => navigate("/trade")}>Trade</li>
          <li onClick={() => navigate("/positions")}>Positions</li>
          <li onClick={() => navigate("/me")}>Me</li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/me" element={<Me />} />
      </Routes>
    </div>
  );
};

export default App;
