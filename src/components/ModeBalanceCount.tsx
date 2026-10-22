/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BALANCE_COUNT_QUESTIONS } from '../data/curriculumData';
import { InteractiveScale } from './InteractiveScale';
import { MascotMessage } from './MascotMessage';
import { PlacedItem } from '../types/game';
import { soundMgr } from '../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';

interface ModeBalanceCountProps {
  onScoreEarned: (points: number) => void;
  onCompleteStation: () => void;
  onGoToNextStation?: () => void;
}

export const ModeBalanceCount: React.FC<ModeBalanceCountProps> = ({
  onScoreEarned,
  onCompleteStation,
  onGoToNextStation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedRightCount, setPlacedRightCount] = useState<number>(() => {
    return BALANCE_COUNT_QUESTIONS[0].initialCounterCount;
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const question = BALANCE_COUNT_QUESTIONS[currentIndex];
  const isInteractiveMode = question.initialCounterCount !== question.requiredCounterCount;

  // CRITICAL FIX: To ensure the balance scale reflects true physical balance without any discrepancy,
  // each counter unit item is calibrated to exactly 1 unit of relative weight.
  // The target item on the left pan is calibrated to weigh exactly (requiredCounterCount / targetCount) units.
  // Therefore, when placedRightCount === requiredCounterCount, Left total == Right total,
  // which produces a 0-degree angle (perfect equilibrium / thăng bằng)!
  const leftUnitWeight = question.requiredCounterCount / question.targetCount;
  const counterUnitWeight = 1;

  // Construct left items with calibrated relative unitWeight
  const leftItems: PlacedItem[] = Array.from({ length: question.targetCount }).map((_, idx) => ({
    instanceId: `left-target-${idx}`,
    item: {
      ...question.targetItem,
      unitWeight: leftUnitWeight,
      unitLabel: 'đơn vị',
    },
  }));

  // Construct right items based on placedRightCount with calibrated unitWeight = 1
  const rightItems: PlacedItem[] = Array.from({ length: placedRightCount }).map((_, idx) => ({
    instanceId: `right-counter-${idx}`,
    item: {
      ...question.counterItem,
      unitWeight: counterUnitWeight,
      unitLabel: 'đơn vị',
    },
  }));

  const isScaleBalanced = placedRightCount === question.requiredCounterCount;

  const handleAddCounterItem = () => {
    if (placedRightCount >= 10) return;
    const newCount = placedRightCount + 1;
    setPlacedRightCount(newCount);
    soundMgr.playItemDrop();

    if (newCount === question.requiredCounterCount) {
      soundMgr.playCorrect();
      setIsAnswered(true);
      setIsCorrect(true);
      onScoreEarned(15);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else {
      soundMgr.playScaleCreak();
    }
  };

  const handleRemoveCounterItem = () => {
    if (placedRightCount <= 0) return;
    const newCount = placedRightCount - 1;
    setPlacedRightCount(newCount);
    soundMgr.playScaleCreak();

    if (newCount === question.requiredCounterCount) {
      soundMgr.playCorrect();
      setIsAnswered(true);
      setIsCorrect(true);
      onScoreEarned(15);
    } else {
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  const handleCheckQuizOption = (opt: number) => {
    setSelectedOption(opt);
    setIsAnswered(true);
    const correct = opt === question.requiredCounterCount;
    setIsCorrect(correct);

    if (correct) {
      soundMgr.playCorrect();
      onScoreEarned(10);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
      } catch {}
    } else {
      soundMgr.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < BALANCE_COUNT_QUESTIONS.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setPlacedRightCount(BALANCE_COUNT_QUESTIONS[nextIdx].initialCounterCount);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
      soundMgr.playFanfare();
      onCompleteStation();
    }
  };

  const handleRestartStation = () => {
    setCurrentIndex(0);
    setPlacedRightCount(BALANCE_COUNT_QUESTIONS[0].initialCounterCount);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center bg-white rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-sm animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 flex items-center justify-center text-4xl mb-4 shadow-xs">
          🌟
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          ĐÃ HOÀN THÀNH TRẠM 2
        </span>
        <h2 className="text-2xl sm:text-3xl font-kids font-bold text-slate-900 mb-2">
          Hoan Hô! Bé Là Thợ Đếm Thăng Bằng Tài Ba!
        </h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
          Bé đã xuất sắc hoàn thành trạm đếm và quy đổi số lượng! Chiếc cân đã thăng bằng hoàn hảo.
        </p>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/70 mb-6 text-sm text-emerald-950 text-left">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Quy đổi thăng bằng bé đã học chuẩn xác:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs sm:text-sm">
            <li>1 quả bưởi nặng bằng <strong>4 quả chanh</strong></li>
            <li>1 quả dưa hấu nặng bằng <strong>4 quả táo đỏ</strong></li>
            <li>1 nải chuối nặng bằng <strong>3 quả táo</strong></li>
            <li>1 con mèo nặng bằng <strong>6 quả táo</strong></li>
            <li>1 quả bí ngô nặng bằng <strong>2 quả bưởi</strong></li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onGoToNextStation && (
            <button
              onClick={onGoToNextStation}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-kids font-bold text-base shadow-sm hover:shadow transition-all cursor-pointer animate-pulse"
            >
              <span>Tiến vào Trạm 3: Ki-lô-gam (kg)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleRestartStation}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Ôn tập lại trạm 2
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Header & Steps */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div>
          <span className="text-xs font-bold text-sky-600 tracking-wider uppercase">
            Trạm 2 · Đếm & Quy đổi thăng bằng
          </span>
          <h2 className="text-xl sm:text-2xl font-kids font-bold text-slate-900">
            {question.title}
          </h2>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1.5">
          {BALANCE_COUNT_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentIndex(idx);
                setPlacedRightCount(q.initialCounterCount);
                setSelectedOption(null);
                setIsAnswered(false);
                setIsCorrect(false);
              }}
              className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                idx === currentIndex
                  ? 'bg-sky-500 text-white shadow-xs scale-105'
                  : idx < currentIndex
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title={`Bài ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Mascot Prompt */}
      <MascotMessage
        message={question.promptQuestion}
        spokenText={question.spokenPrompt}
        hint={question.hint}
      />

      {/* Scale Visualizer */}
      <InteractiveScale
        leftItems={leftItems}
        rightItems={rightItems}
        showWeights={false}
        showStatusBanner={true}
        leftTitle={`${question.targetCount} ${question.targetItem.vietnameseName}`}
        rightTitle={`Đĩa phải: ${placedRightCount} ${question.counterItem.name}`}
        onRemoveRightItem={isInteractiveMode ? handleRemoveCounterItem : undefined}
        interactive={isInteractiveMode}
      />

      {/* Interactive Controls Deck */}
      {isInteractiveMode ? (
        <div className="bg-white rounded-3xl border border-sky-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{question.counterItem.emoji}</span>
            <div>
              <p className="font-kids font-bold text-slate-900 text-base sm:text-lg">
                Thêm hoặc Bớt {question.counterItem.vietnameseName}
              </p>
              <p className="text-xs text-slate-500">
                Đĩa phải đang có: <strong className="font-mono text-sky-700 text-sm">{placedRightCount}</strong> quả
                {isScaleBalanced && (
                  <span className="ml-2 font-bold text-emerald-600">✓ Đã đủ {question.requiredCounterCount} quả thăng bằng!</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRemoveCounterItem}
              disabled={placedRightCount <= 0 || (isAnswered && isCorrect)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
              Bớt 1 quả
            </button>

            <button
              onClick={handleAddCounterItem}
              disabled={isAnswered && isCorrect}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm 1 {question.counterItem.vietnameseName}
            </button>
          </div>
        </div>
      ) : (
        /* Quiz options if viewing a static balanced scale */
        <div className="bg-white rounded-3xl border border-sky-200/80 p-4 shadow-xs">
          <p className="text-center font-kids font-bold text-slate-800 text-base sm:text-lg mb-3">
            Quan sát đĩa cân thăng bằng và chọn số lượng đúng:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {question.options?.map((opt) => {
              const isSelected = selectedOption === opt;
              let style = 'bg-sky-50/60 border-sky-200 hover:border-sky-400 text-slate-800';

              if (isAnswered) {
                if (opt === question.requiredCounterCount) {
                  style = 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-200';
                } else if (isSelected && opt !== question.requiredCounterCount) {
                  style = 'bg-rose-50 border-rose-300 text-rose-800';
                } else {
                  style = 'opacity-50 bg-slate-50 text-slate-400';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleCheckQuizOption(opt)}
                  disabled={isAnswered && isCorrect}
                  className={`p-3 rounded-2xl border-2 font-kids font-bold text-xl transition-all shadow-xs flex flex-col items-center justify-center gap-1 cursor-pointer ${style}`}
                >
                  <span>{opt} quả</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {isAnswered && (
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm sm:text-base">
                {isCorrect ? 'Chính xác! Chiếc cân đã thăng bằng tuyệt đối!' : 'Chưa đúng rồi bé ơi! Đếm lại nhé:'}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                {question.learningRule}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isCorrect ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                <span>{currentIndex + 1 < BALANCE_COUNT_QUESTIONS.length ? 'Bài tiếp theo' : 'Hoàn thành trạm 2'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedOption(null);
                  setIsAnswered(false);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Thử lại nào
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
