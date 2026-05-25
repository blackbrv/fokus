let audioCtx: AudioContext | null = null;

function ensureContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(frequency: number, start: number, duration: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.3, start);
  gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

export function useAudio() {
  const playBreakChime = () => {
    const ctx = ensureContext();
    const t = ctx.currentTime;
    playTone(880, t, 0.4, ctx);
    playTone(660, t + 0.15, 0.25, ctx);
  };

  const playFocusChime = () => {
    const ctx = ensureContext();
    const t = ctx.currentTime;
    playTone(523, t, 0.5, ctx);
    playTone(659, t + 0.18, 0.35, ctx);
    playTone(784, t + 0.36, 0.2, ctx);
  };

  return { playBreakChime, playFocusChime };
}
