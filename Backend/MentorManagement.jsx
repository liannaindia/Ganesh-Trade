// components/MentorManagement.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMentor, setNewMentor] = useState({
    name: "", years: 0, assets: 0, commission: 0, img: ""
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const data = await call(supabase.from("mentors").select("*"));
      setMentors(data || []);
    } catch (error) {
      alert("Failed to load mentors: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMentor = async () => {
    try {
      await call(supabase.from("mentors").insert([newMentor]));
      fetchMentors();
      setNewMentor({ name: "", years: 0, assets: 0, commission: 0, img: "" });
      setIsAdding(false);
    } catch (error) {
      alert("Add failed: " + error.message);
    }
  };

  const updateMentor = async () => {
    try {
      await call(supabase.from("mentors").update(editingMentor).eq("id", editingMentor.id));
      fetchMentors();
      setEditingMentor(null);
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const deleteMentor = async (id) => {
    if (!confirm("Delete this mentor?")) return;
    try {
      await call(supabase.from("mentors").delete().eq("id", id));
      fetchMentors();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-700">Mentor Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
        >
          Add Mentor
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <tr>
                <th className="px-4 py-3 text-center">ID</th>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Years</th>
                <th className="px-4 py-3 text-center">Assets</th>
                <th className="px-4 py-3 text-center">Commission</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {mentors.map((m) => (
                <tr key={m.id} className="hover:bg-orange-50 text-center">
                  <td className="px-4 py-3">{m.id}</td>
                  <td className="px-4 py-3 font-medium text-orange-700">{m.name}</td>
                  <td className="px-4 py-3">{m.years}</td>
                  <td className="px-4 py-3">{m.assets.toLocaleString()}</td>
                  <td className="px-4 py-3">{m.commission}%</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingMentor(m)}
                      className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMentor(m.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-orange-700 mb-4">Add New Mentor</h3>
            <input
              placeholder="Name"
              value={newMentor.name}
              onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Years"
              value={newMentor.years}
              onChange={(e) => setNewMentor({ ...newMentor, years: parseInt(e.target.value) || 0 })}
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Assets"
              value={newMentor.assets}
              onChange={(e) => setNewMentor({ ...newMentor, assets: parseInt(e.target.value) || 0 })}
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Commission %"
              value={newMentor.commission}
              onChange={(e) => setNewMentor({ ...newMentor, commission: parseInt(e.target.value) || 0 })}
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <input
              placeholder="Image URL"
              value={newMentor.img}
              onChange={(e) => setNewMentor({ ...newMentor, img: e.target.value })}
              className="w-full mb-4 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <div className="flex gap-2">
              <button
                onClick={addMentor}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-orange-700 mb-4">Edit Mentor</h3>
            {/* 类似 Add Form，省略重复代码 */}
            <div className="flex gap-2">
              <button
                onClick={updateMentor}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold"
              >
                Update
              </button>
              <button
                onClick={() => setEditingMentor(null)}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
