'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/useAuth';

// ── SVG Icons ─────────────────────────────────────────────────
const DashboardIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const UploadIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const BuildingIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const ReportsIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <DashboardIcon active={false} /> },
    { name: 'Upload Resumes', href: '/upload', icon: <UploadIcon /> },
    { name: 'Companies', href: '/dashboard/companies', icon: <BuildingIcon /> },
    ...(role === 'admin' ? [{ name: 'Teachers & Admins', href: '/dashboard/teachers', icon: <UsersIcon /> }] : []),
    { name: 'Reports', href: '/dashboard/reports', icon: <ReportsIcon /> },
  ];

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#09091a',
      borderRight: '1px solid rgba(123,47,255,0.15)',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        borderBottom: '1px solid rgba(123,47,255,0.12)',
      }}>
        <Logo width={140} height={34} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#e8e6ff' : '#6b6490',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(58,12,163,0.35) 0%, rgba(123,47,255,0.15) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '2px solid #7B2FFF' : '2px solid transparent',
                transition: 'all 0.18s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(123,47,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#b8b0e8';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#6b6490';
                }
              }}
            >
              <span style={{ color: isActive ? '#7B2FFF' : 'inherit', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(123,47,255,0.1)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 10, width: '100%',
            background: 'transparent', border: 'none',
            fontSize: 14, fontWeight: 400, color: '#6b6490',
            cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,35,60,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#ef233c';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#6b6490';
          }}
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </aside>
  );
}
