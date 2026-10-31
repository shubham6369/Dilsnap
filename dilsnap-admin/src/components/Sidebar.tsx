'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic2,
  Users,
  PhoneCall,
  Coins,
  Megaphone,
  Settings,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Hosts & Listeners', href: '/hosts', icon: Mic2 },
  { name: 'Users & Wallets', href: '/users', icon: Users },
  { name: 'Live Call Monitor', href: '/calls', icon: PhoneCall, badge: 'Live' },
  { name: 'Packages & Gifts', href: '/monetization', icon: Coins },
  { name: 'App Broadcast', href: '/broadcast', icon: Megaphone },
  { name: 'Global Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#141320] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF2D55] to-[#FF7A00] flex items-center justify-center shadow-lg shadow-[#FF2D55]/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wide text-white">DilSnap</span>
              <span className="text-[10px] bg-[#FF2D55]/20 text-[#FF2D55] font-bold px-1.5 py-0.5 rounded border border-[#FF2D55]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Control Command Center</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Management
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white shadow-md shadow-[#FF2D55]/25 font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Vercel Pill */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="bg-[#1C1A2D] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-400 font-medium">System Status</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>API Server</span>
            <span className="font-mono text-[11px] text-gray-400">Edge • Next.js 16</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2D55]" />
            v1.0.0 Production
          </span>
          <span className="text-[10px] text-gray-400">Vercel Ready</span>
        </div>
      </div>
    </aside>
  );
}
