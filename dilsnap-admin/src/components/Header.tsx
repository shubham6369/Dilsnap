'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, Shield, Zap, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function Header() {
  const [maintenance, setMaintenance] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        if (data.success && (data.config || data.data)) {
          const cfg = data.config || data.data;
          if (isMounted) {
            setMaintenance(Boolean(cfg.maintenanceMode));
          }
        }
      } catch (err) {
        console.error('[Header] Failed to fetch system config:', err);
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    };
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMaintenance = async () => {
    const nextState = !maintenance;
    setMaintenance(nextState);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          nextState
            ? 'Maintenance mode enabled. Mobile clients will be notified.'
            : 'Maintenance mode disabled. App is now live for all users.',
          nextState ? 'warning' : 'success'
        );
      } else {
        showToast(data.error || 'Failed to update maintenance mode', 'error');
        setMaintenance(!nextState);
      }
    } catch {
      showToast('Network error while toggling maintenance mode', 'error');
      setMaintenance(!nextState);
    }
  };

  return (
    <>
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
            disabled={loadingConfig}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              maintenance
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${maintenance ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-gray-400'}`} />
            {loadingConfig ? 'Checking...' : maintenance ? 'Maintenance Mode: ON' : 'App Active'}
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

      {/* Maintenance Mode Alert Banner */}
      {maintenance && (
        <div className="fixed top-16 right-0 left-64 z-20 bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-300 font-semibold backdrop-blur-md shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>MAINTENANCE MODE ACTIVE:</strong> Mobile apps are currently restricted to emergency broadcast notices.
            </span>
          </div>
          <Link
            href="/settings"
            className="text-[11px] underline text-amber-200 hover:text-white transition shrink-0"
          >
            Manage in Settings &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
