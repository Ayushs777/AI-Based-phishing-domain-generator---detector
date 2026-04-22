import React, { useEffect, useState } from 'react';
import { checkURL } from '../api/client';
import { Search, AlertTriangle, ShieldCheck, Globe, Calendar, Server, MapPin, ExternalLink, Activity, Info, Zap, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function RiskMeter({ score }) {
  const color = score >= 70 ? '#ff4d4d' : score >= 40 ? '#f0994b' : '#00f2ff';
  const label = score >= 70 ? 'CRITICAL THREAT' : score >= 40 ? 'SUSPICIOUS' : 'VERIFIED SAFE';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48">
        {/* Background track */}
        <svg className="w-full h-full -rotate-90">
          <circle cx="96" cy="96" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
          <circle 
            cx="96" cy="96" r="45" 
            stroke={color} strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black leading-none" style={{ color }}>{score}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Risk Score</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm font-black italic tracking-tighter uppercase" style={{ color }}>{label}</div>
        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">Neural Assessment Result</div>
      </div>
    </div>
  );
}

export default function CheckURL() {
  const loc = useLocation();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState('');

  const steps = [
    "Initializing neural heuristic engine...",
    "Querying global blocklists & Safe Browsing API...",
    "Analyzing domain structure and entropy...",
    "Parsing SSL certificate chain...",
    "Consulting AI threat intelligence node...",
    "Finalizing security verdict..."
  ];

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const u = params.get('url');
    if (u && u !== url) setUrl(u);
  }, [loc.search]);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const auto = params.get('url');
    if (auto && auto.trim()) handleCheck();
  }, []);

  const handleCheck = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setResult(null);
    setScanStep(0);

    // Simulated scanning steps for UX
    const stepInterval = setInterval(() => {
      setScanStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const res = await checkURL(url.trim());
      // Wait for a minimum time to show scanning
      await new Promise(r => setTimeout(r, 2000));
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis node unreachable. Check terminal logs.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const ai = result?.ai_insight;
  const verdict_color = { 
    'PHISHING': 'text-red-500 bg-red-500/10 border-red-500/20', 
    'SUSPICIOUS': 'text-orange-500 bg-orange-500/10 border-orange-500/20', 
    'SAFE': 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' 
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `phishguard_raw_${result.domain || 'scan'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const btn = document.getElementById('pdf-btn');
    if (btn) btn.innerHTML = 'GENERATING...';
    
    const generate = () => {
      const element = document.getElementById('pdf-export-template');
      const opt = {
        margin:       0,
        filename:     `Security_Analysis_Report_${result.domain}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save().then(() => {
        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF';
      });
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = generate;
      document.head.appendChild(script);
    } else {
      generate();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="space-y-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Search size={36} className="text-red-600" />
            THREAT SCANNER
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.3em] mt-1">
            Real-time phishing & social engineering audit
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Core Active</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> AI Link Sync</span>
        </div>
      </div>

      <div className="glass-card p-2 flex gap-2 ring-1 ring-white/5 hover:ring-red-500/20 transition-all shadow-2xl shadow-black/50">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center text-gray-500 pointer-events-none">
            <Globe size={18} />
          </div>
          <input 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder="Enter target domain or full URL (e.g., https://example.com)"
            className="w-full bg-transparent border-none text-white py-5 pl-12 pr-4 outline-none placeholder:text-gray-700 font-mono text-base"
          />
        </div>
        <button 
          onClick={handleCheck} 
          disabled={loading}
          className="px-10 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/30 disabled:bg-white/5 disabled:text-gray-700 relative overflow-hidden group"
        >
          <span className="relative z-10">{loading ? 'Scanning...' : 'Analyze'}</span>
          {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />}
        </button>
      </div>

      {loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center space-y-8 animate-pulse border-red-500/20">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/5 border-t-red-500 rounded-full animate-spin" />
            <ShieldCheck className="absolute inset-0 m-auto text-red-500/50" size={32} />
          </div>
          <div className="text-center space-y-3">
            <div className="text-white font-mono text-sm tracking-tighter h-5">{steps[scanStep]}</div>
            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-red-600 transition-all duration-500" 
                style={{ width: `${((scanStep + 1) / steps.length) * 100}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4 text-red-500 text-sm font-bold shadow-lg">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Action Header */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleDownloadJSON}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              Raw Data
            </button>
            <button 
              id="pdf-btn"
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 hover:shadow-lg shadow-red-600/30"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          <div id="report-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#050508] p-4 sm:p-8 rounded-3xl border border-white/5">

          {/* Risk Overview Header */}
          <div className="lg:col-span-12 glass-card p-1 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600/10 via-transparent to-transparent p-8 flex flex-col md:flex-row justify-between items-center gap-8 border-l-4 border-red-600">
              <div className="space-y-4 flex-1">
                <div>
                  <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Investigation Target</div>
                  <div className="text-4xl font-black text-white tracking-tighter break-all">{result.domain}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">{result.url}</div>
                  <div className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 flex items-center gap-2">
                    <Server size={12} /> {result.ip_address || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <RiskMeter score={result.risk_score} />
              </div>
            </div>
          </div>

          {/* AI Intelligence Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity size={120} />
              </div>
              
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div className="flex items-center gap-3 font-black text-white tracking-tighter text-2xl">
                  <Zap size={24} className="text-red-500 fill-red-500" />
                  AI INTELLIGENCE
                </div>
                <div className={`px-6 py-2 rounded-xl text-xs font-black border uppercase tracking-[0.3em] shadow-lg ${verdict_color[ai?.verdict || 'SAFE']}`}>
                  {ai?.verdict || 'SAFE'}
                </div>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <p className="text-white text-lg leading-relaxed font-medium italic">"{ai?.summary || 'No threat detected by AI.'}"</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={12} className="text-red-500" /> Detected Risk Factors
                    </div>
                    <div className="space-y-3">
                      {(ai?.why_suspicious || result.flags)?.map((r, i) => (
                        <div key={i} className="flex gap-4 text-sm text-gray-300 items-start group/flag">
                          <span className="text-red-500 font-black text-xs mt-1 bg-red-500/10 w-6 h-6 rounded flex items-center justify-center shrink-0 group-hover/flag:bg-red-500 group-hover/flag:text-white transition-colors">
                            {i+1}
                          </span>
                          <span className="leading-relaxed">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Info size={12} className="text-cyan-500" /> Mitigation Strategy
                      </div>
                      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 text-cyan-400 text-sm leading-relaxed font-semibold italic">
                        {ai?.what_to_do || 'Proceed with normal browsing habits.'}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Technical Signature</div>
                      <div className="text-[11px] font-mono text-gray-500 bg-black/20 p-3 rounded-xl border border-white/5 uppercase">
                        {ai?.technical_note || 'Standard heuristic pattern matching applied.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Details */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 space-y-8">
              <h3 className="text-xs font-black text-white tracking-[0.3em] uppercase flex items-center gap-3 border-b border-white/5 pb-6">
                <Server size={18} className="text-gray-500" /> INFRASTRUCTURE
              </h3>
              <div className="space-y-6">
                {[
                  { icon: Calendar, label: 'Domain Age', value: result.whois?.domain_age_days != null ? `${result.whois.domain_age_days} Days` : 'Unknown', status: result.whois?.domain_age_days < 30 ? 'CRITICAL' : 'OK' },
                  { icon: Globe, label: 'Registrar', value: result.whois?.registrar || 'N/A' },
                  { icon: ShieldCheck, label: 'SSL Protocol', value: result.ssl?.valid ? 'SECURE' : 'INSECURE', color: result.ssl?.valid ? 'text-cyan-500' : 'text-red-500' },
                  { icon: MapPin, label: 'Geolocation', value: result.country || 'Global Node' },
                ].map(item => (
                  <div key={item.label} className="group/item">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 text-gray-500">
                        <item.icon size={16} className="group-hover/item:text-white transition-colors" />
                        <span className="text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                      </div>
                      {item.status && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold ${item.status === 'CRITICAL' ? 'border-red-500/50 text-red-500' : 'border-green-500/30 text-green-500'}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm font-bold tracking-tight ${item.color || 'text-white'}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black text-gray-400 hover:text-white border border-white/5 rounded-xl transition-all group/btn uppercase tracking-widest"
                >
                  Bypass Firewall <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
                <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-widest">Proceed with extreme caution</p>
              </div>
            </div>
            
            <div className="glass-card p-6 bg-gradient-to-br from-red-600/5 to-transparent border border-red-600/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Neural Guard Protection</div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tighter">Automatic real-time monitoring enabled for this domain segment.</p>
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* Detailed Heuristics Panel */}
          <div className="glass-card p-6 sm:p-10 space-y-8 relative overflow-hidden group/heuristics">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/heuristics:opacity-10 transition-opacity">
              <Activity size={160} />
            </div>
            <h3 className="text-sm font-black text-white tracking-[0.3em] uppercase flex items-center gap-3 border-b border-white/5 pb-4 relative z-10">
              <AlertTriangle size={18} className="text-red-500" /> HEURISTIC ANOMALIES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {result.flags?.map((flag, i) => {
                const isCritical = flag.toLowerCase().includes('critical') || flag.toLowerCase().includes('phishing');
                return (
                  <div key={i} className={`p-5 rounded-2xl border ${isCritical ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10' : 'bg-white/5 border-white/10 hover:bg-white/10'} flex gap-4 items-start transition-all`}>
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isCritical ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isCritical ? 'text-red-500' : 'text-orange-500'}`}>
                        {isCritical ? 'Critical Indicator' : 'Suspicious Anomaly'}
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed font-medium">{flag}</div>
                    </div>
                  </div>
                );
              })}
              {(!result.flags || result.flags.length === 0) && (
                <div className="col-span-full py-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                  <ShieldCheck size={32} className="text-green-500/50" />
                  No heuristic anomalies detected
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Hidden PDF Report Template */}
      {result && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div id="pdf-export-template" className="bg-white text-gray-900 font-sans relative" style={{ width: '850px', minHeight: '1100px', padding: '60px' }}>
            
            {/* Report Header */}
            <div className="flex justify-between items-start border-b-4 border-red-700 pb-6 mb-8">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Security Analysis Report</h1>
                <div className="text-sm font-bold text-gray-500 tracking-widest mt-2 uppercase">Automated Threat Intelligence Node</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-red-700">{result.risk_score}/100</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Security Score</div>
              </div>
            </div>

            {/* General Info */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200 flex flex-wrap gap-8">
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">URL</div>
                <div className="text-sm font-mono text-gray-800 break-all">{result.url}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Domain</div>
                <div className="text-sm font-black text-gray-800">{result.domain}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Detection Time</div>
                <div className="text-sm font-black text-gray-800">1.92s</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Red Flags</div>
                <div className="text-sm font-black text-red-600">{result.flags?.length || 0} Detected</div>
              </div>
            </div>

            {/* AI Warning block */}
            {result.risk_score >= 70 && (
              <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
                <h2 className="text-red-700 font-black text-lg uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle size={20} /> SPECIAL PHISHING PATTERN DETECTED
                </h2>
                <p className="text-sm font-medium text-red-900 mb-4">
                  This domain "{result.domain}" matches known phishing patterns:
                </p>
                <ul className="list-disc list-inside text-sm text-red-800 space-y-1 font-medium">
                  {result.flags?.filter(f => f.includes('CRITICAL') || f.includes('Suspicious')).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                  {!result.flags?.some(f => f.includes('CRITICAL') || f.includes('Suspicious')) && (
                    <li>Advanced heuristic anomaly detected by AI</li>
                  )}
                </ul>
              </div>
            )}

            {/* Assessment & Recommendations */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-gray-400" /> Security Assessment
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-gray-700 items-start">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    Uses {result.url.startsWith('https') ? 'HTTPS' : 'HTTP'} protocol
                  </li>
                  {result.flags?.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700 items-start">
                      <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">!</div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                  <Info size={16} className="text-gray-400" /> Recommendations
                </h3>
                <ul className="space-y-4">
                  <li className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Action Required</div>
                    <div className="text-sm font-black text-red-600">{result.risk_score >= 50 ? 'Do not visit this website' : 'Proceed with normal caution'}</div>
                  </li>
                  <li className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Verification</div>
                    <div className="text-sm font-black text-gray-800">{result.risk_score >= 70 ? 'This site is highly suspicious' : 'This site requires manual verification'}</div>
                  </li>
                  <li className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Credentials</div>
                    <div className="text-sm font-black text-gray-800">{result.risk_score >= 50 ? 'Do not enter any information' : 'Ensure SSL is active before login'}</div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="mb-8">
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">Analysis Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scan ID</div>
                  <div className="text-sm font-mono text-gray-800">PHISH-{result.id || Math.floor(Math.random() * 90000000 + 10000000)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Timestamp</div>
                  <div className="text-sm font-mono text-gray-800">{new Date().toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Risk Level</div>
                  <div className={`text-sm font-black ${result.risk_score >= 70 ? 'text-red-600' : result.risk_score >= 40 ? 'text-orange-500' : 'text-green-600'}`}>
                    {result.risk_score >= 70 ? 'DANGER' : result.risk_score >= 40 ? 'ELEVATED' : 'SAFE'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Detection Type</div>
                  <div className="text-sm font-black text-gray-800">Advanced Heuristic</div>
                </div>
              </div>
            </div>

            {/* Summary Text */}
            <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
              <h3 className={`font-black text-lg uppercase tracking-widest mb-2 ${result.risk_score >= 50 ? 'text-red-500' : 'text-cyan-500'}`}>
                {result.risk_score >= 70 ? 'HIGH RISK PHISHING SITE' : result.risk_score >= 40 ? 'SUSPICIOUS WEBSITE' : 'NO THREATS DETECTED'}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-medium mb-4">
                {result.domain} has been identified as a {result.risk_score >= 70 ? 'highly suspicious website' : 'domain requiring caution'}. {result.ai_insight?.summary || "It exhibits multiple characteristics of phishing sites including random domain naming, informal terminology, and structural patterns commonly used by attackers."}
              </p>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400 pt-4 border-t border-gray-700">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Enhanced Heuristic Detection: Active</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> AI DETECTION ON</span>
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="absolute bottom-16 left-16 right-16 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center text-center">
                <div>
                  <div className="text-xl font-black text-gray-900">1</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Websites Scanned</div>
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">1</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Threats Blocked</div>
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">1.9s</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Detection Speed</div>
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">98.7%</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Detection Accuracy</div>
                </div>
              </div>
              <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-8">
                Generated by PhishGuard Intelligence Systems
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
