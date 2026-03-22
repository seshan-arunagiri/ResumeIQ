'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';

export default function NewTeacherPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '', role: 'teacher' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); setSaving(false); return; }
      router.push('/dashboard/teachers');
    } catch {
      setError('Network error');
      setSaving(false);
    }
  };

  return (
    <ProtectedLayout adminOnly>
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard/teachers" className="inline-flex items-center text-sm text-gray-500 hover:text-[#004643] mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Teachers &amp; Admins
        </Link>
        <h1 className="text-2xl font-bold text-[#004643] mb-6">Add Teacher / Admin</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#004643]"
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Dr. Arjun Kumar' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. arjun@university.edu' },
            { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Computer Science (optional)' },
            { key: 'password', label: 'Login Password', type: 'password', placeholder: 'Set a login password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}{f.key !== 'department' && <span className="text-red-500"> *</span>}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#004643]"
              />
            </div>
          ))}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/teachers" className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#004643] text-white text-sm font-semibold rounded-lg hover:bg-[#003835] disabled:opacity-60 transition"
            >
              {saving ? 'Saving…' : `Save ${form.role === 'admin' ? 'Admin' : 'Teacher'}`}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
