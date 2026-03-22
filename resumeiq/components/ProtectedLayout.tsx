'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ProtectedLayout({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem('resumeiq_user');
    if (!userJson) {
      router.push('/login');
    } else {
      if (adminOnly) {
        const u = JSON.parse(userJson);
        if (u.role !== 'admin') { router.push('/dashboard'); return; }
      }
      setLoading(false);
    }
  }, [router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0EDE5]">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-[#004643] rounded-full mb-4"></div>
            <div className="text-[#004643] font-semibold">Loading ResumeIQ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EDE5] flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F0EDE5] p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
