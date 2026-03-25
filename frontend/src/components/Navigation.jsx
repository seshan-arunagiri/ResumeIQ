import { Building2, Upload, BarChart3, ChevronRight, Home } from 'lucide-react';
import logoSrc from '../assets/hero.png';

const STEPS = [
  { id: 'setup',   label: 'Company Setup',  Icon: Building2 },
  { id: 'upload',  label: 'Upload Resumes', Icon: Upload },
  { id: 'results', label: 'Results',        Icon: BarChart3 },
];

export default function Navigation({ activeTab, onTabChange, onHome, selectedCompany }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(33,37,41,0.9)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 60,
        maxWidth: 1340, margin: '0 auto',
      }}>
        {/* Brand */}
        <button onClick={onHome} style={{
          background: 'none', padding: '4px 8px',
          borderRadius: 8, transition: 'background var(--t)', display: 'flex', alignItems: 'center',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          <img src={logoSrc} alt="ResumeIQ" style={{ height: 34, objectFit: 'contain' }} />
        </button>

        {/* Breadcrumb / active company */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <button onClick={onHome} style={{
            display: 'flex', alignItems: 'center', gap: 5, background: 'none',
            color: 'var(--subtle)', padding: '4px 8px', borderRadius: 6,
            transition: 'color var(--t)',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--subtle)'; }}
          >
            <Home size={13} /> Home
          </button>
          <ChevronRight size={13} color="var(--border2)" />
          {selectedCompany ? (
            <span style={{
              padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: 'var(--teal-soft)', color: 'var(--teal)',
              border: '1px solid rgba(23,162,184,0.25)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Building2 size={11} /> {selectedCompany.name}
            </span>
          ) : (
            <span style={{ color: 'var(--subtle)', fontSize: 12 }}>No company selected</span>
          )}
        </div>
      </div>

      {/* Progress tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 28px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        maxWidth: 1340, margin: '0 auto',
        overflowX: 'auto',
      }}>
        {STEPS.map((step, i) => {
          const active = activeTab === step.id;
          const past   = STEPS.findIndex(s => s.id === activeTab) > i;
          return (
            <button key={step.id} onClick={() => onTabChange(step.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '11px 22px', fontSize: 13, fontWeight: 600,
                background: 'none', whiteSpace: 'nowrap',
                color: active ? 'var(--teal)' : past ? 'var(--text2)' : 'var(--subtle)',
                borderBottom: active
                  ? '2px solid var(--teal)'
                  : past ? '2px solid var(--border)' : '2px solid transparent',
                borderRadius: 0,
                transition: 'color var(--t), border-color var(--t)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text2)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = past ? 'var(--text2)' : 'var(--subtle)'; }}
            >
              {/* Step number disc */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: active ? 'var(--teal-grad)' : past ? 'var(--surface2)' : 'transparent',
                border: active ? 'none' : past ? '1px solid var(--border2)' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                color: active ? '#fff' : past ? 'var(--muted)' : 'var(--border2)',
                transition: 'all var(--t)',
              }}>
                {i + 1}
              </div>
              <step.Icon size={14} />
              {step.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
