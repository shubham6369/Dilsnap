'use client';

import { useState, useEffect } from 'react';
import {
  PhoneCall,
  Video,
  Clock,
  Coins,
  XCircle,
  AlertTriangle,
  History,
  Shield,
  ArrowDownRight,
} from 'lucide-react';
import { ActiveCall } from '@/lib/types';

export default function CallsPage() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [history, setHistory] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      if (data.success) {
        setActiveCalls(data.data.activeCalls || []);
        setHistory(data.data.recentHistory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminate = async (callId: string) => {
    if (!confirm('FORCIBLY TERMINATE THIS CALL IMMEDIATELY?\nThe caller and host will be disconnected.')) return;
    try {
      const res = await fetch('/api/calls/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCalls();
      }
    } catch {
      alert('Error terminating call');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <span>Live Call Monitor & Logs</span>
            <span className="flex items-center gap-1.5 text-xs bg-[#FF2D55]/20 text-[#FF2D55] px-2.5 py-1 rounded-full border border-[#FF2D55]/30">
              <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-ping" />
              {activeCalls.length} Active Right Now
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time inspection of 1-on-1 WebRTC video & audio streams. Terminate unauthorized or abusive calls instantly.
          </p>
        </div>
      </div>

      {/* Active Calls Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[#FF2D55]" />
          <span>Active Streams ({activeCalls.length})</span>
        </h2>

        {activeCalls.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-white/10">
            <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-semibold">All channels are quiet</p>
            <p className="text-xs text-gray-500 mt-0.5">When users initiate a call, it will appear here in real-time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activeCalls.map((call) => (
              <div
                key={call.id}
                className="glass-card rounded-2xl p-6 border border-[#FF2D55]/30 bg-gradient-to-br from-[#1C1A2D] to-[#251A33] shadow-xl relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={call.hostAvatar}
                      alt={call.hostName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF2D55]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{call.hostName}</span>
                        <span className="text-[10px] bg-[#FF2D55]/20 text-[#FF2D55] px-2 py-0.5 rounded font-bold">
                          HOST
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Caller: <span className="text-white font-bold">{call.userName}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      call.callType === 'video'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {call.callType === 'video' ? '📹 HD Video' : '🎙️ HD Audio'}
                  </span>
                </div>

                {/* Real-time stats */}
                <div className="grid grid-cols-3 gap-3 mt-6 p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-gray-400">Duration</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      {Math.floor(call.durationSeconds / 60)}:
                      {(call.durationSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Rate / Min</div>
                    <div className="text-sm font-black text-amber-400">{call.ratePerMinute} 💎</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Burned So Far</div>
                    <div className="text-sm font-black text-[#FF2D55]">{call.coinsBurned} 💎</div>
                  </div>
                </div>

                {/* Bottom terminate action */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live WebRTC Connection</span>
                  </div>

                  <button
                    onClick={() => handleTerminate(call.id)}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span>Force Terminate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call History Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <span>Recent Completed Calls Log</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-4">Caller</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Total Burned</th>
                <th className="py-3 px-4">Ended Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4 font-mono text-gray-400">{h.id}</td>
                  <td className="py-3 px-4 font-bold text-white">{h.hostName}</td>
                  <td className="py-3 px-4 text-gray-300">{h.userName}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300">
                      {h.callType === 'video' ? 'Video' : 'Audio'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {Math.floor(h.durationSeconds / 60)}m {h.durationSeconds % 60}s
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">{h.coinsBurned} 💎</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        h.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {h.status === 'completed' ? 'Completed Normally' : 'Terminated by Admin'}
                    </span>
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
