import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("*");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("获取导师失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">导师管理</h2>
        <button
          onClick={fetchMentors}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[80px] px-4 py-3 text-center font-semibold uppercase text-gray-600">ID</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">姓名</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">粉丝数</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">佣金率</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {mentors.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{m.id}</td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.followers}</td>
                <td className="px-4 py-3">{m.commission}%</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">编辑</button>
                  <button className="text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
