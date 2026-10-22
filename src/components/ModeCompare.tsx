/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COMPARE_QUESTIONS } from '../data/curriculumData';
import { InteractiveScale } from './InteractiveScale';
import { MascotMessage } from './MascotMessage';
import { soundMgr } from '../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface ModeCompareProps {
  onScoreEarned: (points: number) => void;
  onCompleteStation: () => void;
  onGoToNextStation?: () => void;
}

export const ModeCompare: React.FC<ModeCompareProps> = ({
  onScoreEarned,
  onCompleteStation,
  onGoToNextStation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const question = COMPARE_QUESTIONS[currentIndex];

  const leftItems = [
    {
      instanceId: `left-${question.leftItem.id}`,
      item: question.leftItem,
    },
  ];

  const rightItems = [
    {
      instanceId: `right-${question.rightItem.id}`,
      item: question.rightItem,
    },
  ];

  const handleSelectOption = (optionId: string, isOptCorrect: boolean) => {
    if (isAnswered && isCorrect) return; // already solved

    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setIsCorrect(isOptCorrect);

    if (isOptCorrect) {
      soundMgr.playCorrect();
      onScoreEarned(10);

      // Light confetti burst
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch {
        // ignore if confetti blocked
      }
    } else {
      soundMgr.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < COMPARE_QUESTIONS.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
      soundMgr.playFanfare();
      onCompleteStation();
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleRestartStation = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center bg-white rounded-3xl border border-amber-200/80 p-8 shadow-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl mb-4 shadow-xs">
          🏆
        </div>
        <h2 className="text-2xl sm:text-3xl font-kids font-bold text-amber-950 mb-2">
          Xuất Sắc! Bé Đã Hoàn Thành Thử Thách 1!
        </h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Bé đã phân biệt cực kỳ chuẩn xác vật nào nặng hơn, nhẹ hơn và khi nào hai vật nặng bằng nhau trên cân đĩa!
        </p>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 mb-6 text-sm text-amber-900 text-left">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Ghi nhớ bài học:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Đĩa cân hạ xuống thấp hơn: Vật bên đó <strong>NẶNG HƠN</strong>.</li>
            <li>Đĩa cân nâng lên cao hơn: Vật bên đó <strong>NHẸ HƠN</strong>.</li>
            <li>Hai đĩa cân ngang bằng nhau: Hai vật <strong>NẶNG BẰNG NHAU</strong>.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onGoToNextStation && (
            <button
              onClick={onGoToNextStation}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-kids font-bold text-base shadow-sm hover:shadow transition-all cursor-pointer animate-pulse"
            >
              <span>Tiến vào Trạm 2: Đếm & Quy đổi</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleRestartStation}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Ôn tập lại trạm 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Station Header & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Trạm 1 · Khám phá khối lượng
          </span>
          <h2 className="text-xl sm:text-2xl font-kids font-bold text-slate-900">
            {question.title}
          </h2>
        </div>

        {/* Question Counter Badges */}
        <div className="flex items-center gap-1.5">
          {COMPARE_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentIndex(idx);
                setSelectedOptionId(null);
                setIsAnswered(false);
                setIsCorrect(false);
              }}
              className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                idx === currentIndex
                  ? 'bg-amber-500 text-white shadow-xs scale-105'
                  : idx < currentIndex
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title={`Câu ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Mascot Teacher Prompt */}
      <MascotMessage
        message={question.promptQuestion}
        spokenText={question.spokenPrompt}
        hint={question.hint}
      />

      {/* Interactive Balance Scale Visualizer */}
      <InteractiveScale
        leftItems={leftItems}
        rightItems={rightItems}
        showWeights={false} // Hidden so child observes physical height
        showStatusBanner={false}
        leftTitle={question.leftItem.vietnameseName}
        rightTitle={question.rightItem.vietnameseName}
        interactive={false}
      />

      {/* Multiple-Choice Answer Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
        {question.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let btnStyle = 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 hover:bg-amber-50/50';

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs ring-2 ring-emerald-200';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200';
            } else {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
              disabled={isAnswered && isCorrect}
              className={`p-4 rounded-2xl border-2 text-left font-kids font-semibold text-base sm:text-lg transition-all shadow-xs flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
            >
              <span>{opt.text}</span>
              {isAnswered && opt.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {isAnswered && isSelected && !opt.isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next Button */}
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
                {isCorrect ? 'Tuyệt vời, bé trả lời đúng rồi!' : 'Chưa đúng rồi bé ơi! Thử quan sát lại nhé:'}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                {question.options.find((o) => o.id === selectedOptionId)?.explanation}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isCorrect ? (
              <button
                onClick={handleRetryQuestion}
                className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Thử lại nào
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                <span>{currentIndex + 1 < COMPARE_QUESTIONS.length ? 'Câu tiếp theo' : 'Hoàn thành trạm'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Golden Learning Rule Card */}
      <div className="mt-2 p-3 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs sm:text-sm text-amber-950 flex items-center gap-3">
        <span className="text-2xl select-none" aria-hidden="true">💡</span>
        <div className="leading-snug">
          <strong className="text-amber-900">Bí kíp chiếc cân thăng bằng:</strong> Đĩa cân bên nào hạ xuống thấp hơn thì vật bên đó <span className="text-rose-700 font-bold">NẶNG HƠN</span>. Đĩa cân bên nào nhấc lên cao hơn thì vật bên đó <span className="text-sky-700 font-bold">NHẸ HƠN</span>!
        </div>
      </div>
    </div>
  );
};
