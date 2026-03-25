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
      <div
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Spinning ring */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: '3px solid rgba(123,47,255,0.2)',
            borderTopColor: '#7B2FFF',
            animation: 'spin 0.9s linear infinite',
          }} />
          <span style={{ color: '#9b92c8', fontSize: 14, fontWeight: 500, letterSpacing: '0.05em' }}>
            Loading ResumeIQ...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050505' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: '32px',
        background: '#050505',
        /* subtle dot grid */
        backgroundImage: 'radial-gradient(rgba(123,47,255,0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}>
        {children}
      </main>
    </div>
  );
}
