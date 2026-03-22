'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';


// Inline SVG icons — no lucide-react needed
const UploadCloud = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);
const Loader = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
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
    const load = async () => {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
           const json = await res.json();
           setCompanies(json.companies || []);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      }
    };
    load();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setComplete(false);
    setErrorMsg('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // strip "data:application/pdf;base64,"
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    if (!selectedCompanyId) {
      setErrorMsg('Please select a company first');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-cloudinary', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
    } catch (err: any) {
      setErrorMsg('Failed to upload PDFs. Check logs.');
      setUploading(false);
      return;
    }

    setUploading(false);
    setProcessing(true);
    setProgress({ processed: 0, total: uploadedUrls.length, percent: 0 });

    try {
      // Convert all files to base64 for direct processing (bypasses Cloudinary 401)
      const base64Files: string[] = [];
      for (const file of files) {
        const b64 = await fileToBase64(file);
        base64Files.push(b64);
      }

      const res = await fetch('/api/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeUrls: uploadedUrls,
          base64Pdfs: base64Files,   // ← send base64 directly
          companyId: selectedCompanyId
        })
      });

      if (!res.body) throw new Error('No readable stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value, { stream: true });
        const events = chunkStr.split('\n\n');
        for (const e of events) {
          if (e.startsWith('data: ')) {
            try {
              const jsonObj = JSON.parse(e.replace('data: ', ''));
              if (jsonObj.type === 'progress') setProgress({ processed: jsonObj.processed, total: jsonObj.total, percent: jsonObj.percent });
              else if (jsonObj.type === 'complete') { setProcessing(false); setComplete(true); }
              else if (jsonObj.type === 'error') setErrorMsg(jsonObj.message);
            } catch { }
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setProcessing(false);
    }
  };

  const isBusy = uploading || processing;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload Resumes</h1>
        <p className="text-slate-600 mt-2">Drag and drop student PDF resumes to parse, score, and rank automatically.</p>
      </div>

      <div className="space-y-6">
        {/* Company Selector */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <label className="font-semibold text-slate-700 whitespace-nowrap">Select Company</label>
          <select
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none"
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            disabled={isBusy}
          >
            <option value="">-- Select a Company/Role --</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'
            } ${isBusy ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className={`mx-auto mb-4 flex justify-center ${isDragActive ? 'text-blue-500' : 'text-slate-400'}`}>
            <UploadCloud />
          </div>
          <p className="text-xl font-medium text-slate-700">
            {isDragActive ? "Drop the PDFs here..." : "Drag 'n' drop some PDFs here, or click to select files"}
          </p>
          <p className="text-sm text-slate-500 mt-2">Only .pdf files will be accepted</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle /> {errorMsg}
          </div>
        )}

        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 text-slate-800 font-semibold">
                <FileIcon />
                <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
              </div>
              {!isBusy && !complete && (
                <button onClick={handleProcess} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition">
                  Start Processing
                </button>
              )}
            </div>

            {uploading && (
              <div className="py-8 flex flex-col items-center text-slate-600">
                <div className="text-blue-600 mb-4"><Loader /></div>
                <p className="font-medium">Uploading PDFs...</p>
              </div>
            )}

            {processing && (
              <div className="py-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-blue-800">Processing {progress.processed} of {progress.total}...</span>
                  <span className="text-sm font-bold text-blue-600">{progress.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3.5">
                  <div className="bg-blue-600 h-3.5 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}

            {complete && (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <CheckCircle />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Processing Complete!</h3>
                <p className="text-slate-600 mb-6">All candidates have been parsed, scored, and ranked.</p>
                <Link href="/dashboard" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition">
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