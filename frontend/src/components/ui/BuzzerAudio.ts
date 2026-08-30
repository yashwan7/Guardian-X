/**
 * Audio Synthesizer for Buzzer Feedback in Browser
 * Uses standard Web Audio API (zero external audio files needed)
 */

class BuzzerSoundController {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play single short confirmation beep (e.g. Bank A Access Granted)
   */
  public playSuccessBeep(frequency = 2400, durationMs = 100) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  /**
   * Play double pleasant chime (e.g. Bank B MetroPay transaction)
   */
  public playMetroPayChime() {
    this.playSuccessBeep(2200, 80);
    setTimeout(() => {
      this.playSuccessBeep(3300, 100);
    }, 100);
  }

  /**
   * Play triple urgent alarm beep (e.g. Corrupted firmware / Watchdog Rollback)
   */
  public playAlarmBeep() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playSuccessBeep(1200, 150);
      }, i * 200);
    }
  }

  /**
   * Play rollback restoration tone
   */
  public playRollbackTone() {
    this.playSuccessBeep(1800, 100);
    setTimeout(() => {
      this.playSuccessBeep(2400, 150);
    }, 120);
  }
}

export const buzzerAudio = new BuzzerSoundController();
