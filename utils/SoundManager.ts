class SoundManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private currentNoteIndex: number = 0;
  private tempo: number = 110;
  private timerID: number | undefined;

  // Pack Configuration
  private currentPack: 'audio_cyber' | 'audio_chip' | 'audio_dark' = 'audio_cyber';

  private bassLine = [
    { note: 36, dur: 0.25 }, { note: 36, dur: 0.25 }, { note: 38, dur: 0.25 }, { note: 36, dur: 0.25 },
    { note: 31, dur: 0.25 }, { note: 31, dur: 0.25 }, { note: 33, dur: 0.25 }, { note: 31, dur: 0.25 }
  ];

  constructor() {
    // Lazy init
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public setPack(packId: string) {
    if (packId === 'audio_cyber' || packId === 'audio_chip' || packId === 'audio_dark') {
        this.currentPack = packId;
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- MUSIC SEQUENCER ---
  
  private noteToFreq(note: number) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private scheduleNote(noteNumber: number, time: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    // Pack Logic
    if (this.currentPack === 'audio_chip') {
        osc.type = 'square';
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        osc.frequency.value = this.noteToFreq(noteNumber + 12); // Higher pitch for chip
    } else if (this.currentPack === 'audio_dark') {
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Muffled
        osc.frequency.value = this.noteToFreq(noteNumber - 12); // Lower pitch
    } else {
        // Cyber (Default)
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        osc.frequency.value = this.noteToFreq(noteNumber);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.start(time);
    osc.stop(time + duration);
  }

  private scheduler() {
    if (!this.ctx) return;
    const lookahead = 25.0;
    const scheduleAheadTime = 0.1;

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      const note = this.bassLine[this.currentNoteIndex];
      this.scheduleNote(note.note, this.nextNoteTime, note.dur * (60 / this.tempo));
      this.nextNoteTime += 0.25 * (60 / this.tempo); 
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.bassLine.length;
    }
    this.timerID = window.setTimeout(() => this.scheduler(), lookahead);
  }

  public startMusic() {
    if (this.isPlaying || !this.ctx) return;
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.timerID) clearTimeout(this.timerID);
  }

  // --- SFX ---

  public playJump() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    if (this.currentPack === 'audio_chip') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    }

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playSlide() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playCollect() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    if (this.currentPack === 'audio_dark') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.1);
    } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1800, this.ctx.currentTime + 0.05);
    }
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playPowerup() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554, now + 0.1);
    osc.frequency.setValueAtTime(659, now + 0.2);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }

  public playCrash() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public playBuy() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playError() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

export const soundManager = new SoundManager();