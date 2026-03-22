import { useState, useCallback, useRef, useMemo } from 'react';

// ─── constants ──────────────────────────────────────────────────────────────
const API = 'http://localhost:5000';

const BADGE = {
  'Highly Recommended': { bg: '#0f3d20', color: '#3fb950', label: '★ Highly Recommended' },
  'Recommended':        { bg: '#3b2e0a', color: '#e3b341', label: '✓ Recommended' },
  'Not Recommended':    { bg: '#3d0f0f', color: '#f85149', label: '✗ Not Recommended' },
};

const DEFAULT_WEIGHTS = { cgpa: 20, leetcode: 30, github: 20, skills: 30 };

// ─── scoring (mirrors backend scorer.py logic for live recalculation) ────────
function computeScore(s, weights, requiredSkills) {
  const w = weights;
  const cgpa     = Math.min(Math.max(parseFloat(s.cgpa) || 0, 0), 10);
  const cgpaScore = (cgpa / 10) * w.cgpa;

  const easy   = s.lc_easy   || 0;
  const medium = s.lc_medium || 0;
  const hard   = s.lc_hard   || 0;
  const lcW    = easy * 1 + medium * 2 + hard * 3;
  const lcScore = Math.min(lcW / 200, 1) * w.leetcode;

  const repos   = s.gh_repos   || 0;
  const stars   = s.gh_stars   || 0;
  const commits = s.gh_commits || 0;
  const ghScore = ((Math.min(repos / 20, 1) + Math.min(stars / 50, 1) + Math.min(commits / 50, 1)) / 3) * w.github;

  let skillScore = w.skills;
  let jdMatch = 100;
  const req = (requiredSkills || '')
    .split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
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

// ─────────────────────────────── helpers ────────────────────────────────────
const s = (styles) => styles; // identity — just for readability with inline objects

// ─── sub-components ─────────────────────────────────────────────────────────

function WeightSlider({ label, name, value, onChange, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#8b949e' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(name, parseInt(e.target.value))}
        style={{
          width: '100%', accentColor: color, height: 4,
          cursor: 'pointer', background: 'transparent',
        }}
      />
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score >= 75 ? '#3fb950' : score >= 50 ? '#e3b341' : '#f85149';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, background: '#21262d', borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          width: `${score}%`, height: '100%', background: color,
          borderRadius: 99, transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, width: 36, color }}>{score}</span>
    </div>
  );
}

function Badge({ label }) {
  const style = BADGE[label] || BADGE['Not Recommended'];
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  );
}

function SkillTags({ skills, required }) {
  const req = (required || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const list = (skills || []).slice(0, 6);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {list.map(skill => {
        const hit = req.length && req.some(r => skill.toLowerCase().includes(r) || r.includes(skill.toLowerCase()));
        return (
          <span key={skill} style={{
            padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 500,
            background: hit ? '#0f3d20' : '#21262d',
            color: hit ? '#3fb950' : '#8b949e',
            border: `1px solid ${hit ? '#2ea04340' : '#30363d'}`,
          }}>{skill}</span>
        );
      })}
      {(skills || []).length > 6 && (
        <span style={{ fontSize: 11, color: '#8b949e', alignSelf: 'center' }}>+{skills.length - 6}</span>
      )}
    </div>
  );
}

