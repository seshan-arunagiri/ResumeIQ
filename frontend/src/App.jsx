import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Building2, Upload, BarChart3, Search, RefreshCw, Download,
  X, FileText, ChevronDown, Sliders, Zap, Star, CheckCircle2,
  AlertTriangle, Info, ChevronUp, Users, Code2, Brain,
} from 'lucide-react';
import './styles/theme.css';
import HomePage from './pages/HomePage';
import Navigation from './components/Navigation';

// ─── constants ────────────────────────────────────────────────────────────────
const API = 'http://localhost:5000';
const DEFAULT_WEIGHTS = { cgpa: 20, leetcode: 30, github: 20, skills: 30 };

// ─── design tokens (mirrors CSS vars for inline styles) ───────────────────────
const T = {
  bg: '#212529', surface: '#343a40', surface2: '#3d444b', surface3: '#495057',
  border: '#4a5057', border2: '#5a6268',
  text: '#f8f9fa', text2: '#ced4da', muted: '#adb5bd', subtle: '#6c757d',
  teal: '#17a2b8', teal2: '#20c997', tealSoft: 'rgba(23,162,184,0.12)', tealGlow: 'rgba(23,162,184,0.35)',
  green: '#28a745', greenSoft: 'rgba(40,167,69,0.12)', greenGlow: 'rgba(40,167,69,0.35)',
  gold: '#ffc107', goldSoft: 'rgba(255,193,7,0.12)', goldGlow: 'rgba(255,193,7,0.3)',
  red: '#dc3545', redSoft: 'rgba(220,53,69,0.12)', redGlow: 'rgba(220,53,69,0.35)',
};

// ─── scoring ──────────────────────────────────────────────────────────────────
function computeScore(s, weights, requiredSkills) {
  const w = weights;
  const cgpa = Math.min(Math.max(parseFloat(s.cgpa) || 0, 0), 10);
  const cgpaScore = (cgpa / 10) * w.cgpa;
  const easy = s.lc_easy || 0, medium = s.lc_medium || 0, hard = s.lc_hard || 0;
  const lcScore = Math.min((easy * 1 + medium * 2 + hard * 3) / 200, 1) * w.leetcode;
  const repos = s.gh_repos || 0, stars = s.gh_stars || 0, commits = s.gh_commits || 0;
  const ghScore = ((Math.min(repos / 20, 1) + Math.min(stars / 50, 1) + Math.min(commits / 50, 1)) / 3) * w.github;
  let skillScore = w.skills, jdMatch = 100;
  const req = (requiredSkills || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (req.length > 0) {
    const stuSkills = (s.skills || []).map(x => x.toLowerCase());
    const matched = req.filter(r => stuSkills.some(sk => sk.includes(r) || r.includes(sk)));
    jdMatch = Math.round((matched.length / req.length) * 100);
    skillScore = (matched.length / req.length) * w.skills;
  }
  const total = Math.round(Math.min(cgpaScore + lcScore + ghScore + skillScore, 100));
  const rec = total >= 75 ? 'Highly Recommended' : total >= 50 ? 'Recommended' : 'Not Recommended';
  return { score: total, recommendation: rec, jdMatch };
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: '22px 24px', ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase',
      letterSpacing: 1.4, marginBottom: 14,
    }}>{children}</div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 7 }}>{children}</div>
  );
}

