// Web Audio API Hospital Telemetry Chime Synthesizer
// Complies with browser autoplay policies by unlocking on user interaction

class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  // Pre-unlocks audio context on click / toggle
  unlock() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  // High Priority Clinical Alarm: Two-tone hospital telemetry chime
  playAlarm() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Medical standard alert melody (A5, A5, C6)
      const tones = [
        { freq: 880, start: 0, duration: 0.12 },
        { freq: 880, start: 0.16, duration: 0.12 },
        { freq: 1046.5, start: 0.32, duration: 0.25 }
      ];

      tones.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        // Soft attack and smooth decay to avoid audio clicks
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } catch (e) {
      console.warn('Audio alarm playback not allowed yet:', e);
    }
  }

  // Short gentle blip for UI confirmation and AudioContext priming
  playConfirmBlip() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Ignore silence
    }
  }
}

export const audioService = new AudioService();
export default audioService;
