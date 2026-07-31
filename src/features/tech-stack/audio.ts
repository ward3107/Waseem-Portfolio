import { getAudioContext } from '@/lib/browser';
import type { SoundType } from './config';

export const playSound = (type: SoundType) => {
  try {
    const AudioContextConstructor = getAudioContext();
    if (!AudioContextConstructor) return;

    const ctx = new AudioContextConstructor();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
    gainNode.connect(masterGain);

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'laser') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'bomb') {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp((-3 * i) / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.gain.setValueAtTime(0.8, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      noise.start(now);
    } else if (type === 'shatter') {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.connect(gainNode);
      noise.start(now);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gn.gain.setValueAtTime(0.1, now + i * 0.1);
        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } else if (type === 'tier') {
      // Short two-note "unlock" chime for half-percent tiers — quick,
      // rewarding, doesn't interrupt play.
      const notes = [880, 1174.66];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gn.gain.setValueAtTime(0.15, now + i * 0.06);
        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } else if (type === 'milestone') {
      // Ascending arpeggio + shimmer for whole-percent milestones
      // (2/4/6/8). Bigger deal than 'tier', still shorter than 'win'.
      const arpeggio = [523.25, 659.25, 783.99, 1046.5];
      arpeggio.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gn.gain.setValueAtTime(0.12, now + i * 0.08);
        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(2093, now + 0.32);
      shimmerGain.gain.setValueAtTime(0.05, now + 0.32);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(masterGain);
      shimmer.start(now + 0.32);
      shimmer.stop(now + 0.9);
    } else if (type === 'finale') {
      // Full 10% victory fanfare: two-octave arpeggio + sustained major chord.
      const arp = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093];
      arp.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gn.gain.setValueAtTime(0.1, now + i * 0.09);
        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.35);
      });
      const chord = [523.25, 659.25, 783.99];
      const chordStart = now + arp.length * 0.09;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordStart);
        gn.gain.setValueAtTime(0.09, chordStart);
        gn.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.2);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(chordStart);
        osc.stop(chordStart + 1.2);
      });
    } else if (type === 'redeem') {
      // Cash-register "ka-ching": bright metallic ping followed by a
      // resonant bell. Fires when the reward modal opens.
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'square';
      ping.frequency.setValueAtTime(1760, now);
      pingGain.gain.setValueAtTime(0.15, now);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      ping.connect(pingGain);
      pingGain.connect(masterGain);
      ping.start(now);
      ping.stop(now + 0.15);

      const bellNotes = [1046.5, 1318.51, 1567.98];
      bellNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.1 + i * 0.05);
        gn.gain.setValueAtTime(0.12, now + 0.1 + i * 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.05 + 0.6);
        osc.connect(gn);
        gn.connect(masterGain);
        osc.start(now + 0.1 + i * 0.05);
        osc.stop(now + 0.1 + i * 0.05 + 0.6);
      });
    }
  } catch (e) {
    console.debug('Audio playback error:', e);
  }
};
