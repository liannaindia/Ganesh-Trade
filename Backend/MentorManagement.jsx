// src/Backend/MentorManagement.jsx
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

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          导师管理
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium">ID</th>
              <th className="px-6 py-3 text-left font-medium">姓名</th>
              <th className="px-6 py-3 text-left font-medium">粉丝数</th>
              <th className="px-6 py-3 text-left font-medium">佣金率</th>
              <th className="px-6 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mentors.map((mentor) => (
              <tr key={mentor.id} className="hover:bg-blue-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{mentor.id}</td>
                <td className="px-6 py-4">{mentor.name}</td>
                <td className="px-6 py-4">{mentor.followers}</td>
                <td className="px-6 py-4">{mentor.commission}%</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-700 shadow">
                      编辑
                    </button>
                    <button className="px-3 py-1.5 bg-rose-500 text-white rounded-full text-xs hover:bg-rose-600 shadow">
                      移除
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
