/**
 * Offline Web Audio API synthesizer for UI sound effects AND an authentic
 * Nordic / Viking vocal humming ("زمزمه وایکینگی") & Tagelharpa ambient music engine.
 *
 * Features:
 * 1. Formant-Filtered Male Viking Choir Humming ("Mmm / Ooo / Ahh" modal phrases in D Dorian / Aeolian)
 *    with natural human vibrato, chest resonance, and slow breathing swells.
 * 2. Bowed Tagelharpa horsehair string fifths (D2 + A2 open drone & melodic overtones).
 * 3. Deep ritual longhouse frame-drum heartbeat & subtle fjord wind atmosphere.
 * Zero external sound assets required.
 */

import { Season } from '../types/game';

let audioCtx: AudioContext | null = null;

interface AmbientEngineNodes {
  masterGain: GainNode;
  droneOscs: OscillatorNode[];
  lfoOscs: OscillatorNode[];
  windSource: AudioBufferSourceNode;
  windFilter: BiquadFilterNode;
  windGain: GainNode;
  phraseTimer: number | null;
  drumTimer: number | null;
}

let ambientNodes: AmbientEngineNodes | null = null;
let desiredAmbientActive = false;
let desiredAmbientVolume = 0.65;
let desiredAmbientSeason: Season = Season.Spring;
let melodyStepIndex = 0;

/**
 * Haunting Nordic vocal humming phrases in D Dorian / D Aeolian (Hz).
 * Sung by synthesized low male baritone/bass choir voices.
 */
const VIKING_HUM_PHRASES: {
  freq: number;
  harmonyFreq: number;
  vowel: 'mmm' | 'ooo' | 'ahh';
  duration: number;
}[] = [
  // Phrase 1: Solemn Nordic call (D3 -> F3 -> G3 -> A3 -> G3 -> F3 -> E3 -> D3)
  { freq: 146.83, harmonyFreq: 110.0, vowel: 'mmm', duration: 4.2 }, // D3 + A2
  { freq: 174.61, harmonyFreq: 110.0, vowel: 'ooo', duration: 3.6 }, // F3 + A2
  { freq: 196.0, harmonyFreq: 146.83, vowel: 'ahh', duration: 4.4 }, // G3 + D3
  { freq: 220.0, harmonyFreq: 146.83, vowel: 'ooo', duration: 4.8 }, // A3 + D3
  { freq: 196.0, harmonyFreq: 130.81, vowel: 'mmm', duration: 3.6 }, // G3 + C3
  { freq: 174.61, harmonyFreq: 110.0, vowel: 'ooo', duration: 3.8 }, // F3 + A2
  { freq: 164.81, harmonyFreq: 110.0, vowel: 'mmm', duration: 3.4 }, // E3 + A2
  { freq: 146.83, harmonyFreq: 73.42, vowel: 'mmm', duration: 5.2 },  // D3 + D2 deep resolve
  // Phrase 2: Deep throat-hum descent (A2 -> C3 -> D3 -> C3 -> A2 -> G2 -> D2)
  { freq: 110.0, harmonyFreq: 73.42, vowel: 'mmm', duration: 4.5 },  // A2 + D2
  { freq: 130.81, harmonyFreq: 73.42, vowel: 'ooo', duration: 3.8 }, // C3 + D2
  { freq: 146.83, harmonyFreq: 110.0, vowel: 'ahh', duration: 4.6 }, // D3 + A2
  { freq: 130.81, harmonyFreq: 87.31, vowel: 'ooo', duration: 3.8 }, // C3 + F2
  { freq: 110.0, harmonyFreq: 73.42, vowel: 'mmm', duration: 4.8 },  // A2 + D2
];

const VOWEL_FORMANTS: Record<
  'mmm' | 'ooo' | 'ahh',
  { f1: number; f2: number; f3: number; q1: number; q2: number; nasalGain: number }