function Btn({ onClick, disabled, children, variant = 'primary', style = {} }) {
  const base = { padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all var(--t)' };
  const variants = {
    primary: { background: 'var(--teal-grad)', color: '#fff', boxShadow: '0 4px 16px var(--teal-glow)' },
    teal:    { background: 'var(--teal-soft)', color: 'var(--teal)', border: '1px solid rgba(23,162,184,0.3)' },
    ghost:   { background: T.surface2, color: T.text2, border: `1px solid ${T.border2}` },
    green:   { background: 'linear-gradient(135deg, #1e7e34, #28a745)', color: '#fff', boxShadow: '0 4px 14px var(--green-glow)' },
    danger:  { background: T.redSoft, color: T.red, border: `1px solid rgba(220,53,69,0.3)` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
    >
      {children}
    </button>
  );
}

function Alert({ type, children }) {
  const configs = {
    error:   { bg: T.redSoft,   color: T.red,   border: 'rgba(220,53,69,0.3)',  Icon: AlertTriangle },
    success: { bg: T.greenSoft, color: T.green,  border: 'rgba(40,167,69,0.3)',  Icon: CheckCircle2 },
    warn:    { bg: T.goldSoft,  color: T.gold,   border: 'rgba(255,193,7,0.3)',  Icon: Info },
  };
  const c = configs[type] || configs.warn;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <c.Icon size={14} /> {children}
    </div>
  );
}

function ScoreBar({ score, delay = 0 }) {
  const color = score >= 75 ? T.green : score >= 50 ? T.gold : T.red;
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(score), 80 + delay); return () => clearTimeout(t); }, [score, delay]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: T.border2, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.7s cubic-bezier(.22,1,.36,1)' }} />
      </div>
      <span style={{ fontWeight: 800, fontSize: 13, width: 32, color, flexShrink: 0 }}>{score}</span>
    </div>
  );
}

function Badge({ label }) {
  const map = {
    'Highly Recommended': { bg: T.greenSoft, color: T.green, text: 'Highly Rec.' },
    'Recommended':        { bg: T.goldSoft,  color: T.gold,  text: 'Recommended' },
    'Not Recommended':    { bg: T.redSoft,   color: T.red,   text: 'Not Rec.' },
  };
  const b = map[label] || map['Not Recommended'];
  return (
    <span style={{
      background: b.bg, color: b.color, padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
      border: `1px solid ${b.color}44`,
    }}>{b.text}</span>
  );
}

function SkillTags({ skills, required }) {
  const req = (required || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {(skills || []).slice(0, 6).map(skill => {
        const hit = req.length && req.some(r => skill.toLowerCase().includes(r) || r.includes(skill.toLowerCase()));
        return (
          <span key={skill} style={{
            padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
            background: hit ? T.tealSoft : T.surface3,
            color: hit ? T.teal : T.text2,
            border: `1px solid ${hit ? T.teal + '44' : T.border2}`,
          }}>{skill}</span>
        );
      })}
      {(skills || []).length > 6 && <span style={{ fontSize: 11, color: T.subtle, alignSelf: 'center' }}>+{skills.length - 6}</span>}
    </div>
  );
}

function LCTag({ label, count, color }) {
  return (
    <span style={{
      background: `${color}18`, color, padding: '2px 7px',
      borderRadius: 5, fontWeight: 700, fontSize: 11, border: `1px solid ${color}33`,
    }}>{label} {count ?? 0}</span>
  );
}

function RankBadge({ idx }) {
  if (idx === 0) return <span style={{ fontWeight: 900, color: T.gold, fontSize: 13 }}>1st</span>;
  if (idx === 1) return <span style={{ fontWeight: 900, color: '#adb5bd', fontSize: 13 }}>2nd</span>;
  if (idx === 2) return <span style={{ fontWeight: 900, color: '#cd7f32', fontSize: 13 }}>3rd</span>;
  return <span style={{ fontWeight: 700, color: T.subtle, fontSize: 12 }}>#{idx + 1}</span>;
}

function WeightSlider({ label, name, value, onChange, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: T.text2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value}
        onChange={e => onChange(name, parseInt(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }} />
    </div>
  );
}

