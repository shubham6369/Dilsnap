'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CoinPackage, Gift } from '@/lib/types';

export default function MonetizationPage() {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'gifts'>('packages');

  // Modal State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [pkgFormData, setPkgFormData] = useState({
    name: '',
    coins: 100,
    bonusCoins: 20,
    priceInr: 99,
    isPopular: false,
  });

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftFormData, setGiftFormData] = useState({
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        fetchData();
      }
    } catch {
      alert('Failed to create package');
    }
  };

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
        fetchData();
      }
    } catch {
      alert('Failed to create gift');
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

        <div className="flex items-center gap-2">
          {activeTab === 'packages' ? (
            <button
              onClick={() => setIsPkgModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Coin Package</span>
            </button>
          ) : (
            <button
              onClick={() => setIsGiftModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Virtual Gift</span>
            </button>
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
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`glass-card rounded-2xl p-6 border transition relative overflow-hidden ${
                pkg.isPopular ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                  MOST POPULAR
                </div>
              )}

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

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Direct Cashfree Checkout</span>
                <span className="text-emerald-400 font-mono">Active in App</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Gifts */}
      {activeTab === 'gifts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="glass-card rounded-2xl p-5 border border-white/10 text-center hover:border-purple-500/40 transition group"
            >
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

              <div className="mt-3 text-sm font-black text-amber-400">{gift.coinCost} Coins</div>
            </div>
          ))}
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
                  <label className="block text-gray-400 font-semibold mb-1">Coins</label>
                  <input
                    type="number"
                    required
                    value={pkgFormData.coins}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, coins: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Bonus Coins</label>
                  <input
                    type="number"
                    value={pkgFormData.bonusCoins}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, bonusCoins: Number(e.target.value) })}
                    className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={pkgFormData.priceInr}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, priceInr: Number(e.target.value) })}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pop"
                  checked={pkgFormData.isPopular}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, isPopular: e.target.checked })}
                  className="rounded accent-[#FF2D55]"
                />
                <label htmlFor="pop" className="text-gray-300 font-medium">Highlight as "Most Popular" in App</label>
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95"
                >
                  Save Package
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
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
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
    </div>
  );
}