> = {
  // Closed-lip resonant Viking humming ("زمزمه")
  mmm: { f1: 275, f2: 820, f3: 2150, q1: 4.2, q2: 5.0, nasalGain: 0.55 },
  // Deep Nordic choir "Ooo" chant
  ooo: { f1: 330, f2: 760, f3: 2250, q1: 3.8, q2: 4.5, nasalGain: 0.42 },
  // Warm open hall chant "Ahh / Ohm"
  ahh: { f1: 520, f2: 1050, f3: 2400, q1: 3.5, q2: 4.2, nasalGain: 0.32 },
};

function getSeasonWindTarget(season: Season): { cutoff: number; gain: number } {
  switch (season) {
    case Season.Winter:
      return { cutoff: 260, gain: 0.14 }; // Distant winter fjord breeze
    case Season.Autumn:
      return { cutoff: 200, gain: 0.12 };
    case Season.Summer:
      return { cutoff: 115, gain: 0.08 };
    case Season.Spring:
    default:
      return { cutoff: 150, gain: 0.1 };
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctor) {
      audioCtx = new Ctor();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function createBrownianWindBuffer(ctx: AudioContext): AudioBuffer {
  const durationSec = 5;
  const length = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    const edgeFade =
      i < 2400 ? i / 2400 : i > length - 2400 ? (length - i) / 2400 : 1;
    data[i] = lastOut * 2.2 * edgeFade;
  }
  return buffer;
}

/**
 * Synthesizes a single rich human-like Viking vocal hum note using parallel formant filters,
 * chest sub-harmonic warmth, and natural 4.8Hz human vocal vibrato.
 */
function playVikingVocalHumNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  harmonyFreq: number,
  vowel: 'mmm' | 'ooo' | 'ahh',
  duration: number
): void {
  const now = ctx.currentTime;
  const formants = VOWEL_FORMANTS[vowel];

  const noteMaster = ctx.createGain();
  // Smooth human breath envelope (gradual inhale swell, warm sustain, gentle release)
  noteMaster.gain.setValueAtTime(0.0001, now);
  noteMaster.gain.linearRampToValueAtTime(0.32, now + Math.min(1.1, duration * 0.28));
  noteMaster.gain.setValueAtTime(0.32, now + duration * 0.62);
  noteMaster.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.65);
  noteMaster.connect(destination);

  // Natural human vocal vibrato (4.8 Hz, gentle pitch modulation)
  const vibratoOsc = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  vibratoOsc.type = 'sine';
  vibratoOsc.frequency.setValueAtTime(4.7 + Math.random() * 0.4, now);
  vibratoGain.gain.setValueAtTime(1.4, now); // ~1.4 Hz subtle vocal shimmer
  vibratoOsc.connect(vibratoGain);
  vibratoOsc.start(now);
  vibratoOsc.stop(now + duration + 0.7);

  // Formant Filter Bank (F1 chest/throat, F2 mouth/nasal cavity, F3 vocal presence)
  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(formants.f1, now);
  f1.Q.setValueAtTime(formants.q1, now);

  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(formants.f2, now);
  f2.Q.setValueAtTime(formants.q2, now);

  const f3 = ctx.createBiquadFilter();
  f3.type = 'bandpass';
  f3.frequency.setValueAtTime(formants.f3, now);
  f3.Q.setValueAtTime(5.5, now);

  // Warm nasal/chest lowpass for closed-lip humming resonance ("زمزمه")
  const chestFilter = ctx.createBiquadFilter();
  chestFilter.type = 'lowpass';
  chestFilter.frequency.setValueAtTime(340, now);
  chestFilter.Q.setValueAtTime(1.4, now);

  const chestGain = ctx.createGain();
  chestGain.gain.setValueAtTime(formants.nasalGain, now);

  const f1Gain = ctx.createGain();
  f1Gain.gain.setValueAtTime(0.7, now);
  const f2Gain = ctx.createGain();
  f2Gain.gain.setValueAtTime(0.35, now);
  const f3Gain = ctx.createGain();
  f3Gain.gain.setValueAtTime(0.1, now);

  f1.connect(f1Gain);
  f2.connect(f2Gain);
  f3.connect(f3Gain);
  chestFilter.connect(chestGain);

  f1Gain.connect(noteMaster);
  f2Gain.connect(noteMaster);
  f3Gain.connect(noteMaster);
  chestGain.connect(noteMaster);

  // Create choir ensemble oscillators (lead baritone hum + double + fifth throat harmony)
  const voices: { f: number; detune: number; type: OscillatorType; gain: number }[] = [
    { f: freq, detune: -4, type: 'sawtooth', gain: 0.42 },
    { f: freq, detune: 5, type: 'sawtooth', gain: 0.38 },
    { f: freq * 0.5, detune: 0, type: 'triangle', gain: 0.35 }, // Sub-octave chest hum
    { f: harmonyFreq, detune: -3, type: 'sawtooth', gain: 0.25 }, // Fifth/drone harmony singer
    { f: harmonyFreq, detune: 4, type: 'triangle', gain: 0.22 },
  ];

  for (const v of voices) {
    const osc = ctx.createOscillator();
    const vGain = ctx.createGain();
    osc.type = v.type;
    // Slight human pitch glide (portamento) into the note
    osc.frequency.setValueAtTime(v.f * 0.985, now);
    osc.frequency.exponentialRampToValueAtTime(v.f, now + 0.22);
    osc.detune.setValueAtTime(v.detune, now);

    vibratoGain.connect(osc.frequency);

    vGain.gain.setValueAtTime(v.gain, now);
    osc.connect(vGain);

    vGain.connect(f1);
    vGain.connect(f2);
    vGain.connect(f3);
    vGain.connect(chestFilter);

    osc.start(now);
    osc.stop(now + duration + 0.7);
  }
}

