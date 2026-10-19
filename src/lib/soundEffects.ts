/**
 * Pure Web Audio API Sound Synthesizer
 * Generates authentic IoT and Smart Home audio cues without external assets:
 * - Alexa activation chime (classic Echo double-tone)
 * - Ring Doorbell Westminster & chime
 * - Yale Smart Lock mechanical servo motor unlatch / lock
 * - Fire TV remote tactile click
 * - Bee Wearable haptic heartbeat ping
 * - Siren alarm pulse
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Alexa activation beep / Echo double chime
   */
  public playAlexaChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.setValueAtTime(880, now + 0.08); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now); // E6
    osc2.frequency.setValueAtTime(1760, now + 0.08); // A6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  /**
   * Ring Doorbell chime ("Ding Dong")
   */
  public playRingDoorbellChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // "Ding" (Higher chime)
    const oscDing = ctx.createOscillator();
    const gainDing = ctx.createGain();
    oscDing.type = 'sine';
    oscDing.frequency.setValueAtTime(880, now); // A5

    gainDing.gain.setValueAtTime(0, now);
    gainDing.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gainDing.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    oscDing.connect(gainDing);
    gainDing.connect(ctx.destination);
    oscDing.start(now);
    oscDing.stop(now + 0.66);

    // "Dong" (Lower chime, delayed)
    const oscDong = ctx.createOscillator();
    const gainDong = ctx.createGain();
    oscDong.type = 'sine';
    oscDong.frequency.setValueAtTime(659.25, now + 0.35); // E5

    gainDong.gain.setValueAtTime(0, now + 0.35);
    gainDong.gain.linearRampToValueAtTime(0.22, now + 0.37);
    gainDong.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    oscDong.connect(gainDong);
    gainDong.connect(ctx.destination);
    oscDong.start(now + 0.35);
    oscDong.stop(now + 1.21);
  }

  /**
   * Yale Smart Lock mechanical deadbolt servo sound
   */
  public playSmartLockSound(isUnlocking: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency sweeps up for unlock, down for lock
    if (isUnlocking) {
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.22);
    } else {
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.22);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Fire TV Remote D-pad tactile click
   */
  public playRemoteClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Bee Wearable biometric pulse / haptic beat
   */
  public playHeartbeatSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }
}

export const soundEffects = new SoundEffectsEngine();
