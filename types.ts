
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum EntityType {
  PLAYER = 'PLAYER',
  OBSTACLE_GROUND = 'OBSTACLE_GROUND', // Firewall
  OBSTACLE_AIR = 'OBSTACLE_AIR', // Corrupted Data
  PARTICLE = 'PARTICLE',
  POWERUP = 'POWERUP',
  BIT = 'BIT' // Currency
}

export enum PowerupType {
  OVERCLOCK = 'OVERCLOCK',   // Speed + Invincible
  SHIELD = 'SHIELD',         // Protection
  ROOT_ACCESS = 'ROOT_ACCESS', // Fly
  LAG_SWITCH = 'LAG_SWITCH', // Slow Mo
  MAGNET = 'MAGNET',         // Coin Magnet
  DEBUGGER = 'DEBUGGER'      // Clear Screen
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ObstacleVariant = 'SPIKES' | 'FIREWALL' | 'DRONE' | 'VIRUS' | 'VOID' | 'POPUP' | 'CRAWLER' | 'LASER';

export interface Obstacle extends Rect {
  id: number;
  type: EntityType.OBSTACLE_GROUND | EntityType.OBSTACLE_AIR;
  variant: ObstacleVariant;
  passed: boolean;
  state?: number; // For Laser flickering or Crawler animation
}

export interface Powerup extends Rect {
  id: number;
  type: EntityType.POWERUP;
  powerupType: PowerupType;
  active: boolean;
}

export interface Bit extends Rect {
  id: number;
  type: EntityType.BIT;
  active: boolean;
  collected: boolean;
  magnetic?: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string; // For digital rain
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface ActivePowerup {
  type: PowerupType;
  progress: number; // 0 to 1
}

export interface GameStats {
  score: number;
  highScore: number;
  distance: number;
  speedMultiplier: number;
  speedHistory: { time: number; speed: number }[]; // For Recharts
  hasShield: boolean;
  scoreMultiplier: number;
  bitsCollected: number; // Current Run
  revivesLeft: number;
  activePowerups: ActivePowerup[]; // For UI
}

export interface EquippedItems {
  character: string;
  theme: string;
  skin: string;
  audio: string;
  ability: string;
}

export interface GlobalSettings {
  totalBits: number;
  equipped: EquippedItems;
  unlockedItems: string[]; // List of ALL unlocked item IDs
  consumables: {
    systemRestore: number;
  };
  powerupLevels: {
      [key in PowerupType]: number; // 1-5
  };
}