/**
 * Triggers the next note in the Viking vocal humming & Tagelharpa melody sequence.
 */
function triggerNordicVocalStep(): void {
  if (!ambientNodes || !audioCtx || audioCtx.state !== 'running' || !desiredAmbientActive) {
    return;
  }

  try {
    const phrase = VIKING_HUM_PHRASES[melodyStepIndex % VIKING_HUM_PHRASES.length];
    melodyStepIndex = (melodyStepIndex + 1) % VIKING_HUM_PHRASES.length;

    // 1. Play the Viking vocal hum note
    playVikingVocalHumNote(
      audioCtx,
      ambientNodes.masterGain,
      phrase.freq,
      phrase.harmonyFreq,
      phrase.vowel,
      phrase.duration
    );

    // 2. Subtle bowed Tagelharpa / Kravik lyre overtone accompaniment on alternating notes
    if (melodyStepIndex % 2 === 1) {
      const now = audioCtx.currentTime;
      const lyreOsc = audioCtx.createOscillator();
      const lyreGain = audioCtx.createGain();
      const lyreFilter = audioCtx.createBiquadFilter();

      lyreOsc.type = 'triangle';
      lyreOsc.frequency.setValueAtTime(phrase.freq * 2, now + 0.35);

      lyreFilter.type = 'lowpass';
      lyreFilter.frequency.setValueAtTime(620, now + 0.35);

      lyreGain.gain.setValueAtTime(0.0001, now + 0.35);
      lyreGain.gain.linearRampToValueAtTime(0.055, now + 0.55);
      lyreGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      lyreOsc.connect(lyreFilter);
      lyreFilter.connect(lyreGain);
      lyreGain.connect(ambientNodes.masterGain);

      lyreOsc.start(now + 0.35);
      lyreOsc.stop(now + 2.9);
    }
  } catch {
    // Ignore transient Web Audio errors
  }
}

/**
 * Deep, steady shamanic / longhouse frame-drum heartbeat accompanying the vocal hum.
 */
