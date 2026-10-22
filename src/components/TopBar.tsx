/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMode } from '../types/game';
import { Volume2, VolumeX, Music, Music2, Trophy, Lock, CheckCircle2 } from 'lucide-react';

interface TopBarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  unlockedStations: GameMode[];
  completedStations: GameMode[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onOpenAchievements: () => void;
  score: number;
}

const STATIONS: { id: GameMode; name: string; number: number }[] = [
  { id: 'compare', name: '1. Nặng hơn - Nhẹ hơn', number: 1 },
  { id: 'balance-count', name: '2. Đếm & Quy đổi', number: 2 },
  { id: 'kilogram', name: '3. Ki-lô-gam (kg)', number: 3 },
];

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  onSelectMode,
  unlockedStations,
  completedStations,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  speechEnabled,
  onToggleSpeech,
  onOpenAchievements,
  score,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 bg-white border-b border-amber-200/80 sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Brand wordmark - CÂN ĐĨA KÌ DIỆU */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-2xl select-none" role="img" aria-label="Cân đĩa">⚖️</span>
        <button
          onClick={() => onSelectMode('compare')}
          className="text-lg sm:text-xl font-kids font-extrabold tracking-tight text-amber-950 uppercase whitespace-nowrap hover:text-amber-700 transition-colors cursor-pointer text-left"
        >
          CÂN ĐĨA KÌ DIỆU
        </button>
      </div>

      {/* Zone 2: 3 sequential station navigation tabs with lock & check indicators */}
      <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-amber-50/80 rounded-xl border border-amber-200/60 shrink-0">
        {STATIONS.map((st) => {
          const isUnlocked = unlockedStations.includes(st.id);
          const isCompleted = completedStations.includes(st.id);
          const isActive = currentMode === st.id;

          return (
            <button
              key={st.id}
              onClick={() => onSelectMode(st.id)}
              disabled={!isUnlocked}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : isUnlocked
                  ? 'text-amber-900 hover:bg-amber-100/80 cursor-pointer'
                  : 'text-slate-400 bg-slate-100/60 cursor-not-allowed opacity-60'
              }`}
              title={
                !isUnlocked
                  ? `🔒 Hoàn thành trạm ${st.number - 1} để mở khóa trạm này!`
                  : isCompleted
                  ? `✅ Đã hoàn thành (Bấm để ôn tập)`
                  : st.name
              }
            >
              {!isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
              {isCompleted && !isActive && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              <span>{st.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary utility actions & score badge (with background music & sound effect toggles) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Achievements / Stars button */}
        <button
          onClick={onOpenAchievements}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
          title="Xem điểm số & huy hiệu của bé"
        >
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="font-mono tabular-nums">{score}</span>
          <span className="hidden sm:inline">sao</span>
        </button>

        {/* Background Music toggle */}
        <button
          onClick={onToggleMusic}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            musicEnabled
              ? 'bg-amber-500 text-white shadow-xs animate-pulse ring-2 ring-amber-300'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/70'
          }`}
          title={musicEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền vui tươi'}
          aria-label="Bật hoặc tắt nhạc nền"
        >
          {musicEnabled ? <Music2 className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5 opacity-60" />}
          <span className="hidden sm:inline">
            {musicEnabled ? 'Nhạc nền: Bật' : 'Nhạc nền'}
          </span>
        </button>

        {/* Audio sound effects toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
          title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          aria-label="Chuyển đổi âm thanh"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
