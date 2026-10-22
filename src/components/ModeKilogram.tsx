/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KILOGRAM_QUESTIONS, ITEMS } from '../data/curriculumData';
import { InteractiveScale } from './InteractiveScale';
import { MascotMessage } from './MascotMessage';
import { PlacedItem } from '../types/game';
import { soundMgr } from '../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, RotateCcw, Plus, Trash2, Award } from 'lucide-react';

interface ModeKilogramProps {
  onScoreEarned: (points: number) => void;
  onCompleteStation: () => void;
  onGoToNextStation?: () => void;
}

export const ModeKilogram: React.FC<ModeKilogramProps> = ({
  onScoreEarned,
  onCompleteStation,
  onGoToNextStation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedWeights, setPlacedWeights] = useState<PlacedItem[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);

  const question = KILOGRAM_QUESTIONS[currentIndex];

  const leftItems: PlacedItem[] = [
    {
      instanceId: `target-${question.targetObject.id}`,
      item: question.targetObject,
    },
  ];

  const currentRightWeight = placedWeights.reduce((sum, p) => sum + p.item.unitWeight, 0);
  const isTargetMatched = currentRightWeight === question.targetWeightKg;

  const handleAddWeight = (weightValue: number) => {
    if (isAnswered) return;

    let itemKey = 'weight1kg';
    if (weightValue === 2) itemKey = 'weight2kg';
    if (weightValue === 5) itemKey = 'weight5kg';

    const weightItem = ITEMS[itemKey];
    const newPlacedItem: PlacedItem = {
      instanceId: `weight-${Date.now()}-${Math.random()}`,
      item: weightItem,
    };

    const nextWeights = [...placedWeights, newPlacedItem];
    setPlacedWeights(nextWeights);
    soundMgr.playItemDrop();

    const newTotal = nextWeights.reduce((s, p) => s + p.item.unitWeight, 0);
    if (newTotal === question.targetWeightKg) {
      soundMgr.playCorrect();
      setIsAnswered(true);
      onScoreEarned(20);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else if (newTotal > question.targetWeightKg) {
      soundMgr.playScaleCreak();
    }
  };

  const handleRemoveWeight = (instanceId: string) => {
    if (isAnswered) return;
    setPlacedWeights(placedWeights.filter((p) => p.instanceId !== instanceId));
    soundMgr.playItemDrop();
  };

  const handleClearWeights = () => {
    if (isAnswered) return;
    setPlacedWeights([]);
    soundMgr.playScaleCreak();
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < KILOGRAM_QUESTIONS.length) {
      setCurrentIndex(currentIndex + 1);
      setPlacedWeights([]);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      soundMgr.playFanfare();
      onCompleteStation();
    }
  };

  const handleRestartStation = () => {
    setCurrentIndex(0);
    setPlacedWeights([]);
    setIsAnswered(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center bg-white rounded-3xl border border-amber-200/80 p-8 shadow-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl mb-4 shadow-xs">
          🏆
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          XUẤT SẮC HOÀN THÀNH TOÀN BỘ 3 TRẠM
        </span>
        <h2 className="text-2xl sm:text-3xl font-kids font-bold text-amber-950 mb-2">
          Chúc Mừng Bé Đã Chinh Phục CÂN ĐĨA KÌ DIỆU!
        </h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
          Bé đã hoàn thành trọn vẹn cả 3 trạm học tập: Nặng hơn/Nhẹ hơn, Đếm quy đổi và Bác thợ cân Ki-lô-gam (kg)!
        </p>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/70 mb-6 text-sm text-amber-950 text-left">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Kiến thức cốt lõi Bài 15 SGK Toán 2:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs sm:text-sm">
            <li><strong>Ki-lô-gam</strong> là đơn vị đo khối lượng (viết tắt là <strong>kg</strong>).</li>
            <li>Các quả cân chuẩn thường dùng: <strong>1 kg, 2 kg, 5 kg</strong>.</li>
            <li>Có thể cộng trừ khối lượng: <em>2 kg + 1 kg = 3 kg</em>; <em>5 kg - 2 kg = 3 kg</em>.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRestartStation}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-kids font-bold text-base shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Luyện tập lại Trạm 3
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
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
            Trạm 3 · Làm quen với Ki-lô-gam (kg)
          </span>
          <h2 className="text-xl sm:text-2xl font-kids font-bold text-slate-900">
            {question.title}
          </h2>
        </div>

        {/* Question Counter Badges */}
        <div className="flex items-center gap-1.5">
          {KILOGRAM_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentIndex(idx);
                setPlacedWeights([]);
                setIsAnswered(false);
              }}
              className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                idx === currentIndex
                  ? 'bg-emerald-600 text-white shadow-xs scale-105'
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
        rightItems={placedWeights}
        showWeights={true}
        showStatusBanner={true}
        leftTitle={question.targetObject.vietnameseName}
        rightTitle="Đĩa quả cân (kg)"
        onRemoveRightItem={handleRemoveWeight}
        emptyRightPlaceholder="Chưa có quả cân nào, hãy bấm nút bên dưới!"
      />

      {/* Quả cân Deck (Standard Weights Selection) */}
      <div className="bg-white rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-kids font-bold text-slate-900 text-base sm:text-lg">
              Kho quả cân chuẩn bằng sắt (SGK)
            </h3>
            <p className="text-xs text-slate-500">
              Bấm vào quả cân để đặt lên đĩa cân bên phải
            </p>
          </div>

          {/* Right Pan Sum Readout */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold font-mono">
              Tổng quả cân: <span className="text-emerald-700 text-sm">{currentRightWeight} kg</span> / {question.targetWeightKg} kg
            </div>
            {placedWeights.length > 0 && !isAnswered && (
              <button
                onClick={handleClearWeights}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                title="Bỏ hết quả cân ra"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Weights Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {question.availableWeights.map((w) => (
            <button
              key={w}
              onClick={() => handleAddWeight(w)}
              disabled={isAnswered}
              className="group p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-kids font-bold text-base sm:text-lg shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-40 flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-600/80 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors flex items-center justify-center text-sm sm:text-base font-bold shadow-xs">
                {w} kg
              </div>
              <span className="text-xs sm:text-sm text-slate-200">
                + Thêm quả {w} kg
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Banner when balanced */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <p className="font-kids font-bold text-base sm:text-lg text-emerald-900">
                Chính xác rồi! Hai đĩa cân đã thăng bằng ngang nhau!
              </p>
              <p className="text-xs sm:text-sm text-emerald-800">
                {question.fact}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>{currentIndex + 1 < KILOGRAM_QUESTIONS.length ? 'Bài tiếp theo' : 'Hoàn thành trạm'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
