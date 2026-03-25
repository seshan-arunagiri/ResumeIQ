import { Building2, Upload, BarChart3, ArrowRight, CheckCircle2, Users, Code2, FileCheck, TrendingUp } from 'lucide-react';
import logoSrc from '../assets/hero.png';

const features = [
  {
    icon: <Building2 size={22} />,
    title: 'Company Profiles',
    desc: 'Define hiring criteria, minimum CGPA, required skills, and scoring weights per company.',
    color: '#17a2b8',
  },
  {
    icon: <Upload size={22} />,
    title: 'Bulk Resume Upload',
    desc: 'Drag-and-drop hundreds of PDF resumes. AI extracts structured data in seconds.',
    color: '#20c997',
  },
  {
    icon: <Code2 size={22} />,
    title: 'GitHub & LeetCode',
    desc: 'Automatically fetch live coding profiles and factor them into candidate scores.',
    color: '#17a2b8',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Ranked Shortlists',
    desc: 'Company-wise filtered rankings with export to Excel. One click to share.',
    color: '#20c997',
  },
];

const steps = [
  { n: '01', label: 'Set up a company', sub: 'Define scoring criteria and required skills.' },
  { n: '02', label: 'Upload resumes',   sub: 'Batch process PDF resumes with AI extraction.' },
  { n: '03', label: 'View shortlist',   sub: 'Ranked, filtered, and ready to export.' },
];

export default function HomePage({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: 64,
        background: 'rgba(33,37,41,0.85)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <img src={logoSrc} alt="ResumeIQ" style={{ height: 38, objectFit: 'contain' }} />
        <button onClick={onStart} style={{
          padding: '8px 22px', borderRadius: 99,
          background: 'var(--teal-grad)',
          color: '#fff', fontWeight: 700, fontSize: 13,
          boxShadow: '0 4px 18px var(--teal-glow)',
          transition: 'transform var(--t), box-shadow var(--t)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px var(--teal-glow)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px var(--teal-glow)'; }}
        >
          Open App
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', padding: '100px 5% 80px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
        maxWidth: 1200, margin: '0 auto',
      }}>
        {/* Left */}
        <div className="fade-up">

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
            letterSpacing: '-1.5px', color: 'var(--text)',
          }}>
            Campus Placement<br />
            <span className="gradient-text">Screening — Automated.</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--muted)', maxWidth: 480, marginBottom: 40 }}>
            Upload hundreds of resumes and get a ranked shortlist in minutes.
            Scoring uses CGPA, LeetCode, GitHub, and skill match — all configurable per company.
          </p>

          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={onStart} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 32px', borderRadius: 99,
              background: 'var(--teal-grad)', color: '#fff',
              fontWeight: 700, fontSize: 15,
              boxShadow: '0 6px 28px var(--teal-glow)',
              transition: 'all var(--t)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px var(--teal-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px var(--teal-glow)'; }}
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right — metrics / processing visual */}
        <div className="float-el" style={{ position: 'relative', height: 380 }}>
          {/* Tilted back layer */}
          <div style={{
            position: 'absolute', right: 30, top: 30, left: 30, bottom: 10,
            borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
            transform: 'rotate(-4deg)',
          }} />
          {/* Front card */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'var(--surface)', borderRadius: 20,
            border: '1px solid var(--border2)',
            padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 18,
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
                  <FileCheck size={15} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Resume Analysis</span>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: 'rgba(40,167,69,0.12)', color: '#28a745', fontWeight: 700, border: '1px solid rgba(40,167,69,0.25)' }}>342 processed</span>
            </div>

            {/* Metric bars */}
            {[
              { label: 'CGPA Score',    pct: 82, color: '#74b9ff' },
              { label: 'LeetCode',      pct: 67, color: '#ffc107' },
              { label: 'GitHub',        pct: 74, color: '#a29bfe' },
              { label: 'Skill Match',   pct: 91, color: '#17a2b8' },
            ].map((m, i) => (
              <div key={m.label} style={{ animation: `stagger 0.5s ease ${i * 80}ms both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: m.color }}>{m.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${m.pct}%`, height: '100%', borderRadius: 99,
                    background: m.color, opacity: 0.85,
                    boxShadow: `0 0 8px ${m.color}66`,
                  }} />
                </div>
              </div>
            ))}

            {/* Bottom stat row */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {[
                { Icon: Users,      val: '342', label: 'Candidates' },
                { Icon: FileCheck,  val: '87',  label: 'Shortlisted' },
                { Icon: TrendingUp, val: '94%', label: 'Accuracy' },
              ].map(({ Icon, val, label }) => (
                <div key={label} style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <Icon size={14} color="var(--teal)" style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'var(--subtle)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '80px 5%', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 56 }}>
            Three steps to a shortlist
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, position: 'relative' }}>
            {/* connector line */}
            <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 1, background: 'var(--border2)' }} />
            {steps.map((step, i) => (
              <div key={step.n} className="fade-up" style={{ textAlign: 'center', padding: '0 24px', animationDelay: `${i * 120}ms` }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'var(--teal-grad)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                  boxShadow: '0 8px 24px var(--teal-glow)',
                  position: 'relative', zIndex: 1,
                }}>{step.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{step.label}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>{step.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <button onClick={onStart} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 32px', borderRadius: 99,
              background: 'var(--teal-grad)', color: '#fff',
              fontWeight: 700, fontSize: 14,
              boxShadow: '0 4px 18px var(--teal-glow)',
              transition: 'all var(--t)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              Start Screening <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 12 }}>Features</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--text)', marginBottom: 48, maxWidth: 500 }}>
          Everything you need for campus hiring
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.title} className="fade-up" style={{
              padding: '28px 32px', borderRadius: 'var(--r-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              transition: 'border-color var(--t), transform var(--t)',
              animationDelay: `${i * 100}ms`,
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 18,
                background: 'var(--teal-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color,
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 5%',
        textAlign: 'center', fontSize: 13, color: 'var(--subtle)',
        background: 'var(--surface)',
      }}>
        ResumeIQ · AI-powered campus placement screener · Flask + Groq + LeetCode + GitHub
      </footer>
    </div>
  );
}
