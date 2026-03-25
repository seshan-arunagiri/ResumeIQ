'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';

const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6m4-6v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

export default function TeachersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) { const json = await res.json(); setUsers(json.teachers || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const u = localStorage.getItem('resumeiq_user');
    if (u) setCurrentUser(JSON.parse(u));
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const card: React.CSSProperties = {
    borderRadius: 18, border: '1px solid rgba(123,47,255,0.15)',
    background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(10px)', overflow: 'hidden',
  };

  return (
    <ProtectedLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e8e6ff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Teachers & Admins</h1>
          <p style={{ color: '#5c5585', marginTop: 6, fontSize: 14 }}>Manage who has access to the ResumeIQ system</p>
        </div>
        {currentUser?.role === 'admin' && (
          <Link href="/dashboard/teachers/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 12, textDecoration: 'none',
            background: 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
            color: '#fff', fontSize: 13, fontWeight: 700,
            boxShadow: '0 6px 20px rgba(123,47,255,0.35)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(123,47,255,0.55)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(123,47,255,0.35)'; }}
          >
            <PlusIcon /> Add Teacher / Admin
          </Link>
        )}
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(123,47,255,0.2)', borderTopColor: '#7B2FFF', animation: 'spin 0.9s linear infinite' }} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#3d3660', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg width="44" height="44" fill="none" stroke="rgba(123,47,255,0.3)" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>No teachers or admins added yet.</p>
            {currentUser?.role === 'admin' && (
              <Link href="/dashboard/teachers/new" style={{ color: '#7B2FFF', fontSize: 13, textDecoration: 'underline' }}>Add one now</Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(58,12,163,0.07)', borderBottom: '1px solid rgba(123,47,255,0.1)' }}>
                  {['Name', 'Email', 'Department', 'Role', 'Added', ''].map(h => (
                    <th key={h} style={{
                      padding: '13px 20px', textAlign: h === '' ? 'right' : 'left',
                      fontSize: 11, fontWeight: 700, color: '#5c5585',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any, i: number) => (
                  <tr key={u.id}
                    style={{ borderBottom: '1px solid rgba(123,47,255,0.06)', transition: 'background 0.15s', animation: `fadeSlideUp 0.4s ease ${i * 0.05}s both` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(123,47,255,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg, rgba(58,12,163,0.6), rgba(123,47,255,0.5))'
                            : 'linear-gradient(135deg, rgba(76,201,240,0.25), rgba(6,214,160,0.2))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800,
                          color: u.role === 'admin' ? '#c4b5fd' : '#4cc9f0',
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#e8e6ff' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#5c5585' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px', color: '#5c5585' }}>{u.department || '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 11px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: u.role === 'admin' ? 'rgba(123,47,255,0.15)' : 'rgba(76,201,240,0.1)',
                        color: u.role === 'admin' ? '#c4b5fd' : '#4cc9f0',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(123,47,255,0.3)' : 'rgba(76,201,240,0.25)'}`,
                      }}>
                        {u.role === 'admin' ? 'Admin' : 'Teacher'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#5c5585' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {currentUser?.role === 'admin' && currentUser?.id !== u.id && (
                        <button onClick={() => handleDelete(u.id, u.name)} title="Delete"
                          style={{
                            padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(239,35,60,0.2)',
                            background: 'rgba(239,35,60,0.05)', color: '#5c5585',
                            cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,35,60,0.15)'; (e.currentTarget as HTMLElement).style.color = '#ff6b81'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,35,60,0.4)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,35,60,0.05)'; (e.currentTarget as HTMLElement).style.color = '#5c5585'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,35,60,0.2)'; }}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
