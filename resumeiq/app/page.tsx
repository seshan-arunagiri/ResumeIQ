'use client';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useEffect, useRef } from 'react';

const FileSearchIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="14,2 14,8 20,8" />
    <circle cx="11" cy="15" r="2" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13 17 2 2" />
  </svg>
);
const BrainIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);
const BarChartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="12" width="4" height="8" rx="1" strokeWidth="2" />
    <rect x="9" y="8" width="4" height="12" rx="1" strokeWidth="2" />
    <rect x="15" y="4" width="4" height="16" rx="1" strokeWidth="2" />
  </svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" points="9,18 15,12 9,6" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-5-7 7 7-7 7" />
  </svg>
);

const features = [
  {
    icon: <FileSearchIcon />,
    label: 'AI Resume Parsing',
    desc: 'Extract CGPA, skills, and structured data from any PDF using LLMs — in milliseconds.',
    color: '#3A0CA3',
    glow: 'rgba(58,12,163,0.35)',
  },
  {
    icon: <BrainIcon />,
    label: 'Smart Ranking',
    desc: 'Assign custom weights to resume, GitHub, and LeetCode scores to surface top candidates.',
    color: '#7B2FFF',
    glow: 'rgba(123,47,255,0.35)',
  },
  {
    icon: <BarChartIcon />,
    label: 'Export Reports',
    desc: 'Generate Excel and PDF shortlist reports ready to share with campus recruiters.',
    color: '#4cc9f0',
    glow: 'rgba(76,201,240,0.3)',
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.style.opacity = '1';
      heroRef.current.style.transform = 'translateY(0)';
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#e8e6ff', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(58,12,163,0.22) 0%, transparent 70%)',
          animation: 'orb-float 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '-8%',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,47,255,0.18) 0%, transparent 70%)',
          animation: 'orb-float 12s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '55%', left: '40%',
          width: 350, height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,201,240,0.08) 0%, transparent 70%)',
          animation: 'orb-float 15s ease-in-out infinite 3s',
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(123,47,255,0.12)',
        position: 'relative', zIndex: 1,
      }}>
        <Logo width={152} height={36} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 500, color: '#9b92c8',
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid rgba(123,47,255,0.2)',
            transition: 'all 0.2s',
            textDecoration: 'none',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,255,0.5)'; (e.currentTarget as HTMLElement).style.color = '#e8e6ff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,255,0.2)'; (e.currentTarget as HTMLElement).style.color = '#9b92c8'; }}
          >Sign In</Link>
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 600, color: '#fff',
            padding: '9px 22px', borderRadius: 10,
            background: 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
            boxShadow: '0 4px 20px rgba(123,47,255,0.35)',
            transition: 'all 0.2s',
            textDecoration: 'none',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(123,47,255,0.55)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(123,47,255,0.35)'; }}
          >Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 1 }}>
        <div
          ref={heroRef}
          style={{
            textAlign: 'center',
            opacity: 0, transform: 'translateY(30px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            border: '1px solid rgba(123,47,255,0.35)',
            background: 'rgba(58,12,163,0.1)',
            fontSize: 13, fontWeight: 500, color: '#b8a4ff',
            marginBottom: 36,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7B2FFF', boxShadow: '0 0 8px #7B2FFF', display: 'inline-block' }} />
            Powered by Groq — GitHub + LeetCode included
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.1,
            marginBottom: 24, letterSpacing: '-2px',
            fontFamily: "'Space Grotesk', Inter, sans-serif",
          }}>
            <span style={{ color: '#e8e6ff' }}>AI-Powered Campus</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #7B2FFF 50%, #4cc9f0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Placement Screening
            </span>
          </h1>

          <p style={{ fontSize: 19, lineHeight: 1.7, color: '#9b92c8', maxWidth: 600, margin: '0 auto 44px' }}>
            Instantly process hundreds of resumes, extract precise data using LLMs, and rank
            candidates automatically based on custom company criteria.
          </p>

          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 36px', borderRadius: 50,
            background: 'linear-gradient(135deg, #3A0CA3 0%, #7B2FFF 100%)',
            color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(123,47,255,0.4)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(123,47,255,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(123,47,255,0.4)'; }}
          >
            Get Started Free <ChevronRight />
          </Link>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24, marginTop: 100,
        }}>
          {features.map((f, i) => (
            <div key={f.label} style={{
              padding: '32px 28px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(123,47,255,0.15)',
              transition: 'all 0.3s ease',
              animation: `fadeSlideUp 0.6s ease ${i * 0.15}s both`,
              cursor: 'default',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-6px)';
                el.style.borderColor = 'rgba(123,47,255,0.45)';
                el.style.boxShadow = `0 20px 60px ${f.glow}`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'rgba(123,47,255,0.15)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `rgba(${i === 0 ? '58,12,163' : i === 1 ? '123,47,255' : '76,201,240'},0.15)`,
                color: f.color, marginBottom: 20,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e8e6ff', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#7b7299' }}>{f.desc}</p>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, color: '#7B2FFF', fontSize: 13, fontWeight: 600 }}>
                Learn more <ArrowRight />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '32px 40px',
        borderTop: '1px solid rgba(123,47,255,0.1)',
        color: '#3d3660', fontSize: 13,
        position: 'relative', zIndex: 1,
      }}>
        ResumeIQ — AI-powered college placement screener · Flask + Groq + LeetCode + GitHub
      </footer>
    </div>
  );
}
