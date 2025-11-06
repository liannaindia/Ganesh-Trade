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

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">上股管理</h2>
        <button
          onClick={fetchStocks}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">代码</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">名称</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">价格</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{stock.code}</td>
                <td className="px-4 py-3">{stock.name}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">${stock.price}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      stock.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {stock.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {stock.status === "pending" && (
                    <button
                      onClick={() => handlePublish(stock.id)}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      上架
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-800">编辑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
