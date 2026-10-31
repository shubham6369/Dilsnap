'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, Shield, Zap, ExternalLink } from 'lucide-react';

export default function Header() {
  const [maintenance, setMaintenance] = useState(false);

  const toggleMaintenance = async () => {
    const nextState = !maintenance;
    setMaintenance(nextState);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: nextState }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-[#141320]/80 backdrop-blur-md border-b border-white/10 fixed top-0 right-0 left-64 z-30 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search hosts, users, calls or logs..."
          className="w-full bg-[#1C1A2D] text-xs text-white rounded-xl pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-[#FF2D55] transition-all"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Maintenance Toggle */}
        <button
          onClick={toggleMaintenance}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            maintenance
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${maintenance ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
          {maintenance ? 'Maintenance Mode: ON' : 'App Active'}
        </button>

        {/* Live Call Pulse Badge */}
        <Link
          href="/calls"
          className="flex items-center gap-2 bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#FF2D55]/25 transition"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-ping" />
          <span>Live Monitor</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[#FF2D55] flex items-center justify-center font-bold text-xs text-white shadow-sm">
            AD
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-white flex items-center gap-1">
              Super Admin
              <Shield className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-[10px] text-gray-400">admin@dilsnap.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
