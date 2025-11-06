// src/Backend/StockManagement.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from("stocks").select("*");
      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error("获取股票失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    await supabase.from("stocks").update({ status: "published" }).eq("id", id);
    fetchStocks();
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          上股管理
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium">代码</th>
              <th className="px-6 py-3 text-left font-medium">名称</th>
              <th className="px-6 py-3 text-left font-medium">价格</th>
              <th className="px-6 py-3 text-left font-medium">状态</th>
              <th className="px-6 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-blue-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{stock.code}</td>
                <td className="px-6 py-4">{stock.name}</td>
                <td className="px-6 py-4 font-semibold">${stock.price}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      stock.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {stock.status === "pending" ? "待上架" : "已上架"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {stock.status === "pending" && (
                      <button
                        onClick={() => handlePublish(stock.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs hover:bg-emerald-700 shadow"
                      >
                        上架
                      </button>
                    )}
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-700 shadow">
                      编辑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
