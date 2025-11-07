import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function RechargeChannel() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // 新增编辑表单显示状态
  const [newChannel, setNewChannel] = useState({
    currency_name: "",
    wallet_address: "",
    status: "active",
  });
  const [editingChannel, setEditingChannel] = useState(null); // 用于存储编辑时的通道数据

  // 初始化加载
  useEffect(() => {
    fetchChannels();
  }, []);

  // 获取通道数据
  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("id, currency_name, wallet_address, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("获取虚拟币通道失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加新通道
  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannel.currency_name || !newChannel.wallet_address) {
      alert("请输入币种名称和钱包地址！");
      return;
    }

    try {
      const { error } = await supabase.from("channels").insert([
        {
          currency_name: newChannel.currency_name,
          wallet_address: newChannel.wallet_address,
          status: newChannel.status,
        },
      ]);

      if (error) throw error;

      setNewChannel({ currency_name: "", wallet_address: "", status: "active" });
      setShowAddForm(false);
      fetchChannels();
    } catch (error) {
      console.error("添加失败:", error);
      alert("添加失败，请检查 Supabase 权限或网络。");
    }
  };

  // 删除通道
  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除该通道吗？")) return;

    try {
      const { error } = await supabase.from("channels").delete().eq("id", id);
      if (error) throw error;
      fetchChannels();
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请稍后重试。");
    }
  };

  // 编辑通道
  const handleEditChannel = (channel) => {
    setEditingChannel(channel); // 设置正在编辑的通道
    setShowEditForm(true); // 显示编辑表单
  };

  // 更新通道
  const handleUpdateChannel = async (e) => {
    e.preventDefault();
    if (!editingChannel.currency_name || !editingChannel.wallet_address) {
      alert("请输入币种名称和钱包地址！");
      return;
    }

    try {
      const { error } = await supabase
        .from("channels")
        .update({
          currency_name: editingChannel.currency_name,
          wallet_address: editingChannel.wallet_address,
          status: editingChannel.status,
        })
        .eq("id", editingChannel.id);

      if (error) throw error;

      setEditingChannel(null); // 清空编辑的通道数据
      setShowEditForm(false); // 隐藏编辑表单
      fetchChannels(); // 刷新通道列表
    } catch (error) {
      console.error("更新失败:", error);
      alert("更新失败，请检查 Supabase 权限或网络。");
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {/* 顶部操作栏 */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">虚拟币充值通道管理</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            {showAddForm ? "取消添加" : "添加通道"}
          </button>
          <button
            onClick={fetchChannels}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <form onSubmit={handleAddChannel} className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">币种名称</label>
              <input
                type="text"
                value={newChannel.currency_name}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, currency_name: e.target.value })
                }
                placeholder="例如：USDT (TRC20)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">钱包地址</label>
              <input
                type="text"
                value={newChannel.wallet_address}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, wallet_address: e.target.value })
                }
                placeholder="输入该币种对应的充值地址"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={newChannel.status}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              保存
            </button>
          </div>
        </form>
      )}

      {/* 编辑表单 */}
      {showEditForm && editingChannel && (
        <form onSubmit={handleUpdateChannel} className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">币种名称</label>
              <input
                type="text"
                value={editingChannel.currency_name}
                onChange={(e) =>
                  setEditingChannel({ ...editingChannel, currency_name: e.target.value })
                }
                placeholder="例如：USDT (TRC20)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">钱包地址</label>
              <input
                type="text"
                value={editingChannel.wallet_address}
                onChange={(e) =>
                  setEditingChannel({ ...editingChannel, wallet_address: e.target.value })
                }
                placeholder="输入该币种对应的充值地址"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={editingChannel.status}
                onChange={(e) =>
                  setEditingChannel({ ...editingChannel, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              更新
            </button>
          </div>
        </form>
      )}

      {/* 表格显示 */}
      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[160px] px-4 py-3 text-center font-semibold uppercase text-gray-600">
                币种名称
              </th>
              <th className="w-[400px] px-4 py-3 text-center font-semibold uppercase text-gray-600">
                充值地址
              </th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">
                状态
              </th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">
                操作
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {channels.map((ch) => (
              <tr key={ch.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{ch.currency_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 break-all">
                  {ch.wallet_address}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ch.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ch.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="text-red-600 hover:text-red-800 mr-3"
                  >
                    删除
                  </button>
                  <button
                    onClick={() => handleEditChannel(ch)} // 点击编辑按钮时传入通道数据
                    className="text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            ))}

            {channels.length === 0 && (
              <tr>
                <td colSpan="4" className="py-6 text-gray-400 text-center">
                  暂无充值通道，请添加新的虚拟币。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
