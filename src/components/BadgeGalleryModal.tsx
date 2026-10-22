/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Star, Award, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../types/game';

interface BadgeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  achievements: Achievement[];
}

export const BadgeGalleryModal: React.FC<BadgeGalleryModalProps> = ({
  isOpen,
  onClose,
  score,
  achievements,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-amber-200 animate-fadeIn">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-b from-amber-100 to-amber-50 border-b border-amber-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md mb-2 bg-white flex items-center justify-center">
            <img
              src="/src/assets/images/award_scale_badge_1792589259208.jpg"
              alt="Huy Hiệu Toán Học"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-3xl select-none" aria-hidden="true">🏆</span>
          </div>

          <h2 className="text-2xl font-kids font-bold text-amber-950">
            Bảng Vàng Thành Tích Của Bé
          </h2>
          <p className="text-xs text-amber-800">
            Trò chơi CÂN ĐĨA KÌ DIỆU · Toán Lớp 2
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full bg-amber-500 text-white font-kids font-bold text-base shadow-xs">
            <Star className="w-4 h-4 fill-white" />
            <span className="font-mono tabular-nums">{score}</span>
            <span>Ngôi Sao Toán Học</span>
          </div>
        </div>

        {/* Badges List */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          <h3 className="font-kids font-bold text-sm text-slate-900 uppercase tracking-wider">
            Các huy hiệu khen thưởng:
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  ach.unlocked
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                    ach.unlocked
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-kids font-bold text-sm text-slate-900 truncate">
                      {ach.title}
                    </h4>
                    {ach.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {ach.description}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      ach.unlocked
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? 'Đã đạt' : 'Chưa đạt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 italic">
            Cố gắng giải đúng các trạm để mở khóa tất cả huy hiệu nhé!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
