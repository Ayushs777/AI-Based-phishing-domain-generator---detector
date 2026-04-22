import React, { useState } from 'react';
import { generateDomains, downloadReport } from '../api/client';
import { Zap, Download, Filter, Target, Shield, AlertCircle, Layers } from 'lucide-react';

const RISK_COLORS = { HIGH: 'text-red-500 border-red-500/20 bg-red-500/10', 
                      MEDIUM: 'text-orange-500 border-orange-500/20 bg-orange-500/10', 
                      LOW: 'text-cyan-500 border-cyan-500/20 bg-cyan-500/10' };

export default function GenerateDomains() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await generateDomains(domain.trim());
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Node generation offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const res = await downloadReport(result.target_domain, result.variants);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `PG-INTEL-${result.target_domain}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) {
      setError('PDF Generation Failed.');
    } finally {
      setDownloading(false);
    }
  };

  const filtered = result?.variants?.filter(v => filter === 'ALL' || v.risk_level === filter) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center justify-center md:justify-start gap-3">
          <Zap size={32} className="text-orange-500" />
          DOMAIN MUTATION LAB
        </h2>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
          Generate typosquatting variants for proactive brand monitoring
        </p>
      </div>

      <div className="glass-card p-2 flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center text-gray-500 pointer-events-none">
            <Target size={18} />
          </div>
          <input 
            value={domain} 
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="Target Brand Domain (e.g. microsoft.com)"
            className="w-full bg-transparent border-none text-white py-4 pl-12 pr-4 outline-none placeholder:text-gray-600 font-mono text-sm"
          />
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="px-8 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 disabled:bg-white/5"
        >
          {loading ? 'MUTATING...' : 'GENERATE'}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-6 border-l-4 border-l-orange-500">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Brand</div>
              <div className="text-2xl font-black text-white italic">{result.target_domain}</div>
              <div className="text-xs text-orange-500/70 font-bold">{result.total} Threat Variants Mutated</div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {['ALL','HIGH','MEDIUM','LOW'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.15em] border transition-all
                    ${filter === f 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}
                  `}
                >
                  {f}
                </button>
              ))}
              <button 
                onClick={handleDownload} 
                disabled={downloading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-xl border border-red-500 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <Download size={14} /> {downloading ? 'GENERATING...' : 'EXFILTRATE INTEL'}
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden border-t border-white/5">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Threat Domain</th>
                  <th className="px-6 py-4 hidden md:table-cell">Pattern Vector</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Detection Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((v, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">{v.domain}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <Layers size={12} /> {v.pattern}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black border uppercase tracking-widest ${RISK_COLORS[v.risk_level]}`}>
                        {v.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-black italic tracking-tighter" style={{ color: v.risk_score >= 70 ? '#ff4d4d' : v.risk_score >= 40 ? '#f0994b' : '#00f2ff' }}>
                        {Math.round(v.risk_score)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center space-y-3">
                <AlertCircle size={40} className="mx-auto text-gray-700" />
                <div className="text-gray-600 text-sm font-bold uppercase tracking-widest">No matching threats found in current view</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
