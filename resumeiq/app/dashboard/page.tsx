'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';

interface DashboardData {
  totalResumes: number;
  totalCompanies: number;
  totalTeachers: number;
  shortlists: any[];
  companies: any[];
}

// ── Export helpers ──────────────────────────────────────────────────────────
async function exportPDF(companyName: string, candidates: any[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Shortlist: ${companyName}`, 14, 16);
  doc.setFontSize(10);
  doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 24);
  autoTable(doc, {
    startY: 30,
    head: [['Rank', 'Name', 'Score', 'Resume', 'GitHub', 'LeetCode', 'CGPA', 'Status']],
    body: candidates.map((c: any) => [
      c.rank ?? '-', c.studentName ?? '',
      (c.totalScore ?? 0).toFixed(1), (c.resumeScore ?? 0).toFixed(1),
      (c.githubScore ?? 0).toFixed(1), (c.leetcodeScore ?? 0).toFixed(1),
      (c.cgpa ?? 0).toFixed(2), c.status ?? '',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [58, 12, 163] },
  });
  doc.save(`${companyName}_shortlist.pdf`);
}

async function exportExcel(companyName: string, candidates: any[]) {
  const XLSX = await import('xlsx');
  const rows = candidates.map((c: any) => ({
    Rank: c.rank ?? '', Name: c.studentName ?? '', Email: c.studentEmail ?? '',
    'Total Score': (c.totalScore ?? 0).toFixed(1),
    'Resume Score': (c.resumeScore ?? 0).toFixed(1),
    'GitHub Score': (c.githubScore ?? 0).toFixed(1),
    'LeetCode Score': (c.leetcodeScore ?? 0).toFixed(1),
    'CGPA Score': (c.cgpaScore ?? 0).toFixed(1),
    CGPA: c.cgpa ?? '', Status: c.status ?? '', Reason: c.reason ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shortlist');
  XLSX.writeFile(wb, `${companyName}_shortlist.xlsx`);
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    'Highly Recommended': { bg: 'rgba(123,47,255,0.15)', color: '#c4b5fd', border: 'rgba(123,47,255,0.35)' },
    'Recommended':        { bg: 'rgba(6,214,160,0.12)',  color: '#06d6a0', border: 'rgba(6,214,160,0.3)' },
    'Not Recommended':    { bg: 'rgba(239,35,60,0.1)',   color: '#ff8096', border: 'rgba(239,35,60,0.25)' },
  };
  const s = styles[status] ?? { bg: 'rgba(255,255,255,0.06)', color: '#9b92c8', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 100,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  );
}

// ── Company section ──────────────────────────────────────────────────────────
function CompanySection({ company, shortlists }: { company: any; shortlists: any[] }) {
  const [open, setOpen] = useState(true);
  const sorted = [...shortlists].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      border: '1px solid rgba(123,47,255,0.18)',
      background: 'rgba(255,255,255,0.025)',
      backdropFilter: 'blur(10px)',
      transition: 'border-color 0.2s',
      animation: 'fadeSlideUp 0.5s ease both',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: open ? '1px solid rgba(123,47,255,0.12)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        background: 'rgba(58,12,163,0.08)',
        cursor: 'pointer',
      }} onClick={() => setOpen(!open)}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff',
            }}>
              {company.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8e6ff', fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>{company.name}</h2>
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 100,
              background: 'rgba(123,47,255,0.15)', color: '#b8a4ff',
              border: '1px solid rgba(123,47,255,0.3)',
            }}>
              {sorted.length} candidate{sorted.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {sorted.length > 0 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); exportPDF(company.name, sorted); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,35,60,0.35)',
                  background: 'rgba(239,35,60,0.08)', color: '#ff8096',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,35,60,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,35,60,0.08)'; }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                Export PDF
              </button>
              <button
                onClick={e => { e.stopPropagation(); exportExcel(company.name, sorted); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(6,214,160,0.35)',
                  background: 'rgba(6,214,160,0.08)', color: '#06d6a0',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(6,214,160,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(6,214,160,0.08)'; }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export Excel
              </button>
            </>
          )}
          <div style={{ color: '#5c5585', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="9,18 15,12 9,6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      {open && (
        sorted.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#3d3660', fontSize: 14 }}>
            No resumes processed yet.{' '}
            <a href="/upload" style={{ color: '#7B2FFF', textDecoration: 'underline' }}>Upload resumes</a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(58,12,163,0.07)' }}>
                  {['Rank', 'Candidate', 'Score', 'Resume', 'GitHub', 'LeetCode', 'CGPA', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: '#5c5585',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      borderBottom: '1px solid rgba(123,47,255,0.1)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((sl: any, idx: number) => (
                  <tr key={sl.id ?? idx} style={{ borderBottom: '1px solid rgba(123,47,255,0.06)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(123,47,255,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg, rgba(58,12,163,0.4), rgba(123,47,255,0.3))',
                        color: '#c4b5fd', fontSize: 12, fontWeight: 800,
                        border: '1px solid rgba(123,47,255,0.3)',
                      }}>
                        {sl.rank ?? idx + 1}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#e8e6ff', fontSize: 14 }}>{sl.studentName}</div>
                      <div style={{ fontSize: 12, color: '#3d3660', marginTop: 2 }}>{sl.studentEmail}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 800, color: '#7B2FFF', fontSize: 16 }}>{(sl.totalScore ?? 0).toFixed(1)}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9b92c8' }}>{(sl.resumeScore ?? 0).toFixed(1)}</td>
                    <td style={{ padding: '12px 16px', color: '#9b92c8' }}>{(sl.githubScore ?? 0).toFixed(1)}</td>
                    <td style={{ padding: '12px 16px', color: '#9b92c8' }}>{(sl.leetcodeScore ?? 0).toFixed(1)}</td>
                    <td style={{ padding: '12px 16px', color: '#9b92c8' }}>{sl.cgpa ?? '-'}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={sl.status ?? ''} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState('all');

  useEffect(() => {
    const userStr = localStorage.getItem('resumeiq_user');
    if (userStr) setUser(JSON.parse(userStr));
    fetch('/api/dashboard-data')
      .then(r => r.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayedCompanies =
    selectedCompany === 'all'
      ? data?.companies ?? []
      : (data?.companies ?? []).filter((c: any) => c.id === selectedCompany);

  const stats = [
    {
      label: 'Processed Resumes', value: data?.totalResumes ?? 0,
      color: '#4cc9f0', bg: 'rgba(76,201,240,0.1)',
      path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      label: 'Active Companies', value: data?.totalCompanies ?? 0,
      color: '#06d6a0', bg: 'rgba(6,214,160,0.1)',
      path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Teachers & Admins', value: data?.totalTeachers ?? 0,
      color: '#7B2FFF', bg: 'rgba(123,47,255,0.1)',
      path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
  ];

  return (
    <ProtectedLayout>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#e8e6ff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Dashboard</h1>
          <p style={{ color: '#5c5585', marginTop: 6, fontSize: 14 }}>Welcome back, {user?.name || 'Admin'}</p>
        </div>
        {(data?.companies?.length ?? 0) > 1 && (
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            style={{
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)',
              color: '#e8e6ff', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: '#0c0c18' }}>All Companies</option>
            {data?.companies?.map((c: any) => (
              <option key={c.id} value={c.id} style={{ background: '#0c0c18' }}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(123,47,255,0.2)', borderTopColor: '#7B2FFF', animation: 'spin 0.9s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
            {stats.map((stat, i) => (
              <div key={stat.label} style={{
                padding: '22px 24px', borderRadius: 18,
                background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(123,47,255,0.15)',
                display: 'flex', alignItems: 'center', gap: 16,
                animation: `fadeSlideUp 0.5s ease ${i * 0.1}s both`,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,255,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(123,47,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,255,0.15)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 13, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" fill="none" stroke={stat.color} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.path} />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#5c5585', fontWeight: 500, marginBottom: 4 }}>{stat.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Company sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {displayedCompanies.length === 0 ? (
              <div style={{
                padding: '60px', textAlign: 'center', borderRadius: 18,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(123,47,255,0.15)',
                color: '#3d3660', fontSize: 14,
              }}>
                No companies found.{' '}
                <a href="/dashboard/companies/new" style={{ color: '#7B2FFF', textDecoration: 'underline' }}>Add a company</a> to get started.
              </div>
            ) : (
              displayedCompanies.map((company: any) => (
                <CompanySection
                  key={company.id}
                  company={company}
                  shortlists={(data?.shortlists ?? []).filter((sl: any) => sl.companyId === company.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </ProtectedLayout>
  );
}
