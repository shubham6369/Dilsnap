'use client';

import { useState, useEffect } from 'react';
import {
  Gift as GiftIcon,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle,
  X,
  Tag,
  Coins,
  Search,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { Gift } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmModal';

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Popular' | 'Luxury' | 'Special'>('All');

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Create Gift Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    coinCost: 50,
    assetPath: 'assets/image/cake.png',
    category: 'Popular' as 'Popular' | 'Luxury' | 'Special',
  });

  // Edit Gift Modal State
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    coinCost: 50,
    assetPath: 'assets/image/cake.png',
    category: 'Popular' as 'Popular' | 'Luxury' | 'Special',
  });

  const fetchGifts = async () => {
    try {
      const res = await fetch('/api/gifts');
      const data = await res.json();
      if (data.success) {
        setGifts(data.data || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load virtual gifts catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });
      const data = await res.json();
      if (data.success && (data.gift || data.data)) {
        setIsAddModalOpen(false);
        setAddFormData({
          name: '',
          coinCost: 50,
          assetPath: 'assets/image/cake.png',
          category: 'Popular',
        });
        showToast(`Gift "${addFormData.name}" added successfully`, 'success');
        fetchGifts();
      } else {
        showToast(data.error || 'Failed to create gift', 'error');
      }
    } catch {
      showToast('Network error while adding gift', 'error');
    }
  };

  const openEditModal = (gift: Gift) => {
    setEditingGift(gift);
    setEditFormData({
      name: gift.name,
      coinCost: gift.coinCost,
      assetPath: gift.assetPath || 'assets/image/cake.png',
      category: (gift.category as any) || 'Popular',
    });
  };

  const handleUpdateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGift) return;

    try {
      const res = await fetch(`/api/gifts/${editingGift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success && (data.gift || data.data)) {
        const updated = data.gift || data.data;
        setGifts((prev) => prev.map((g) => (g.id === editingGift.id ? updated : g)));
        setEditingGift(null);
        showToast(`Gift "${updated.name}" updated successfully`, 'success');
      } else {
        showToast(data.error || 'Failed to update gift', 'error');
      }
    } catch {
      showToast('Network error while updating gift', 'error');
    }
  };

  const handleDeleteGift = async (gift: Gift) => {
    const ok = await confirm({
      title: 'Delete Virtual Gift',
      message: `Are you sure you want to permanently remove "${gift.name}" (${gift.coinCost} coins)? It will immediately disappear from mobile call gifting trays.`,
      confirmText: 'Delete Gift',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/gifts/${gift.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setGifts((prev) => prev.filter((g) => g.id !== gift.id));
        showToast(`Gift "${gift.name}" deleted successfully`, 'success');
      } else {
        showToast(data.error || 'Failed to delete gift', 'error');
      }
    } catch {
      showToast('Network error while deleting gift', 'error');
    }
  };

  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch =
      gift.name.toLowerCase().includes(search.toLowerCase()) ||
      gift.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || gift.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const avgCost = gifts.length
    ? Math.round(gifts.reduce((sum, g) => sum + g.coinCost, 0) / gifts.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
            <GiftIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Virtual Monetization Assets</span>
          </div>
          <h1 className="text-2xl font-black text-white">Virtual Gifts Catalog</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure animated gifts that mobile callers can send to hosts during live 1-on-1 calls.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Virtual Gift</span>
        </button>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Total Virtual Gifts</div>
            <div className="text-2xl font-black text-white mt-1">{gifts.length}</div>
            <div className="text-[11px] text-purple-400 font-semibold mt-1">Ready in mobile trays</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <GiftIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Average Coin Cost</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{avgCost} 💎</div>
            <div className="text-[11px] text-amber-300 font-semibold mt-1">Across all tiers</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Luxury Tier Gifts</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {gifts.filter((g) => g.category?.toLowerCase() === 'luxury').length}
            </div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-1">High conversion VIP items</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['All', 'Popular', 'Luxury', 'Special'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gifts..."
            className="w-full bg-[#141320] text-xs text-white rounded-xl pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={`gift-skeleton-${idx}`}
              className="glass-card rounded-2xl p-5 border border-white/10 animate-pulse text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10" />
              <div className="w-3/4 h-3.5 mx-auto bg-white/10 rounded" />
              <div className="w-1/2 h-3 mx-auto bg-white/5 rounded" />
              <div className="w-16 h-4 mx-auto bg-white/10 rounded" />
            </div>
          ))
        ) : filteredGifts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 glass-card rounded-3xl border border-white/10">
            <GiftIcon className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <div className="text-base font-bold text-white">No Virtual Gifts Found</div>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {search || selectedCategory !== 'All'
                ? 'No gifts matched your search or category filter. Try clearing filters.'
                : 'Click "Add Virtual Gift" above to create your first animated gift.'}
            </p>
          </div>
        ) : (
          filteredGifts.map((gift) => (
            <div
              key={gift.id}
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-purple-500/40 transition group flex flex-col justify-between"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition shadow-inner">
                  {gift.name.includes('Diamond')
                    ? '💎'
                    : gift.name.includes('Heart')
                    ? '💖'
                    : gift.name.includes('Cake')
                    ? '🎂'
                    : gift.name.includes('Crown')
                    ? '👑'
                    : gift.name.includes('Rose')
                    ? '🌹'
                    : gift.name.includes('Rocket')
                    ? '🚀'
                    : gift.name.includes('Car')
                    ? '🏎️'
                    : '🎁'}
                </div>

                <h3 className="font-bold text-white text-sm truncate" title={gift.name}>
                  {gift.name}
                </h3>

                <div className="mt-1">
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      gift.category?.toLowerCase() === 'luxury'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : gift.category?.toLowerCase() === 'special'
                        ? 'bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {gift.category}
                  </span>
                </div>

                <div className="mt-2 text-sm font-black text-amber-400">{gift.coinCost} 💎</div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1 text-xs">
                <button
                  onClick={() => openEditModal(gift)}
                  className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteGift(gift)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                  aria-label="Delete Gift"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Gift Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add New Virtual Gift</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGift} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Gift Name</label>
                <input
                  type="text"
                  required
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  placeholder="e.g. Royal Crown, Golden Rose, Supercar"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Coin Cost (💎)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={addFormData.coinCost}
                  onChange={(e) => setAddFormData({ ...addFormData, coinCost: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Category</label>
                <select
                  value={addFormData.category}
                  onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value as any })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none focus:border-purple-500"
                >
                  <option value="Popular">Popular</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Asset Path / Icon</label>
                <input
                  type="text"
                  value={addFormData.assetPath}
                  onChange={(e) => setAddFormData({ ...addFormData, assetPath: e.target.value })}
                  placeholder="assets/image/crown.png"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition"
                >
                  Create Virtual Gift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Gift Modal */}
      {editingGift && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Virtual Gift</h2>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{editingGift.id}</p>
              </div>
              <button onClick={() => setEditingGift(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGift} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Gift Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Coin Cost (💎)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editFormData.coinCost}
                  onChange={(e) => setEditFormData({ ...editFormData, coinCost: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as any })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none focus:border-purple-500"
                >
                  <option value="Popular">Popular</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Asset Path</label>
                <input
                  type="text"
                  value={editFormData.assetPath}
                  onChange={(e) => setEditFormData({ ...editFormData, assetPath: e.target.value })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-mono text-[11px] focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGift(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
