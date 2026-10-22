/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API synthesizer for clean, instant, failure-proof sound effects and background music
class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private speechEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicGainNode: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  // --- Background Music (BGM) Engine ---
  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public toggleMusic(): boolean {
    const nextState = !this.musicEnabled;
    this.setMusicEnabled(nextState);
    return nextState;
  }

  private startMusic() {
    this.stopMusic();
    const ctx = this.getContext();
    if (!ctx) return;

    // Create a gentle master gain node for background music
    this.musicGainNode = ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(0.045, ctx.currentTime);

    // Warm low-pass filter to give marimba / music-box warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    this.musicGainNode.connect(filter);
    filter.connect(ctx.destination);

    // Cute pentatonic melody loops (C Major pentatonic: C4, D4, E4, G4, A4, C5)
    // 16 beats per loop, 0.35s per beat (~85 BPM)
    const beatLen = 0.35;
    const loopDuration = 16 * beatLen; // 5.6 seconds per pattern

    const melodyNotes: { note: number; beat: number; dur: number; bass?: number }[] = [
      // Measure 1 (C Major)
      { note: 523.25, beat: 0, dur: 0.25, bass: 130.81 }, // C5, C3
      { note: 659.25, beat: 1, dur: 0.25 },               // E5
      { note: 783.99, beat: 2, dur: 0.30 },               // G5
      { note: 659.25, beat: 3, dur: 0.20 },               // E5
      // Measure 2 (F Major)
      { note: 587.33, beat: 4, dur: 0.25, bass: 174.61 }, // D5, F3
      { note: 659.25, beat: 5, dur: 0.25 },               // E5
      { note: 523.25, beat: 6, dur: 0.40 },               // C5
      { note: 440.00, beat: 7, dur: 0.20 },               // A4
      // Measure 3 (G Major)
      { note: 493.88, beat: 8, dur: 0.25, bass: 196.00 }, // B4, G3
      { note: 587.33, beat: 9, dur: 0.25 },               // D5
      { note: 659.25, beat: 10, dur: 0.25 },              // E5
      { note: 783.99, beat: 11, dur: 0.25 },              // G5
      // Measure 4 (C Major Resolution)
      { note: 880.00, beat: 12, dur: 0.30, bass: 130.81 }, // A5, C3
      { note: 783.99, beat: 13, dur: 0.25 },               // G5
      { note: 659.25, beat: 14, dur: 0.25 },               // E5
      { note: 523.25, beat: 15, dur: 0.40 },               // C5
    ];

    const schedulePattern = (startTime: number) => {
      if (!this.musicEnabled || !this.musicGainNode || !this.ctx) return;

      melodyNotes.forEach(({ note, beat, dur, bass }) => {
        const noteTime = startTime + beat * beatLen;

        // Treble marimba tone (soft sine + triangle bell)
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, noteTime);

        noteGain.gain.setValueAtTime(0, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.7, noteTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur + 0.15);

        osc.connect(noteGain);
        noteGain.connect(this.musicGainNode!);

        osc.start(noteTime);
        osc.stop(noteTime + dur + 0.2);

        // Gentle acoustic bass note at measure head
        if (bass) {
          const bassOsc = this.ctx!.createOscillator();
          const bassGain = this.ctx!.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(bass, noteTime);

          bassGain.gain.setValueAtTime(0, noteTime);
          bassGain.gain.linearRampToValueAtTime(0.5, noteTime + 0.03);
          bassGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

          bassOsc.connect(bassGain);
          bassGain.connect(this.musicGainNode!);

          bassOsc.start(noteTime);
          bassOsc.stop(noteTime + 0.7);
        }
      });
    };

    // Schedule the first pattern immediately
    let nextPatternTime = ctx.currentTime + 0.05;
    schedulePattern(nextPatternTime);

    // Schedule subsequent patterns smoothly
    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      if (this.ctx.currentTime >= nextPatternTime - 0.5) {
        nextPatternTime += loopDuration;
        schedulePattern(nextPatternTime);
      }
    }, (loopDuration * 1000) / 2);
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGainNode && this.ctx) {
      try {
        this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, this.ctx.currentTime);
        this.musicGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      } catch {}
      this.musicGainNode = null;
    }
  }

  // Play a cheerful chime when child answers correctly
  public playCorrect() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major arpeggio)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  // Play a gentle, encouraging boing when child answers incorrectly
  public playWrong() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Soft clink when adding or removing an item on the scale
  public playItemDrop() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Metallic gentle scale creak/sway
  public playScaleCreak() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(392, now + 0.12);
    osc.frequency.linearRampToValueAtTime(349, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Celebration fanfare when finishing a station
  public playFanfare() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.12 },
      { f: 523.25, d: 0.12, t: 0.24 },
      { f: 659.25, d: 0.24, t: 0.36 },
      { f: 783.99, d: 0.24, t: 0.60 },
      { f: 1046.50, d: 0.50, t: 0.84 },
    ];

    melody.forEach(({ f, d, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.25, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Vietnamese Speech Synthesis helper for reading instructions aloud
  public speakVietnamese(text: string) {
    if (!this.speechEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // slightly slower for Grade 2 children
    utterance.pitch = 1.1; // friendly, gentle pitch

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VIE'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundMgr = new SoundManager();
