/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, Achievement } from './types/game';
import { ACHIEVEMENTS } from './data/curriculumData';
import { TopBar } from './components/TopBar';
import { ModeCompare } from './components/ModeCompare';
import { ModeBalanceCount } from './components/ModeBalanceCount';
import { ModeKilogram } from './components/ModeKilogram';
import { BadgeGalleryModal } from './components/BadgeGalleryModal';
import { soundMgr } from './utils/audio';
import { Sparkles, Trophy, Lock, CheckCircle2, Music2 } from 'lucide-react';

const STATION_FLOW: { id: GameMode; name: string; number: number; subtitle: string }[] = [
  { id: 'compare', name: 'Trạm 1: Nặng hơn - Nhẹ hơn', number: 1, subtitle: 'So sánh cân đĩa' },
  { id: 'balance-count', name: 'Trạm 2: Đếm & Quy đổi', number: 2, subtitle: 'Thăng bằng vật mẫu' },
  { id: 'kilogram', name: 'Trạm 3: Ki-lô-gam (kg)', number: 3, subtitle: 'Quả cân 1kg, 2kg, 5kg' },
];

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('compare');
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('can_dia_ki_dieu_score');
    return saved ? parseInt(saved, 10) : 30;
  });

  // Sequential station unlock tracking
  const [unlockedStations, setUnlockedStations] = useState<GameMode[]>(() => {
    try {
      const saved = localStorage.getItem('can_dia_ki_dieu_unlocked');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.includes('compare')) return parsed;
      }
    } catch {}
    return ['compare'];
  });

  const [completedStations, setCompletedStations] = useState<GameMode[]>(() => {
    try {
      const saved = localStorage.getItem('can_dia_ki_dieu_completed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('can_dia_ki_dieu_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('can_dia_ki_dieu_unlocked', JSON.stringify(unlockedStations));
  }, [unlockedStations]);

  useEffect(() => {
    localStorage.setItem('can_dia_ki_dieu_completed', JSON.stringify(completedStations));
  }, [completedStations]);

  const handleScoreEarned = (points: number) => {
    setScore((prev) => prev + points);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundMgr.setSoundEnabled(next);
  };

  const handleToggleMusic = () => {
    const next = soundMgr.toggleMusic();
    setMusicEnabled(next);
  };

  const handleToggleSpeech = () => {
    const next = !speechEnabled;
    setSpeechEnabled(next);
    soundMgr.setSpeechEnabled(next);
  };

  const handleSelectStation = (target: GameMode) => {
    if (!unlockedStations.includes(target)) {
      soundMgr.playWrong();
      const station = STATION_FLOW.find((s) => s.id === target);
      setLockWarning(`🔒 Trạm ${station?.number || ''} đang bị khóa! Bé cần hoàn thành trạm trước để mở khóa nhé!`);
      setTimeout(() => setLockWarning(null), 3500);
      return;
    }
    setLockWarning(null);
    setCurrentMode(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteStation = (mode: GameMode) => {
    // 1. Mark current mode as completed if not yet
    if (!completedStations.includes(mode)) {
      setCompletedStations((prev) => [...prev, mode]);
    }

    // 2. Unlock next station in sequential order
    if (mode === 'compare') {
      if (!unlockedStations.includes('balance-count')) {
        setUnlockedStations((prev) => [...prev, 'balance-count']);
      }
      setAchievements((prev) =>
        prev.map((ach) => (ach.id === 'eye_sharp' ? { ...ach, unlocked: true } : ach))
      );
    } else if (mode === 'balance-count') {
      if (!unlockedStations.includes('kilogram')) {
        setUnlockedStations((prev) => [...prev, 'kilogram']);
      }
      setAchievements((prev) =>
        prev.map((ach) => (ach.id === 'balance_master' ? { ...ach, unlocked: true } : ach))
      );
    } else if (mode === 'kilogram') {
      setAchievements((prev) =>
        prev.map((ach) => (ach.id === 'kg_expert' ? { ...ach, unlocked: true } : ach))
      );
    }
  };

  const handleGoToNext = (target: GameMode) => {
    if (!unlockedStations.includes(target)) {
      setUnlockedStations((prev) => (prev.includes(target) ? prev : [...prev, target]));
    }
    setCurrentMode(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProgress = () => {
    if (window.confirm('Bé có muốn đặt lại tiến trình và bắt đầu chơi lại từ Trạm 1 không?')) {
      setUnlockedStations(['compare']);
      setCompletedStations([]);
      setCurrentMode('compare');
      localStorage.removeItem('can_dia_ki_dieu_unlocked');
      localStorage.removeItem('can_dia_ki_dieu_completed');
      soundMgr.playScaleCreak();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-amber-200">
      {/* Universal Top Bar */}
      <TopBar
        currentMode={currentMode}
        onSelectMode={handleSelectStation}
        unlockedStations={unlockedStations}
        completedStations={completedStations}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        musicEnabled={musicEnabled}
        onToggleMusic={handleToggleMusic}
        speechEnabled={speechEnabled}
        onToggleSpeech={handleToggleSpeech}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        score={score}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        {/* Whimsical Header Banner with Fruit Market Backdrop */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-200/90 shadow-sm bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 p-5 sm:p-7 text-amber-950 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
            <img
              src="/src/assets/images/market_classroom_scene_1792589260514.jpg"
              alt="Khu chợ thăng bằng"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 backdrop-blur-xs text-xs font-bold text-amber-950 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>Toán Lớp 2 · Bài 15: Ki-lô-gam (Kết Nối Tri Thức)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-kids font-extrabold text-amber-950 tracking-tight leading-tight uppercase">
              CÂN ĐĨA KÌ DIỆU
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-amber-900/90 leading-relaxed">
              Trò chơi học tập tuần tự qua 3 trạm: Khám phá nặng hơn - nhẹ hơn, quy đổi thăng bằng và chinh phục quả cân ki-lô-gam!
            </p>
          </div>

          {/* Sequential Station Roadmap Progress Bar */}
          <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col items-center gap-1.5">
            <div className="text-[11px] font-bold text-amber-950/80 uppercase tracking-wider">
              Lộ trình 3 trạm
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-xs p-1.5 rounded-2xl border border-amber-300/80 shadow-xs">
              {STATION_FLOW.map((st, idx) => {
                const isUnlocked = unlockedStations.includes(st.id);
                const isCompleted = completedStations.includes(st.id);
                const isActive = currentMode === st.id;

                return (
                  <React.Fragment key={st.id}>
                    <button
                      onClick={() => handleSelectStation(st.id)}
                      disabled={!isUnlocked}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-kids text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-950 text-white shadow-xs scale-105'
                          : isCompleted
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                          : isUnlocked
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer'
                          : 'bg-slate-200/80 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        !isUnlocked
                          ? `🔒 Hoàn thành trạm ${st.number - 1} để mở khóa!`
                          : `Trạm ${st.number}: ${st.name}`
                      }
                    >
                      {!isUnlocked ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                      ) : null}
                      <span>T{st.number}</span>
                    </button>
                    {idx < STATION_FLOW.length - 1 && (
                      <span className="text-amber-800/60 text-xs font-bold">➔</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lock Alert Toast if student clicks a locked station */}
        {lockWarning && (
          <div className="w-full max-w-xl mx-auto p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 font-kids font-bold text-sm text-center shadow-xs animate-bounce flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{lockWarning}</span>
          </div>
        )}

        {/* Active Station Component */}
        <div className="w-full">
          {currentMode === 'compare' && (
            <ModeCompare
              onScoreEarned={handleScoreEarned}
              onCompleteStation={() => handleCompleteStation('compare')}
              onGoToNextStation={() => handleGoToNext('balance-count')}
            />
          )}

          {currentMode === 'balance-count' && (
            <ModeBalanceCount
              onScoreEarned={handleScoreEarned}
              onCompleteStation={() => handleCompleteStation('balance-count')}
              onGoToNextStation={() => handleGoToNext('kilogram')}
            />
          )}

          {currentMode === 'kilogram' && (
            <ModeKilogram
              onScoreEarned={handleScoreEarned}
              onCompleteStation={() => handleCompleteStation('kilogram')}
            />
          )}
        </div>
      </main>

      {/* Clean Footer (hidden lesson plan/structure) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>CÂN ĐĨA KÌ DIỆU</strong> · Trò chơi giáo dục bổ trợ môn Toán Lớp 2 (Bộ sách Kết nối tri thức với cuộc sống).
          </p>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="hover:text-amber-700 transition-colors cursor-pointer"
            >
              Bảng vàng thành tích
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetProgress}
              className="hover:text-rose-600 transition-colors cursor-pointer text-slate-400 hover:underline"
              title="Đặt lại để chơi từ Trạm 1"
            >
              Đặt lại tiến trình
            </button>
          </div>
        </div>
      </footer>

      {/* Achievement Badges Modal */}
      <BadgeGalleryModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        score={score}
        achievements={achievements}
      />
    </div>
  );
}
