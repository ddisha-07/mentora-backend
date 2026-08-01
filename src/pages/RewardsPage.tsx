import React, { useState, useEffect } from 'react';
import { Gift, Award, Send, Receipt, Shield, Sparkles, Flame, CheckCircle, RefreshCw, Layers, ChevronRight, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';
import { Card, EmptyState, SkeletonLoader, PageHeader } from '../components/reusable';
import { supabase } from '../lib/supabaseClient';

interface Transaction {
  id: string | number;
  rewardId?: number | string;
  description: string;
  amount: number;
  type: 'earn' | 'spend' | 'transfer';
  date: string;
}

export default function RewardsPage() {
  const { profile, setProfile, user } = useApp();

  const activeProfile = profile || {
    id: '',
    name: 'Learner',
    role: 'JUNIOR_EMPLOYEE',
    department: 'Software Engineering',
    mentoraCredits: 0,
    xp: 0,
    streak: 0
  };

  const mentoraCredits = activeProfile.mentoraCredits !== undefined 
    ? Number(activeProfile.mentoraCredits) 
    : (activeProfile.mentora_credits !== undefined ? Number(activeProfile.mentora_credits) : 0);

  const isRetired = activeProfile.role === 'RETIRED_EMPLOYEE' || activeProfile.role === 'ADMIN' || activeProfile.role === 'SENIOR_EMPLOYEE';

  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const [transferredCredits, setTransferredCredits] = useState(0);

  const [transferId, setTransferId] = useState('');
  const [transferName, setTransferName] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [relationship, setRelationship] = useState('Son');

  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('cost', { ascending: true });
      if (error) throw error;
      setRewardsList(data || []);
    } catch (err: any) {
      console.error("Error loading rewards:", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const fetchRedemptionHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('id, reward_id, cost_paid, redeemed_at, rewards (title)')
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });
      if (error) throw error;

      const mappedTx: Transaction[] = (data || []).map((r: any) => ({
        id: r.id,
        rewardId: r.reward_id,
        description: `Redeemed: ${r.rewards?.title || 'Unknown Reward'}`,
        amount: Number(r.cost_paid),
        type: 'spend',
        date: new Date(r.redeemed_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }));
      setTransactions(mappedTx);
    } catch (err: any) {
      console.error("Error loading redemption history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchUpdatedProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      if (data) {
        setProfile((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            mentoraCredits: data.mentora_credits,
            mentora_credits: data.mentora_credits,
            xp: data.xp,
            knowledgeCredits: data.knowledge_credits
          };
        });
      }
    } catch (err) {
      console.error("Error syncing profile:", err);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchRedemptionHistory();
  }, [user]);

  const spentCredits = transactions.reduce((acc, tx) => acc + (tx.type === 'spend' ? tx.amount : 0), 0);
  const lifetimeEarned = mentoraCredits + spentCredits + transferredCredits;

  const handleRedeem = async (reward: any) => {
    if (!user) {
      alert("You must be logged in to redeem rewards.");
      return;
    }
    const rewardCost = Number(reward.cost || 0);
    if (mentoraCredits < rewardCost) {
      alert(`Insufficient credits to redeem: ${reward.title}. Earn more credits by completing daily missions or learning paths!`);
      return;
    }

    setRedeemingId(reward.id);
    try {
      const { data, error } = await supabase.rpc('redeem_reward_item', {
        p_reward_id: reward.id
      });

      if (error) throw error;

      if (data && data.success === true) {
        alert(`Success! Redeemed: ${data.reward_title}.\nCost: ${data.cost_paid} MC\nTransaction ID: ${data.redemption_id}\n\nYour reward voucher code has been dispatched to your employee email.`);
        
        await fetchUpdatedProfile();
        await fetchRedemptionHistory();
      } else {
        const errMsg = data?.error || "Transaction declined by database constraints.";
        alert(`Redemption Failed: ${errMsg}`);
      }
    } catch (err: any) {
      console.error("Checkout transaction error:", err);
      alert(`Redemption Failed: ${err.message || "An unexpected error occurred during checkout."}`);
    } finally {
      setRedeemingId(null);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }
    if (mentoraCredits < amount) {
      alert('Insufficient balance to complete credit transfer.');
      return;
    }
    if (!transferId.trim() || !transferName.trim()) {
      alert('Please fill in receiver details.');
      return;
    }

    setProfile((prev: any) => {
      if (!prev) return prev;
      const nextBal = Math.max(0, (prev.mentoraCredits || prev.mentora_credits || 0) - amount);
      return {
        ...prev,
        mentoraCredits: nextBal,
        mentora_credits: nextBal
      };
    });

    setTransferredCredits(prev => prev + amount);

    const newTx: Transaction = {
      id: Date.now() + 1,
      description: `Transferred to ${transferName} (${relationship}) - ID: ${transferId}`,
      amount: amount,
      type: 'transfer',
      date: 'Just now'
    };
    setTransactions(prev => [newTx, ...prev]);

    alert(`Transfer Successful! Sent ${amount} Mentora Credits to family member: ${transferName} (ID: ${transferId}). Leaderboard ranks and XP remain unaffected.`);

    setTransferId('');
    setTransferName('');
    setTransferAmount('');
  };

  const BADGES = [
    { id: 'b1', name: '7-Day Learning Streak', desc: 'Maintained 7+ active daily streaks.', earned: activeProfile.streak >= 7, icon: '🔥' },
    { id: 'b2', name: 'Knowledge Contributor', desc: 'Provided helpful Q&A forum answers.', earned: true, icon: '💡' },
    { id: 'b3', name: 'Expert Mentor', desc: 'Verified 5+ peer operator answers.', earned: isRetired, icon: '🛠️' },
    { id: 'b4', name: 'SOP Master', desc: 'Read and certified 10+ SOP guides.', earned: true, icon: '📋' },
    { id: 'b5', name: 'AI Explorer', desc: 'Tried active ML use case simulators.', earned: true, icon: '🤖' },
    { id: 'b6', name: 'Training Champion', desc: 'Passed emergency live session quizzes.', earned: false, icon: '🎓' },
    { id: 'b7', name: 'Knowledge Legacy Champion', desc: 'Preserved vital factory override guides.', earned: isRetired, icon: '🏅' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Rewards & Wallet"
        description="Redeem Mentora Credits (MC) for training vouchers, merchandise, or transfer credentials to family members."
        breadcrumbs={[{ label: "Mentora" }, { label: "Rewards" }]}
      />

      {/* Wallet Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="premium-glass-card p-5 flex flex-col justify-between h-28 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Wallet Balance</span>
          <p className="text-2xl font-extrabold text-foreground">{mentoraCredits.toLocaleString()} MC</p>
          <span className="text-[9px] text-muted-foreground">Immediate checkout available</span>
        </div>
        <div className="premium-glass-card p-5 flex flex-col justify-between h-28">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lifetime Earned</span>
          <p className="text-2xl font-extrabold text-foreground">{lifetimeEarned.toLocaleString()} MC</p>
          <span className="text-[9px] text-emerald-400 font-semibold">+100 MC this week</span>
        </div>
        <div className="premium-glass-card p-5 flex flex-col justify-between h-28">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Voucher Spend</span>
          <p className="text-2xl font-extrabold text-foreground">{spentCredits.toLocaleString()} MC</p>
          <span className="text-[9px] text-muted-foreground">Exchanged in catalog</span>
        </div>
        <div className="premium-glass-card p-5 flex flex-col justify-between h-28">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Transferred Balance</span>
          <p className="text-2xl font-extrabold text-foreground">{transferredCredits.toLocaleString()} MC</p>
          <span className="text-[9px] text-muted-foreground">Excluded from XP ranks</span>
        </div>
      </div>

      {/* Transaction & Transfer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Transfer */}
        <div className="lg:col-span-1">
          <div className="premium-glass-card p-5 space-y-4 border border-border/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <Send size={14} className="text-primary" /> Transfer to Family Member
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Retired employee safety legacy program: Eligible retired specialists can transfer MC to family members employed at Tata Steel.
            </p>

            <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Receiver Employee ID</label>
                <input
                  required
                  placeholder="e.g. TS-4821"
                  value={transferId}
                  onChange={e => setTransferId(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/10 rounded-xl p-2.5 text-foreground outline-none focus:border-primary/45"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Receiver Full Name</label>
                <input
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={transferName}
                  onChange={e => setTransferName(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/10 rounded-xl p-2.5 text-foreground outline-none focus:border-primary/45"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Relationship</label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                  >
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Nephew">Nephew</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Credits Amount</label>
                  <input
                    required
                    type="number"
                    placeholder="MC"
                    value={transferAmount}
                    onChange={e => setTransferAmount(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 rounded-xl p-2.5 text-foreground outline-none focus:border-primary/45"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                Confirm Transfer
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Transactions */}
        <div className="lg:col-span-2">
          <div className="premium-glass-card p-5 space-y-4 h-full flex flex-col justify-between border border-border/10">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <Receipt size={14} className="text-primary" /> Wallet Transactions History
              </h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {loadingHistory ? (
                  <div className="space-y-2 py-4">
                    <SkeletonLoader />
                    <SkeletonLoader />
                  </div>
                ) : transactions.length > 0 ? (
                  transactions.map(tx => (
                    <div key={tx.id} className="p-3.5 bg-secondary/10 border border-border/5 rounded-xl flex items-center justify-between text-xs transition-all">
                      <div>
                        <p className="font-bold text-foreground leading-snug">{tx.description}</p>
                        <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${tx.type === 'earn' ? 'text-emerald-400' : tx.type === 'spend' ? 'text-rose-400' : 'text-primary'}`}>
                        {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} MC
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-8">No transaction records found.</p>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic border-t border-border/10 pt-3 mt-4">
              Compliance reminder: Transfer histories are audited periodically according to factory regulations.
            </p>
          </div>
        </div>

      </div>

      {/* Badges Cabinet Showcase */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Earned &amp; Locked Badges ({BADGES.filter(b => b.earned).length}/7)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {BADGES.map(badge => (
            <div
              key={badge.id}
              className={`premium-glass-card p-4 text-center space-y-3 flex flex-col justify-between items-center transition-all border ${
                badge.earned ? 'border-primary/20 bg-primary/5' : 'border-border/5 opacity-65'
              }`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <div>
                <h4 className="text-[10px] font-bold text-foreground leading-tight">{badge.name}</h4>
                <p className="text-[8px] text-muted-foreground mt-1.5 leading-normal">{badge.desc}</p>
              </div>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                badge.earned ? 'bg-primary/25 text-primary border border-primary/20' : 'bg-secondary/40 text-muted-foreground border border-border/10'
              }`}>
                {badge.earned ? 'Earned' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Rewards Catalogue Store
        </h3>
        
        {loadingCatalog ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonLoader className="h-48" />
            <SkeletonLoader className="h-48" />
            <SkeletonLoader className="h-48" />
          </div>
        ) : rewardsList.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {rewardsList.map(reward => {
              const isRedeeming = redeemingId === reward.id;
              const rewardCost = Number(reward.cost || 0);
              const isAvailable = reward.availability === true || String(reward.availability) === 'true';
              const hasBalance = mentoraCredits >= rewardCost;
              const hasRedeemed = !reward.is_repeatable && transactions.some((tx: any) => Number(tx.rewardId) === Number(reward.id));
              const isBtnDisabled = isRedeeming || !isAvailable || !hasBalance || hasRedeemed;

              return (
                <motion.div
                  key={reward.id}
                  variants={itemVariants}
                  className="premium-glass-card p-5 flex flex-col justify-between hover:scale-[1.01] transition-all h-48 border border-border/10"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[8px] px-2 py-0.5 rounded-md bg-secondary/35 border border-border/10 text-muted-foreground font-bold uppercase tracking-wider">
                        {reward.category}
                      </span>
                      <strong className="text-xs text-primary font-bold font-mono">
                        💰 {rewardCost} MC
                      </strong>
                    </div>
                    <h4 className="text-xs font-bold text-foreground mt-3 mb-1.5 leading-snug" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {reward.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{reward.description}</p>
                  </div>
                  <button
                    disabled={isBtnDisabled}
                    onClick={() => handleRedeem(reward)}
                    className={`w-full font-bold py-2 rounded-xl text-xs transition-all mt-4 cursor-pointer ${
                      isBtnDisabled 
                        ? 'bg-secondary/40 text-muted-foreground cursor-not-allowed border border-border/10 opacity-50'
                        : 'bg-primary hover:bg-primary/95 text-white active:scale-95 shadow-md shadow-primary/20'
                    }`}
                  >
                    {!isAvailable 
                      ? 'Unavailable'
                      : hasRedeemed 
                        ? 'Already Redeemed'
                        : !hasBalance
                          ? 'Insufficient Credits'
                          : isRedeeming 
                            ? 'Processing Checkout...' 
                            : 'Redeem Reward'
                    }
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Catalog store is empty"
              message="Check back later for available merchandise and course vouchers."
            />
          </div>
        )}
      </div>

    </motion.div>
  );
}
