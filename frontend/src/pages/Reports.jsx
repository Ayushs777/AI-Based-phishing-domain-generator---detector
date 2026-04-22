import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, login, register } from '../api/client';
import { Shield, Lock, User, Mail, History, ExternalLink, Trash2, ChevronRight, Activity } from 'lucide-react';

const RISK_COLORS = { high: '#ff4d4d', medium: '#f0994b', low: '#00f2ff' };

export default function Reports({ user, setUser }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      getHistory().then(r => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await login(form.username, form.password);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', form.username);
      setUser(form.username);
    } catch { setError('Authorization Failed: Invalid Credentials'); }
  };

  const handleRegister = async () => {
    try {
      await register(form.email, form.username, form.password);
      const res = await login(form.username, form.password);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', form.username);
      setUser(form.username);
    } catch (e) { setError(e.response?.data?.detail || 'Node Registration Error'); }
  };

  if (!user) return (
    <div className="max-w-md mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-2">
        <div className="inline-flex p-4 rounded-3xl bg-red-600/10 border border-red-500/20 text-red-500 mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter">SECURE ACCESS</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Agent Credentials Required</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          {['login','register'].map(m => (
            <button 
              key={m} 
              onClick={() => { setMode(m); setError(''); }}
              className={`
                flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                ${mode === m ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}
              `}
            >
              {m}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                placeholder="EMAIL_ADDRESS" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
          )}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input 
              placeholder="AGENT_ID" 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input 
              type="password" 
              placeholder="SECRET_KEY" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
        </div>

        <button 
          onClick={mode === 'login' ? handleLogin : handleRegister}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-red-600/20"
        >
          {mode === 'login' ? 'Establish Link' : 'Register Agent'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <History size={32} className="text-red-500" />
            THREAT ARCHIVE
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Historical intel assessment data</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-4 glass-card text-center min-w-[120px]">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Scans</div>
            <div className="text-white text-xl font-black italic">{history.length}</div>
          </div>
          <div className="px-6 py-4 glass-card text-center min-w-[120px]">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Status</div>
            <div className="text-cyan-500 text-xl font-black italic uppercase tracking-tighter">Syncing</div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-600 animate-pulse uppercase font-black text-sm tracking-widest">
            Fetching Intel Archive...
          </div>
        ) : history.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <Activity size={48} className="mx-auto text-gray-800" />
            <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">No threat history detected in your node</p>
            <Link to="/check" className="inline-block text-red-500 text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Initialize first scan →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Threat Domain</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((r, i) => {
                  const riskKey = r.risk_score >= 70 ? 'high' : r.risk_score >= 40 ? 'medium' : 'low';
                  return (
                    <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-300 font-bold">{r.domain}</div>
                        <div className="text-[10px] text-gray-600 truncate max-w-[200px]">{r.url}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-black italic tracking-tighter" style={{ color: RISK_COLORS[riskKey] }}>
                          {Math.round(r.risk_score)}<span className="text-[10px] opacity-40 ml-0.5">/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`
                          px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border
                          ${r.is_phishing ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-cyan-500 border-cyan-500/20 bg-cyan-500/5'}
                        `}>
                          {r.is_phishing ? 'PHISHING' : 'SAFE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                        {new Date(r.created_at).toLocaleString().toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/check?url=${encodeURIComponent(r.url)}`} className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </Link>
                          <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
