import React, { useState, useEffect, useRef } from 'react';
import { UserStats } from '../types';
import { Play, Pause, Target, Clock, CheckCircle2, Sparkles, Plus, RefreshCw, Volume2, VolumeX, Flame } from 'lucide-react';

interface LearningGoalWidgetProps {
  stats: UserStats;
  token: string | null;
  onUpdateStats: (newStats: UserStats) => void;
}

export function LearningGoalWidget({ stats, token, onUpdateStats }: LearningGoalWidgetProps) {
  const targetMinutes = stats.dailyStudyTarget || 30;
  const progressSeconds = stats.dailyStudyProgress || 0;

  const [isTimerActive, setIsTimerActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom inputs
  const [customTarget, setCustomTarget] = useState(String(targetMinutes));
  const [manualMinutes, setManualMinutes] = useState('');
  const [customTargetError, setCustomTargetError] = useState<string | null>(null);
  const [manualMinutesError, setManualMinutesError] = useState<string | null>(null);

  // Keep track of unsynced seconds during active ticking
  const unsyncedSecondsRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize target and progress locally for instant real-time ticking
  const [localProgressSeconds, setLocalProgressSeconds] = useState(progressSeconds);

  // Update local progress when stats from parent updates (e.g. from backend or initial load)
  useEffect(() => {
    setLocalProgressSeconds(progressSeconds);
  }, [progressSeconds]);

  // Audio Synthesizer
  const playSound = (type: 'start' | 'pause' | 'success' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'pause') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'success') {
        // Sci-Fi celebratory rising chime
        const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
        frequencies.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.35);
          
          oscNode.start(ctx.currentTime + idx * 0.08);
          oscNode.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio might be blocked on iframe sandboxes
    }
  };

  // Sync function to send progress to backend
  const syncProgressToBackend = async (secondsToSync: number) => {
    if (secondsToSync <= 0 || !token) return;
    try {
      const res = await fetch('/api/progress/study-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ additionalSeconds: secondsToSync })
      });
      
      if (res.ok) {
        const updatedStats = await res.json();
        onUpdateStats(updatedStats);
        
        // If daily goal completed check
        const targetSec = targetMinutes * 60;
        const previousTotal = progressSeconds;
        const newTotal = updatedStats.dailyStudyProgress || 0;
        if (previousTotal < targetSec && newTotal >= targetSec) {
          playSound('success');
        }
      }
    } catch (err) {
      console.error('Failed to sync study progress:', err);
    }
  };

  // Ticking effect
  useEffect(() => {
    if (isTimerActive) {
      playSound('start');
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        setLocalProgressSeconds(prev => prev + 1);
        unsyncedSecondsRef.current += 1;

        // Auto-save every 10 seconds of active study
        if (unsyncedSecondsRef.current >= 10) {
          syncProgressToBackend(10);
          unsyncedSecondsRef.current = 0;
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        // Sync any leftover unsynced seconds on pause
        if (unsyncedSecondsRef.current > 0) {
          syncProgressToBackend(unsyncedSecondsRef.current);
          unsyncedSecondsRef.current = 0;
        }
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  // Handle Pause / Resume toggle
  const toggleTimer = () => {
    playSound('click');
    if (isTimerActive) {
      playSound('pause');
      setIsTimerActive(false);
    } else {
      setIsTimerActive(true);
    }
  };

  // Reset current session timer (logs whatever was accumulated first)
  const resetSessionTimer = () => {
    playSound('click');
    setIsTimerActive(false);
    if (unsyncedSecondsRef.current > 0) {
      syncProgressToBackend(unsyncedSecondsRef.current);
      unsyncedSecondsRef.current = 0;
    }
    setSecondsElapsed(0);
  };

  // Handle Manual Target Setting
  const updateTargetValue = async (minutes: number) => {
    if (minutes < 1 || minutes > 480) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/progress/study-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dailyStudyTarget: minutes })
      });
      if (res.ok) {
        const updatedStats = await res.json();
        onUpdateStats(updatedStats);
        playSound('start');
      }
    } catch (err) {
      console.error('Failed to update study target:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customTarget);
    if (isNaN(parsed) || parsed < 1 || parsed > 480) {
      setCustomTargetError('Please input a target between 1 and 480 minutes.');
      return;
    }
    setCustomTargetError(null);
    updateTargetValue(parsed);
    setShowSettings(false);
  };

  // Handle Manual Study Time Logging
  const handleManualMinutesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(manualMinutes);
    if (isNaN(parsed) || parsed <= 0 || parsed > 240) {
      setManualMinutesError('Please input a value between 0.1 and 240 minutes.');
      return;
    }
    setManualMinutesError(null);
    setIsSaving(true);
    try {
      const res = await fetch('/api/progress/study-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ manualMinutes: parsed })
      });
      if (res.ok) {
        const updatedStats = await res.json();
        onUpdateStats(updatedStats);
        setManualMinutes('');
        
        // Celebration chime if completed
        const targetSec = targetMinutes * 60;
        const previousTotal = progressSeconds;
        const newTotal = updatedStats.dailyStudyProgress || 0;
        if (previousTotal < targetSec && newTotal >= targetSec) {
          playSound('success');
        } else {
          playSound('start');
        }
      }
    } catch (err) {
      console.error('Failed to log manual study time:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const progressPercent = Math.min(Math.round((localProgressSeconds / (targetMinutes * 60)) * 100), 100);
  const isGoalReached = localProgressSeconds >= targetMinutes * 60;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatStopwatch = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#18181b] border border-white/10 p-5 font-mono relative overflow-hidden group">
      
      {/* Absolute top glowing background bar depending on state */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 ${
        isTimerActive ? 'bg-amber-400 animate-pulse' : isGoalReached ? 'bg-emerald-500' : 'bg-white/10'
      }`} />

      {/* Header and Sound Toggle */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <h3 className="text-xs font-bold text-[#F8F7F4] flex items-center gap-2 uppercase tracking-wider">
          <Target className={`w-4 h-4 ${isTimerActive ? 'text-amber-400 animate-spin' : 'text-amber-400'}`} style={{ animationDuration: '3s' }} />
          <span>Daily study tracker</span>
        </h3>
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

      {/* Real-time Circular Status Progress & Metrics */}
      <div className="grid grid-cols-5 gap-3.5 items-center mb-5 bg-[#111113] p-4 border border-white/5 relative">
        
        {/* Left column: Circular or Percentage gauge */}
        <div className="col-span-2 flex flex-col items-center justify-center relative">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* SVG circle track and fill */}
            <svg className="w-full h-full -rotate-90">
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                className="stroke-white/5 fill-none" 
                strokeWidth="5" 
              />
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                className={`fill-none transition-all duration-500 ${isGoalReached ? 'stroke-emerald-400' : 'stroke-amber-400'}`} 
                strokeWidth="5" 
                strokeDasharray="213.62"
                strokeDashoffset={213.62 - (213.62 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-base font-black ${isGoalReached ? 'text-emerald-400' : 'text-[#F8F7F4]'}`}>
                {progressPercent}%
              </span>
            </div>
          </div>
          <span className="text-[8px] text-[#F8F7F4]/40 uppercase mt-1.5 font-semibold">Today's goal</span>
        </div>

        {/* Right column: Target stats and real-time state */}
        <div className="col-span-3 space-y-2">
          <div>
            <span className="text-[8px] text-[#F8F7F4]/40 uppercase block">Daily Target</span>
            <span className="text-xs font-bold text-[#F8F7F4] uppercase flex items-center gap-1.5">
              <span>{targetMinutes} Minutes</span>
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="text-amber-400 hover:text-amber-300 text-[9px] hover:underline"
              >
                [Edit]
              </button>
            </span>
          </div>

          <div>
            <span className="text-[8px] text-[#F8F7F4]/40 uppercase block">Time Completed</span>
            <span className={`text-xs font-bold uppercase flex items-center gap-1 ${isGoalReached ? 'text-emerald-400' : 'text-[#F8F7F4]'}`}>
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatTime(localProgressSeconds)}</span>
            </span>
          </div>

          {/* Target Milestone Status */}
          {isGoalReached ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] uppercase font-bold animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Goal Completed (+50 XP)</span>
            </div>
          ) : (
            <div className="text-[9px] text-amber-400/80 uppercase font-bold">
              <span>{Math.max(0, targetMinutes - Math.floor(localProgressSeconds / 60))} mins remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings / Edit Target Box */}
      {showSettings && (
        <form onSubmit={handleCustomTargetSubmit} className="mb-4 bg-white/5 border border-white/10 p-3.5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Set Daily study goal</span>
            <button 
              type="button" 
              onClick={() => setShowSettings(false)} 
              className="text-white/40 hover:text-white text-[9px]"
            >
              [X] Close
            </button>
          </div>
          
          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[15, 30, 45, 60].map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => {
                  playSound('click');
                  setCustomTarget(String(min));
                  updateTargetValue(min);
                  setShowSettings(false);
                }}
                className={`py-1 border text-[9px] font-bold uppercase transition ${
                  targetMinutes === min 
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300' 
                    : 'border-white/10 text-[#F8F7F4]/60 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                {min}m
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-[#F8F7F4]/40 uppercase block">Or Input Custom Minutes</label>
            <div className="flex gap-1.5">
              <input 
                type="number"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                min="1"
                max="480"
                className="flex-1 bg-[#111113] border border-white/10 text-xs text-[#F8F7F4] p-1.5 focus:border-amber-400 focus:outline-none font-mono"
                placeholder="Target minutes..."
              />
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-3 py-1.5 bg-amber-400 text-amber-950 font-bold uppercase text-[9px] tracking-wider hover:bg-amber-300 transition"
              >
                Apply
              </button>
            </div>
            {customTargetError && (
              <p className="text-red-400 text-[8px] uppercase mt-1 leading-tight">{customTargetError}</p>
            )}
          </div>
        </form>
      )}

      {/* Live Stopwatch & Control Center */}
      <div className="bg-[#111113] border border-white/5 p-4 flex flex-col items-center mb-4 relative overflow-hidden">
        
        {/* Subtle background pulsing when active */}
        {isTimerActive && (
          <div className="absolute inset-0 bg-amber-400/[0.02] animate-pulse pointer-events-none" />
        )}

        {/* Real-time Session Stopwatch display */}
        <span className="text-[8px] text-[#F8F7F4]/30 uppercase tracking-widest mb-1 font-bold">Active study session</span>
        <span className={`text-3xl font-black tracking-tight font-mono mb-3 ${isTimerActive ? 'text-amber-400 animate-pulse' : 'text-[#F8F7F4]'}`}>
          {formatStopwatch(secondsElapsed)}
        </span>

        {/* Stopwatch Controls */}
        <div className="flex gap-2 w-full">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-2 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer ${
              isTimerActive
                ? 'bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20'
                : 'bg-amber-400 text-amber-950 hover:bg-amber-300 border border-amber-400'
            }`}
          >
            {isTimerActive ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-red-400 stroke-red-400" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-950 stroke-amber-950" />
                <span>Start Studying</span>
              </>
            )}
          </button>

          {secondsElapsed > 0 && (
            <button
              onClick={resetSessionTimer}
              className="px-3 border border-white/10 text-[#F8F7F4]/60 hover:text-[#F8F7F4] hover:bg-white/5 transition text-[9px] uppercase font-bold"
              title="Reset current stopwatch and save progress"
            >
              Reset
            </button>
          )}
        </div>

        {isTimerActive && (
          <div className="flex items-center gap-1.5 text-amber-400 text-[8px] uppercase font-bold mt-2.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
            <span>Learning OS sync active...</span>
          </div>
        )}
      </div>

      {/* Manual Study Log Tool */}
      <form onSubmit={handleManualMinutesSubmit} className="border-t border-white/5 pt-4">
        <span className="text-[8px] text-[#F8F7F4]/40 uppercase tracking-wide block mb-2">Log completed offline study</span>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="number" 
              step="any"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              className="w-full bg-[#111113] border border-white/10 text-xs text-[#F8F7F4] p-2 focus:border-amber-400 focus:outline-none font-mono pr-8"
              placeholder="Study duration..."
            />
            <span className="absolute right-2.5 top-2 text-[9px] text-[#F8F7F4]/30 uppercase font-bold">Mins</span>
          </div>
          
          <button 
            type="submit"
            disabled={isSaving || !manualMinutes.trim()}
            className="px-4 py-2 border border-white/10 hover:border-amber-400 text-[#F8F7F4]/70 hover:text-amber-400 hover:bg-amber-400/5 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition"
          >
            {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-amber-400" />}
            <span>Log Time</span>
          </button>
        </div>
        {manualMinutesError && (
          <p className="text-red-400 text-[8px] uppercase mt-1 leading-tight">{manualMinutesError}</p>
        )}
      </form>

      {/* Real-time Study Target Completion Overlay / Sparkle Banner when achieved */}
      {isGoalReached && (
        <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h5 className="font-bold text-emerald-400 text-[10px] uppercase leading-tight">Daily Target achieved!</h5>
            <p className="text-[8px] text-[#F8F7F4]/50 uppercase mt-0.5 leading-normal">
              You hit your study target for today! Keep up your streak tomorrow.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
