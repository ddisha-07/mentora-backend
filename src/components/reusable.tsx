import React from 'react';
import {
  Award,
  CheckCircle,
  Calendar,
  Clock,
  Star,
  Users,
  AlertTriangle,
  RefreshCw,
  Flame,
  Zap,
  BookOpen,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLES_CONFIG } from '../config/roles';

// ----------------------------------------------------
// 1. STAT CARD
// ----------------------------------------------------
export function StatCard({
  label,
  value,
  delta,
  icon,
  className = ''
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 flex items-center justify-between ${className}`}>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        {delta && (
          <p className="text-[10px] text-emerald-400 font-medium mt-1">
            {delta}
          </p>
        )}
      </div>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. PROGRESS CARD
// ----------------------------------------------------
export function ProgressCard({
  title,
  value,
  max = 100,
  description,
  className = ''
}: {
  title: string;
  value: number;
  max?: number;
  description?: string;
  className?: string;
}) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <span className="text-xs font-semibold text-primary">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, boxShadow: '0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)' }}
        />
      </div>
      {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}

// ----------------------------------------------------
// 3. MISSION CARD
// ----------------------------------------------------
export function MissionCard({
  title,
  description,
  rewardType,
  rewardAmount,
  estimatedTime,
  status,
  dueDate,
  onStart
}: {
  title: string;
  description: string;
  rewardType: 'xp' | 'credits' | 'both';
  rewardAmount: number;
  estimatedTime: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  dueDate: string;
  onStart?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-primary/20 transition-all">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <StatusBadge status={status} />
          <span className="text-[10px] text-muted-foreground font-mono">{dueDate}</span>
        </div>
        <h4 className="text-sm font-bold text-foreground mb-1 leading-snug">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>
      </div>
      <div className="border-t border-border/50 pt-4 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <XPBadge amount={rewardAmount} />
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Clock size={12} /> {estimatedTime}
          </span>
        </div>
        {status === 'assigned' && onStart && (
          <button
            onClick={onStart}
            className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-full transition-all active:scale-95"
          >
            Start
          </button>
        )}
        {status === 'in_progress' && (
          <button className="text-xs font-semibold text-primary border border-primary/20 bg-primary/5 px-3 py-1 rounded-full cursor-default">
            In Progress
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. TRAINING CARD
// ----------------------------------------------------
export function TrainingCard({
  title,
  trainer,
  description,
  date,
  time,
  duration,
  status,
  participants,
  recordingAvailable,
  onJoin
}: {
  title: string;
  trainer: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: number;
  recordingAvailable: boolean;
  onJoin?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-primary/20 transition-all">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <StatusBadge status={status} />
          <span className="text-xs text-primary font-semibold flex items-center gap-1">
            <Calendar size={13} /> {date}
          </span>
        </div>
        <h4 className="text-sm font-bold text-foreground mb-1 leading-snug">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>
        <div className="text-[11px] text-muted-foreground space-y-1 mb-4">
          <p>
            <strong className="text-foreground">Trainer:</strong> {trainer}
          </p>
          <p>
            <strong className="text-foreground">Time:</strong> {time} ({duration})
          </p>
        </div>
      </div>
      <div className="border-t border-border/50 pt-4 flex items-center justify-between mt-auto">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
          <Users size={12} /> {participants} attending
        </span>
        {status === 'upcoming' && onJoin && (
          <button
            onClick={onJoin}
            className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-full transition-all active:scale-95"
          >
            Register
          </button>
        )}
        {status === 'completed' && recordingAvailable && (
          <button className="text-xs font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3.5 py-1.5 rounded-full transition-all">
            Watch Recording
          </button>
        )}
        {status === 'live' && (
          <button className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3.5 py-1.5 rounded-full animate-pulse transition-all">
            Join Live
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. COURSE CARD
// ----------------------------------------------------
export function CourseCard({
  title,
  duration,
  rating,
  progress,
  thumbnail,
  category,
  onNavigate
}: {
  title: string;
  duration: string;
  rating: number;
  progress?: number;
  thumbnail: string;
  category: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      onClick={onNavigate}
      className={`bg-card border border-border rounded-2xl overflow-hidden group transition-all duration-300 ${onNavigate ? 'cursor-pointer hover:border-primary/30' : ''}`}
    >
      <div className="h-40 overflow-hidden relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-muted"
        />
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-foreground">
          {category}
        </div>
      </div>
      <div className="p-5">
        <h4 className="text-sm font-bold text-foreground mb-1 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 mb-4">
          <span className="flex items-center gap-1"><Clock size={12} /> {duration}</span>
          <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {rating}</span>
        </div>
        {progress !== undefined && progress > 0 ? (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <span className="text-xs text-primary font-semibold group-hover:underline">Start Course &rarr;</span>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 6. SKILL PROGRESS
// ----------------------------------------------------
export function SkillProgress({
  name,
  category,
  progress,
  proficiency
}: {
  name: string;
  category: string;
  progress: number;
  proficiency: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="text-sm font-semibold text-foreground leading-tight">{name}</h5>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{category}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
          {proficiency}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-semibold text-foreground min-w-[30px] text-right">{progress}%</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 7. USER AVATAR WITH FALLBACK
// ----------------------------------------------------
export function UserAvatar({
  src,
  name,
  size = 'md',
  className = ''
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover bg-muted border border-border flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-primary/15 border border-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}

// ----------------------------------------------------
// 8. ROLE BADGE
// ----------------------------------------------------
export function RoleBadge({ role }: { role: UserRole }) {
  const metadata = ROLES_CONFIG[role] || { displayName: role };
  const badgeColors: Record<UserRole, string> = {
    SHOP_FLOOR_WORKER: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    JUNIOR_EMPLOYEE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    SENIOR_EMPLOYEE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    OFFICER_MANAGER: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    RETIRED_EMPLOYEE: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${badgeColors[role] || 'bg-muted text-muted-foreground'}`}
    >
      {metadata.displayName}
    </span>
  );
}

