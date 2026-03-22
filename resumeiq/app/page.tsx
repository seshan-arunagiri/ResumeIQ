import Link from "next/link";
const BrainCircuit = ({ className, style }: any) => <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5" /><path d="m13 12 4-4" /></svg>
const FileSearch = ({ className, style }: any) => <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><circle cx="11" cy="15" r="2" /><path d="m13 17 2 2" /></svg>
const BarChart3 = ({ className, style }: any) => <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="4" height="8" /><rect x="9" y="8" width="4" height="12" /><rect x="15" y="4" width="4" height="16" /></svg>
const ChevronRight = ({ className, style }: any) => <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: '#F0EDE5' }}>
      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
        style={{ borderBottom: '1px solid #d4cfc8' }}
      >
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-7 h-7" style={{ color: '#004643' }} />
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#004643' }}>ResumeIQ</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-medium transition"
            style={{ color: '#004643' }}
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg shadow-sm transition"
            style={{ backgroundColor: '#004643' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-8 py-20 lg:py-28 flex flex-col items-center text-center">
        <div
          className="inline-flex items-center px-4 py-2 rounded-full font-medium text-sm mb-8 border"
          style={{ backgroundColor: '#e6f0ef', color: '#004643', borderColor: '#b3d0cd' }}
        >
          <span className="flex h-2 w-2 rounded-full mr-2" style={{ backgroundColor: '#004643' }}></span>
          Now supporting automatic GitHub &amp; LeetCode scraping
        </div>

        <h1
          className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl"
          style={{ color: '#1a1a1a' }}
        >
          AI-Powered Campus <br />
          <span style={{ color: '#004643' }}>Placement Screening</span>
        </h1>

        <p className="text-xl mb-10 max-w-2xl" style={{ color: '#4a4a4a' }}>
          Instantly process hundreds of resumes, extract precise data using LLMs, and rank candidates
          automatically based on custom company criteria.
        </p>

        <Link
          href="/login"
          className="group inline-flex items-center text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all"
          style={{ backgroundColor: '#004643' }}
        >
          Get Started
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 w-full">
          <div
            className="p-8 rounded-2xl text-left hover:shadow-md transition"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cfc8' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#e6f0ef' }}>
              <FileSearch className="w-6 h-6" style={{ color: '#004643' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1a1a' }}>AI Parsing</h3>
            <p style={{ color: '#4a4a4a' }} className="leading-relaxed">
              Extract CGPA, skills, projects, and structured data from PDFs using Google&apos;s Gemini Flash.
            </p>
          </div>

          <div
            className="p-8 rounded-2xl text-left hover:shadow-md transition"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cfc8' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#ede8ff' }}>
              <BrainCircuit className="w-6 h-6" style={{ color: '#7c3aed' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1a1a' }}>Smart Ranking</h3>
            <p style={{ color: '#4a4a4a' }} className="leading-relaxed">
              Assign custom weights to resume, GitHub, and LeetCode scores to find the perfect candidate.
            </p>
          </div>

          <div
            className="p-8 rounded-2xl text-left hover:shadow-md transition"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cfc8' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#dbeafe' }}>
              <BarChart3 className="w-6 h-6" style={{ color: '#2563eb' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1a1a' }}>Export Reports</h3>
            <p style={{ color: '#4a4a4a' }} className="leading-relaxed">
              Generate Excel and PDF shortlist reports to send directly to campus recruiters.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
