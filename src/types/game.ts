/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'compare' | 'balance-count' | 'kilogram';

export interface ScaleItem {
  id: string;
  name: string;
  vietnameseName: string;
  category: 'animal' | 'fruit' | 'object' | 'weight';
  unitWeight: number; // in relative units or kg
  unitLabel: string; // e.g. "kg" or "đơn vị"
  emoji: string;
  color: string;
  iconType: 'bear' | 'dog' | 'cat' | 'rabbit' | 'squirrel' | 'duck' | 'chicken' | 
            'watermelon' | 'pomelo' | 'apple' | 'lemon' | 'banana' | 'pumpkin' | 
            'backpack' | 'pencilcase' | 'ricebag' | 'flour' |
            'weight1kg' | 'weight2kg' | 'weight5kg' | 'weight10kg';
}

export interface PlacedItem {
  instanceId: string;
  item: ScaleItem;
}

export interface CompareQuestion {
  id: number;
  title: string;
  story: string;
  leftItem: ScaleItem;
  rightItem: ScaleItem;
  promptQuestion: string;
  spokenPrompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
}

export interface BalanceCountQuestion {
  id: number;
  title: string;
  story: string;
  targetItem: ScaleItem;
  targetCount: number;
  counterItem: ScaleItem;
  requiredCounterCount: number;
  initialCounterCount: number; // usually 0 or partial
  promptQuestion: string;
  spokenPrompt: string;
  options?: number[];
  hint: string;
  learningRule: string;
}

export interface KilogramQuestion {
  id: number;
  title: string;
  story: string;
  targetObject: ScaleItem;
  targetWeightKg: number;
  availableWeights: number[]; // e.g. [1, 2, 5]
  promptQuestion: string;
  spokenPrompt: string;
  hint: string;
  fact: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
