/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { PlacedItem, ScaleItem } from '../types/game';
import { Sparkles, ArrowDown, ArrowUp, CheckCircle2 } from 'lucide-react';

interface InteractiveScaleProps {
  leftItems: PlacedItem[];
  rightItems: PlacedItem[];
  onRemoveLeftItem?: (instanceId: string) => void;
  onRemoveRightItem?: (instanceId: string) => void;
  showWeights?: boolean;
  showStatusBanner?: boolean;
  leftTitle?: string;
  rightTitle?: string;
  emptyLeftPlaceholder?: string;
  emptyRightPlaceholder?: string;
  highlightBalanced?: boolean;
  interactive?: boolean;
}

export const InteractiveScale: React.FC<InteractiveScaleProps> = ({
  leftItems,
  rightItems,
  onRemoveLeftItem,
  onRemoveRightItem,
  showWeights = true,
  showStatusBanner = true,
  leftTitle = 'Đĩa Cân Trái',
  rightTitle = 'Đĩa Cân Phải',
  emptyLeftPlaceholder = 'Đang trống',
  emptyRightPlaceholder = 'Đang trống',
  highlightBalanced = true,
  interactive = true,
}) => {
  // Calculate total weights
  const totalLeftWeight = useMemo(() => {
    return leftItems.reduce((sum, item) => sum + item.item.unitWeight, 0);
  }, [leftItems]);

  const totalRightWeight = useMemo(() => {
    return rightItems.reduce((sum, item) => sum + item.item.unitWeight, 0);
  }, [rightItems]);

  // Compute tilt angle based on difference
  // Max tilt angle is +/- 13 degrees
  const diff = totalRightWeight - totalLeftWeight;
  const tiltAngle = useMemo(() => {
    if (Math.abs(diff) < 0.05) return 0;
    // Non-linear clamping for satisfying motion
    const sign = Math.sign(diff);
    const mag = Math.min(Math.abs(diff), 8);
    return sign * (5 + (mag / 8) * 8); // ranges from ~5 to 13 degrees
  }, [diff]);

  const isBalanced = Math.abs(diff) < 0.05 && (leftItems.length > 0 || rightItems.length > 0);

  // Vertical offsets for pans (in SVG coordinates)
  // Beam half-length is ~180px, angle in radians: deltaY = 180 * sin(angle)
  const angleRad = (tiltAngle * Math.PI) / 180;
  const beamHalfLength = 190;
  const leftPanDeltaY = -Math.sin(angleRad) * beamHalfLength;
  const rightPanDeltaY = Math.sin(angleRad) * beamHalfLength;

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center select-none">
      {/* Top Status Banner */}
      {showStatusBanner && (
        <div className="w-full flex justify-center mb-3">
          {isBalanced ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-kids text-lg shadow-sm animate-pulse">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Hai đĩa cân <strong>THĂNG BẰNG</strong> — Hai bên <strong>NẶNG BẰNG NHAU</strong>!</span>
            </div>
          ) : totalLeftWeight > totalRightWeight ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-sm md:text-base font-medium shadow-sm">
              <span className="flex items-center gap-1 font-bold text-amber-800">
                <ArrowDown className="w-4 h-4 text-rose-600 animate-bounce" /> Đĩa Trái chìm xuống (NẶNG HƠN)
              </span>
              <span className="text-amber-400">|</span>
              <span className="flex items-center gap-1 text-slate-600">
                <ArrowUp className="w-4 h-4 text-emerald-600 animate-bounce" /> Đĩa Phải nhấc lên (NHẸ HƠN)
              </span>
            </div>
          ) : totalRightWeight > totalLeftWeight ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-sm md:text-base font-medium shadow-sm">
              <span className="flex items-center gap-1 text-slate-600">
                <ArrowUp className="w-4 h-4 text-emerald-600 animate-bounce" /> Đĩa Trái nhấc lên (NHẸ HƠN)
              </span>
              <span className="text-amber-400">|</span>
              <span className="flex items-center gap-1 font-bold text-amber-800">
                <ArrowDown className="w-4 h-4 text-rose-600 animate-bounce" /> Đĩa Phải chìm xuống (NẶNG HƠN)
              </span>
            </div>
          ) : (
            <div className="text-slate-400 text-sm italic">
              Chiếc cân đang ở vị trí sẵn sàng
            </div>
          )}
        </div>
      )}

      {/* Main SVG Scale Container */}
      <div className="relative w-full aspect-[16/10] max-h-[380px] bg-gradient-to-b from-sky-50/60 via-amber-50/30 to-amber-100/50 rounded-3xl border border-amber-200/80 p-2 md:p-4 shadow-sm overflow-hidden flex flex-col justify-end">
        {/* Whimsical classroom / wood floor hint */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-amber-200/60 to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 600 360"
          className="w-full h-full overflow-visible"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))' }}
        >
          <defs>
            {/* Gradients for brass / golden mechanical parts */}
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>

            <linearGradient id="panGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="30%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 1. Base Pedestal (Fixed) */}
          <g id="base-pedestal">
            {/* Wide bottom base */}
            <path
              d="M 210,345 C 210,335 240,330 300,330 C 360,330 390,335 390,345 L 405,355 L 195,355 Z"
              fill="url(#pedestalGrad)"
              stroke="#78350f"
              strokeWidth="2"
            />
            {/* Center brass column */}
            <rect
              x="290"
              y="110"
              width="20"
              height="225"
              rx="4"
              fill="url(#brassGrad)"
              stroke="#854d0e"
              strokeWidth="1.5"
            />
            {/* Column decorative rings */}
            <rect x="286" y="160" width="28" height="8" rx="2" fill="url(#brassGrad)" stroke="#854d0e" strokeWidth="1" />
            <rect x="286" y="240" width="28" height="8" rx="2" fill="url(#brassGrad)" stroke="#854d0e" strokeWidth="1" />

            {/* Equilibrium indicator dial backplate behind the needle */}
            <path
              d="M 270,95 A 30 30 0 0 1 330,95 L 325,120 A 25 25 0 0 0 275,120 Z"
              fill="#ffffff"
              stroke="#854d0e"
              strokeWidth="1.5"
            />
            {/* Dial tick marks */}
            <line x1="300" y1="95" x2="300" y2="85" stroke="#dc2626" strokeWidth="2" />
            <line x1="285" y1="97" x2="280" y2="90" stroke="#64748b" strokeWidth="1.5" />
            <line x1="315" y1="97" x2="320" y2="90" stroke="#64748b" strokeWidth="1.5" />
          </g>

          {/* 2. Rotating Beam Group (Rotates around center fulcrum at 300, 110) */}
          <g
            id="rotating-beam"
            className="scale-beam-transition"
            style={{
              transformOrigin: '300px 110px',
              transform: `rotate(${tiltAngle}deg)`,
            }}
          >
            {/* The main horizontal beam bar */}
            <path
              d="M 110,105 L 290,103 L 300,98 L 310,103 L 490,105 L 490,115 L 310,117 L 300,122 L 290,117 L 110,115 Z"
              fill="url(#brassGrad)"
              stroke="#854d0e"
              strokeWidth="2"
              filter="url(#shadowGlow)"
            />

            {/* Left Beam Hook Loop */}
            <circle cx="110" cy="110" r="7" fill="none" stroke="#854d0e" strokeWidth="2.5" />
            <circle cx="110" cy="110" r="3" fill="#eab308" />

            {/* Right Beam Hook Loop */}
            <circle cx="490" cy="110" r="7" fill="none" stroke="#854d0e" strokeWidth="2.5" />
            <circle cx="490" cy="110" r="3" fill="#eab308" />

            {/* Needle indicator attached to beam (points straight up when beam is horizontal) */}
            <polygon
              points="297,110 300,55 303,110"
              fill={isBalanced ? '#16a34a' : '#dc2626'}
              stroke="#991b1b"
              strokeWidth="0.8"
            />
            {/* Center Pivot cap button */}
            <circle cx="300" cy="110" r="10" fill="url(#brassGrad)" stroke="#78350f" strokeWidth="2" />
            <circle cx="300" cy="110" r="4" fill="#fef08a" />
          </g>

          {/* 3. Left Pan Assembly (Moves vertically by leftPanDeltaY, stays horizontal) */}
          <g
            id="left-pan-assembly"
            className="pan-transition"
            style={{
              transform: `translate(0px, ${leftPanDeltaY}px)`,
            }}
          >
            {/* Suspension cords/chains from left hook (110, 110 + leftPanDeltaY) to pan edges */}
            <line x1="110" y1="110" x2="50" y2="245" stroke="#b45309" strokeWidth="1.8" strokeDasharray="3 2" />
            <line x1="110" y1="110" x2="170" y2="245" stroke="#b45309" strokeWidth="1.8" strokeDasharray="3 2" />
            <line x1="110" y1="110" x2="110" y2="248" stroke="#ca8a04" strokeWidth="1.5" />

            {/* Left Pan Dish */}
            <path
              d="M 45,245 C 50,270 80,285 110,285 C 140,285 170,270 175,245 C 175,242 165,240 110,240 C 55,240 45,242 45,245 Z"
              fill="url(#panGrad)"
              stroke="#78350f"
              strokeWidth="2.5"
              filter="url(#shadowGlow)"
            />
            {/* Pan Inner Rim Accent */}
            <ellipse cx="110" cy="245" rx="62" ry="7" fill="#fef08a" fillOpacity="0.4" />
          </g>

          {/* 4. Right Pan Assembly (Moves vertically by rightPanDeltaY, stays horizontal) */}
          <g
            id="right-pan-assembly"
            className="pan-transition"
            style={{
              transform: `translate(0px, ${rightPanDeltaY}px)`,
            }}
          >
            {/* Suspension cords/chains from right hook (490, 110 + rightPanDeltaY) to pan edges */}
            <line x1="490" y1="110" x2="430" y2="245" stroke="#b45309" strokeWidth="1.8" strokeDasharray="3 2" />
            <line x1="490" y1="110" x2="550" y2="245" stroke="#b45309" strokeWidth="1.8" strokeDasharray="3 2" />
            <line x1="490" y1="110" x2="490" y2="248" stroke="#ca8a04" strokeWidth="1.5" />

            {/* Right Pan Dish */}
            <path
              d="M 425,245 C 430,270 460,285 490,285 C 520,285 550,270 555,245 C 555,242 545,240 490,240 C 435,240 425,242 425,245 Z"
              fill="url(#panGrad)"
              stroke="#78350f"
              strokeWidth="2.5"
              filter="url(#shadowGlow)"
            />
            {/* Pan Inner Rim Accent */}
            <ellipse cx="490" cy="245" rx="62" ry="7" fill="#fef08a" fillOpacity="0.4" />
          </g>
        </svg>

        {/* 5. HTML Content Layer over the Left & Right Pans */}
        {/* Left Pan Overlay Container */}
        <div
          className="absolute left-[3%] sm:left-[5%] md:left-[8%] w-[38%] max-w-[210px] pointer-events-auto pan-transition flex flex-col items-center"
          style={{
            bottom: `${26 - leftPanDeltaY * 0.28}%`,
          }}
        >
          {/* Header pill for Left Pan */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-950 text-xs font-semibold shadow-xs mb-1">
            <span>{leftTitle}</span>
            {showWeights && (
              <span className="font-mono text-amber-800 bg-white/70 px-1.5 py-0.5 rounded text-[11px]">
                {totalLeftWeight} {leftItems[0]?.item.unitLabel || 'kg'}
              </span>
            )}
          </div>

          {/* Items Container on Left Pan */}
          <div className="w-full min-h-[90px] max-h-[140px] overflow-y-auto rounded-2xl bg-white/75 backdrop-blur-xs border border-amber-300/80 p-2 shadow-sm flex flex-wrap gap-1.5 justify-center items-center content-center">
            {leftItems.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center p-2">
                {emptyLeftPlaceholder}
              </div>
            ) : (
              leftItems.map((pi) => (
                <div
                  key={pi.instanceId}
                  className="group relative flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-b from-white to-amber-50 border border-amber-300 text-xs font-medium text-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-default"
                  title={`${pi.item.vietnameseName} (${pi.item.unitWeight} ${pi.item.unitLabel})`}
                >
                  <span className="text-base select-none">{pi.item.emoji}</span>
                  <span className="font-kids font-semibold truncate max-w-[65px]">
                    {pi.item.name}
                  </span>
                  {showWeights && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {pi.item.unitWeight}{pi.item.unitLabel === 'kg' ? 'kg' : ''}
                    </span>
                  )}
                  {interactive && onRemoveLeftItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLeftItem(pi.instanceId);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 p-0.5 rounded"
                      aria-label={`Xóa ${pi.item.name}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pan Overlay Container */}
        <div
          className="absolute right-[3%] sm:right-[5%] md:right-[8%] w-[38%] max-w-[210px] pointer-events-auto pan-transition flex flex-col items-center"
          style={{
            bottom: `${26 - rightPanDeltaY * 0.28}%`,
          }}
        >
          {/* Header pill for Right Pan */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100/90 text-sky-950 text-xs font-semibold shadow-xs mb-1">
            <span>{rightTitle}</span>
            {showWeights && (
              <span className="font-mono text-sky-800 bg-white/70 px-1.5 py-0.5 rounded text-[11px]">
                {totalRightWeight} {rightItems[0]?.item.unitLabel || 'kg'}
              </span>
            )}
          </div>

          {/* Items Container on Right Pan */}
          <div className="w-full min-h-[90px] max-h-[140px] overflow-y-auto rounded-2xl bg-white/75 backdrop-blur-xs border border-sky-300/80 p-2 shadow-sm flex flex-wrap gap-1.5 justify-center items-center content-center">
            {rightItems.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center p-2">
                {emptyRightPlaceholder}
              </div>
            ) : (
              rightItems.map((pi) => (
                <div
                  key={pi.instanceId}
                  className="group relative flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-b from-white to-sky-50 border border-sky-300 text-xs font-medium text-slate-800 shadow-xs hover:border-sky-500 transition-all cursor-default"
                  title={`${pi.item.vietnameseName} (${pi.item.unitWeight} ${pi.item.unitLabel})`}
                >
                  <span className="text-base select-none">{pi.item.emoji}</span>
                  <span className="font-kids font-semibold truncate max-w-[65px]">
                    {pi.item.name}
                  </span>
                  {showWeights && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {pi.item.unitWeight}{pi.item.unitLabel === 'kg' ? 'kg' : ''}
                    </span>
                  )}
                  {interactive && onRemoveRightItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRightItem(pi.instanceId);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 p-0.5 rounded"
                      aria-label={`Xóa ${pi.item.name}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
