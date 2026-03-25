'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';

const UploadCloud = ({ active }: { active: boolean }) => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={active ? '#7B2FFF' : '#3d3660'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const FileIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const CheckIcon = () => (
  <svg width="32" height="32" fill="none" stroke="#06d6a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#ff6b81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12" y2="16.01" />
  </svg>
);

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, percent: 0 });
  const [complete, setComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/companies').then(r => r.ok ? r.json() : null)
      .then(j => j && setCompanies(j.companies || []))
      .catch(console.error);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setComplete(false); setErrorMsg('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] },
  });

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleProcess = async () => {
    if (!files.length) return;
    if (!selectedCompanyId) { setErrorMsg('Please select a company first'); return; }
    setUploading(true); setErrorMsg('');
    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData(); formData.append('file', file);
        const res = await fetch('/api/upload-cloudinary', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json(); uploadedUrls.push(data.url);
      }
    } catch { setErrorMsg('Failed to upload PDFs.'); setUploading(false); return; }
    setUploading(false); setProcessing(true);
    setProgress({ processed: 0, total: uploadedUrls.length, percent: 0 });
    try {
      const base64Files = await Promise.all(files.map(fileToBase64));
      const res = await fetch('/api/process-batch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrls: uploadedUrls, base64Pdfs: base64Files, companyId: selectedCompanyId }),
      });
      if (!res.body) throw new Error('No readable stream');
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        const events = decoder.decode(value, { stream: true }).split('\n\n');
        for (const e of events) {
          if (e.startsWith('data: ')) {
            try {
              const j = JSON.parse(e.replace('data: ', ''));
              if (j.type === 'progress') setProgress({ processed: j.processed, total: j.total, percent: j.percent });
              else if (j.type === 'complete') { setProcessing(false); setComplete(true); }
              else if (j.type === 'error') setErrorMsg(j.message);
            } catch { /**/ }
          }
        }
      }
    } catch (err: any) { setErrorMsg(err.message); setProcessing(false); }
  };

  const isBusy = uploading || processing;

  const card: React.CSSProperties = {
    borderRadius: 18, border: '1px solid rgba(123,47,255,0.18)',
    background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e8e6ff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Upload Resumes</h1>
        <p style={{ color: '#5c5585', marginTop: 8, fontSize: 14 }}>Drag and drop student PDF resumes to parse, score, and rank automatically.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Company Selector */}
        <div style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="20" height="20" fill="none" stroke="#7B2FFF" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#9b92c8', whiteSpace: 'nowrap' }}>Target Company</label>
          <select
            value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)}
            disabled={isBusy}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 14,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)',
              color: selectedCompanyId ? '#e8e6ff' : '#3d3660', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: '#0c0c18' }}>-- Select a Company / Role --</option>
            {companies.map(c => <option key={c.id} value={c.id} style={{ background: '#0c0c18' }}>{c.name}</option>)}
          </select>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            borderRadius: 20, padding: '60px 40px', textAlign: 'center', cursor: isBusy ? 'not-allowed' : 'pointer',
            border: `2px dashed ${isDragActive ? '#7B2FFF' : 'rgba(123,47,255,0.25)'}`,
            background: isDragActive ? 'rgba(123,47,255,0.08)' : 'rgba(255,255,255,0.015)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.25s ease',
            opacity: isBusy ? 0.5 : 1,
            animation: isDragActive ? 'borderFlow 1.5s linear infinite' : 'none',
          }}
        >
          <input {...getInputProps()} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <UploadCloud active={isDragActive} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: isDragActive ? '#c4b5fd' : '#9b92c8', marginBottom: 8 }}>
            {isDragActive ? 'Drop the PDFs here...' : "Drag & drop PDF resumes, or click to browse"}
          </p>
          <p style={{ fontSize: 13, color: '#3d3660' }}>Only .pdf files will be accepted</p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,35,60,0.08)', border: '1px solid rgba(239,35,60,0.25)',
            color: '#ff8096', fontSize: 13,
          }}>
            <AlertIcon /> {errorMsg}
          </div>
        )}

        {/* File list + actions */}
        {files.length > 0 && (
          <div style={card}>
            <div style={{
              padding: '16px 24px',
              borderBottom: (uploading || processing || complete) ? '1px solid rgba(123,47,255,0.1)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9b92c8', fontWeight: 600, fontSize: 14 }}>
                <FileIcon />
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </div>
              {!isBusy && !complete && (
                <button onClick={handleProcess} style={{
                  padding: '9px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(123,47,255,0.35)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(123,47,255,0.55)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(123,47,255,0.35)'; }}
                >
                  Start Processing
                </button>
              )}
            </div>

            {uploading && (
              <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: '#9b92c8' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(123,47,255,0.2)', borderTopColor: '#7B2FFF', animation: 'spin 0.9s linear infinite' }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>Uploading PDFs to cloud...</p>
              </div>
            )}

            {processing && (
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#9b92c8' }}>Processing {progress.processed} of {progress.total}...</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#7B2FFF' }}>{progress.percent}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 100, background: 'rgba(123,47,255,0.1)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 100,
                    background: 'linear-gradient(90deg, #3A0CA3, #7B2FFF, #4cc9f0)',
                    backgroundSize: '200% 100%',
                    width: `${progress.percent}%`,
                    transition: 'width 0.4s ease',
                    animation: 'shimmer 2s linear infinite',
                  }} />
                </div>
              </div>
            )}

            {complete && (
              <div style={{ padding: '48px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(6,214,160,0.1)', border: '2px solid rgba(6,214,160,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckIcon />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#e8e6ff', fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>Processing Complete</h3>
                <p style={{ color: '#5c5585', fontSize: 14 }}>All candidates have been parsed, scored, and ranked.</p>
                <Link href="/dashboard" style={{
                  marginTop: 8, padding: '12px 32px', borderRadius: 50, textDecoration: 'none',
                  background: 'linear-gradient(135deg, #3A0CA3, #7B2FFF)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(123,47,255,0.35)',
                }}>
                  View Ranked Dashboard
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}