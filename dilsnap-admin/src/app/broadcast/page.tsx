'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Smartphone,
  Send,
  Sparkles,
  CheckCircle2,
  Bell,
  Eye,
  Radio,
} from 'lucide-react';

export default function BroadcastPage() {
  const [active, setActive] = useState(true);
  const [title, setTitle] = useState('✨ Welcome to DilSnap!');
  const [message, setMessage] = useState(
    'Connect 1-on-1 with verified friendly hosts via HD Video & Audio calls.'
  );
  const [actionUrl, setActionUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.broadcastNotice) {
          const b = data.data.broadcastNotice;
          setActive(b.active ?? true);
          setTitle(b.title || '');
          setMessage(b.message || '');
          setActionUrl(b.actionUrl || '');
        }
      });
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcastNotice: {
            active,
            title,
            message,
            actionUrl,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert('Failed to publish broadcast');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#FF2D55]" />
          <span>Global App Broadcast Center</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Broadcast real-time announcement banners, festival recharge promotions, and server maintenance alerts to all connected mobile clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Broadcast Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Broadcast Composer</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-400 font-medium">Broadcast Active:</span>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FF2D55]"
              />
            </label>
          </div>

          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🎉 Holi Special: 50% Extra Coins!"
                className="w-full bg-[#141320] text-white text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-[#FF2D55] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Announcement Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full alert details for the user..."
                className="w-full bg-[#141320] text-white rounded-xl p-3.5 border border-white/10 focus:border-[#FF2D55] outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Action Button Target (Optional)</label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g. /wallet, /hosts, or custom link"
                className="w-full bg-[#141320] text-white rounded-xl px-4 py-2.5 border border-white/10 outline-none font-mono text-xs"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcast Published Live to Mobile App!</span>
                </div>
              ) : (
                <div className="text-[11px] text-gray-400">
                  Instantly visible to all app users on next refresh
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSaving ? 'Publishing...' : 'Publish Broadcast'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Mobile Device Screen Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#FF2D55]" />
            <span>Mobile Live Preview</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[280px] h-[550px] bg-black rounded-[42px] p-3 border-4 border-white/20 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Top Speaker & Notch */}
            <div className="w-24 h-4 bg-[#1F1E2C] rounded-full mx-auto mb-2" />

            {/* Simulated App Screen */}
            <div className="flex-1 bg-[#0F0E17] rounded-[28px] p-3 flex flex-col overflow-hidden relative">
              {/* Top App Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white">
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <span className="text-[#FF2D55]">❤️</span> DilSnap
                </div>
                <div className="bg-[#1C1A2D] px-2 py-0.5 rounded-full text-[10px] text-amber-400 font-bold border border-amber-500/30">
                  💎 120
                </div>
              </div>

              {/* Dynamic Broadcast Banner Component (if active) */}
              {active ? (
                <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55]/20 to-[#FF7A00]/20 border border-[#FF2D55]/40 text-left relative overflow-hidden animate-pulse">
                  <div className="flex items-start gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#FF2D55] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-black text-white">{title || 'Announcement'}</div>
                      <div className="text-[9px] text-gray-300 mt-0.5 line-clamp-3 leading-tight">
                        {message || 'Broadcast message will appear here...'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-center text-[10px] text-gray-500 py-1 bg-white/5 rounded-lg">
                  (Broadcast banner hidden)
                </div>
              )}

              {/* Mock Host Card */}
              <div className="mt-3 flex-1 bg-[#1C1A2D] rounded-xl p-2 relative overflow-hidden flex flex-col justify-between">
                <div className="w-full h-40 bg-gradient-to-t from-black to-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Host"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[8px] text-emerald-400 font-bold">
                    ONLINE
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-white">
                  <div>
                    <div className="font-bold text-[11px]">Priya Sharma, 22</div>
                    <div className="text-[9px] text-gray-400">Hindi • English</div>
                  </div>
                  <div className="bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-[9px] font-bold px-2.5 py-1 rounded-md">
                    Call 30💎
                  </div>
                </div>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="pt-2 flex justify-around text-gray-500 text-[9px] border-t border-white/5 mt-2">
                <span className="text-[#FF2D55] font-bold">Explore</span>
                <span>Live</span>
                <span>Messages</span>
                <span>Wallet</span>
              </div>
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
