import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const Markets = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch the initial market data from Binance API
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?limit=10");
      const data = await res.json();
      const formattedData = data.map((coin) => ({
        name: coin.symbol.replace("USDT", ""),
        price: parseFloat(coin.lastPrice).toFixed(2),
        change: parseFloat(coin.priceChangePercent).toFixed(2),
      }));
      setCoins(formattedData);
      setHasMore(true);
    } catch (error) {
      console.error("Error fetching market data", error);
    } finally {
      setLoading(false);
    }
  };

  // Load more data when scrolling to the bottom
  const loadMoreData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?limit=10&offset=${coins.length}`
      );
      const data = await res.json();
      const formattedData = data.map((coin) => ({
        name: coin.symbol.replace("USDT", ""),
        price: parseFloat(coin.lastPrice).toFixed(2),
        change: parseFloat(coin.priceChangePercent).toFixed(2),
      }));
      if (data.length > 0) {
        setCoins((prevCoins) => [...prevCoins, ...formattedData]);
      } else {
        setHasMore(false); // No more data to load
      }
    } catch (error) {
      console.error("Error fetching more market data", error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchMarketData once on mount
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Handle scroll event to load more data when scrolled to the bottom
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && hasMore) {
      loadMoreData();
    }
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* Search Bar */}
      <div className="flex items-center gap-2 mt-3 mb-3">
        <div
          onClick={() => navigate("/markets")}
          className="flex items-center flex-1 bg-slate-100 border border-slate-200 rounded-full pl-3 pr-3 py-2 text-slate-500 cursor-pointer"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm text-slate-400">Enter the trading product name</span>
        </div>
      </div>

      {/* Market Data Table */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm"
        onScroll={handleScroll}
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-800">Markets</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {coins.length === 0 ? (
            <div className="text-center py-3 text-slate-500">Loading market data...</div>
          ) : (
            coins.map((coin, index) => (
              <div key={index} className="flex justify-between items-center py-2 text-sm">
                <span className="font-medium text-slate-700">{coin.name}</span>
                <span className="text-slate-800 font-semibold">{coin.price}</span>
                <span
                  className={`font-medium ${
                    coin.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {coin.change}%
                </span>
              </div>
            ))
          )}
          {loading && hasMore && (
            <div className="text-center py-2 text-slate-500">Loading more...</div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {coins.length > 10 && (
        <div className="text-center mt-4">
          <button
            onClick={() => window.scrollTo(0, 0)}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2 px-4 rounded-xl transition"
          >
            Back to Top
          </button>
        </div>
      )}
    </div>
  );
};

export default Markets;
