'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Mic2,
  Trash2,
  Edit2,
  Ban,
  CheckCircle,
  X,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { Host } from '@/lib/types';

export default function HostsPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    age: 22,
    gender: 'Female',
    avatarUrl: '',
    languages: 'Hindi, English',
    interests: 'Singing, Night Talks, Movies',
    bio: '',
    coinRatePerMinute: 30,
    isOnline: true,
  });

  const fetchHosts = async () => {
    try {
      const res = await fetch('/api/hosts');
      const data = await res.json();
      if (data.success) {
        setHosts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleToggleOnline = async (host: Host) => {
    try {
      const res = await fetch(`/api/hosts/${host.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: !host.isOnline }),
      });
      const data = await res.json();
      if (data.success) {
        setHosts(hosts.map((h) => (h.id === host.id ? { ...h, isOnline: !h.isOnline } : h)));
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleToggleBan = async (host: Host) => {
    const nextBan = !host.isBanned;
    if (!confirm(`Are you sure you want to ${nextBan ? 'BAN' : 'UNBAN'} ${host.name}?`)) return;
    try {
      const res = await fetch(`/api/hosts/${host.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: nextBan, isOnline: nextBan ? false : host.isOnline }),
      });
      const data = await res.json();
      if (data.success) {
        setHosts(hosts.map((h) => (h.id === host.id ? { ...h, isBanned: nextBan } : h)));
      }
    } catch {
      alert('Failed to update ban status');
    }
  };

  const handleDeleteHost = async (host: Host) => {
    if (!confirm(`Delete host ${host.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/hosts/${host.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHosts(hosts.filter((h) => h.id !== host.id));
      }
    } catch {
      alert('Failed to delete host');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHost) {
        // Update
        const res = await fetch(`/api/hosts/${editingHost.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            languages: formData.languages.split(',').map((s) => s.trim()),
            interests: formData.interests.split(',').map((s) => s.trim()),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setEditingHost(null);
          setIsAddModalOpen(false);
          fetchHosts();
        }
      } else {
        // Create
        const res = await fetch('/api/hosts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setIsAddModalOpen(false);
          fetchHosts();
        }
      }
    } catch {
      alert('Error saving host');
    }
  };

  const openEditModal = (host: Host) => {
    setEditingHost(host);
    setFormData({
      name: host.name,
      age: host.age,
      gender: host.gender,
      avatarUrl: host.avatarUrl,
      languages: host.languages.join(', '),
      interests: host.interests.join(', '),
      bio: host.bio,
      coinRatePerMinute: host.coinRatePerMinute,
      isOnline: host.isOnline,
    });
    setIsAddModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingHost(null);
    setFormData({
      name: '',
      age: 22,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      languages: 'Hindi, English',
      interests: 'Singing, Late Night Talk, Movies',
      bio: 'Verified listener on DilSnap ready to connect!',
      coinRatePerMinute: 30,
      isOnline: true,
    });
    setIsAddModalOpen(true);
  };

  const filteredHosts = hosts.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.languages.some((l) => l.toLowerCase().includes(search.toLowerCase()));
    const matchesGender = genderFilter === 'All' || h.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Hosts & Listeners Directory</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage audio/video hosts, set calling rates per minute, verify avatars, and toggle online availability.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Host</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, language..."
            className="w-full bg-[#141320] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#FF2D55]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Female', 'Male'].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                genderFilter === g
                  ? 'bg-[#FF2D55] text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Hosts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHosts.map((host) => (
          <div
            key={host.id}
            className={`glass-card rounded-2xl p-5 border transition-all ${
              host.isBanned
                ? 'border-red-500/40 bg-red-950/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={host.avatarUrl}
                  alt={host.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#141320] ${
                    host.isBanned
                      ? 'bg-red-500'
                      : host.isOnline
                      ? 'bg-emerald-500'
                      : 'bg-gray-500'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base truncate">{host.name}</h3>
                  <span className="text-xs text-amber-400 font-bold">⭐ {host.rating}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {host.age} yrs • {host.gender}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 truncate">
                  {host.languages.join(' • ')}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-3 line-clamp-2 italic bg-black/20 p-2 rounded-lg">
              "{host.bio}"
            </p>

            <div className="flex items-center justify-between mt-4 py-2 px-3 rounded-xl bg-white/5 border border-white/5 text-xs">
              <div>
                <span className="text-gray-400 text-[10px]">Calling Rate: </span>
                <span className="font-bold text-amber-400">{host.coinRatePerMinute} 💎/min</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Calls: </span>
                <span className="font-bold text-white">{host.totalCalls}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => handleToggleOnline(host)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                  host.isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30'
                }`}
              >
                {host.isOnline ? 'Active Online' : 'Set Offline'}
              </button>

              <button
                onClick={() => openEditModal(host)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                title="Edit Host"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleToggleBan(host)}
                className={`p-2 rounded-lg border transition ${
                  host.isBanned
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                }`}
                title={host.isBanned ? 'Unban Host' : 'Ban Host'}
              >
                <Ban className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteHost(host)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                title="Delete Host"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Host Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {editingHost ? `Edit Host: ${editingHost.name}` : 'Register New Verified Host'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#FF2D55] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="Hindi, English, Punjabi"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Coin Rate Per Minute (💎)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={500}
                  value={formData.coinRatePerMinute}
                  onChange={(e) => setFormData({ ...formData, coinRatePerMinute: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Bio / Profile Greeting</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell callers about what you love talking about..."
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition"
                >
                  {editingHost ? 'Save Changes' : 'Create Host'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
