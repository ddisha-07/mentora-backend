import React, { useState, useEffect } from 'react';
import { Gift, Award, CheckCircle } from 'lucide-react';
import { mockService } from '../services/mockData';
import { Reward } from '../types';
import { CreditBadge } from '../components/reusable';

export default function RewardsPage({ mentoraCredits = 450 }: { mentoraCredits?: number }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockService
      .fetchRewards()
      .then(data => {
        setRewards(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRedeem = (reward: Reward) => {
    if (mentoraCredits < reward.cost) {
      alert(`Insufficient credits to redeem: ${reward.title}`);
      return;
    }
    alert(`Success! Redeemed: ${reward.title}. Check your registered email for voucher instructions.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gift className="text-primary" size={24} /> Rewards Store
          </h2>
          <p className="text-muted-foreground text-sm">Redeem your Mentora Credits (MC) for merchandise, certifications, and expert consultation sessions.</p>
        </div>
        <div className="bg-card border border-border rounded-2xl px-5 py-3 flex items-center gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Your Balance</p>
            <p className="text-base font-bold text-foreground mt-0.5">{mentoraCredits} MC</p>
          </div>
          <Award className="text-primary" size={22} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border border-t-primary border-r-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-primary/20 transition-all">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">{reward.category}</span>
                <h4 className="text-sm font-bold text-foreground mt-3 mb-1 leading-snug">{reward.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{reward.description}</p>
              </div>
              <div className="border-t border-border/50 pt-4 flex items-center justify-between mt-auto">
                <CreditBadge amount={reward.cost} type="mentora" />
                <button
                  onClick={() => handleRedeem(reward)}
                  className="text-xs font-semibold text-white bg-primary hover:bg-primary/95 px-3.5 py-1.5 rounded-full transition-all active:scale-95"
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