// ─── Section: Company Setup ──────────────────────────────────────────────────
function CompanySetup({ companies, onCompanyCreated, onSelectCompany, selectedCompany }) {
  const [jdText, setJdText] = useState('');
  const [analyzingJD, setAnalyzingJD] = useState(false);
  const [form, setForm] = useState({
    name: '', min_cgpa: '', required_skills: '',
  });
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleWeight = (name, val) => {
    setWeights(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Company name is required' }); return; }
    if (total !== 100) { setMsg({ type: 'error', text: `Weights must sum to 100 (currently ${total})` }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          min_cgpa: parseFloat(form.min_cgpa) || 0,
          weight_cgpa: weights.cgpa,
          weight_leetcode: weights.leetcode,
          weight_github: weights.github,
          weight_skills: weights.skills,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMsg({ type: 'success', text: `Company created (ID: ${data.id})` });
      setForm({ name: '', min_cgpa: '', required_skills: '' });
      setWeights(DEFAULT_WEIGHTS);
      onCompanyCreated();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) { setMsg({ type: 'error', text: 'Please paste a job description first.' }); return; }
    setAnalyzingJD(true); setMsg(null);
    try {
      const res = await fetch(`${API}/analyze-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'JD analysis failed');
      
      const allSkills = [...(data.required_skills || []), ...(data.preferred_skills || [])].filter(Boolean);
      setForm(f => ({ ...f, required_skills: allSkills.join(', ') }));
      if (data.suggested_weights) {
        setWeights(prev => ({ ...prev, ...data.suggested_weights }));
      }
      setMsg({ type: 'success', text: 'Successfully analyzed JD and auto-filled skills & weights!' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setAnalyzingJD(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top: JD Analysis */}
      <Card title="✨ Auto-fill with AI Job Description Analysis">
        <textarea
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          style={{ width: '100%', height: 100, marginBottom: 14, resize: 'vertical' }}
        />
        <button
          onClick={handleAnalyzeJD} disabled={analyzingJD}
          style={{
            padding: '9px 18px', fontSize: 13,
            background: '#a371f7', color: '#fff',
            opacity: analyzingJD ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          {analyzingJD ? '⏳ Analyzing...' : '✨ Analyze JD & Auto-fill'}
        </button>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: form */}
      <Card title="Company Profile">
        <Label>Company Name</Label>
        <input
          value={form.name} placeholder="e.g. Google, TCS, Infosys"
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ width: '100%', marginBottom: 14 }}
        />
        <Label>Minimum CGPA</Label>
        <input
          type="number" min="0" max="10" step="0.1"
          value={form.min_cgpa} placeholder="e.g. 7.5"
          onChange={e => setForm(f => ({ ...f, min_cgpa: e.target.value }))}
          style={{ width: '100%', marginBottom: 14 }}
        />
        <Label>Required Skills <span style={{ color: '#8b949e', fontWeight: 400 }}>(comma-separated)</span></Label>
        <input
          value={form.required_skills} placeholder="Python, React, SQL, AWS"
          onChange={e => setForm(f => ({ ...f, required_skills: e.target.value }))}
          style={{ width: '100%', marginBottom: 18 }}
        />
        {msg && (
          <div style={{
            marginBottom: 14, padding: '9px 13px', borderRadius: 8, fontSize: 13,
            background: msg.type === 'error' ? '#3d0f0f' : '#0f3d20',
            color: msg.type === 'error' ? '#f85149' : '#3fb950',
          }}>{msg.text}</div>
        )}
        <button
          onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '11px', fontSize: 14,
            background: '#238636', color: '#fff',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : '＋ Save Company'}
        </button>
      </Card>

      {/* Right: weights */}
      <Card title={`Score Weights  ${total !== 100 ? `⚠ Total: ${total}%` : `✓ Total: 100%`}`}
            headerColor={total !== 100 ? '#e3b341' : '#3fb950'}>
        <WeightSlider label="CGPA"     name="cgpa"     value={weights.cgpa}     onChange={handleWeight} color="#58a6ff" />
        <WeightSlider label="LeetCode" name="leetcode" value={weights.leetcode} onChange={handleWeight} color="#e3b341" />
        <WeightSlider label="GitHub"   name="github"   value={weights.github}   onChange={handleWeight} color="#a371f7" />
        <WeightSlider label="Skills"   name="skills"   value={weights.skills}   onChange={handleWeight} color="#3fb950" />

        {/* Company selector */}
        {companies.length > 0 && (
          <>
            <div style={{ height: 1, background: '#30363d', margin: '18px 0' }} />
            <Label>Active Company for Upload / Results</Label>
            <select
              value={selectedCompany?.id || ''}
              onChange={e => {
                const c = companies.find(x => x.id === parseInt(e.target.value));
                onSelectCompany(c || null);
              }}
              style={{ width: '100%', padding: '9px 13px' }}
            >
              <option value="">— select company —</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </>
        )}
      </Card>
    </div>
    </div>
  );
}

// ─── Section: Upload ─────────────────────────────────────────────────────────
function UploadSection({ selectedCompany, onUploadComplete, liveWeights }) {
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
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...pdfs.filter(f => !existing.has(f.name))];
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleUpload = async () => {
    if (!selectedCompany) { alert('Please select a company first.'); return; }
    if (!files.length) { alert('No files selected.'); return; }
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    setResults([]); setErrors([]);

    const newResults = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ done: i, total: files.length });
      const fd = new FormData();
      fd.append('company_id', selectedCompany.id);
      fd.append('file', file);
      try {
        const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        newResults.push(data);
      } catch (e) {
        setErrors(prev => [...prev, { filename: file.name, error: e.message }]);
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setResults(newResults);
    setUploading(false);
    setFiles([]);
    onUploadComplete();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!selectedCompany && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, background: '#3b2e0a',
          color: '#e3b341', fontSize: 13,
        }}>
          ⚠ Select a company above before uploading resumes.
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#58a6ff' : '#30363d'}`,
          borderRadius: 12, padding: '48px 32px', textAlign: 'center',
          cursor: 'pointer', transition: 'all .2s',
          background: dragging ? '#161b22ee' : '#161b22',
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 10 }}>📄</div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop PDF resumes here</p>
        <p style={{ fontSize: 13, color: '#8b949e' }}>or click to browse files</p>
        <input ref={inputRef} type="file" accept=".pdf" multiple hidden
               onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <Card title={`${files.length} file${files.length > 1 ? 's' : ''} selected`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
            {files.map(f => (
              <div key={f.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', background: '#21262d', borderRadius: 7,
              }}>
                <span style={{ fontSize: 13 }}>📄 {f.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); removeFile(f.name); }}
                  style={{ background: 'none', color: '#f85149', fontSize: 16, padding: '0 4px' }}
                >×</button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload} disabled={uploading || !selectedCompany}
            style={{
              marginTop: 14, width: '100%', padding: 11, fontSize: 14,
              background: '#1f6feb', color: '#fff',
              opacity: (uploading || !selectedCompany) ? 0.6 : 1,
            }}
          >
            {uploading
              ? `⏳ Processing ${progress.done} of ${progress.total}…`
              : `🚀 Process ${files.length} Resume${files.length > 1 ? 's' : ''}`}
          </button>
          {uploading && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 4, background: '#21262d', borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99, background: '#1f6feb',
                  width: `${(progress.done / progress.total) * 100}%`,
                  transition: 'width .3s ease',
                }} />
              </div>
              <p style={{ fontSize: 12, color: '#8b949e', marginTop: 6 }}>
                Processing {progress.done} / {progress.total}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card title="Upload Errors">
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 13, color: '#f85149', marginBottom: 4 }}>
              ✗ {e.filename}: {e.error}
            </div>
          ))}
        </Card>
      )}

      {/* Quick results preview */}
      {results.length > 0 && (
        <Card title={`✓ ${results.length} Resumes Processed`}>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', background: '#21262d', borderRadius: 7, marginBottom: 6,
            }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name || r.filename}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge label={r.recommendation} />
                <span style={{ fontWeight: 700, color: '#58a6ff' }}>{r.score}/100</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── Section: Results ────────────────────────────────────────────────────────
