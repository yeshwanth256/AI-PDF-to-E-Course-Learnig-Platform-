import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  Trophy, Flame, CheckCircle2, Circle, Sparkles, Gift, Clock, Zap, Code2, Award, 
  ChevronRight, Volume2, VolumeX, ShieldAlert
} from 'lucide-react';

interface ChallengeHubProps {
  stats: UserStats;
  token: string | null;
  onUpdateStats: (newStats: UserStats) => void;
  compact?: boolean;
}

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'daily' | 'weekly';
  checkCompleted: (stats: UserStats) => boolean;
  icon: React.ReactNode;
}

export function ChallengeHub({ stats, token, onUpdateStats, compact = false }: ChallengeHubProps) {
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize completed daily/weekly arrays safely
  const completedDaily = stats.completedDaily || [];
  const completedWeekly = stats.completedWeekly || [];

  // Define our 100% functional, real-time checked challenges and quests!
  const challenges: ChallengeItem[] = [
    // DAILY CHALLENGES
    {
      id: 'daily-study',
      title: 'Mindful Session',
      description: 'Study for at least 5 minutes today on the active timer',
      xpReward: 20,
      type: 'daily',
      icon: <Clock className="w-3.5 h-3.5 text-sky-400" />,
      checkCompleted: (s) => (s.dailyStudyProgress || 0) >= 300,
    },
    {
      id: 'daily-dsa',
      title: 'DSA Explorer',
      description: 'Solve at least 1 DSA practice problem in the Arena',
      xpReward: 30,
      type: 'daily',
      icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" />,
      checkCompleted: (s) => (s.completedDsa || []).length >= 1,
    },
    {
      id: 'daily-xp',
      title: 'XP Optimizer',
      description: 'Accumulate a career level with at least 150 total XP',
      xpReward: 25,
      type: 'daily',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      checkCompleted: (s) => s.xpPoints >= 150,
    },
    // WEEKLY QUESTS
    {
      id: 'weekly-dsa-expert',
      title: 'Algorithmic Overlord',
      description: 'Solve 3 or more DSA challenges in the Practice Arena',
      xpReward: 75,
      type: 'weekly',
      icon: <Award className="w-4 h-4 text-emerald-400" />,
      checkCompleted: (s) => (s.completedDsa || []).length >= 3,
    },
    {
      id: 'weekly-streak',
      title: 'Consistency King',
      description: 'Maintain a study streak of 3 or more days',
      xpReward: 60,
      type: 'weekly',
      icon: <Flame className="w-4 h-4 text-orange-400 animate-pulse" />,
      checkCompleted: (s) => s.learningStreak >= 3,
    },
    {
      id: 'weekly-badge',
      title: 'Skill Forge Specialist',
      description: 'Earn at least 1 professional credential badge',
      xpReward: 100,
      type: 'weekly',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      checkCompleted: (s) => s.badges.length >= 1,
    }
  ];

  // Synthesizer Audio Trigger
  const playClaimChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Sci-Fi high-tech double-chime + riser
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.07 + 0.3);
        
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.3);
      });
    } catch (e) {
      // Audio block fallback
    }
  };

  const handleClaimReward = async (item: ChallengeItem) => {
    if (!token) return;
    setIsClaiming(item.id);
    try {
      const res = await fetch('/api/stats/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: item.type,
          id: item.id,
          title: item.title,
          xpReward: item.xpReward
        })
      });

      if (res.ok) {
        const updatedStats = await res.json();
        onUpdateStats(updatedStats);
        playClaimChime();
      }
    } catch (err) {
      console.error('Failed to claim challenge reward:', err);
    } finally {
      setIsClaiming(null);
    }
  };

  const dailyList = challenges.filter(c => c.type === 'daily');
  const weeklyList = challenges.filter(c => c.type === 'weekly');

  // Compute overall progress ratios
  const completedDailyCount = dailyList.filter(c => completedDaily.includes(c.id)).length;
  const completedWeeklyCount = weeklyList.filter(c => completedWeekly.includes(c.id)).length;

  const claimableDailyCount = dailyList.filter(c => c.checkCompleted(stats) && !completedDaily.includes(c.id)).length;
  const claimableWeeklyCount = weeklyList.filter(c => c.checkCompleted(stats) && !completedWeekly.includes(c.id)).length;

  if (compact) {
    return (
      <div className="bg-[#18181b] border border-white/10 p-4 font-mono">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-1.5">
          <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Operational Quests</span>
          </h4>
          {(claimableDailyCount > 0 || claimableWeeklyCount > 0) && (
            <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 font-bold animate-pulse">
              {claimableDailyCount + claimableWeeklyCount} CLAIMABLE
            </span>
          )}
        </div>
        <div className="space-y-2">
          {challenges.slice(0, 3).map((item) => {
            const isCompleted = item.type === 'daily' 
              ? completedDaily.includes(item.id) 
              : completedWeekly.includes(item.id);
            const isFinishedState = item.checkCompleted(stats);
            const isClaimable = isFinishedState && !isCompleted;

            return (
              <div key={item.id} className="flex items-center justify-between p-2 bg-[#111113] border border-white/5 text-[10px]">
                <div className="flex items-center gap-2 truncate">
                  {item.icon}
                  <div className="truncate">
                    <p className={`font-bold ${isCompleted ? 'line-through text-white/30' : 'text-white'}`}>{item.title}</p>
                    <p className="text-[8px] text-white/40 truncate">{item.description}</p>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="text-[8px] text-emerald-400 font-bold">CLAIMED</span>
                  ) : isClaimable ? (
                    <button
                      onClick={() => handleClaimReward(item)}
                      disabled={isClaiming === item.id}
                      className="px-2 py-0.5 bg-emerald-400 text-emerald-950 font-bold text-[8px] hover:bg-emerald-300 transition uppercase"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <span className="text-[8px] text-white/30 font-bold uppercase">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#18181b] border border-white/10 p-5 font-mono relative overflow-hidden group">
      
      {/* Top ambient color-glow strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400" />

      {/* Title Header */}
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-2.5">
        <div>
          <span className="text-[8px] text-amber-400 font-bold tracking-widest uppercase block">GAMIFIED ACHIEVEMENT MATRIX</span>
          <h3 className="text-sm font-bold text-[#F8F7F4] flex items-center gap-2 uppercase tracking-wide mt-0.5">
            <Trophy className="w-4 h-4 text-[#FFD700] animate-bounce" style={{ animationDuration: '3s' }} />
            <span>Quests & Challenges Hub</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="text-[#F8F7F4]/40 hover:text-amber-400 transition"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
          </button>
        </div>
      </div>

      {/* Quest Progress Overview Header */}
      <div className="grid grid-cols-2 gap-3 mb-5 bg-[#111113] p-3.5 border border-white/5">
        <div>
          <span className="text-[8px] text-[#F8F7F4]/40 uppercase block">Daily Challenges</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-sky-400">{completedDailyCount}/3</span>
            <span className="text-[9px] text-[#F8F7F4]/30 uppercase">Completed</span>
          </div>
          <div className="w-full h-1 bg-white/10 mt-2 overflow-hidden">
            <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${(completedDailyCount / 3) * 100}%` }} />
          </div>
        </div>

        <div>
          <span className="text-[8px] text-[#F8F7F4]/40 uppercase block">Weekly Quests</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-amber-400">{completedWeeklyCount}/3</span>
            <span className="text-[9px] text-[#F8F7F4]/30 uppercase">Completed</span>
          </div>
          <div className="w-full h-1 bg-white/10 mt-2 overflow-hidden">
            <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(completedWeeklyCount / 3) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main Quests & Challenges lists */}
      <div className="space-y-5">
        
        {/* 1. Daily Challenges Section */}
        <div>
          <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider block mb-2">// 24H DAILY OBJECTIVES</span>
          <div className="space-y-2.5">
            {dailyList.map((item) => {
              const isCompleted = completedDaily.includes(item.id);
              const isFinishedState = item.checkCompleted(stats);
              const isClaimable = isFinishedState && !isCompleted;

              return (
                <div 
                  key={item.id} 
                  className={`border p-3 transition-all ${
                    isCompleted 
                      ? 'border-white/5 bg-[#111113]/30 opacity-60' 
                      : isClaimable 
                      ? 'border-emerald-500/40 bg-emerald-500/[0.03] shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                      : 'border-white/10 bg-[#111113]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2.5">
                      <div className="mt-0.5">{item.icon}</div>
                      <div>
                        <h4 className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${isCompleted ? 'line-through text-[#F8F7F4]/30' : 'text-[#F8F7F4]'}`}>
                          {item.title}
                          {isClaimable && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />}
                        </h4>
                        <p className={`text-[9px] mt-0.5 uppercase tracking-wide leading-relaxed ${isCompleted ? 'text-[#F8F7F4]/20' : 'text-[#F8F7F4]/40'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-right">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Claimed</span>
                        </div>
                      ) : isClaimable ? (
                        <button
                          onClick={() => handleClaimReward(item)}
                          disabled={isClaiming === item.id}
                          className="px-2.5 py-1.5 bg-emerald-400 text-emerald-950 font-black text-[9px] hover:bg-emerald-300 active:scale-95 transition-all uppercase cursor-pointer flex items-center gap-1"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>CLAIM +{item.xpReward} XP</span>
                        </button>
                      ) : (
                        <div className="text-[9px] font-bold text-white/30 uppercase border border-white/5 bg-white/[0.02] px-2 py-1 flex items-center gap-1">
                          <Circle className="w-3 h-3 text-white/20" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Real-time sub progress bar */}
                  {!isCompleted && item.id === 'daily-study' && (
                    <div className="mt-2.5 flex items-center gap-2 text-[8px] text-[#F8F7F4]/40 uppercase">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${Math.min(((stats.dailyStudyProgress || 0) / 300) * 100, 100)}%` }} />
                      </div>
                      <span>{Math.round(Math.min((stats.dailyStudyProgress || 0), 300) / 6)} / 50 study ticks</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Weekly Quests Section */}
        <div>
          <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-2">// WEEKLY MILESTONES (RESETS ON SUNDAY)</span>
          <div className="space-y-2.5">
            {weeklyList.map((item) => {
              const isCompleted = completedWeekly.includes(item.id);
              const isFinishedState = item.checkCompleted(stats);
              const isClaimable = isFinishedState && !isCompleted;

              return (
                <div 
                  key={item.id} 
                  className={`border p-3 transition-all ${
                    isCompleted 
                      ? 'border-white/5 bg-[#111113]/30 opacity-60' 
                      : isClaimable 
                      ? 'border-emerald-500/40 bg-emerald-500/[0.03] shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                      : 'border-white/10 bg-[#111113]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2.5">
                      <div className="mt-0.5">{item.icon}</div>
                      <div>
                        <h4 className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${isCompleted ? 'line-through text-[#F8F7F4]/30' : 'text-[#F8F7F4]'}`}>
                          {item.title}
                          {isClaimable && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />}
                        </h4>
                        <p className={`text-[9px] mt-0.5 uppercase tracking-wide leading-relaxed ${isCompleted ? 'text-[#F8F7F4]/20' : 'text-[#F8F7F4]/40'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-right">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Claimed</span>
                        </div>
                      ) : isClaimable ? (
                        <button
                          onClick={() => handleClaimReward(item)}
                          disabled={isClaiming === item.id}
                          className="px-2.5 py-1.5 bg-emerald-400 text-emerald-950 font-black text-[9px] hover:bg-emerald-300 active:scale-95 transition-all uppercase cursor-pointer flex items-center gap-1"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>CLAIM +{item.xpReward} XP</span>
                        </button>
                      ) : (
                        <div className="text-[9px] font-bold text-white/30 uppercase border border-white/5 bg-white/[0.02] px-2 py-1 flex items-center gap-1">
                          <Circle className="w-3 h-3 text-white/20" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Real-time sub progress bar for DSA counts */}
                  {!isCompleted && item.id === 'weekly-dsa-expert' && (
                    <div className="mt-2.5 flex items-center gap-2 text-[8px] text-[#F8F7F4]/40 uppercase">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${Math.min(((stats.completedDsa || []).length / 3) * 100, 100)}%` }} />
                      </div>
                      <span>{(stats.completedDsa || []).length} / 3 problems solved</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
