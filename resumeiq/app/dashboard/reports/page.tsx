'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/debug');
        if (res.ok) {
          const json = await res.json();
          setData(json.counts);
        }
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <ProtectedLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#004643]">Reports</h1>
        <p className="text-gray-600 mt-2">System statistics overview</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 max-w-4xl">
        {loading ? (
             <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-[#004643]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
        ) : !data ? (
           <p className="text-gray-500">Failed to load reports data.</p>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F0EDE5] p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-[#004643] mb-4">Total Shortlists</h3>
                    <p className="text-4xl font-bold text-[#004643]">{data.shortlists}</p>
                </div>
                <div className="bg-[#F0EDE5] p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-[#004643] mb-4">Total Students</h3>
                    <p className="text-4xl font-bold text-[#004643]">{data.students}</p>
                </div>
                <div className="bg-[#F0EDE5] p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-[#004643] mb-4">Total Companies</h3>
                    <p className="text-4xl font-bold text-[#004643]">{data.companies}</p>
                </div>
                <div className="bg-[#F0EDE5] p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-[#004643] mb-4">Total Teachers</h3>
                    <p className="text-4xl font-bold text-[#004643]">{data.teachers}</p>
                </div>
             </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