function ResultsDashboard({ selectedCompany, students, liveWeights, refreshStudents }) {
  const [search, setSearch]   = useState('');
  const [filterBadge, setFilterBadge] = useState('All');

  // Recalculate scores live with current weights
  const scored = useMemo(() => {
    if (!students.length) return [];
    const req = selectedCompany?.required_skills || '';
    return students
      .map(s => {
        const { score, recommendation, jdMatch } = computeScore(s, liveWeights, req);
        return { ...s, score, recommendation, jdMatch };
      })
      .sort((a, b) => b.score - a.score);
  }, [students, liveWeights, selectedCompany]);

  const filtered = useMemo(() => {
    return scored.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.skills || []).some(sk => sk.toLowerCase().includes(q));
      const matchBadge = filterBadge === 'All' || s.recommendation === filterBadge;
      return matchSearch && matchBadge;
    });
  }, [scored, search, filterBadge]);

  const stats = useMemo(() => {
    const hr = scored.filter(s => s.recommendation === 'Highly Recommended').length;
    const r  = scored.filter(s => s.recommendation === 'Recommended').length;
    const nr = scored.filter(s => s.recommendation === 'Not Recommended').length;
    const avg = scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : 0;
    return { hr, r, nr, avg, total: scored.length };
  }, [scored]);

  if (!selectedCompany) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#8b949e' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <p>Select a company to view results</p>
      </div>
    );
  }

  const exportToExcel = () => {
    if (filtered.length === 0) {
      alert("No students to export.");
      return;
    }
    
    // Map the scored students to the exact columns requested
    const exportData = filtered.map((s, index) => ({
      Rank: index + 1,
      Name: s.name || '',
      Email: s.email || '',
      CGPA: s.cgpa || 0,
      Score: s.score || 0,
      'LeetCode Easy': s.lc_easy || 0,
      'LeetCode Medium': s.lc_medium || 0,
      'LeetCode Hard': s.lc_hard || 0,
      'LeetCode Total': s.lc_total || 0,
      'GitHub Repos': s.gh_repos || 0,
      'Top Language': s.gh_top_lang || '',
      'JD Match %': s.jdMatch || 0,
      Skills: Array.isArray(s.skills) ? s.skills.join(', ') : (s.skills || ''),
      Recommendation: s.recommendation || ''
    }));

    // Generate Excel sheet and trigger download
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Shortlist");
    
    // Format filename safely
    const companySafeName = (selectedCompany.name || 'company').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `shortlist_${companySafeName}_${dateStr}.xlsx`;
    
    window.XLSX.writeFile(wb, filename);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Students', value: stats.total,  color: '#58a6ff' },
          { label: 'Highly Rec.',    value: stats.hr,     color: '#3fb950' },
          { label: 'Recommended',   value: stats.r,      color: '#e3b341' },
          { label: 'Avg Score',     value: `${stats.avg}`, color: '#a371f7' },
        ].map(st => (
          <div key={st.label} style={{
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: 10, padding: '16px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: st.color }}>{st.value}</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search} placeholder="🔍  Search by name, email, skill…"
          onChange={e => setSearch(e.target.value)}
          style={{ flexGrow: 1, minWidth: 200 }}
        />
        {['All', 'Highly Recommended', 'Recommended', 'Not Recommended'].map(b => (
          <button
            key={b} onClick={() => setFilterBadge(b)}
            style={{
              padding: '7px 14px', fontSize: 12,
              background: filterBadge === b ? '#1f6feb' : '#21262d',
              color: filterBadge === b ? '#fff' : '#8b949e',
            }}
          >{b}</button>
        ))}
        <button
          onClick={refreshStudents}
          style={{ padding: '7px 14px', fontSize: 12, background: '#21262d', color: '#8b949e' }}
        >⟳ Refresh</button>
        
        <div style={{ flexGrow: 1 }} /> {/* Spacer */}
        
        <button
          onClick={exportToExcel}
          style={{ 
            padding: '7px 14px', 
            fontSize: 12, 
            background: '#238636', 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>📊</span> Export to Excel
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8b949e' }}>
          No students match your filter.
        </div>
      ) : (
        <div style={{ overflow: 'auto', borderRadius: 10, border: '1px solid #30363d' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
                {['#', 'Student', 'Score', 'CGPA', 'LeetCode', 'GitHub', 'JD Match & Skills', 'Badge'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#8b949e', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((st, idx) => (
                <tr key={st.id || idx} style={{
                  borderBottom: '1px solid #21262d',
                  transition: 'background .15s',
                }} onMouseEnter={e => e.currentTarget.style.background = '#161b22'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Td>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: idx === 0 ? '#e3b341' : idx === 1 ? '#8b949e' : idx === 2 ? '#cd7f32' : '#8b949e',
                    }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{st.name || '—'}</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>{st.email || ''}</div>
                  </Td>
                  <Td style={{ minWidth: 130 }}>
                    <ScoreBar score={st.score} />
                  </Td>
                  <Td>
                    <span style={{ fontWeight: 600 }}>{st.cgpa ?? '—'}</span>
                  </Td>
                  <Td style={{ minWidth: 130 }}>
                    <div style={{ fontSize: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <LCTag label="E" count={st.lc_easy}   color="#3fb950" />
                      <LCTag label="M" count={st.lc_medium} color="#e3b341" />
                      <LCTag label="H" count={st.lc_hard}   color="#f85149" />
                    </div>
                    {st.lc_ranking > 0 && (
                      <div style={{ fontSize: 11, color: '#8b949e', marginTop: 3 }}>
                        Rank #{st.lc_ranking?.toLocaleString()}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: '#a371f7', fontWeight: 600 }}>{st.gh_repos}</span>
                      <span style={{ color: '#8b949e' }}> repos</span>
                    </div>
                    {st.gh_top_lang && (
                      <div style={{ fontSize: 11, color: '#8b949e' }}>{st.gh_top_lang}</div>
                    )}
                    {st.gh_stars > 0 && (
                      <div style={{ fontSize: 11, color: '#e3b341' }}>⭐ {st.gh_stars}</div>
                    )}
                  </Td>
                  <Td style={{ minWidth: 180 }}>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ 
                        fontSize: 11, fontWeight: 700, 
                        background: st.jdMatch >= 80 ? '#0f3d20' : st.jdMatch >= 50 ? '#3b2e0a' : '#3d0f0f',
                        color: st.jdMatch >= 80 ? '#3fb950' : st.jdMatch >= 50 ? '#e3b341' : '#f85149',
                        padding: '2px 6px', borderRadius: 4
                      }}>
                        JD Match: {st.jdMatch}%
                      </span>
                    </div>
                    <SkillTags skills={st.skills} required={selectedCompany?.required_skills} />
                  </Td>
                  <Td>
                    <Badge label={st.recommendation} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// tiny helper components
function Td({ children, style = {} }) {
  return (
    <td style={{ padding: '11px 14px', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  );
}

function LCTag({ label, count, color }) {
  return (
    <span style={{
      background: `${color}22`, color, padding: '1px 6px',
      borderRadius: 4, fontWeight: 600, fontSize: 11,
    }}>{label}:{count ?? 0}</span>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
      {children}
    </div>
  );
}

function Card({ title, children, headerColor }) {
  return (
    <div style={{
      background: '#161b22', border: '1px solid #30363d',
      borderRadius: 10, padding: '18px 20px',
    }}>
      {title && (
        <div style={{
          fontSize: 13, fontWeight: 700, color: headerColor || '#e6edf3',
          marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #30363d',
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

// ─── section tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'setup',    label: '🏢  Company Setup' },
  { id: 'upload',   label: '📤  Upload Resumes' },
  { id: 'results',  label: '🏆  Results' },
];

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]         = useState('setup');
  const [companies, setCompanies]         = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [students, setStudents]           = useState([]);
  const [liveWeights, setLiveWeights]     = useState(DEFAULT_WEIGHTS);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(`${API}/company`);
      const data = await res.json();
      setCompanies(data);
    } catch (e) { console.error('fetchCompanies', e); }
  }, []);

  const fetchStudents = useCallback(async (company) => {
    const target = company || selectedCompany;
    if (!target) return;
    try {
      const res = await fetch(`${API}/students/${target.id}`);
      const data = await res.json();
      setStudents(data);
    } catch (e) { console.error('fetchStudents', e); }
  }, [selectedCompany]);

  // Load companies once on mount
  useState(() => { fetchCompanies(); }, []);

  const handleSelectCompany = (c) => {
    setSelectedCompany(c);
    if (c) fetchStudents(c);
  };

  const handleUploadComplete = () => {
    fetchStudents();
    setActiveTab('results');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: '#161b22', borderBottom: '1px solid #30363d',
        padding: '0 28px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 58,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -.3 }}>
            Resume<span style={{ color: '#58a6ff' }}>IQ</span>
          </span>
          {selectedCompany && (
            <span style={{
              background: '#21262d', color: '#8b949e',
              padding: '3px 10px', borderRadius: 99, fontSize: 12,
            }}>
              {selectedCompany.name}
            </span>
          )}
        </div>
        {/* Live weight editor in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
            { k: 'cgpa', label: 'CGPA', color: '#58a6ff' },
            { k: 'leetcode', label: 'LC', color: '#e3b341' },
            { k: 'github', label: 'GH', color: '#a371f7' },
            { k: 'skills', label: 'Skills', color: '#3fb950' },
          ].map(({ k, label, color }) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: '#8b949e' }}>{label}</span>
              <input
                type="number" min={0} max={100} value={liveWeights[k]}
                onChange={e => setLiveWeights(prev => ({ ...prev, [k]: parseInt(e.target.value) || 0 }))}
                style={{
                  width: 46, padding: '3px 6px', fontSize: 12, textAlign: 'center',
                  background: '#21262d', border: `1px solid ${color}44`,
                  color, fontWeight: 700,
                }}
              />
            </div>
          ))}
          <span style={{
            fontSize: 11, fontWeight: 700, minWidth: 60,
            color: Object.values(liveWeights).reduce((a, b) => a + b, 0) === 100 ? '#3fb950' : '#f85149',
          }}>
            = {Object.values(liveWeights).reduce((a, b) => a + b, 0)}%
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0,
        background: '#161b22', borderBottom: '1px solid #30363d',
        padding: '0 28px',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px', fontSize: 13, fontWeight: 600,
              background: 'none', color: activeTab === tab.id ? '#58a6ff' : '#8b949e',
              borderBottom: activeTab === tab.id ? '2px solid #58a6ff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <main style={{ padding: '24px 28px', maxWidth: 1300, width: '100%', margin: '0 auto', flex: 1 }}>
        {activeTab === 'setup' && (
          <CompanySetup
            companies={companies}
            onCompanyCreated={() => { fetchCompanies(); }}
            onSelectCompany={handleSelectCompany}
            selectedCompany={selectedCompany}
          />
        )}
        {activeTab === 'upload' && (
          <UploadSection
            selectedCompany={selectedCompany}
            onUploadComplete={handleUploadComplete}
            liveWeights={liveWeights}
          />
        )}
        {activeTab === 'results' && (
          <ResultsDashboard
            selectedCompany={selectedCompany}
            students={students}
            liveWeights={liveWeights}
            refreshStudents={fetchStudents}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #30363d', padding: '14px 28px',
        fontSize: 12, color: '#8b949e', textAlign: 'center',
        background: '#161b22',
      }}>
        ResumeIQ · AI-powered college placement screener · Flask + Groq + LeetCode + GitHub
      </footer>
    </div>
  );
}
