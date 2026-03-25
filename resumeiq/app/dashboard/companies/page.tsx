'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';

interface Company { id: string; name: string; industry: string; createdAt: string; }

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
const BuildingIcon = () => (
  <svg width="40" height="40" fill="none" stroke="rgba(123,47,255,0.3)" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) { const j = await res.json(); setCompanies(j.companies || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company?')) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      res.ok ? fetchCompanies() : alert('Failed to delete company');
    } catch { alert('Error deleting company'); }
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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e8e6ff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Companies</h1>
          <p style={{ color: '#5c5585', marginTop: 6, fontSize: 14 }}>Manage placement companies and roles</p>
        </div>
        <Link href="/dashboard/companies/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', borderRadius: 12, textDecoration: 'none',
          background: 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
          color: '#fff', fontSize: 13, fontWeight: 700,
          boxShadow: '0 6px 20px rgba(123,47,255,0.35)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(123,47,255,0.55)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(123,47,255,0.35)'; }}
        >
          <PlusIcon /> Add Company
        </Link>
      </div>

      {/* Table card */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(123,47,255,0.2)', borderTopColor: '#7B2FFF', animation: 'spin 0.9s linear infinite' }} />
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: '70px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <BuildingIcon />
            <p style={{ color: '#3d3660', fontSize: 14 }}>No companies added yet.</p>
            <Link href="/dashboard/companies/new" style={{ color: '#7B2FFF', fontSize: 13, textDecoration: 'underline' }}>Add your first company</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(58,12,163,0.07)', borderBottom: '1px solid rgba(123,47,255,0.1)' }}>
                  {['Company', 'Industry', 'Date Added', ''].map(h => (
                    <th key={h} style={{
                      padding: '13px 20px', textAlign: h === '' ? 'right' : 'left',
                      fontSize: 11, fontWeight: 700, color: '#5c5585',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((company, i) => (
                  <tr key={company.id}
                    style={{ borderBottom: '1px solid rgba(123,47,255,0.06)', transition: 'background 0.15s', animation: `fadeSlideUp 0.4s ease ${i * 0.05}s both` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(123,47,255,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: 'linear-gradient(135deg, rgba(58,12,163,0.5), rgba(123,47,255,0.4))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: '#c4b5fd', flexShrink: 0,
                        }}>
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#e8e6ff', fontSize: 14 }}>{company.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#5c5585' }}>{company.industry || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#5c5585' }}>
                      {new Date(company.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(company.id)} title="Delete company"
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
