import React, { useState, useEffect } from 'react';
import { Gift, Award, Send, Receipt, Shield, Sparkles, Flame, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { useApp } from '../../App';
import { Card, EmptyState, SkeletonLoader } from '../components/reusable';
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

  // Enforce consistent, safe credit resolution from active profile context
  const mentoraCredits = activeProfile.mentoraCredits !== undefined 
    ? Number(activeProfile.mentoraCredits) 
    : (activeProfile.mentora_credits !== undefined ? Number(activeProfile.mentora_credits) : 0);

  const isRetired = activeProfile.role === 'RETIRED_EMPLOYEE' || activeProfile.role === 'ADMIN' || activeProfile.role === 'SENIOR_EMPLOYEE';

  // Live states
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  // Wallet spend / transfer states
  const [transferredCredits, setTransferredCredits] = useState(0);

  // Transfer form state
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

  // Re-sync full authenticated profile from public.profiles
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

  // Derived wallet metrics
  const spentCredits = transactions.reduce((acc, tx) => acc + (tx.type === 'spend' ? tx.amount : 0), 0);
  const lifetimeEarned = mentoraCredits + spentCredits + transferredCredits;

  // Redeem logic invoking the secure database RPC transaction function
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
      // Execute transaction atomically on backend
      const { data, error } = await supabase.rpc('redeem_reward_item', {
        p_reward_id: reward.id
      });

      if (error) throw error;

      // Inspect response success explicitly
      if (data && data.success === true) {
        alert(`Success! Redeemed: ${data.reward_title}.\nCost: ${data.cost_paid} MC\nTransaction ID: ${data.redemption_id}\n\nYour reward voucher code has been dispatched to your employee email.`);
        
        // Re-sync wallet balances and logs from the DB
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

  // Transfer logic (keeps UI presentation)
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

    // Deduct context balance
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

    // Log transaction locally
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

  // Badges lists with status
  const BADGES = [
    { id: 'b1', name: '7-Day Learning Streak', desc: 'Maintained 7+ active daily streaks.', earned: activeProfile.streak >= 7, icon: '🔥' },
    { id: 'b2', name: 'Knowledge Contributor', desc: 'Provided helpful Q&A forum answers.', earned: true, icon: '💡' },
    { id: 'b3', name: 'Expert Mentor', desc: 'Verified 5+ peer operator answers.', earned: isRetired, icon: '🛠️' },
    { id: 'b4', name: 'SOP Master', desc: 'Read and certified 10+ SOP guides.', earned: true, icon: '📋' },
    { id: 'b5', name: 'AI Explorer', desc: 'Tried active ML use case simulators.', earned: true, icon: '🤖' },
    { id: 'b6', name: 'Training Champion', desc: 'Passed emergency live session quizzes.', earned: false, icon: '🎓' },
    { id: 'b7', name: 'Knowledge Legacy Champion', desc: 'Preserved vital factory override guides.', earned: isRetired, icon: '🏅' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gift className="text-primary" size={24} /> Rewards &amp; Wallet
          </h2>
          <p className="text-muted-foreground text-sm">Redeem Mentora Credits (MC) for merchandise, certifications, and benefits, or transfer to family members.</p>
        </div>
      </div>

      {/* Wallet Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 flex flex-col justify-between h-28 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Wallet Balance</span>
          <p className="text-2xl font-black text-foreground">{mentoraCredits.toLocaleString()} MC</p>
          <span className="text-[9px] text-muted-foreground">Available for immediate redemption</span>
        </Card>
        <Card className="p-5 flex flex-col justify-between h-28">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Lifetime Earned</span>
          <p className="text-2xl font-black text-foreground">{lifetimeEarned.toLocaleString()} MC</p>
          <span className="text-[9px] text-emerald-400 font-semibold">+100 MC this week</span>
        </Card>
        <Card className="p-5 flex flex-col justify-between h-28">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Redeemed Spent</span>
          <p className="text-2xl font-black text-foreground">{spentCredits.toLocaleString()} MC</p>
          <span className="text-[9px] text-muted-foreground">Exchanged in Rewards Store</span>
        </Card>
        <Card className="p-5 flex flex-col justify-between h-28">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Transferred Credits</span>
          <p className="text-2xl font-black text-foreground">{transferredCredits.toLocaleString()} MC</p>
          <span className="text-[9px] text-muted-foreground">Excluded from XP/Leaderboards</span>
        </Card>
      </div>

      {/* Wallet Transfer & Transaction history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: Transfer credits (Retired Employees only) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1">
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
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Receiver Full Name</label>
                <input
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={transferName}
                  onChange={e => setTransferName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Relationship</label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground outline-none"
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
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 shadow-lg shadow-primary/10"
              >
                Confirm Transfer
              </button>
            </form>
          </div>
        </div>

        {/* Right pane: Transaction history */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1">
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
                    <div key={tx.id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-200">
                      <div>
                        <p className="font-bold text-foreground leading-snug">{tx.description}</p>
                        <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                      </div>
                      <span className={`font-black text-sm ${tx.type === 'earn' ? 'text-emerald-400' : tx.type === 'spend' ? 'text-rose-400' : 'text-primary'}`}>
                        {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} MC
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-6">No transaction records found.</p>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic border-t border-border/50 pt-3 mt-4">
              Note: Credit transfers are audited by L&amp;D compliance guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Badges Cabinet Showcase */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
          Earned &amp; Locked Badges ({BADGES.filter(b => b.earned).length}/7)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {BADGES.map(badge => (
            <div
              key={badge.id}
              className={`border rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between items-center transition-all ${badge.earned ? 'bg-card border-primary/40' : 'bg-card/40 border-border opacity-65'}`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <div>
                <h4 className="text-[10px] font-black text-foreground leading-tight">{badge.name}</h4>
                <p className="text-[8px] text-muted-foreground mt-1 leading-normal">{badge.desc}</p>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${badge.earned ? 'bg-primary/20 text-primary border border-primary/25' : 'bg-muted text-muted-foreground border border-border'}`}>
                {badge.earned ? 'Earned' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Catalogue */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
          Rewards Catalogue Store
        </h3>
        
        {loadingCatalog ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonLoader className="h-48" />
            <SkeletonLoader className="h-48" />
            <SkeletonLoader className="h-48" />
          </div>
        ) : rewardsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {rewardsList.map(reward => {
              const isRedeeming = redeemingId === reward.id;
              const rewardCost = Number(reward.cost || 0);
              const isAvailable = reward.availability === true || String(reward.availability) === 'true';
              const hasBalance = mentoraCredits >= rewardCost;
              const hasRedeemed = !reward.is_repeatable && transactions.some((tx: any) => Number(tx.rewardId) === Number(reward.id));
              const isBtnDisabled = isRedeeming || !isAvailable || !hasBalance || hasRedeemed;

              return (
                <div key={reward.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-primary/20 transition-all h-48">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[8px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-black uppercase tracking-wider">
                        {reward.category}
                      </span>
                      <strong className="text-xs text-primary font-black font-mono">
                        💰 {rewardCost} MC
                      </strong>
                    </div>
                    <h4 className="text-xs font-black text-foreground mt-3 mb-1.5 leading-snug">{reward.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{reward.description}</p>
                  </div>
                  <button
                    disabled={isBtnDisabled}
                    onClick={() => handleRedeem(reward)}
                    className={`w-full font-bold py-2 rounded-xl text-xs transition-all mt-4 ${
                      isBtnDisabled 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-50'
                        : 'bg-primary hover:bg-primary/95 text-white active:scale-95'
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Catalog store is empty"
              message="Check back later for available merchandise and course vouchers."
            />
          </div>
        )}
      </div>
    </div>
  );
}
