// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please check .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 统一错误处理
export const call = async (fn) => {
  const { data, error } = await fn;
  if (error) throw new Error(error.message || 'Operation failed');
  return data;
};

// 登录（使用 Supabase Auth + 伪邮箱）
export const login = (phone, password) =>
  call(supabase.auth.signInWithPassword({
    email: `${phone}@ganesh.trade`,
    password,
  }));

// 注册
export const register = (phone, password) =>
  call(supabase.auth.signUp({
    email: `${phone}@ganesh.trade`,
    password,
  }));

// 登出
export const logout = () => supabase.auth.signOut();

// 监听登录状态
export const onAuthChange = (callback) =>
  supabase.auth.onAuthStateChange(callback);
