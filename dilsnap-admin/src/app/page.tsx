'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Coins,
  PhoneCall,
  Users,
  Mic2,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Megaphone,
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [resAnalytics, resCalls, resHosts] = await Promise.all([
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/calls').then((r) => r.json()),
        fetch('/api/hosts').then((r) => r.json()),
      ]);

      if (resAnalytics.success) setAnalytics(resAnalytics.data);
      if (resCalls.success) setActiveCalls(resCalls.data.activeCalls || []);
      if (resHosts.success) setHosts(resHosts.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminateCall = async (callId: string) => {
    if (!confirm('Are you sure you want to forcibly terminate this live call?')) return;
    try {
      const res = await fetch('/api/calls/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch {
      alert('Failed to terminate call');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B33] via-[#2A1E3C] to-[#1E1B33] p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D55]/20 border border-[#FF2D55]/30 text-[#FF2D55] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Production Telemetry</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              DilSnap Command Dashboard
            </h1>
            <p className="text-sm text-gray-400 max-w-xl">
              Control 1-on-1 calls, host status, wallet coin burns, and dynamic pricing across all active Android & iOS mobile clients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/broadcast"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition"
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Broadcast Notice</span>
            </Link>
            <Link
              href="/hosts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Verified Host</span>
            </Link>
          </div>
        </div>

        {/* Subtle Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF2D55]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 6 Key Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total App Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              ₹{analytics ? (analytics.totalRevenue).toLocaleString() : '52,540'}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.4% this week</span>
              <span className="text-gray-400 font-normal ml-1">via Cashfree UPI</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Coins Burned Today */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Today's Coins Burned</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {analytics ? analytics.todayBurnedCoins.toLocaleString() : '2,840'} 💎
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400 font-semibold">
              <span>Avg {analytics?.avgCallDurationMinutes || '6.4 min'} per call</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Calls Right Now */}
        <div className="glass-card rounded-2xl p-6 border border-[#FF2D55]/30 bg-[#FF2D55]/5 hover:border-[#FF2D55]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">Live Calls In-Progress</span>
            <div className="p-2.5 rounded-xl bg-[#FF2D55]/20 border border-[#FF2D55]/40 text-[#FF2D55]">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-black text-white">{activeCalls.length}</div>
              <span className="flex items-center gap-1 text-xs font-bold text-[#FF2D55] bg-[#FF2D55]/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-ping" />
                STREAMING
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Encrypted WebRTC P2P Streams
            </div>
          </div>
        </div>

        {/* Metric 4: Coins in Circulation */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Coins in Circulation</span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {analytics ? analytics.coinsInCirculation.toLocaleString() : '800'} 💎
            </div>
            <div className="text-xs text-purple-400 mt-2 font-medium">
              In user wallets ready for call burn
            </div>
          </div>
        </div>

        {/* Metric 5: Total Registered Users */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Registered Users</span>
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {analytics ? analytics.totalUsersCount.toLocaleString() : '1,424'}
            </div>
            <div className="text-xs text-blue-400 mt-2 font-medium">
              +42 new registrations today
            </div>
          </div>
        </div>

        {/* Metric 6: Verified Hosts Online */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Verified Hosts Online</span>
            <div className="p-2.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400">
              <Mic2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-white">
                {analytics ? analytics.onlineHostsCount : 5}
              </div>
              <span className="text-xs text-gray-400 font-medium">/ {hosts.length} Total</span>
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-semibold">
              High listener availability
            </div>
          </div>
        </div>
      </div>

      {/* Live Calls Command Monitor Section */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF2D55] animate-ping" />
            <h2 className="text-lg font-bold text-white">Live Call Monitor (Active Sessions)</h2>
          </div>
          <Link
            href="/calls"
            className="text-xs text-[#FF2D55] hover:text-[#FF7A00] font-bold flex items-center gap-1 transition"
          >
            <span>View All Call Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeCalls.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
            <PhoneCall className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">No calls currently active</p>
            <p className="text-xs text-gray-400">Incoming calls from mobile devices will display here in real-time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCalls.map((call) => (
              <div
                key={call.id}
                className="bg-[#1F1D32] rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={call.hostAvatar}
                      alt={call.hostName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#FF2D55]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{call.hostName}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Host</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Connected with <strong className="text-white">{call.userName}</strong>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      call.callType === 'video'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {call.callType === 'video' ? '📹 Video Call' : '🎙️ Audio Call'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 py-3 px-4 rounded-xl bg-black/30 border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-gray-400">Rate</div>
                    <div className="text-xs font-bold text-amber-400">{call.ratePerMinute} 💎/min</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Duration</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {Math.floor(call.durationSeconds / 60)}:{(call.durationSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Coins Burned</div>
                    <div className="text-xs font-bold text-[#FF2D55]">{call.coinsBurned} 💎</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active 60fps WebRTC</span>
                  </div>
                  <button
                    onClick={() => handleTerminateCall(call.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Terminate Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Hosts Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Top Active Verified Hosts</h2>
            <p className="text-xs text-gray-400">Manage rates, availability, and live stream channels</p>
          </div>
          <Link
            href="/hosts"
            className="text-xs text-[#FF2D55] hover:text-[#FF7A00] font-bold flex items-center gap-1 transition"
          >
            <span>Manage All ({hosts.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-4">Rate / Min</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Total Calls</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {hosts.slice(0, 4).map((host) => (
                <tr key={host.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={host.avatarUrl}
                        alt={host.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/20"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{host.name}</div>
                        <div className="text-[11px] text-gray-400">{host.languages.join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {host.coinRatePerMinute} 💎
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        host.isOnline
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${host.isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                      {host.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ⭐ {host.rating}
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">
                    {host.totalCalls} calls
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/hosts"
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] border border-white/10 transition"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
