/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { soundMgr } from '../utils/audio';

interface MascotMessageProps {
  message: string;
  hint?: string;
  spokenText?: string;
  characterMood?: 'happy' | 'thinking' | 'celebrate';
}

export const MascotMessage: React.FC<MascotMessageProps> = ({
  message,
  hint,
  spokenText,
  characterMood = 'happy',
}) => {
  const [showHint, setShowHint] = useState(false);

  const handleSpeak = () => {
    soundMgr.speakVietnamese(spokenText || message);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-amber-200/90 p-3 sm:p-4 shadow-xs flex items-start gap-3 sm:gap-4 transition-all">
      {/* Teacher Bear Avatar */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-xs bg-amber-100 flex items-center justify-center">
          <img
            src="/src/assets/images/mascot_bear_math_1792589258938.jpg"
            alt="Thầy Gấu Nâu Dạy Toán"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to cute emoji if image is blocked
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-2xl select-none" aria-hidden="true">🐻</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md shadow-xs">
          Thầy Gấu
        </div>
      </div>

      {/* Speech Content Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Lời Thầy Gấu nhắn nhủ:</span>
          </div>

          <div className="flex items-center gap-1">
            {hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Xem gợi ý của câu hỏi"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
              </button>
            )}

            <button
              onClick={handleSpeak}
              className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              title="Nghe Thầy Gấu đọc câu hỏi"
              aria-label="Đọc câu hỏi bằng giọng nói"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Đọc</span>
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
          {message}
        </p>

        {showHint && hint && (
          <div className="mt-2 text-xs bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg p-2 leading-relaxed animate-fadeIn">
            <strong>💡 Gợi ý nhỏ:</strong> {hint}
          </div>
        )}
      </div>
    </div>
  );
};
