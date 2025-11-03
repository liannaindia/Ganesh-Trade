import React from "react";
import { useNavigate } from "react-router-dom";

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

      <div>
      </div>
    </div>
  );
};

export default App;
