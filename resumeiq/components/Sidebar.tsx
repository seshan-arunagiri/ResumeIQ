'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/useAuth';

// Inline SVGs replacing lucide-react
const LayoutDashboardIcon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
);

const UploadCloudIcon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
);

const Building2Icon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
);

const FileBarChartIcon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
);

const UsersIcon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
);

const BrainCircuitIcon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 00-7.391 16.738A5 5 0 0112 14v-2M12 2a10 10 0 017.391 16.738A5 5 0 0012 14v-2z"></path></svg>
);

const LogOutIcon = ({ className, style }: any) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
    { name: 'Upload Resumes', href: '/upload', icon: UploadCloudIcon },
    { name: 'Companies', href: '/dashboard/companies', icon: Building2Icon },
    ...(role === 'admin' ? [{ name: 'Teachers & Admins', href: '/dashboard/teachers', icon: UsersIcon }] : []),
    { name: 'Reports', href: '/dashboard/reports', icon: FileBarChartIcon },
  ];

  return (
    <div className="flex flex-col w-64 h-full" style={{ backgroundColor: '#004643', borderRight: '1px solid #003330' }}>
      <div className="flex items-center justify-center h-16" style={{ borderBottom: '1px solid rgba(240,237,229,0.15)' }}>
        <BrainCircuitIcon className="w-6 h-6 mr-2" style={{ color: '#F0EDE5' }} />
        <span className="text-xl font-bold tracking-tight" style={{ color: '#F0EDE5' }}>ResumeIQ</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive ? '#006b65' : 'transparent',
                  color: isActive ? '#F0EDE5' : 'rgba(240,237,229,0.75)',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(240,237,229,0.1)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <item.icon
                  className="flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                  style={{ color: isActive ? '#F0EDE5' : 'rgba(240,237,229,0.6)' }}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4" style={{ borderTop: '1px solid rgba(240,237,229,0.15)' }}>
        <button
          onClick={logout}
          className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
          style={{ color: 'rgba(240,237,229,0.65)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(240,237,229,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <LogOutIcon className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
          <span className="truncate">Sign out</span>
        </button>
      </div>
    </div>
  );
}
