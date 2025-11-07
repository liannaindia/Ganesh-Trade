import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMentor, setNewMentor] = useState({
    name: "",
    years: 0,
    assets: 0,
    commission: 0,
    img: "",
  });

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

  const addMentor = async () => {
    try {
      const { error } = await supabase
        .from("mentors")
        .insert([
          {
            name: newMentor.name,
            years: newMentor.years,
            assets: newMentor.assets,
            commission: newMentor.commission,
            img: newMentor.img,
          },
        ]);
      if (error) throw error;
      fetchMentors(); // Refresh the list after adding
      setNewMentor({ name: "", years: 0, assets: 0, commission: 0, img: "" }); // Reset the form
    } catch (error) {
      console.error("添加导师失败:", error);
    }
  };

  const deleteMentor = async (id) => {
    try {
      const { error } = await supabase.from("mentors").delete().eq("id", id);
      if (error) throw error;
      fetchMentors(); // Refresh the list after deleting
    } catch (error) {
      console.error("删除导师失败:", error);
    }
  };

  const editMentor = async (id) => {
    const updatedMentor = mentors.find((mentor) => mentor.id === id);
    if (!updatedMentor) return;
    try {
      const { error } = await supabase
        .from("mentors")
        .update({
          name: updatedMentor.name,
          years: updatedMentor.years,
          assets: updatedMentor.assets,
          commission: updatedMentor.commission,
          img: updatedMentor.img,
        })
        .eq("id", id);
      if (error) throw error;
      fetchMentors(); // Refresh the list after editing
    } catch (error) {
      console.error("编辑导师失败:", error);
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

      <div className="p-6">
        <h3 className="text-lg font-semibold">添加新导师</h3>
        <input
          type="text"
          className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
          placeholder="导师姓名"
          value={newMentor.name}
          onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
        />
        <input
          type="number"
          className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
          placeholder="经验年数"
          value={newMentor.years}
          onChange={(e) => setNewMentor({ ...newMentor, years: parseInt(e.target.value) })}
        />
        <input
          type="number"
          className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
          placeholder="资产总额"
          value={newMentor.assets}
          onChange={(e) => setNewMentor({ ...newMentor, assets: parseInt(e.target.value) })}
        />
        <input
          type="number"
          className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
          placeholder="佣金率"
          value={newMentor.commission}
          onChange={(e) => setNewMentor({ ...newMentor, commission: parseInt(e.target.value) })}
        />
        <input
          type="text"
          className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
          placeholder="头像URL"
          value={newMentor.img}
          onChange={(e) => setNewMentor({ ...newMentor, img: e.target.value })}
        />
        <button
          onClick={addMentor}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          添加导师
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[80px] px-4 py-3 text-center font-semibold uppercase text-gray-600">ID</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">姓名</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">经验年数</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">资产总额</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">佣金率</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {mentors.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{m.id}</td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.years}</td>
                <td className="px-4 py-3">{m.assets.toLocaleString()}</td>
                <td className="px-4 py-3">{m.commission}%</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => editMentor(m.id)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => deleteMentor(m.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
