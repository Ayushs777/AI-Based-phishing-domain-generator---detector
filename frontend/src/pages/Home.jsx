import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, History, ShieldCheck, Globe, Cpu, Lock } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: Search, title: 'Neural Scan', desc: 'Deep-packet analysis of URLs using Llama-3 neural processing.', link: '/check', color: 'blue' },
    { icon: Zap, title: 'Mutation Lab', desc: 'Generate 60+ phishing variants for proactive brand protection.', link: '/generate', color: 'red' },
    { icon: History, title: 'Intel Archive', desc: 'Encrypted history of all threat assessments and reports.', link: '/reports', color: 'cyan' },
    { icon: Globe, title: 'Real-time Guard', desc: 'Browser-integrated threat detection for 360° protection.', link: '#', color: 'green' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <ShieldCheck size={12} />
          Active Protection Enabled
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
          AI-POWERED <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">THREAT INTELLIGENCE</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-light leading-relaxed">
          The next generation of phishing detection. Analyze suspicious domains with 
          <span className="text-white font-medium"> Groq Llama-3 </span> 
          and protect your digital perimeter in milliseconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/check" className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center gap-2 group">
            Begin Analysis <Search size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/generate" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all">
            Open Lab Terminal
          </Link>
        </div>
      </div>

      {/* Stats/Badge Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-8 border-y border-white/5">
        {[
          { label: 'Latency', value: '< 150ms' },
          { label: 'Model', value: 'Llama-3.1-70B' },
          { label: 'Detection', value: '99.9%' },
          { label: 'Analysis', value: 'Heuristic + AI' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{s.label}</div>
            <div className="text-white font-mono font-medium text-lg italic">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <Link key={i} to={f.link} className="glass-card group p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <f.icon size={120} />
            </div>
            
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-red-500/50 transition-colors`}>
                <f.icon size={28} className="text-white group-hover:text-red-500 transition-colors" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest pt-2 group-hover:text-white transition-colors">
                  Initialize Module <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
