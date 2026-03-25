'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
) : (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('resumeiq_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(123,47,255,0.2)',
    borderRadius: 10,
    color: '#e8e6ff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,12,163,0.25) 0%, transparent 68%)', animation: 'orb-float 10s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.2) 0%, transparent 68%)', animation: 'orb-float 14s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420, margin: '0 20px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(123,47,255,0.25)',
        borderRadius: 24, padding: '44px 40px',
        position: 'relative', zIndex: 1,
        animation: 'fadeSlideUp 0.55s ease both',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Logo width={152} height={36} /></div>
          <p style={{ color: '#5c5585', fontSize: 14, marginTop: 10 }}>Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 16px',
            background: 'rgba(239,35,60,0.1)', border: '1px solid rgba(239,35,60,0.25)',
            borderRadius: 10, color: '#ff6b81', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9b92c8', marginBottom: 8 }}>
              Email Address
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu" required
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#7B2FFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123,47,255,0.2)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9b92c8', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => { e.currentTarget.style.borderColor = '#7B2FFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123,47,255,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#5c5585',
                display: 'flex', alignItems: 'center', padding: 0,
              }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: loading ? 'rgba(123,47,255,0.4)' : 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 8px 24px rgba(123,47,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 4,
          }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(123,47,255,0.5)'; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = loading ? 'none' : '0 8px 24px rgba(123,47,255,0.35)'; }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Back link */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: '#5c5585', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9b92c8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5c5585'; }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}