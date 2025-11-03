import { createClient } from '@supabase/supabase-js';

// 使用您的 Supabase URL 和 API 密钥
const supabase = createClient(
  'https://gigzrgapctbdrbmbkcia.supabase.co', // 替换成您的 Supabase 项目 URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZ3pyZ2FwY3RiZHJibWJrY2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTI2NDIsImV4cCI6MjA3NzcyODY0Mn0.F6dnpa2--Q-xy1mlndbvsmKvvHN1hSKgh-kykCztNwQ' // 替换成您的匿名 API 密钥
);

export default supabase;