function triggerRitualFrameDrum(): void {
  if (!ambientNodes || !audioCtx || audioCtx.state !== 'running' || !desiredAmbientActive) {
    return;
  }

  try {
    const now = audioCtx.currentTime;

    // Primary deep skin-drum beat (D1 fundamental thud)
    const drumOsc = audioCtx.createOscillator();
    const drumGain = audioCtx.createGain();
    const drumFilter = audioCtx.createBiquadFilter();

    drumOsc.type = 'sine';
    drumOsc.frequency.setValueAtTime(68, now);
    drumOsc.frequency.exponentialRampToValueAtTime(36, now + 0.38);

    drumFilter.type = 'lowpass';
    drumFilter.frequency.setValueAtTime(135, now);

    drumGain.gain.setValueAtTime(0.0001, now);
    drumGain.gain.linearRampToValueAtTime(0.2, now + 0.025);
    drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    drumOsc.connect(drumFilter);
    drumFilter.connect(drumGain);
    drumGain.connect(ambientNodes.masterGain);

    drumOsc.start(now);
    drumOsc.stop(now + 0.6);

    // Soft secondary heartbeat echo (lub-dub ritual cadence)
    const echoOsc = audioCtx.createOscillator();
    const echoGain = audioCtx.createGain();
    echoOsc.type = 'triangle';
    echoOsc.frequency.setValueAtTime(54, now + 0.42);
    echoOsc.frequency.exponentialRampToValueAtTime(32, now + 0.72);

    echoGain.gain.setValueAtTime(0.0001, now + 0.42);
    echoGain.gain.linearRampToValueAtTime(0.09, now + 0.45);
    echoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    echoOsc.connect(drumFilter);
    drumFilter.connect(echoGain);
    echoGain.connect(ambientNodes.masterGain);

    echoOsc.start(now + 0.42);
    echoOsc.stop(now + 0.9);
  } catch {
    // Ignore transient Web Audio errors
  }
}

function targetMasterGainValue(volume: number): number {
  const clamped = Math.max(0.05, Math.min(1, volume));
  // Rich, warm, clearly audible Viking vocal humming & drone level
  return clamped * 0.34;
}

export function syncAmbientSoundscape(
  active: boolean,
  volume = 0.65,
  season: Season = desiredAmbientSeason
): void {
  desiredAmbientActive = active;
  desiredAmbientVolume = volume;
  desiredAmbientSeason = season;

  if (!active) {
    stopAmbientSoundscape();
    return;
  }

  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const targetGain = targetMasterGainValue(volume);
  const windTarget = getSeasonWindTarget(season);

  if (ambientNodes) {
    try {
      ambientNodes.masterGain.gain.cancelScheduledValues(now);
      ambientNodes.masterGain.gain.setValueAtTime(
        Math.max(0.0001, ambientNodes.masterGain.gain.value),
        now
      );
      ambientNodes.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.35);

      ambientNodes.windFilter.frequency.cancelScheduledValues(now);
      ambientNodes.windFilter.frequency.setValueAtTime(
        ambientNodes.windFilter.frequency.value,
        now
      );
      ambientNodes.windFilter.frequency.linearRampToValueAtTime(windTarget.cutoff, now + 1.2);

      ambientNodes.windGain.gain.cancelScheduledValues(now);
      ambientNodes.windGain.gain.setValueAtTime(ambientNodes.windGain.gain.value, now);
      ambientNodes.windGain.gain.linearRampToValueAtTime(windTarget.gain, now + 1.2);
    } catch {
      // Ignore
    }
    return;
  }

  try {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(targetGain, now + 1.4);
    masterGain.connect(ctx.destination);

    // 1. Continuous Low Throat-Drone & Bowed Tagelharpa Fifths (D1 36.71Hz, A1 55.0Hz, D2 73.42Hz, A2 110Hz)
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(240, now);
    droneFilter.Q.setValueAtTime(1.3, now);
    droneFilter.connect(masterGain);

    // Slow chest-breathing LFO modulating the drone filter cutoff
    const filterLfo = ctx.createOscillator();
    const filterLfoGain = ctx.createGain();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.08, now);
    filterLfoGain.gain.setValueAtTime(70, now);
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(droneFilter.frequency);
    filterLfo.start(now);

    const droneConfigs: { freq: number; type: OscillatorType; detune: number; gain: number }[] = [
      { freq: 36.71, type: 'sine', detune: 0, gain: 0.38 },     // Deep sub-bass D1 root
      { freq: 73.42, type: 'sawtooth', detune: -3, gain: 0.16 }, // Bass throat-singing D2
      { freq: 73.42, type: 'triangle', detune: 4, gain: 0.18 },  // Warm D2 chorus
      { freq: 110.0, type: 'triangle', detune: -2, gain: 0.14 }, // Open fifth A2 hum
    ];

    const droneOscs: OscillatorNode[] = [];
    for (const cfg of droneConfigs) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.freq, now);
      osc.detune.setValueAtTime(cfg.detune, now);
      g.gain.setValueAtTime(cfg.gain, now);
      osc.connect(g);
      g.connect(droneFilter);
      osc.start(now);
      droneOscs.push(osc);
    }

    // 2. Subtle Nordic Fjord Breeze beneath the vocal chant
    const windBuffer = createBrownianWindBuffer(ctx);
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(windTarget.cutoff, now);
    windFilter.Q.setValueAtTime(0.7, now);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(windTarget.gain, now);

    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.09, now);
    windLfoGain.gain.setValueAtTime(0.04, now);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);
    windLfo.start(now);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windSource.start(now);

    // 3. Schedule continuous Viking Vocal Humming Phrases ("زمزمه وایکینگی") & Ritual Drum
    const phraseTimer = window.setInterval(() => {
      triggerNordicVocalStep();
    }, 4100);

    const drumTimer = window.setInterval(() => {
      triggerRitualFrameDrum();
    }, 3200);

    ambientNodes = {
      masterGain,
      droneOscs,
      lfoOscs: [filterLfo, windLfo],
      windSource,
      windFilter,
      windGain,
      phraseTimer,
      drumTimer,
    };

    // Trigger first vocal hum phrase immediately so the player hears the Viking chant right away
    window.setTimeout(() => {
      triggerNordicVocalStep();
      triggerRitualFrameDrum();
    }, 250);
  } catch {
    // Ignore audio initialization restrictions
  }
}

