
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const GROUND_HEIGHT = 100; // Pixels from bottom
export const BASE_SPEED = 6;
export const MAX_SPEED = 24;
export const SPEED_INCREMENT = 0.003;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT_RUN = 80;
export const PLAYER_HEIGHT_SLIDE = 40;

export const OBSTACLE_WIDTH = 50;
export const OBSTACLE_HEIGHT_TALL = 100;
export const OBSTACLE_HEIGHT_LOW = 40;
export const OBSTACLE_AIR_Y_OFFSET = 90;

export const POWERUP_SIZE = 30;
export const BIT_SIZE = 15;
export const SHAKE_INTENSITY = 15;

export const PLAYER_COLORS = {
  cyan: '#22d3ee',
  magenta: '#d946ef',
  lime: '#a3e635',
  orange: '#fb923c',
  crimson: '#f43f5e',
  white: '#ffffff',
  gold: '#facc15'
};

export const COLORS = {
  ...PLAYER_COLORS,
  red: '#ef4444',
  yellow: '#eab308',
  dark: '#0f172a', 
  bit: '#fde047',
  textGlow: '0 0 10px rgba(34, 211, 238, 0.7)'
};

// --- UPGRADE CONFIG ---
export const UPGRADE_MAX_LEVEL = 5;
export const UPGRADE_BASE_COST = 1000;

export type ShopCategory = 'CHARACTERS' | 'THEMES' | 'SKINS' | 'AUDIO' | 'ABILITIES' | 'CONSUMABLES' | 'UPGRADES';

export const SHOP_DATA = {
  CHARACTERS: [
    { id: 'char_ninja', name: 'CYBER NINJA', price: 0, description: 'Standard Runner Model.' },
    { id: 'char_bot', name: 'GLITCH BOT', price: 500, description: 'Heavy duty chassis.' },
    { id: 'char_sphere', name: 'DATA SPHERE', price: 1000, description: 'Pure energy form.' }
  ],
  THEMES: [
    { 
      id: 'theme_cyber', 
      name: 'NIGHT CITY', 
      price: 0, 
      colors: { 
          skyStart: '#0a0515', skyEnd: '#241235', 
          buildingBase: '#1c0b2e', 
          ground: '#151518', 
          grid: 'rgba(215, 40, 255, 0.05)' 
      } 
    },
    { 
      id: 'theme_matrix', 
      name: 'THE SOURCE', 
      price: 300, 
      colors: { 
          skyStart: '#000000', skyEnd: '#022c02', 
          buildingBase: '#001a00', 
          ground: '#020617', 
          grid: 'rgba(34, 197, 94, 0.2)' 
      } 
    },
    { 
      id: 'theme_retro', 
      name: 'SUNSET WAVE', 
      price: 600, 
      colors: { 
          skyStart: '#2e1065', skyEnd: '#f43f5e', 
          buildingBase: '#4c1d95', 
          ground: '#2e1065', 
          grid: 'rgba(244, 63, 94, 0.2)' 
      } 
    },
    { 
      id: 'theme_mono', 
      name: 'MONOCHROME', 
      price: 800, 
      colors: { 
          skyStart: '#000000', skyEnd: '#1a1a1a', 
          buildingBase: '#111111', 
          ground: '#000000', 
          grid: 'rgba(255, 255, 255, 0.15)' 
      } 
    }
  ],
  SKINS: [
    { id: 'skin_cyan', name: 'NEON CYAN', color: PLAYER_COLORS.cyan, price: 0 },
    { id: 'skin_magenta', name: 'HOT MAGENTA', color: PLAYER_COLORS.magenta, price: 50 },
    { id: 'skin_lime', name: 'ACID LIME', color: PLAYER_COLORS.lime, price: 150 },
    { id: 'skin_orange', name: 'PLASMA ORANGE', color: PLAYER_COLORS.orange, price: 300 },
    { id: 'skin_crimson', name: 'CRIMSON GLITCH', color: PLAYER_COLORS.crimson, price: 600 },
    { id: 'skin_white', name: 'GHOST', color: PLAYER_COLORS.white, price: 1000 },
  ],
  AUDIO: [
    { id: 'audio_cyber', name: 'DEEP DIVE', price: 0, description: 'Standard Synthwave.' },
    { id: 'audio_chip', name: '8-BIT CRUNCH', price: 400, description: 'Retro chiptune sounds.' },
    { id: 'audio_dark', name: 'VOID SIGNAL', price: 800, description: 'Heavy industrial bass.' }
  ],
  ABILITIES: [
    { id: 'ability_none', name: 'NO MODULE', price: 0, description: 'No active enhancements.' },
    { id: 'ability_magnet', name: 'BIT MAGNET', price: 1500, description: 'Passive: Attracts nearby data bits.' },
    { id: 'ability_double_jump', name: 'AERO JETS', price: 2500, description: 'Active: Press Jump in mid-air.' },
    { id: 'ability_shield_start', name: 'HARDENED KERNEL', price: 3000, description: 'Passive: Start every run with a Shield.' },
    { id: 'ability_time_dilation', name: 'CHRONO BRAKE', price: 4000, description: 'Passive: World accelerates 50% slower.' },
    { id: 'ability_score_hack', name: 'SCORE INJECTOR', price: 5000, description: 'Passive: +20% Score Multiplier.' }
  ],
  CONSUMABLES: [
    { id: 'item_restore', name: 'SYSTEM RESTORE', price: 1000, description: 'Auto-revive on crash. One use per run.', max: 5 }
  ],
  UPGRADES: [
    { id: 'OVERCLOCK', name: 'OVERCLOCK', description: 'Increases duration of speed boost.' },
    { id: 'ROOT_ACCESS', name: 'ROOT ACCESS', description: 'Increases flight duration.' },
    { id: 'LAG_SWITCH', name: 'LAG SWITCH', description: 'Increases slow-motion duration.' },
    { id: 'MAGNET', name: 'BIT MAGNET', description: 'Increases magnet duration.' },
    { id: 'SHIELD', name: 'FIREWALL', description: 'Increases recovery time after break.' },
    { id: 'DEBUGGER', name: 'DEBUGGER', description: 'Bonus bits when clearing screen.' },
  ]
};
