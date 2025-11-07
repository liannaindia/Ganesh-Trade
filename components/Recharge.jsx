import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";  // 引入箭头图标
import { supabase } from "../supabaseClient";  // 引入supabase客户端

export default function Recharge({ setTab }) {
  const [channels, setChannels] = useState([]); // 存储通道数据
  const [loading, setLoading] = useState(true);  // 加载状态
  const [selectedChannel, setSelectedChannel] = useState(null); // 存储选中的通道

  useEffect(() => {
    // Get channel data from the database
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")  // Fetch data from channels table
          .select("id, currency_name, wallet_address, status")
          .eq("status", "active");  // Only fetch active channels

        if (error) throw error;
        setChannels(data);  // Store the fetched data
      } catch (error) {
        console.error("Failed to fetch recharge channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels(); // Call fetchChannels when the component mounts
  }, []);

  const handleChannelClick = (channel) => {
    // Toggle selection of the channel
    if (selectedChannel?.id === channel.id) {
      setSelectedChannel(null);  // Deselect if the same channel is clicked again
    } else {
      setSelectedChannel(channel);  // Select the new channel
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")} 
        />
        <h2 className="font-semibold text-slate-800 text-lg">Recharge</h2>
      </div>

      {/* Recharge page content */}
      <div className="space-y-2">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm cursor-pointer"
              onClick={() => handleChannelClick(channel)} // Toggle selection on click
            >
              <img
                src="https://i.imgur.com/b5NYPsZ.png" // You can dynamically load images based on channel.currency_name or other data
                className="w-8 h-8 rounded-full"
                alt="Payment Channel"
              />
              <div>
                <div className="font-medium text-slate-800 text-sm">{channel.currency_name}</div>
                <div className="text-[12px] text-slate-500">Instant deposit, fast arrival</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No available recharge channels</div>
        )}
      </div>

      {/* Display selected channel's wallet address */}
      {selectedChannel && (
        <div className="mt-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
          <div className="font-semibold text-slate-800">Wallet Address:</div>
          <div className="text-slate-500">{selectedChannel.wallet_address}</div>
        </div>
      )}

      {/* Enter recharge amount */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="text-sm text-slate-500 mb-1">
          Recharge Amount <span className="text-slate-400">1 USDT = 1 USDT</span>
        </div>
        <input
          className="w-full border border-slate-200 rounded-xl p-2 text-sm outline-none"
          placeholder="Minimum recharge amount 1 USDT"
        />
        <div className="text-[12px] text-slate-500 mt-1 text-right">USDT</div>
      </div>

      {/* Important reminder */}
      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
        <strong>Important Reminder:</strong>
        <br />
        If it does not arrive for a long time, please refresh the page or contact customer service.
      </div>

      {/* Continue button */}
      <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl">
        Continue
      </button>
    </div>
  );
}