function Spinner({ size = 18 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${T.border2}`, borderTopColor: T.teal,
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// ─── Company Setup ────────────────────────────────────────────────────────────
function CompanySetup({ companies, onCompanyCreated, onSelectCompany, selectedCompany }) {
  const [jdText, setJdText] = useState('');
  const [analyzingJD, setAnalyzingJD] = useState(false);
  const [form, setForm] = useState({ name: '', min_cgpa: '', required_skills: '' });
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const handleWeight = (name, val) => setWeights(prev => ({ ...prev, [name]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Company name is required' }); return; }
    if (total !== 100) { setMsg({ type: 'error', text: `Weights must sum to 100 (currently ${total})` }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/company`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, min_cgpa: parseFloat(form.min_cgpa) || 0, weight_cgpa: weights.cgpa, weight_leetcode: weights.leetcode, weight_github: weights.github, weight_skills: weights.skills }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMsg({ type: 'success', text: `Company "${data.name || form.name}" created successfully` });
      setForm({ name: '', min_cgpa: '', required_skills: '' });
      setWeights(DEFAULT_WEIGHTS);
      onCompanyCreated();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    finally { setSaving(false); }
  };

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) { setMsg({ type: 'error', text: 'Please paste a job description first.' }); return; }
    setAnalyzingJD(true); setMsg(null);
    try {
      const res = await fetch(`${API}/analyze-jd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jd_text: jdText }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'JD analysis failed');
      const allSkills = [...(data.required_skills || []), ...(data.preferred_skills || [])].filter(Boolean);
      setForm(f => ({ ...f, required_skills: allSkills.join(', ') }));
      if (data.suggested_weights) setWeights(prev => ({ ...prev, ...data.suggested_weights }));
      setMsg({ type: 'success', text: 'JD analyzed — skills & weights auto-filled!' });
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    finally { setAnalyzingJD(false); }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>Company Setup</h2>
        <p style={{ color: T.muted, fontSize: 14 }}>Create a company profile and configure scoring weights for candidate ranking.</p>
      </div>

      {/* AI JD Analyzer */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
            <Brain size={15} />
          </div>
          <SectionTitle>AI Job Description Analyzer</SectionTitle>
        </div>
        <textarea value={jdText} onChange={e => setJdText(e.target.value)}
          placeholder="Paste the full job description here to auto-extract skills and suggested weights…"
          style={{ width: '100%', height: 100, marginBottom: 12, resize: 'vertical' }} />
        <Btn onClick={handleAnalyzeJD} disabled={analyzingJD} variant="teal">
          {analyzingJD ? <><Spinner size={13} /> Analyzing…</> : <><Zap size={13} /> Analyze JD & Auto-fill</>}
        </Btn>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Company Profile */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
              <Building2 size={15} />
            </div>
            <SectionTitle>Company Profile</SectionTitle>
          </div>
          <Label>Company Name *</Label>
          <input value={form.name} placeholder="e.g. Google, TCS, Infosys"
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ marginBottom: 14 }} />
          <Label>Minimum CGPA</Label>
          <input type="number" min="0" max="10" step="0.1" value={form.min_cgpa} placeholder="e.g. 7.5"
            onChange={e => setForm(f => ({ ...f, min_cgpa: e.target.value }))}
            style={{ marginBottom: 14 }} />
          <Label>Required Skills <span style={{ color: T.subtle, fontWeight: 400 }}>(comma-separated)</span></Label>
          <input value={form.required_skills} placeholder="Python, React, SQL, AWS"
            onChange={e => setForm(f => ({ ...f, required_skills: e.target.value }))}
            style={{ marginBottom: 18 }} />
          {msg && <Alert type={msg.type}>{msg.text}</Alert>}
          <Btn onClick={handleSave} disabled={saving} variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? <><Spinner size={13} /> Saving…</> : '+ Save Company'}
          </Btn>
        </Card>

        {/* Score Weights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
                  <Sliders size={15} />
                </div>
                <SectionTitle>Score Weights</SectionTitle>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: total !== 100 ? T.gold : T.green }}>
                {total !== 100 ? `${total}/100` : '100%'}
              </span>
            </div>
            <WeightSlider label="CGPA"     name="cgpa"     value={weights.cgpa}     onChange={handleWeight} color="#74b9ff" />
            <WeightSlider label="LeetCode" name="leetcode" value={weights.leetcode} onChange={handleWeight} color={T.gold} />
            <WeightSlider label="GitHub"   name="github"   value={weights.github}   onChange={handleWeight} color="#a29bfe" />
            <WeightSlider label="Skills"   name="skills"   value={weights.skills}   onChange={handleWeight} color={T.teal} />
          </Card>

          {/* Existing companies selector */}
          {companies.length > 0 && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
                  <Users size={15} />
                </div>
                <SectionTitle>Active Company</SectionTitle>
              </div>
              <select value={selectedCompany?.id || ''}
                onChange={e => { const c = companies.find(x => x.id === parseInt(e.target.value)); onSelectCompany(c || null); }}>
                <option value="">— select company —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload Section ───────────────────────────────────────────────────────────
function UploadSection({ selectedCompany, onUploadComplete, companies, onSelectCompany }) {
  const [files, setFiles]       = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState({ done: 0, total: 0 });
  const [results, setResults]     = useState([]);
  const [errors, setErrors]       = useState([]);
  const [dragging, setDragging]   = useState(false);
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const pdfs = [...incoming].filter(f => f.type === 'application/pdf');
    if (pdfs.length < incoming.length) alert('Some files skipped — only PDFs accepted.');
    setFiles(prev => { const existing = new Set(prev.map(f => f.name)); return [...prev, ...pdfs.filter(f => !existing.has(f.name))]; });
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }, []);

  const handleUpload = async () => {
    if (!selectedCompany) { alert('Please select a company first.'); return; }
    if (!files.length) { alert('No files selected.'); return; }
    setUploading(true); setProgress({ done: 0, total: files.length }); setResults([]); setErrors([]);
    const newResults = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ done: i, total: files.length });
      const fd = new FormData(); fd.append('company_id', selectedCompany.id); fd.append('file', file);
      try {
        const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        newResults.push(data);
      } catch (e) { setErrors(prev => [...prev, { filename: file.name, error: e.message }]); }
      setProgress({ done: i + 1, total: files.length });
    }
    setResults(newResults); setUploading(false); setFiles([]); onUploadComplete();
  };

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>Upload Resumes</h2>
        <p style={{ color: T.muted, fontSize: 14 }}>Drag-and-drop PDF resumes below — AI extracts structured data automatically.</p>
      </div>

      {/* Company selector at top of upload */}
      {companies.length > 0 && (
        <Card style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Building2 size={15} color={T.teal} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>Company:</span>
          </div>
          <select value={selectedCompany?.id || ''}
            onChange={e => { const c = companies.find(x => x.id === parseInt(e.target.value)); onSelectCompany(c || null); }}
            style={{ maxWidth: 280, flex: 1 }}>
            <option value="">— select company —</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedCompany && (
            <span style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: T.tealSoft, color: T.teal, border: '1px solid rgba(23,162,184,0.25)',
            }}>
              <CheckCircle2 size={11} style={{ marginRight: 4 }} /> Selected
            </span>
          )}
        </Card>
      )}

      {!selectedCompany && <Alert type="warn">Select a company above before uploading resumes.</Alert>}

      {/* Drop zone */}
      <div onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? T.teal : T.border2}`,
          borderRadius: 18, padding: '64px 32px', textAlign: 'center',
          cursor: 'pointer', transition: 'all .25s',
          background: dragging ? 'rgba(23,162,184,0.06)' : T.surface,
          boxShadow: dragging ? '0 0 40px rgba(23,162,184,0.15)' : 'none',
        }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: dragging ? 'rgba(23,162,184,0.15)' : T.surface2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: dragging ? T.teal : T.subtle,
          transition: 'all .25s',
        }}>
          <Upload size={26} />
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: T.text }}>
          {dragging ? 'Drop your PDFs here' : 'Drag PDF resumes here'}
        </p>
        <p style={{ fontSize: 13, color: T.subtle }}>or click to browse — multiple files supported</p>
        <input ref={inputRef} type="file" accept=".pdf" multiple hidden onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <Card>
          <SectionTitle>{files.length} file{files.length > 1 ? 's' : ''} ready to process</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
            {files.map(f => (
              <div key={f.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: T.surface2, borderRadius: 8, border: `1px solid ${T.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.text2, fontSize: 13 }}>
                  <FileText size={13} color={T.teal} /> {f.name}
                </div>
                <button onClick={e => { e.stopPropagation(); setFiles(p => p.filter(x => x.name !== f.name)); }}
                  style={{ background: 'none', color: T.red, padding: '2px 4px', display: 'flex' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.text2 }}>Processing {progress.done} / {progress.total}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.teal }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: T.border2, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: `linear-gradient(90deg, ${T.teal}, ${T.teal2})`,
                  transition: 'width .4s ease', boxShadow: '0 0 10px rgba(23,162,184,0.4)',
                }} />
              </div>
            </div>
          )}

          <Btn onClick={handleUpload} disabled={uploading || !selectedCompany} variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            {uploading
              ? <><Spinner size={14} /> Processing {progress.done} of {progress.total}…</>
              : <><Upload size={14} /> Process {files.length} Resume{files.length > 1 ? 's' : ''}</>}
          </Btn>
        </Card>
      )}

      {errors.length > 0 && (
        <Card style={{ border: `1px solid rgba(220,53,69,0.3)` }}>
          <SectionTitle>Upload Errors</SectionTitle>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 13, color: T.red, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
              <X size={13} /> {e.filename}: {e.error}
            </div>
          ))}
        </Card>
      )}

      {results.length > 0 && (
        <Card style={{ border: `1px solid rgba(40,167,69,0.25)` }}>
          <SectionTitle>{results.length} Resumes Processed</SectionTitle>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 12px', background: T.surface2, borderRadius: 8, marginBottom: 6, border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={13} color={T.green} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.name || r.filename}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge label={r.recommendation} />
                <span style={{ fontWeight: 800, color: T.teal, fontSize: 14 }}>{r.score}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ student: st, idx, activeCompany }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="fade-in" style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s',
      animationDelay: `${idx * 50}ms`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Card header */}
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Rank + avatar */}
        <div style={{ flexShrink: 0, textAlign: 'center', width: 36 }}>
          <RankBadge idx={idx} />
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: idx < 3 ? `linear-gradient(135deg, ${T.teal}, ${T.teal2})` : T.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: idx < 3 ? '#fff' : T.muted,
        }}>
          {(st.name || '?').charAt(0).toUpperCase()}
        </div>
        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.subtle, marginTop: 1 }}>{st.email || ''}</div>
        </div>
        {/* Score bar */}
        <div style={{ width: 140, flexShrink: 0 }}>
          <ScoreBar score={st.score} delay={idx * 50} />
        </div>
        {/* Badge */}
        <Badge label={st.recommendation} />
        {/* Expand toggle */}
        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'none', color: T.muted, padding: 6, display: 'flex', borderRadius: 6,
          transition: 'color .2s, background .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.surface2; e.currentTarget.style.color = T.text2; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.muted; }}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: '14px 18px', borderTop: `1px solid ${T.border}`,
          background: T.surface2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, color: T.subtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Academic</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: (st.cgpa || 0) >= 8 ? T.teal : (st.cgpa || 0) >= 6 ? T.text : T.muted }}>
              {st.cgpa ?? '—'}
            </div>
            <div style={{ fontSize: 11, color: T.subtle }}>CGPA</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.subtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>LeetCode</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <LCTag label="E" count={st.lc_easy}   color={T.green} />
              <LCTag label="M" count={st.lc_medium} color={T.gold} />
              <LCTag label="H" count={st.lc_hard}   color={T.red} />
            </div>
            {st.lc_ranking > 0 && <div style={{ fontSize: 11, color: T.subtle, marginTop: 4 }}>Rank #{st.lc_ranking?.toLocaleString()}</div>}
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.subtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>GitHub</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#a29bfe' }}>{st.gh_repos ?? 0} <span style={{ fontSize: 12, fontWeight: 400, color: T.subtle }}>repos</span></div>
            {st.gh_top_lang && <div style={{ fontSize: 12, color: T.teal, marginTop: 2 }}>{st.gh_top_lang}</div>}
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.subtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Skills <span style={{ color: T.teal }}>JD {st.jdMatch}%</span>
            </div>
            <SkillTags skills={st.skills} required={activeCompany?.required_skills} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Live Weight Panel ────────────────────────────────────────────────────────
function WeightPanel({ liveWeights, setLiveWeights }) {
  const [open, setOpen] = useState(false);
  const total = Object.values(liveWeights).reduce((a, b) => a + b, 0);
  const sliders = [
    { k: 'cgpa', label: 'CGPA', color: '#74b9ff' },
    { k: 'leetcode', label: 'LeetCode', color: T.gold },
    { k: 'github', label: 'GitHub', color: '#a29bfe' },
    { k: 'skills', label: 'Skills', color: T.teal },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', fontSize: 12,
        background: open ? T.tealSoft : T.surface2, color: open ? T.teal : T.text2,
        border: `1px solid ${open ? T.teal + '44' : T.border2}`, borderRadius: 8,
        transition: 'all var(--t)',
      }}>
        <Sliders size={13} />
        Weights <span style={{ fontWeight: 800, color: total === 100 ? T.green : T.red }}>={total}%</span>
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '.25s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', width: 240,
          background: T.surface, border: `1px solid ${T.border2}`,
          borderRadius: 12, padding: '16px 18px', zIndex: 200,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          {sliders.map(s => (
            <WeightSlider key={s.k} label={s.label} name={s.k} value={liveWeights[s.k]}
              onChange={(n, v) => setLiveWeights(p => ({ ...p, [n]: v }))} color={s.color} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Results Dashboard ────────────────────────────────────────────────────────
function ResultsDashboard({ companies, selectedCompany, students, liveWeights, refreshStudents, onSelectCompany }) {
  const [search, setSearch]         = useState('');
  const [filterBadge, setFilterBadge] = useState('All');
  const [sortBy, setSortBy]         = useState('score');
  const [filterCompany, setFilterCompany] = useState(selectedCompany?.id || '');
  const [aiOpen, setAiOpen]         = useState(false);

  useEffect(() => { setFilterCompany(selectedCompany?.id || ''); }, [selectedCompany]);

  const activeCompany = useMemo(
    () => companies.find(c => c.id === parseInt(filterCompany)) || selectedCompany,
    [companies, filterCompany, selectedCompany]
  );

  const scored = useMemo(() => {
    if (!students.length) return [];
    const req = activeCompany?.required_skills || '';
    const seen = new Set();
    const deduped = students.filter(s => { const key = s.file_hash || s.email || s.name; if (seen.has(key)) return false; seen.add(key); return true; });
    return deduped.map(s => { const { score, recommendation, jdMatch } = computeScore(s, liveWeights, req); return { ...s, score, recommendation, jdMatch }; });
  }, [students, liveWeights, activeCompany]);

  const filtered = useMemo(() => {
    let res = scored.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.skills || []).some(sk => sk.toLowerCase().includes(q));
      const matchBadge = filterBadge === 'All' || s.recommendation === filterBadge;
      return matchSearch && matchBadge;
    });
    if (sortBy === 'score') res = [...res].sort((a, b) => b.score - a.score);
    else if (sortBy === 'cgpa') res = [...res].sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
    else if (sortBy === 'leetcode') res = [...res].sort((a, b) => ((b.lc_easy||0)+(b.lc_medium||0)*2+(b.lc_hard||0)*3)-((a.lc_easy||0)+(a.lc_medium||0)*2+(a.lc_hard||0)*3));
    return res;
  }, [scored, search, filterBadge, sortBy]);

  const stats = useMemo(() => {
    const hr  = scored.filter(s => s.recommendation === 'Highly Recommended').length;
    const r   = scored.filter(s => s.recommendation === 'Recommended').length;
    const nr  = scored.filter(s => s.recommendation === 'Not Recommended').length;
    const avg = scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : 0;
    return { hr, r, nr, avg, total: scored.length };
  }, [scored]);

  const exportToExcel = () => {
    if (filtered.length === 0) { alert('No students to export.'); return; }
    const exportData = filtered.map((s, index) => ({
      Rank: index + 1, Name: s.name || '', Email: s.email || '', CGPA: s.cgpa || 0, Score: s.score || 0,
      'LeetCode Easy': s.lc_easy || 0, 'LeetCode Medium': s.lc_medium || 0, 'LeetCode Hard': s.lc_hard || 0,
      'GitHub Repos': s.gh_repos || 0, 'Top Language': s.gh_top_lang || '',
      'JD Match %': s.jdMatch || 0, Skills: Array.isArray(s.skills) ? s.skills.join(', ') : (s.skills || ''),
      Recommendation: s.recommendation || '',
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Shortlist');
    const name = (activeCompany?.name || 'company').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    window.XLSX.writeFile(wb, `shortlist_${name}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!activeCompany) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px', color: T.subtle }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: T.subtle }}>
          <BarChart3 size={28} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text2 }}>No company selected</p>
        <p style={{ fontSize: 14, color: T.subtle }}>Go to Setup tab and select or create a company.</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total',      value: stats.total, color: T.teal,  Icon: Users },
    { label: 'Highly Rec.', value: stats.hr,   color: T.green, Icon: CheckCircle2 },
    { label: 'Recommended', value: stats.r,    color: T.gold,  Icon: Star },
    { label: 'Avg Score',   value: stats.avg,  color: '#a29bfe', Icon: BarChart3 },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>Results</h2>
          <p style={{ color: T.muted, fontSize: 14 }}>Ranked candidates for <strong style={{ color: T.teal }}>{activeCompany.name}</strong></p>
        </div>
        <WeightPanel liveWeights={liveWeights} setLiveWeights={() => {}} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {statCards.map((st, i) => (
          <div key={st.label} className="fade-in" style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: '18px 20px', animationDelay: `${i * 60}ms`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: `${st.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color,
            }}>
              <st.Icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: st.color, lineHeight: 1 }}>{st.value}</div>
              <div style={{ fontSize: 11, color: T.subtle, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .8 }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {companies.length > 1 && (
          <select value={filterCompany}
            onChange={e => { setFilterCompany(e.target.value); const c = companies.find(x => x.id === parseInt(e.target.value)); if (c) onSelectCompany(c); }}
            style={{ maxWidth: 220 }}>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: 200 }}>
          <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }}>
            <Search size={13} />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, skill…" style={{ paddingLeft: 32 }} />
        </div>
        {['All', 'Highly Recommended', 'Recommended', 'Not Recommended'].map(b => {
          const active = filterBadge === b;
          const colors = { 'Highly Recommended': T.green, 'Recommended': T.gold, 'Not Recommended': T.red };
          const col = colors[b] || T.teal;
          return (
            <button key={b} onClick={() => setFilterBadge(b)} style={{
              padding: '7px 14px', fontSize: 12, borderRadius: 8,
              background: active ? (b === 'All' ? T.tealSoft : `${col}18`) : T.surface2,
              color: active ? (b === 'All' ? T.teal : col) : T.muted,
              border: `1px solid ${active ? (b === 'All' ? T.teal : col) + '55' : T.border2}`,
              transition: 'all var(--t)',
            }}>
              {b === 'All' ? 'All' : b === 'Highly Recommended' ? 'Highly Rec.' : b}
            </button>
          );
        })}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="score">Sort: Score</option>
          <option value="cgpa">Sort: CGPA</option>
          <option value="leetcode">Sort: LeetCode</option>
        </select>
        <button onClick={() => refreshStudents(activeCompany)} style={{ padding: '8px 13px', background: T.surface2, color: T.text2, border: `1px solid ${T.border2}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <Btn onClick={exportToExcel} variant="primary" style={{ fontSize: 13 }}>
          <Download size={13} /> Export
        </Btn>
      </div>

      {/* ── Company-wise Student Cards ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 56, color: T.subtle, background: T.surface, borderRadius: 14, border: `1px solid ${T.border}` }}>
          No students match your filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((st, idx) => (
            <StudentCard key={st.id || idx} student={st} idx={idx} activeCompany={activeCompany} />
          ))}
        </div>
      )}

      {/* ── AI Analyzer (collapsible, at bottom) ── */}
      <div style={{
        marginTop: 8, borderRadius: 14, border: `1px solid ${T.border}`,
        background: T.surface, overflow: 'hidden',
      }}>
        <button onClick={() => setAiOpen(o => !o)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'none', color: T.text2, borderRadius: 0,
          borderBottom: aiOpen ? `1px solid ${T.border}` : 'none',
          transition: 'color var(--t)',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = T.text; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.text2; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: T.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
              <Brain size={14} />
            </div>
            AI Analyzer
            <span style={{ fontSize: 11, color: T.subtle, fontWeight: 400 }}>— click to expand</span>
          </div>
          <ChevronDown size={16} style={{ transform: aiOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
        </button>
        {aiOpen && (
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 14, color: T.subtle, textAlign: 'center', padding: '24px 0' }}>
              AI analysis results will appear here after processing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]                 = useState('home'); // 'home' | 'app'
  const [activeTab, setActiveTab]       = useState('setup');
  const [companies, setCompanies]       = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [students, setStudents]         = useState([]);
  const [liveWeights, setLiveWeights]   = useState(DEFAULT_WEIGHTS);

  const fetchCompanies = useCallback(async () => {
    try { const res = await fetch(`${API}/company`); const data = await res.json(); setCompanies(data); }
    catch (e) { console.error('fetchCompanies', e); }
  }, []);

  const fetchStudents = useCallback(async (company) => {
    const target = company || selectedCompany;
    if (!target) return;
    try { const res = await fetch(`${API}/students/${target.id}`); const data = await res.json(); setStudents(data); }
    catch (e) { console.error('fetchStudents', e); }
  }, [selectedCompany]);

  useEffect(() => { fetchCompanies(); }, []);

  const handleSelectCompany = (c) => { setSelectedCompany(c); if (c) fetchStudents(c); };
  const handleUploadComplete = () => { fetchStudents(); setActiveTab('results'); };
  const handleStart = () => { setPage('app'); fetchCompanies(); };

  if (page === 'home') return <HomePage onStart={handleStart} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onHome={() => setPage('home')}
        selectedCompany={selectedCompany}
      />

      <main style={{ padding: '32px 28px', maxWidth: 1340, width: '100%', margin: '0 auto', flex: 1 }}>
        {activeTab === 'setup' && (
          <CompanySetup
            companies={companies}
            onCompanyCreated={fetchCompanies}
            onSelectCompany={handleSelectCompany}
            selectedCompany={selectedCompany}
          />
        )}
        {activeTab === 'upload' && (
          <UploadSection
            selectedCompany={selectedCompany}
            onUploadComplete={handleUploadComplete}
            companies={companies}
            onSelectCompany={handleSelectCompany}
          />
        )}
        {activeTab === 'results' && (
          <ResultsDashboard
            companies={companies}
            selectedCompany={selectedCompany}
            students={students}
            liveWeights={liveWeights}
            refreshStudents={fetchStudents}
            onSelectCompany={handleSelectCompany}
          />
        )}
      </main>

      <footer style={{
        borderTop: `1px solid ${T.border}`, padding: '14px 28px',
        fontSize: 12, color: T.subtle, textAlign: 'center', background: T.surface,
      }}>
        ResumeIQ · AI-powered college placement screener · Flask + Groq + LeetCode + GitHub
      </footer>
    </div>
  );
}
