'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Coins,
  Ban,
  Plus,
  Minus,
  CheckCircle,
  X,
  CreditCard,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { User } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [walletAmount, setWalletAmount] = useState(100);
  const [walletAction, setWalletAction] = useState<'add' | 'deduct'>('add');
  const [walletReason, setWalletReason] = useState('Admin Promotional Grant');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch('/api/users/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: walletAmount,
          action: walletAction,
          reason: walletReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsWalletModalOpen(false);
        showToast(
          `Successfully ${walletAction === 'add' ? 'credited' : 'deducted'} ${walletAmount} 💎 for ${selectedUser.name}`,
          'success'
        );
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to update user wallet', 'error');
      }
    } catch {
      showToast('Network error while updating user wallet', 'error');
    }
  };

  const handleToggleUserBan = async (user: User) => {
    const nextBan = !user.isBanned;
    const ok = await confirm({
      title: nextBan ? 'Suspend User Access' : 'Restore User Access',
      message: `Are you sure you want to ${nextBan ? 'SUSPEND' : 'RESTORE'} user "${user.name}" (${user.mobile})? ${
        nextBan
          ? 'Suspended callers will immediately be blocked from initiating calls, recharging coins, or sending gifts.'
          : 'Restoring access will allow the caller to resume normal app usage.'
      }`,
      confirmText: nextBan ? 'Suspend User' : 'Restore User',
      variant: nextBan ? 'danger' : 'primary',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleBan' }),
      });
      const data = await res.json();
      if (data.success && (data.data || data.user)) {
        const updated = data.data || data.user;
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
        showToast(
          nextBan ? `User ${user.name} has been suspended.` : `User ${user.name} has been restored.`,
          nextBan ? 'warning' : 'success'
        );
      } else {
        showToast(data.error || 'Failed to update ban status', 'error');
      }
    } catch {
      showToast('Network error while updating ban status', 'error');
    }
  };

  const openWalletModal = (user: User) => {
    setSelectedUser(user);
    setWalletAmount(100);
    setWalletAction('add');
    setWalletReason('Admin Reward Grant');
    setIsWalletModalOpen(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Users & Wallet Controls</h1>
          <p className="text-xs text-gray-400 mt-1">
            Audit registered callers, grant or deduct wallet coins, view lifetime purchases, and manage suspensions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-white/10">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400">Total User Coins:</span>
            <span className="font-bold text-amber-400">
              {users.reduce((acc, u) => acc + u.coinBalance, 0).toLocaleString()} 💎
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, mobile number (+91...)..."
            className="w-full bg-[#141320] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#FF2D55]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Coin Balance</th>
                <th className="py-3 px-4">Total Calls</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3.5 bg-white/10 rounded" />
                          <div className="w-16 h-2.5 bg-white/5 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="w-24 h-3 bg-white/10 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-16 h-3 bg-white/10 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-14 h-3 bg-white/10 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-16 h-3 bg-white/10 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-20 h-5 bg-white/10 rounded-full" /></td>
                    <td className="py-4 px-4 text-right"><div className="w-24 h-7 bg-white/10 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-500" />
                      <div className="text-sm font-semibold text-gray-300">No callers found</div>
                      <div className="text-xs text-gray-400">No users match &ldquo;{search}&rdquo;. Try another search term.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{user.name}</div>
                          <div className="text-[10px] text-gray-400">Joined: {user.joinedDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{user.mobile}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        {user.coinBalance} 💎
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-semibold">{user.totalCalls} calls</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{user.totalSpentInr}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.isBanned
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {user.isBanned ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openWalletModal(user)}
                          className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/30 transition flex items-center gap-1"
                        >
                          <Coins className="w-3 h-3" />
                          <span>Adjust Coins</span>
                        </button>

                        <button
                          onClick={() => handleToggleUserBan(user)}
                          className={`p-1.5 rounded-lg border transition ${
                            user.isBanned
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/25'
                          }`}
                          title={user.isBanned ? 'Reactivate User' : 'Suspend User'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Coins Modal */}
      {isWalletModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Adjust User Coins</h2>
                <p className="text-xs text-gray-400">{selectedUser.name} ({selectedUser.mobile})</p>
              </div>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustCoins} className="space-y-4 text-xs">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-gray-400">Current Balance:</span>
                <span className="text-sm font-black text-amber-400">{selectedUser.coinBalance} 💎</span>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWalletAction('add')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                      walletAction === 'add'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Coins</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAction('deduct')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                      walletAction === 'deduct'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    <span>Deduct Coins</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Number of Coins (💎)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#FF2D55] outline-none text-sm font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  placeholder="e.g. VIP promotion bonus, refund compensation"
                  className="w-full bg-[#141320] text-white rounded-xl px-3.5 py-2.5 border border-white/10 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] text-white font-bold shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
