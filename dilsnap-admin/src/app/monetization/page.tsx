'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  Gift as GiftIcon,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle,
  X,
  CreditCard,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CoinPackage, Gift } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmModal';

export default function MonetizationPage() {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'gifts'>('packages');

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Create Package Modal State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [pkgFormData, setPkgFormData] = useState({
    name: '',
    coins: 100,
    bonusCoins: 20,
    priceInr: 99,
    isPopular: false,
  });

  // Edit Package Modal State
  const [editingPkg, setEditingPkg] = useState<CoinPackage | null>(null);
  const [editPkgFormData, setEditPkgFormData] = useState({
    name: '',
    coins: 100,
    bonusCoins: 20,
    priceInr: 99,
    isPopular: false,
  });

  // Create Gift Modal State
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftFormData, setGiftFormData] = useState({
    name: '',
    coinCost: 50,
    assetPath: 'assets/image/cake.png',
    category: 'Luxury' as 'Popular' | 'Luxury' | 'Special',
  });

  // Edit Gift Modal State
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [editGiftFormData, setEditGiftFormData] = useState({
    name: '',
    coinCost: 50,
    assetPath: 'assets/image/cake.png',
    category: 'Luxury' as 'Popular' | 'Luxury' | 'Special',
  });

  const fetchData = async () => {
    try {
      const [resPkg, resGifts] = await Promise.all([
        fetch('/api/packages').then((r) => r.json()),
        fetch('/api/gifts').then((r) => r.json()),
      ]);
      if (resPkg.success) setPackages(resPkg.data);
      if (resGifts.success) setGifts(resGifts.data);
    } catch (e) {
      console.error(e);
      showToast('Failed to fetch monetization data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Package Actions ---
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkgFormData),
      });
      const data = await res.json();
      if (data.success) {
        setIsPkgModalOpen(false);
        setPkgFormData({
          name: '',
          coins: 100,
          bonusCoins: 20,
          priceInr: 99,
          isPopular: false,
        });
        showToast('Coin package created successfully', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Failed to create package', 'error');
      }
    } catch {
      showToast('Network error while creating package', 'error');
    }
  };

  const openEditPkgModal = (pkg: CoinPackage) => {
    setEditingPkg(pkg);
    setEditPkgFormData({
      name: pkg.name,
      coins: pkg.coins,
      bonusCoins: pkg.bonusCoins,
      priceInr: pkg.priceInr,
      isPopular: Boolean(pkg.isPopular),
    });
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    try {
      const res = await fetch(`/api/packages/${editingPkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPkgFormData),
      });
      const data = await res.json();
      if (data.success && (data.package || data.data)) {
        const updated = data.package || data.data;
        setPackages((prev) => prev.map((p) => (p.id === editingPkg.id ? updated : p)));
        setEditingPkg(null);
        showToast(`Updated "${updated.name}" package successfully`, 'success');
      } else {
        showToast(data.error || 'Failed to update package', 'error');
      }
    } catch {
      showToast('Network error while updating package', 'error');
    }
  };

  const handleDeletePackage = async (pkg: CoinPackage) => {
    const ok = await confirm({
      title: 'Delete Coin Package',
      message: `Are you sure you want to permanently delete "${pkg.name}" (₹${pkg.priceInr} / ${pkg.coins + pkg.bonusCoins} coins)? This package will no longer be available in the app.`,
      confirmText: 'Delete Package',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
        showToast(`Deleted "${pkg.name}" package`, 'success');
      } else {
        showToast(data.error || 'Failed to delete package', 'error');
      }
    } catch {
      showToast('Network error while deleting package', 'error');
    }
  };

  // --- Gift Actions ---
  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftFormData),
      });
      const data = await res.json();
      if (data.success) {
        setIsGiftModalOpen(false);
        setGiftFormData({
          name: '',
          coinCost: 50,
          assetPath: 'assets/image/cake.png',
          category: 'Luxury',
        });
        showToast('Virtual gift created successfully', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Failed to create gift', 'error');
      }
    } catch {
      showToast('Network error while creating gift', 'error');
    }
  };

  const openEditGiftModal = (gift: Gift) => {
    setEditingGift(gift);
    setEditGiftFormData({
      name: gift.name,
      coinCost: gift.coinCost,
      assetPath: gift.assetPath || 'assets/image/cake.png',
      category: (gift.category as any) || 'Luxury',
    });
  };

  const handleUpdateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGift) return;

    try {
      const res = await fetch(`/api/gifts/${editingGift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGiftFormData),
      });
      const data = await res.json();
      if (data.success && (data.gift || data.data)) {
        const updated = data.gift || data.data;
        setGifts((prev) => prev.map((g) => (g.id === editingGift.id ? updated : g)));
        setEditingGift(null);
        showToast(`Updated "${updated.name}" gift successfully`, 'success');
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
      message: `Are you sure you want to delete virtual gift "${gift.name}" (${gift.coinCost} coins)? Callers will no longer be able to send it.`,
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
        showToast(`Deleted "${gift.name}" gift`, 'success');
      } else {
        showToast(data.error || 'Failed to delete gift', 'error');
      }
    } catch {
      showToast('Network error while deleting gift', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Monetization: Packages & Gifts</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure in-app coin recharge packages (Cashfree UPI pricing) and virtual gifts with coin costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'packages' ? (
            <button
              onClick={() => setIsPkgModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Coin Package</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/gifts"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition"
              >
                <span>Full Gifts Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsGiftModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Virtual Gift</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'packages'
              ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Coin Packages ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'gifts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <GiftIcon className="w-4 h-4" />
          <span>Virtual Gifts ({gifts.length})</span>
        </button>
      </div>

      {/* Tab 1: Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`pkg-skel-${idx}`}
                className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="w-3/4 h-4 bg-white/10 rounded" />
                    <div className="w-1/3 h-3 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-20 bg-white/5 rounded-xl" />
                <div className="h-8 bg-white/10 rounded-xl" />
              </div>
            ))
          ) : packages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 glass-card rounded-2xl border border-white/10">
              <Coins className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">No Coin Packages Configured</div>
              <p className="text-xs text-gray-400 mt-1">Create your first coin package for mobile user recharges.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`glass-card rounded-2xl p-6 border transition relative overflow-hidden flex flex-col justify-between ${
                  pkg.isPopular ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl">
                      💎
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                      <div className="text-xs text-emerald-400 font-semibold">₹{pkg.priceInr} INR</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Base Coins:</span>
                      <span className="font-bold text-white">{pkg.coins} 💎</span>
                    </div>
                    {pkg.bonusCoins > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Free Bonus:</span>
                        <span className="font-bold">+{pkg.bonusCoins} 💎</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                      <span>Total Delivered:</span>
                      <span className="text-amber-300">{pkg.coins + pkg.bonusCoins} 💎</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-mono text-[11px]">Active in App</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditPkgModal(pkg)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg)}
                      className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      aria-label="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Gifts */}
      {activeTab === 'gifts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`gift-skel-${idx}`}
                className="glass-card rounded-2xl p-5 border border-white/10 animate-pulse text-center space-y-3"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10" />
                <div className="w-3/4 h-3.5 mx-auto bg-white/10 rounded" />
                <div className="w-1/2 h-3 mx-auto bg-white/5 rounded" />
              </div>
            ))
          ) : gifts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 glass-card rounded-2xl border border-white/10">
              <GiftIcon className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">No Virtual Gifts Configured</div>
              <p className="text-xs text-gray-400 mt-1">Add animated gifts that callers can send to hosts during calls.</p>
            </div>
          ) : (
            gifts.map((gift) => (
              <div
                key={gift.id}
                className="glass-card rounded-2xl p-5 border border-white/10 text-center hover:border-purple-500/40 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                    {gift.name.includes('Diamond')
                      ? '💎'
                      : gift.name.includes('Heart')
                      ? '💖'
                      : gift.name.includes('Cake')
                      ? '🎂'
                      : gift.name.includes('Crown')
                      ? '👑'
                      : '🎁'}
                  </div>

                  <h3 className="font-bold text-white text-sm">{gift.name}</h3>
                  <div className="inline-block mt-1 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                    {gift.category}
                  </div>

                  <div className="mt-2 text-sm font-black text-amber-400">{gift.coinCost} Coins</div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditGiftModal(gift)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[10px] font-semibold flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteGift(gift)}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                    aria-label="Delete Gift"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Package Creation Modal */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">New Coin Recharge Package</h2>
              <button onClick={() => setIsPkgModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={pkgFormData.name}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, name: e.target.value })}
                  placeholder="e.g. Mega Saver Pack"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Base Coins (💎)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pkgFormData.coins}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, coins: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Bonus Coins (💎)</label>
                  <input
                    type="number"
                    min={0}
                    value={pkgFormData.bonusCoins}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, bonusCoins: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none text-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={pkgFormData.priceInr}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, priceInr: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={pkgFormData.isPopular}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, isPopular: e.target.checked })}
                  className="rounded border-white/20 bg-[#141320] text-[#FF2D55] focus:ring-0"
                />
                <label htmlFor="isPopular" className="text-gray-300 font-medium cursor-pointer">
                  Tag as &ldquo;Most Popular&rdquo; package in app
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPkgModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white font-bold shadow-lg shadow-[#FF2D55]/30"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Coin Package</h2>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{editingPkg.id}</p>
              </div>
              <button onClick={() => setEditingPkg(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={editPkgFormData.name}
                  onChange={(e) => setEditPkgFormData({ ...editPkgFormData, name: e.target.value })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Base Coins (💎)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editPkgFormData.coins}
                    onChange={(e) => setEditPkgFormData({ ...editPkgFormData, coins: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Bonus Coins (💎)</label>
                  <input
                    type="number"
                    min={0}
                    value={editPkgFormData.bonusCoins}
                    onChange={(e) => setEditPkgFormData({ ...editPkgFormData, bonusCoins: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none text-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editPkgFormData.priceInr}
                  onChange={(e) => setEditPkgFormData({ ...editPkgFormData, priceInr: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsPopular"
                  checked={editPkgFormData.isPopular}
                  onChange={(e) => setEditPkgFormData({ ...editPkgFormData, isPopular: e.target.checked })}
                  className="rounded border-white/20 bg-[#141320] text-[#FF2D55] focus:ring-0"
                />
                <label htmlFor="editIsPopular" className="text-gray-300 font-medium cursor-pointer">
                  Tag as &ldquo;Most Popular&rdquo; package in app
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white font-bold shadow-lg shadow-[#FF2D55]/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Creation Modal */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add Virtual Gift</h2>
              <button onClick={() => setIsGiftModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGift} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Gift Name</label>
                <input
                  type="text"
                  required
                  value={giftFormData.name}
                  onChange={(e) => setGiftFormData({ ...giftFormData, name: e.target.value })}
                  placeholder="e.g. Sports Car"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Coin Cost (💎)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={giftFormData.coinCost}
                  onChange={(e) => setGiftFormData({ ...giftFormData, coinCost: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Category</label>
                <select
                  value={giftFormData.category}
                  onChange={(e) => setGiftFormData({ ...giftFormData, category: e.target.value as any })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                >
                  <option value="Popular">Popular</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white font-bold shadow-lg shadow-purple-600/30"
                >
                  Add Gift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Edit Modal */}
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
                  value={editGiftFormData.name}
                  onChange={(e) => setEditGiftFormData({ ...editGiftFormData, name: e.target.value })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Coin Cost (💎)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editGiftFormData.coinCost}
                  onChange={(e) => setEditGiftFormData({ ...editGiftFormData, coinCost: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Category</label>
                <select
                  value={editGiftFormData.category}
                  onChange={(e) => setEditGiftFormData({ ...editGiftFormData, category: e.target.value as any })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                >
                  <option value="Popular">Popular</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Special">Special</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white font-bold shadow-lg shadow-purple-600/30"
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
