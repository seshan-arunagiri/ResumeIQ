'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';

const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function NewTeacherPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '', role: 'teacher' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); setSaving(false); return; }
      router.push('/dashboard/teachers');
    } catch { setError('Network error'); setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)',
    color: '#e8e6ff', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  };

  const fields = [
    { key: 'name',       label: 'Full Name',      type: 'text',     placeholder: 'e.g. Dr. Arjun Kumar',           required: true  },
    { key: 'email',      label: 'Email Address',  type: 'email',    placeholder: 'e.g. arjun@university.edu',      required: true  },
    { key: 'department', label: 'Department',     type: 'text',     placeholder: 'e.g. Computer Science (optional)', required: false },
    { key: 'password',   label: 'Login Password', type: 'password', placeholder: 'Set a secure password',          required: true  },
  ];

  return (
    <ProtectedLayout adminOnly>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Back */}
        <Link href="/dashboard/teachers" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#5c5585', textDecoration: 'none', marginBottom: 24,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9b92c8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5c5585'; }}
        >
          <BackIcon /> Back to Teachers & Admins
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e8e6ff', margin: '0 0 24px', fontFamily: "'Space Grotesk', sans-serif" }}>
          Add Teacher / Admin
        </h1>

        <form onSubmit={handleSubmit} style={{
          borderRadius: 20, border: '1px solid rgba(123,47,255,0.18)',
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(10px)',
          padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Role */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9b92c8', marginBottom: 8 }}>
              Role <span style={{ color: '#ef233c' }}>*</span>
            </label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7B2FFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123,47,255,0.2)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <option value="teacher" style={{ background: '#0c0c18' }}>Teacher</option>
              <option value="admin"   style={{ background: '#0c0c18' }}>Admin</option>
            </select>
          </div>

          {/* Fields */}
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9b92c8', marginBottom: 8 }}>
                {f.label} {f.required && <span style={{ color: '#ef233c' }}>*</span>}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#7B2FFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123,47,255,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          ))}

          {/* Error */}
          {error && (
            <div style={{
              padding: '11px 14px', borderRadius: 10, fontSize: 13,
              background: 'rgba(239,35,60,0.08)', border: '1px solid rgba(239,35,60,0.25)', color: '#ff8096',
            }}>{error}</div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4 }}>
            <Link href="/dashboard/teachers" style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(123,47,255,0.2)', color: '#9b92c8', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,255,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,255,0.2)'; }}
            >Cancel</Link>
            <button type="submit" disabled={saving} style={{
              padding: '10px 28px', borderRadius: 10, border: 'none',
              background: saving ? 'rgba(123,47,255,0.4)' : 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 6px 20px rgba(123,47,255,0.35)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { if (!saving) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(123,47,255,0.55)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = saving ? 'none' : '0 6px 20px rgba(123,47,255,0.35)'; }}
            >
              {saving
                ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                : `Save ${form.role === 'admin' ? 'Admin' : 'Teacher'}`
              }
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
