'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">
      <p className="text-slate-400 animate-pulse">جاري التحويل لنظام إدارة العملاء...</p>
    </div>
  );
}