export function stopAmbientSoundscape(): void {
  desiredAmbientActive = false;
  if (!ambientNodes) return;

  const nodesToClean = ambientNodes;
  ambientNodes = null;

  if (nodesToClean.phraseTimer !== null) {
    window.clearInterval(nodesToClean.phraseTimer);
  }
  if (nodesToClean.drumTimer !== null) {
    window.clearInterval(nodesToClean.drumTimer);
  }

  try {
    if (audioCtx) {
      const now = audioCtx.currentTime;
      nodesToClean.masterGain.gain.cancelScheduledValues(now);
      nodesToClean.masterGain.gain.setValueAtTime(
        Math.max(0.0001, nodesToClean.masterGain.gain.value),
        now
      );
      nodesToClean.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      window.setTimeout(() => {
        nodesToClean.droneOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Ignore
          }
        });
        nodesToClean.lfoOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Ignore
          }
        });
        try {
          nodesToClean.windSource.stop();
          nodesToClean.windSource.disconnect();
          nodesToClean.masterGain.disconnect();
        } catch {
          // Ignore
        }
      }, 500);
    }
  } catch {
    // Ignore cleanup errors
  }
}

export function resumeAudioIfNeeded(): void {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (desiredAmbientActive && !ambientNodes) {
    syncAmbientSoundscape(true, desiredAmbientVolume, desiredAmbientSeason);
  }
}

export function playSound(
  type: 'advance' | 'choice' | 'click' | 'raid' | 'honor' | 'dishonor' | 'death' | 'sail',
  enabled: boolean
): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    if (type === 'advance') {
      // Warm low frame-drum thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.14);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'choice' || type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'raid') {
      // Deep Norse lur horn fifth
      [130.81, 196.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + 0.45);
      });
    } else if (type === 'honor') {
      // Plucked Kravik lyre chord
      [293.66, 440.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.09, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 0.38);
      });
    } else if (type === 'dishonor') {
      // Muted descending D-minor pluck for stained honor
      [220.0, 164.81].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.075, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + 0.4);
      });
    } else if (type === 'sail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.linearRampToValueAtTime(246.94, now + 0.22);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'death') {
      // Solemn low minor vocal-formant chord
      [98.0, 146.83].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.78);
      });
    }
  } catch {
    // Ignore audio errors on restricted devices
  }
}
