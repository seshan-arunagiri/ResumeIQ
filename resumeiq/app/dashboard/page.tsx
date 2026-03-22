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
      c.rank ?? '-',
      c.studentName ?? '',
      (c.totalScore ?? 0).toFixed(1),
      (c.resumeScore ?? 0).toFixed(1),
      (c.githubScore ?? 0).toFixed(1),
      (c.leetcodeScore ?? 0).toFixed(1),
      (c.cgpa ?? 0).toFixed(2),
      c.status ?? '',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 70, 67] },
  });
  doc.save(`${companyName}_shortlist.pdf`);
}

async function exportExcel(companyName: string, candidates: any[]) {
  const XLSX = await import('xlsx');
  const rows = candidates.map((c: any) => ({
    Rank: c.rank ?? '',
    Name: c.studentName ?? '',
    Email: c.studentEmail ?? '',
    'Total Score': (c.totalScore ?? 0).toFixed(1),
    'Resume Score': (c.resumeScore ?? 0).toFixed(1),
    'GitHub Score': (c.githubScore ?? 0).toFixed(1),
    'LeetCode Score': (c.leetcodeScore ?? 0).toFixed(1),
    'CGPA Score': (c.cgpaScore ?? 0).toFixed(1),
    CGPA: c.cgpa ?? '',
    Status: c.status ?? '',
    Reason: c.reason ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shortlist');
  XLSX.writeFile(wb, `${companyName}_shortlist.xlsx`);
}

// ── Status badge helper ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Highly Recommended'
      ? 'bg-green-100 text-green-800'
      : status === 'Recommended'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  return (
    <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${cls}`}>
      {status}
    </span>
  );
}

// ── Company shortlist section ───────────────────────────────────────────────
function CompanySection({
  company,
  shortlists,
}: {
  company: any;
  shortlists: any[];
}) {
  const sorted = [...shortlists].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#004643]">{company.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {sorted.length} candidate{sorted.length !== 1 ? 's' : ''} processed
          </p>
        </div>
        {sorted.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => exportPDF(company.name, sorted)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              Export PDF
            </button>
            <button
              onClick={() => exportExcel(company.name, sorted)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export Excel
            </button>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          No resumes processed for this company yet.{' '}
          <a href="/upload" className="text-[#004643] underline">Upload resumes</a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Rank','Candidate','Score','Resume','GitHub','LeetCode','CGPA','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((sl: any, idx: number) => (
                <tr key={sl.id ?? idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-[#004643]">#{sl.rank ?? idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{sl.studentName}</div>
                    <div className="text-xs text-gray-400">{sl.studentEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">{(sl.totalScore ?? 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(sl.resumeScore ?? 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(sl.githubScore ?? 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(sl.leetcodeScore ?? 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sl.cgpa ?? '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={sl.status ?? ''} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard page ─────────────────────────────────────────────────────
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

  return (
    <ProtectedLayout>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#004643]">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}!</p>
        </div>
        {/* Company filter */}
        {(data?.companies?.length ?? 0) > 1 && (
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#004643]"
          >
            <option value="all">All Companies</option>
            {data?.companies?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-[#004643]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Processed Resumes', value: data?.totalResumes ?? 0, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', bg: 'bg-blue-50', ic: 'text-blue-500' },
              { label: 'Active Companies', value: data?.totalCompanies ?? 0, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', bg: 'bg-green-50', ic: 'text-green-500' },
              { label: 'Teachers & Admins', value: data?.totalTeachers ?? 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', bg: 'bg-purple-50', ic: 'text-purple-500' },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`p-3 ${stat.bg} rounded-lg shrink-0`}>
                  <svg className={`w-6 h-6 ${stat.ic}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#004643]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Per-company tables */}
          <div className="space-y-6">
            {displayedCompanies.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100 text-gray-400">
                No companies found.{' '}
                <a href="/dashboard/companies/new" className="text-[#004643] underline">Add a company</a> to get started.
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
