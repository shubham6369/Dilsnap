'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  Coins,
  CheckCircle2,
  Save,
  Server,
  Zap,
  Lock,
  Globe,
} from 'lucide-react';
import { AppConfig } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && (data.data || data.config)) {
          setConfig(data.data || data.config);
        }
      })
      .catch(() => {
        showToast('Failed to load system configuration', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        showToast('System configuration saved and synchronized!', 'success');
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch {
      showToast('Network error while saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div className="h-10 w-64 bg-white/10 rounded-2xl" />
        <div className="h-4 w-96 bg-white/5 rounded-xl" />
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-20 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#FF2D55]" />
          <span>Global App & Gateway Settings</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Tune dynamic calling parameters, emergency kill-switches, welcome coin gifts, and Cashfree payment keys.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Emergency & Operational Switches */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-sm font-bold text-white">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Emergency Kill-Switches</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
            <div>
              <div className="font-bold text-sm text-white">Emergency Maintenance Mode</div>
              <p className="text-xs text-gray-400 mt-0.5">
                When activated, all mobile users will see a "Under Scheduled Maintenance" screen.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2D55]"></div>
            </label>
          </div>
        </div>

        {/* Section 2: Coins & Calling Rates */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-sm font-bold text-white">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Coin Economy & Call Rules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">New User Welcome Coins (💎)</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={config.welcomeBonusCoins}
                onChange={(e) => setConfig({ ...config, welcomeBonusCoins: Number(e.target.value) })}
                className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400"
              />
              <p className="text-[10px] text-gray-400 mt-1">Free balance credited upon mobile signup</p>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Min Video Rate (💎/min)</label>
              <input
                type="number"
                min={10}
                value={config.minVideoCoinRate}
                onChange={(e) => setConfig({ ...config, minVideoCoinRate: Number(e.target.value) })}
                className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-white"
              />
              <p className="text-[10px] text-gray-400 mt-1">Floor rate hosts can charge for video</p>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Min Audio Rate (💎/min)</label>
              <input
                type="number"
                min={10}
                value={config.minAudioCoinRate}
                onChange={(e) => setConfig({ ...config, minAudioCoinRate: Number(e.target.value) })}
                className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-white"
              />
              <p className="text-[10px] text-gray-400 mt-1">Floor rate hosts can charge for audio</p>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Gateway (Cashfree) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-sm font-bold text-white">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Cashfree Payment Gateway Integration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Environment Mode</label>
              <select
                value={config.cashfreeMode}
                onChange={(e) => setConfig({ ...config, cashfreeMode: e.target.value as any })}
                className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold"
              >
                <option value="TEST">TEST (Sandbox Mode)</option>
                <option value="PROD">PRODUCTION (Live UPI Payments)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Cashfree App ID</label>
              <input
                type="text"
                value={config.cashfreeAppId}
                onChange={(e) => setConfig({ ...config, cashfreeAppId: e.target.value })}
                className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Vercel Deployment & Mobile API URL */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Mobile App Connection URL</span>
          </div>
          <p className="text-xs text-gray-400">
            Once you deploy this project to Vercel, copy your Vercel production URL (e.g. <code className="text-pink-400">https://dilsnap-admin.vercel.app</code>) and set it in the Flutter app's <code className="text-amber-400">AppConstants.apiBaseUrl</code>.
          </p>
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-emerald-400 select-all">
            GET /api/hosts • GET /api/config • GET /api/packages • POST /api/calls
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration Saved & Active!</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