// ----------------------------------------------------
// 9. XP BADGE
// ----------------------------------------------------
export function XPBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
      <Zap size={11} className="fill-primary" /> {amount} XP
    </span>
  );
}

// ----------------------------------------------------
// 10. CREDIT BADGE
// ----------------------------------------------------
export function CreditBadge({ amount, type = 'mentora' }: { amount: number; type?: 'knowledge' | 'mentora' }) {
  const isKnowledge = type === 'knowledge';
  const bg = isKnowledge ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-primary/10 text-primary border-primary/20';
  const label = isKnowledge ? 'KC' : 'MC';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-md ${bg}`}>
      <Award size={11} /> {amount} {label}
    </span>
  );
}

// ----------------------------------------------------
// 11. STREAK INDICATOR
// ----------------------------------------------------
export function StreakIndicator({ streak }: { streak: number }) {
  if (streak === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
      <Flame size={12} className="fill-orange-400" /> {streak} Days
    </span>
  );
}

// ----------------------------------------------------
// 12. STATUS BADGE
// ----------------------------------------------------
export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    live: 'bg-red-500/10 text-red-400 border-red-500/20',
    open: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${colorMap[status] || 'bg-muted text-muted-foreground'}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

// ----------------------------------------------------
// 13. ANSWER TYPE BADGE
// ----------------------------------------------------
export function AnswerTypeBadge({ type }: { type: 'standard' | 'expert' | 'verified' }) {
  const labels = {
    standard: 'Peer Answer',
    expert: 'Expert Response',
    verified: 'Verified Solution'
  };
  const colors = {
    standard: 'bg-muted text-muted-foreground border-border',
    expert: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}

// ----------------------------------------------------
// 14. EMPTY STATE
// ----------------------------------------------------
export function EmptyState({
  title,
  message,
  icon,
  actionText,
  onAction
}: {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="border border-border border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {icon || <HelpCircle size={20} />}
      </div>
      <h4 className="text-sm font-bold text-foreground mb-1 leading-snug">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed mb-6">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl transition-all active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 15. LOADING STATE
// ----------------------------------------------------
export function LoadingState({ message = 'Loading details...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      <span className="text-xs text-muted-foreground font-medium animate-pulse">{message}</span>
    </div>
  );
}

// ----------------------------------------------------
// 16. ERROR STATE
// ----------------------------------------------------
export function ErrorState({
  message = 'An error occurred while loading content.',
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-6">
      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-3">
        <ShieldAlert size={18} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 17. SKELETON LOADER
// ----------------------------------------------------
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card/50 border border-border/50 rounded-2xl p-5 space-y-3 animate-pulse ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-muted rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted rounded w-1/3" />
          <div className="h-2.5 bg-muted rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}
