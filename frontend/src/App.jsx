import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Search, Zap, LayoutDashboard, Menu, X } from 'lucide-react';
import CheckURL from './pages/CheckURL';
import GenerateDomains from './pages/GenerateDomains';
import Home from './pages/Home';

function Navbar() {
  const loc = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { to: '/', label: 'Portal', icon: LayoutDashboard },
    { to: '/check', label: 'Threat Scan', icon: Search },
    { to: '/generate', label: 'Domain Lab', icon: Zap },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
            <Shield size={18} className="text-red-500" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tighter">
            PHISH<span className="text-red-500">GUARD</span>
          </span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-white/40 border border-white/10 uppercase tracking-widest">v1.0-Core</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${loc.pathname === item.to 
                ? 'bg-red-500/10 text-red-500' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}>
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-600/20">
            Node Active
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <div className="scanline" />
        <Navbar />
        
        <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/check" element={<CheckURL />} />
            <Route path="/generate" element={<GenerateDomains />} />
          </Routes>
        </main>

        <footer className="py-8 text-center border-t border-white/5 text-gray-600 text-xs uppercase tracking-[0.2em]">
          &copy; 2026 PhishGuard Intelligence Systems // All Rights Reserved
        </footer>
      </div>
    </BrowserRouter>
  );
}
