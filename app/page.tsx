'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: '123456',
    });

    setLoading(false);

    if (error) {
      alert('❌ خطأ في تسجيل الدخول');
    } else {
window.location.href = '/dashboard';      // تقدر بعد كده توديه لصفحة تانية
      // window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl text-center border border-white/20 w-full max-w-md">
        
        <div className="text-6xl mb-6">👥</div>

        <h1 className="text-4xl font-bold text-white mb-2">
          Alfa CRM
        </h1>

        <p className="text-slate-300 mb-6">
          يرجى تسجيل الدخول
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold w-full transition"
        >
          {loading ? 'جاري الدخول...' : 'تسجيل دخول'}
        </button>

        <p className="text-slate-400 text-sm mt-4">
          للتسجيل الجديد تواصل مع الإدارة
        </p>
      </div>
    </div>
  );
}