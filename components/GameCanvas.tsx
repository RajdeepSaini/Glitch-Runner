
import React, { useRef, useEffect } from 'react';
import { GameState, EntityType, PowerupType, Obstacle, Particle, Powerup, GameStats, Bit, EquippedItems, FloatingText, ObstacleVariant, ActivePowerup } from '../types';
import { 
  GRAVITY, JUMP_FORCE, GROUND_HEIGHT, BASE_SPEED, MAX_SPEED, SPEED_INCREMENT,
  PLAYER_WIDTH, PLAYER_HEIGHT_RUN, PLAYER_HEIGHT_SLIDE,
  OBSTACLE_WIDTH, OBSTACLE_HEIGHT_TALL, OBSTACLE_HEIGHT_LOW, OBSTACLE_AIR_Y_OFFSET, 
  COLORS, POWERUP_SIZE, BIT_SIZE, SHAKE_INTENSITY, SHOP_DATA
} from '../constants';
import { soundManager } from '../utils/SoundManager';

const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

interface BuildingLayerItem {
  x: number;
  w: number;
  h: number;
  type: number; // For randomized appearance
  windows: boolean;
  neon: boolean;
  neonColor: string;
}

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  updateStats: (stats: Partial<GameStats>) => void;
  equipped: EquippedItems;
  availableRevives: number;
  onConsumeRevive: () => void;
  powerupLevels: Record<string, number>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
    gameState, 
    setGameState, 
    updateStats, 
    equipped, 
    availableRevives,
    onConsumeRevive,
    powerupLevels
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const currentTheme = SHOP_DATA.THEMES.find(t => t.id === equipped.theme) || SHOP_DATA.THEMES[0];
  const skinColor = SHOP_DATA.SKINS.find(s => s.id === equipped.skin)?.color || COLORS.cyan;

  const playerRef = useRef({
    x: 0, // Lateral offset
    y: 0,
    vx: 0,
    vy: 0,
    isJumping: false,
    isSliding: false,
    jumpCount: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT_RUN,
    hasShield: false,
    trail: [] as {x: number, y: number, h: number}[],
    revivesLeft: 0,
    invincibleTimer: 0, // frames
    popupTimer: 0, // For "Popup Spam" obstacle
    // Powerup States
    isFlying: false,
    flyTimer: 0,
    flyMax: 0,
    isMagnet: false,
    magnetTimer: 0,
    magnetMax: 0,
    isOverclock: false,
    overclockTimer: 0,
    overclockMax: 0,
    isSlowMo: false,
    slowMoTimer: 0,
    slowMoMax: 0
  });
  
  const keysRef = useRef<Set<string>>(new Set());

  const gameRef = useRef({
    speed: BASE_SPEED,
    baseSpeed: BASE_SPEED, // To track non-slow-mo speed
    distance: 0,
    internalScore: 0, 
    scoreMultiplier: 1,
    scoreBoostTimer: 0, 
    nextSpawnDistance: 0,
    nextPowerupDistance: 1000,
    // Removed nextBitDistance - replaced with smart spawning
    lastEntityX: 0, // Tracks the right-most edge of game entities to manage gaps
    consecutiveObstacles: 0,
    obstacles: [] as Obstacle[],
    powerups: [] as Powerup[],
    bits: [] as Bit[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    // Parallax Layers
    bgLayer1: [] as BuildingLayerItem[], // Far
    bgLayer2: [] as BuildingLayerItem[], // Mid
    bgLayer3: [] as BuildingLayerItem[], // Near
    frameCount: 0,
    lastTime: 0,
    isGameOver: false,
    shake: 0,
    bitsCollected: 0
  });

  const generateLayer = (width: number, minH: number, maxH: number, widthFactor: number, density: number): BuildingLayerItem[] => {
    const buildings: BuildingLayerItem[] = [];
    let x = -100;
    while (x < width * 2) {
      const w = 50 + Math.random() * widthFactor;
      const h = minH + Math.random() * (maxH - minH);
      const gap = Math.random() * 20; // Small gaps between buildings
      
      buildings.push({ 
          x, w, h,
          type: Math.random(),
          windows: Math.random() < density,
          neon: Math.random() < (density * 0.5),
          neonColor: Math.random() > 0.5 ? '#d039f9' : '#00f0ff' // Pink or Cyan
      });
      x += w + gap;
    }
    return buildings;
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string = '#fff') => {
      gameRef.current.floatingTexts.push({
          id: Math.random(),
          x, y,
          text,
          color,
          life: 1.0,
          vy: -2
      });
  };

  const resetGame = () => {
    playerRef.current = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      isJumping: false,
      isSliding: false,
      jumpCount: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT_RUN,
      hasShield: equipped.ability === 'ability_shield_start',
      trail: [],
      revivesLeft: availableRevives,
      invincibleTimer: 0,
      popupTimer: 0,
      isFlying: false,
      flyTimer: 0,
      flyMax: 0,
      isMagnet: false,
      magnetTimer: 0,
      magnetMax: 0,
      isOverclock: false,
      overclockTimer: 0,
      overclockMax: 0,
      isSlowMo: false,
      slowMoTimer: 0,
      slowMoMax: 0
    };
    keysRef.current.clear();
    gameRef.current = {
      speed: BASE_SPEED,
      baseSpeed: BASE_SPEED,
      distance: 0,
      internalScore: 0,
      scoreMultiplier: 1,
      scoreBoostTimer: 0,
      nextSpawnDistance: 800,
      nextPowerupDistance: 2000,
      lastEntityX: 800,
      consecutiveObstacles: 0,
      obstacles: [],
      powerups: [],
      bits: [],
      particles: [],
      floatingTexts: [],
      // Generate Layers with different properties
      bgLayer1: generateLayer(window.innerWidth, 200, 400, 150, 0.1), // Far: Tall, sparse details
      bgLayer2: generateLayer(window.innerWidth, 150, 300, 100, 0.4), // Mid: Medium, some windows
      bgLayer3: generateLayer(window.innerWidth, 100, 250, 80, 0.7),  // Near: Short, detailed
      frameCount: 0,
      lastTime: performance.now(),
      isGameOver: false,
      shake: 0,
      bitsCollected: 0
    };
    updateStats({ 
        score: 0, 
        distance: 0, 
        speedMultiplier: 1, 
        speedHistory: [], 
        hasShield: playerRef.current.hasShield,
        scoreMultiplier: 1,
        bitsCollected: 0,
        revivesLeft: availableRevives,
        activePowerups: []
    });
    
    soundManager.startMusic();
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
    } else {
      soundManager.stopMusic();
    }
  }, [gameState]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      keysRef.current.add(e.code);
      
      const p = playerRef.current;
      const canDoubleJump = equipped.ability === 'ability_double_jump';
      
      // Regular jump logic (only if NOT flying)
      if (!p.isFlying) {
          if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (!p.isJumping && !p.isSliding) {
                p.vy = JUMP_FORCE;
                p.isJumping = true;
                p.jumpCount = 1;
                soundManager.playJump();
                spawnParticles(100 + p.x + PLAYER_WIDTH/2, canvasRef.current!.height - GROUND_HEIGHT, skinColor, 5, false);
            } else if (canDoubleJump && p.isJumping && p.jumpCount < 2) {
                p.vy = JUMP_FORCE * 0.8;
                p.jumpCount = 2;
                soundManager.playJump();
                spawnParticles(100 + p.x + PLAYER_WIDTH/2, canvasRef.current!.height - GROUND_HEIGHT + p.y, skinColor, 8, false);
            }
          }
          
          if (e.code === 'ArrowDown' && !p.isSliding && !p.isJumping) {
            p.isSliding = true;
            p.height = PLAYER_HEIGHT_SLIDE;
            soundManager.playSlide();
            spawnParticles(100 + p.x + PLAYER_WIDTH/2, canvasRef.current!.height - GROUND_HEIGHT - 10, skinColor, 3, false);
          }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
      if (e.code === 'ArrowDown') {
        playerRef.current.isSliding = false;
        playerRef.current.height = PLAYER_HEIGHT_RUN;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, equipped, skinColor]);

  const spawnParticles = (x: number, y: number, color: string, count = 5, isDigital = true) => {
    for (let i = 0; i < count; i++) {
      gameRef.current.particles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        maxLife: 1.0,
        color: color,
        size: Math.random() * 3 + 1,
        text: isDigital ? (Math.random() > 0.5 ? '1' : '0') : undefined
      });
    }
  };

  // --- DRAWING HELPERS ---
  const drawSky = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, currentTheme.colors.skyStart);
      gradient.addColorStop(1, currentTheme.colors.skyEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const moonX = width * 0.2;
      const moonY = height * 0.2;
      const moonRadius = 60;
      
      ctx.shadowBlur = 50;
      ctx.shadowColor = currentTheme.colors.skyEnd; // Use theme color for glow
      ctx.fillStyle = adjustColor(currentTheme.colors.skyStart, 20); // Slightly lighter than sky
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
  };

  const drawBuilding = (ctx: CanvasRenderingContext2D, b: BuildingLayerItem, color: string, groundY: number) => {
      const y = groundY - b.h;
      ctx.fillStyle = color;
      ctx.fillRect(b.x, y, b.w + 1, b.h);

      if (b.windows) {
          ctx.fillStyle = '#000';
          const cols = Math.floor(b.w / 15);
          const rows = Math.floor(b.h / 20);
          for (let r = 1; r < rows - 1; r++) {
              for (let c = 1; c < cols; c++) {
                  const seed = Math.sin(b.x * r * c);
                  if (seed > 0.6) {
                      ctx.fillStyle = seed > 0.9 ? '#ffcc00' : '#553377';
                      ctx.fillRect(b.x + c * 15, y + r * 20, 8, 12);
                  } else {
                      ctx.fillStyle = adjustColor(color, -20); // Darker window
                      ctx.fillRect(b.x + c * 15, y + r * 20, 8, 12);
                  }
              }
          }
      }

      if (b.neon) {
          ctx.fillStyle = b.neonColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = b.neonColor;
          if (b.type > 0.5) {
             ctx.fillRect(b.x + b.w - 10, y + 20, 4, b.h * 0.6);
          } else {
             ctx.fillRect(b.x + 5, y + 10, b.w - 10, 4);
          }
          ctx.shadowBlur = 0;
      }
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, height: number, width: number) => {
    drawSky(ctx, width, height);
    const groundY = height - GROUND_HEIGHT;

    // Dynamically shade buildings based on distance (layer)
    const baseColor = currentTheme.colors.buildingBase || '#1c0b2e';
    
    gameRef.current.bgLayer1.forEach(b => {
        b.x -= gameRef.current.speed * 0.05;
        if (b.x + b.w < -100) { 
             const last = gameRef.current.bgLayer1[gameRef.current.bgLayer1.length - 1];
             b.x = last.x + last.w + Math.random() * 20;
             gameRef.current.bgLayer1.push(gameRef.current.bgLayer1.shift()!);
        }
        drawBuilding(ctx, b, adjustColor(baseColor, -30), groundY); // Darkest, furthest
    });

    gameRef.current.bgLayer2.forEach(b => {
        b.x -= gameRef.current.speed * 0.1;
        if (b.x + b.w < -100) { 
             const last = gameRef.current.bgLayer2[gameRef.current.bgLayer2.length - 1];
             b.x = last.x + last.w + Math.random() * 50;
             gameRef.current.bgLayer2.push(gameRef.current.bgLayer2.shift()!);
        }
        drawBuilding(ctx, b, adjustColor(baseColor, -10), groundY); // Mid
    });

    gameRef.current.bgLayer3.forEach(b => {
        b.x -= gameRef.current.speed * 0.2;
        if (b.x + b.w < -100) { 
             const last = gameRef.current.bgLayer3[gameRef.current.bgLayer3.length - 1];
             b.x = last.x + last.w + Math.random() * 100;
             gameRef.current.bgLayer3.push(gameRef.current.bgLayer3.shift()!);
        }
        drawBuilding(ctx, b, baseColor, groundY); // Closest
    });
  };
  
  const drawFloor = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const groundY = height - GROUND_HEIGHT;
      
      // Main Floor
      ctx.fillStyle = currentTheme.colors.ground;
      ctx.fillRect(0, groundY, width, GROUND_HEIGHT);
      
      const stripeSize = 30;
      const offset = (gameRef.current.distance * 1.5) % stripeSize;
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, groundY, width, 10);
      ctx.clip();
      
      ctx.fillStyle = playerRef.current.isOverclock ? '#22d3ee' : '#eab308';
      ctx.fillRect(0, groundY, width, 10);
      
      ctx.fillStyle = '#000';
      for (let x = -stripeSize; x < width + stripeSize; x += stripeSize) {
          ctx.beginPath();
          ctx.moveTo(x - offset, groundY);
          ctx.lineTo(x + 10 - offset, groundY);
          ctx.lineTo(x - 5 - offset, groundY + 10);
          ctx.lineTo(x - 15 - offset, groundY + 10);
          ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = adjustColor(currentTheme.colors.ground, 20);
      ctx.lineWidth = 2;
      const beamOffset = gameRef.current.distance % 100;
      
      ctx.fillStyle = adjustColor(currentTheme.colors.ground, 15);
      ctx.fillRect(0, groundY + 10, width, 15);
      
      for (let x = -beamOffset; x < width; x += 100) {
          ctx.fillStyle = adjustColor(currentTheme.colors.ground, -10);
          ctx.fillRect(x, groundY + 10, 20, GROUND_HEIGHT - 10);
          ctx.fillStyle = adjustColor(currentTheme.colors.ground, 30);
          ctx.beginPath();
          ctx.arc(x + 5, groundY + 20, 2, 0, Math.PI*2);
          ctx.arc(x + 15, groundY + 20, 2, 0, Math.PI*2);
          ctx.arc(x + 5, groundY + GROUND_HEIGHT - 20, 2, 0, Math.PI*2);
          ctx.arc(x + 15, groundY + GROUND_HEIGHT - 20, 2, 0, Math.PI*2);
          ctx.fill();
      }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, ob: Obstacle) => {
    // If Overclocked, draw glitchy ghost obstacle
    if (playerRef.current.isOverclock) {
        ctx.globalAlpha = 0.5;
        const jitterX = Math.random() * 4 - 2;
        ctx.translate(jitterX, 0);
    }

    if (ob.variant === 'VOID') {
        const groundY = ctx.canvas.height - GROUND_HEIGHT;
        ctx.save(); ctx.beginPath(); ctx.rect(ob.x, groundY, ob.w, GROUND_HEIGHT); ctx.clip();
        ctx.fillStyle = '#050505'; ctx.fillRect(ob.x, groundY, ob.w, GROUND_HEIGHT);
        ctx.fillStyle = 'rgba(255, 0, 255, 0.1)'; const size = 10;
        for(let i=0; i<ob.w; i+=size) { for(let j=0; j<GROUND_HEIGHT; j+=size) { if(Math.random() > 0.5) ctx.fillRect(ob.x + i, groundY + j, size, size); } }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.font = 'bold 20px monospace'; ctx.fillText("404", ob.x + 5, groundY + 40);
        ctx.fillStyle = '#eab308'; ctx.fillRect(ob.x, groundY, 5, GROUND_HEIGHT); ctx.fillRect(ob.x + ob.w - 5, groundY, 5, GROUND_HEIGHT);
        ctx.restore();
    } else if (ob.variant === 'POPUP') {
        const cx = ob.x + ob.w/2; const cy = ob.y + ob.h/2; const floatY = Math.sin(gameRef.current.frameCount * 0.1) * 5;
        ctx.translate(0, floatY);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(ob.x, ob.y, ob.w, 10);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(ob.x + ob.w - 12, ob.y + 2, 8, 6);
        ctx.fillStyle = '#000'; ctx.font = '24px monospace'; ctx.fillText("!", cx - 6, cy + 8);
        ctx.translate(0, -floatY);
    } else if (ob.variant === 'CRAWLER') {
        const cx = ob.x + ob.w/2; const cy = ob.y + ob.h/2; const legAnim = Math.sin(gameRef.current.frameCount * 0.5) * 5;
        ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f43f5e'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2;
        for(let i=0; i<4; i++) {
             const angle = (Math.PI + (i * Math.PI/3)) - 0.5; const kneeX = cx + Math.cos(angle) * 20; const kneeY = cy + Math.sin(angle) * 20 - 10;
             const footX = cx + Math.cos(angle) * 35; const footY = cy + Math.sin(angle) * 35 + legAnim * (i%2===0 ? 1 : -1);
             ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(kneeX, kneeY); ctx.lineTo(footX, footY); ctx.stroke();
        }
    } else if (ob.variant === 'LASER') {
        const isActive = ob.state === 1; 
        ctx.fillStyle = '#333'; ctx.fillRect(ob.x, ob.y - 10, ob.w, 10); ctx.fillRect(ob.x, ob.y + ob.h, ob.w, 10);
        if (isActive) {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.4)'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 20; ctx.fillRect(ob.x + 5, ob.y, ob.w - 10, ob.h);
            ctx.fillStyle = '#fff'; ctx.fillRect(ob.x + ob.w/2 - 2, ob.y, 4, ob.h); ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.1)'; ctx.fillRect(ob.x + 10, ob.y, ob.w - 20, ob.h);
        }
    } else if (ob.variant === 'FIREWALL') {
        ctx.save(); ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h); ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
        ctx.fillStyle = '#ef4444'; ctx.font = '10px monospace'; ctx.clip(); const time = Math.floor(Date.now() / 50);
        for (let i = 0; i < ob.w; i += 10) { for (let j = 0; j < ob.h; j += 12) { if (Math.random() > 0.7) { const char = String.fromCharCode(0x30A0 + Math.random() * 96); const yOffset = (time * 2 + j) % (ob.h + 20); ctx.fillText(char, ob.x + i, ob.y + yOffset); } } }
        ctx.restore();
    } else if (ob.variant === 'SPIKES') {
        ctx.fillStyle = '#d946ef'; ctx.shadowColor = '#d946ef'; ctx.shadowBlur = 10; ctx.beginPath();
        const spikeCount = 4; const spikeW = ob.w / spikeCount; ctx.moveTo(ob.x, ob.y + ob.h);
        for(let i = 0; i < spikeCount; i++) { const tipX = ob.x + (i * spikeW) + spikeW/2; const tipY = ob.y + Math.random() * 10; const baseX = ob.x + (i + 1) * spikeW; ctx.lineTo(tipX, tipY); ctx.lineTo(baseX, ob.y + ob.h); }
        ctx.fill(); ctx.shadowBlur = 0;
    } else if (ob.variant === 'DRONE') {
        const cx = ob.x + ob.w/2; const cy = ob.y + ob.h/2; const hover = Math.sin(gameRef.current.frameCount * 0.2) * 5;
        ctx.translate(0, hover); ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.ellipse(cx, cy, ob.w/2, ob.h/3, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.translate(0, -hover);
    } else {
        const cx = ob.x + ob.w/2; const cy = ob.y + ob.h/2; ctx.save(); ctx.translate(cx, cy); ctx.rotate(gameRef.current.frameCount * 0.1);
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3; ctx.shadowColor = '#eab308'; ctx.shadowBlur = 15; ctx.beginPath();
        ctx.moveTo(0, -ob.h/2); ctx.lineTo(ob.w/2, 0); ctx.lineTo(0, ob.h/2); ctx.lineTo(-ob.w/2, 0); ctx.closePath(); ctx.stroke(); ctx.restore();
    }

    if (playerRef.current.isOverclock) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset jitter
        ctx.globalAlpha = 1;
    }
  };

  const drawBit = (ctx: CanvasRenderingContext2D, bit: Bit) => {
    if (bit.collected) return;
    const cx = bit.x + bit.w/2;
    const cy = bit.y + bit.h/2;
    const rot = gameRef.current.frameCount * 0.1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = '#fde047'; ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10;
    ctx.fillRect(-bit.w/2, -bit.h/2, bit.w, bit.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-bit.w/4, -bit.h/4, bit.w/2, bit.h/2);
    ctx.restore();
  };

  const drawPowerup = (ctx: CanvasRenderingContext2D, p: Powerup) => {
    if (!p.active) return;
    const cx = p.x + p.w/2;
    const cy = p.y + p.h/2;
    const bounce = Math.sin(gameRef.current.frameCount * 0.1) * 5;
    ctx.save();
    ctx.translate(cx, cy + bounce);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '20px monospace';
    
    if (p.powerupType === PowerupType.OVERCLOCK) {
        ctx.fillStyle = '#22d3ee'; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(5, -10); ctx.lineTo(-5, 0); ctx.lineTo(0, 0); ctx.lineTo(-2, 10); ctx.lineTo(8, 0); ctx.lineTo(2, 0); ctx.fill();
    } else if (p.powerupType === PowerupType.SHIELD) {
        ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-8, 0); ctx.lineTo(-8, -8); ctx.lineTo(8, -8); ctx.lineTo(8, 0); ctx.fill();
    } else if (p.powerupType === PowerupType.ROOT_ACCESS) {
        ctx.fillStyle = '#f472b6'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(0, -10, 10, 0); ctx.lineTo(0, 5); ctx.fill();
    } else if (p.powerupType === PowerupType.LAG_SWITCH) {
        ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -8); ctx.lineTo(0, 0); ctx.lineTo(6, 8); ctx.lineTo(-6, 8); ctx.lineTo(0, 0); ctx.fill();
    } else if (p.powerupType === PowerupType.MAGNET) {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI, 0); ctx.lineTo(8, 8); ctx.moveTo(-8, 8); ctx.lineTo(-8, 0); ctx.stroke();
    } else if (p.powerupType === PowerupType.DEBUGGER) {
        ctx.fillStyle = '#a855f7'; ctx.fillRect(-6, -6, 12, 12); ctx.clearRect(-2, -2, 4, 4);
    }
    ctx.restore();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const p = playerRef.current;
    if (p.invincibleTimer > 0 && Math.floor(gameRef.current.frameCount / 4) % 2 === 0) return;
    const cx = x + w/2;
    const cy = y + h/2;
    
    if (gameRef.current.frameCount % 2 === 0) {
        p.trail.unshift({ x: cx, y: cy, h: p.height });
        if (p.trail.length > 10) p.trail.pop();
    }
    ctx.save();
    if (p.isOverclock) {
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath();
        for(let i=0; i<8; i++) {
             const angle = Math.random() * Math.PI * 2; const rad = 40 + Math.random() * 10;
             ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle)*rad, cy + Math.sin(angle)*rad);
        }
        ctx.stroke();
    }
    if (p.trail.length > 1) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 0; i < p.trail.length - 1; i++) {
            const point = p.trail[i]; const nextPoint = p.trail[i+1]; point.x -= gameRef.current.speed; 
            ctx.lineWidth = (10 - i) * 2; ctx.globalAlpha = (10 - i) / 10 * 0.3; ctx.strokeStyle = p.isOverclock ? '#22d3ee' : skinColor;
            ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(nextPoint.x, nextPoint.y); ctx.stroke();
        }
    }
    ctx.globalAlpha = 1; ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    if (p.isFlying) {
        ctx.fillStyle = '#f472b6'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.ellipse(0, 35, 30, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        
        // Jetpack Thrusters
        const t = gameRef.current.frameCount * 0.5;
        const flameLength = 30 + Math.sin(t) * 10;
        ctx.fillStyle = '#fde047'; // Yellow
        ctx.beginPath(); ctx.moveTo(-10, 20); ctx.lineTo(0, 20 + flameLength); ctx.lineTo(10, 20); ctx.fill();
        ctx.fillStyle = '#f97316'; // Orange core
        ctx.beginPath(); ctx.moveTo(-5, 20); ctx.lineTo(0, 20 + flameLength * 0.6); ctx.lineTo(5, 20); ctx.fill();
    }
    if (p.hasShield || p.invincibleTimer > 0) {
        ctx.strokeStyle = p.invincibleTimer > 0 ? COLORS.white : COLORS.cyan; ctx.lineWidth = 2;
        ctx.shadowColor = p.invincibleTimer > 0 ? COLORS.white : COLORS.cyan; ctx.shadowBlur = 10;
        ctx.beginPath(); const pulse = Math.sin(gameRef.current.frameCount * 0.2) * 2;
        ctx.arc(0, 0, Math.max(w, h) * 0.6 + pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = p.invincibleTimer > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(34, 211, 238, 0.05)'; ctx.fill(); ctx.shadowBlur = 0;
    }
    
    // Character Stick Logic
    const runCycle = (gameRef.current.frameCount * 0.3) % (Math.PI * 2);
    let legL_rot = 0, legR_rot = 0, armL_rot = 0, armR_rot = 0, body_rot = 0.1, scarf_y = -25;
    if (p.isFlying) {
        body_rot = 0.5; legL_rot = 0.2; legR_rot = 0.2; armL_rot = 2.5; armR_rot = 2.5; scarf_y = -20;
    } else if (p.isJumping) {
        legL_rot = -0.5; legR_rot = 0.5; armL_rot = -2.0; armR_rot = 1.0; body_rot = -0.2;
    } else if (p.isSliding) {
        body_rot = -1.3; legL_rot = 1.5; legR_rot = 1.2; armL_rot = 1.0; armR_rot = 0.5; scarf_y = -10;
    } else {
        legL_rot = Math.sin(runCycle) * 0.8; legR_rot = Math.sin(runCycle + Math.PI) * 0.8;
        armL_rot = Math.sin(runCycle + Math.PI) * 0.8; armR_rot = Math.sin(runCycle) * 0.8;
    }
    ctx.rotate(body_rot);
    ctx.save(); ctx.rotate(-body_rot); ctx.beginPath(); ctx.moveTo(0, scarf_y); 
    const tipY = scarf_y + Math.sin(gameRef.current.frameCount * 0.5) * 10;
    ctx.quadraticCurveTo(-30, scarf_y - 10, -50 - (p.isJumping ? 10 : 0), tipY);
    ctx.lineWidth = 4; ctx.strokeStyle = p.isOverclock ? '#22d3ee' : skinColor;
    ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b';
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(Math.sin(armR_rot) * 15, -15 + Math.cos(armR_rot) * 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(Math.sin(legR_rot) * 15, 5 + Math.cos(legR_rot) * 15); 
    ctx.lineTo(Math.sin(legR_rot) * 15 + Math.sin(legR_rot - 0.5) * 15, 5 + Math.cos(legR_rot) * 15 + Math.cos(legR_rot - 0.5) * 15); ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-6, -20, 12, 30);
    ctx.beginPath(); ctx.arc(0, -25, 9, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = skinColor; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2, -25); ctx.lineTo(9, -25); ctx.stroke();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 4; 
    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(Math.sin(legL_rot) * 15, 5 + Math.cos(legL_rot) * 15);
    ctx.lineTo(Math.sin(legL_rot) * 15 + Math.sin(legL_rot - 0.5) * 15, 5 + Math.cos(legL_rot) * 15 + Math.cos(legL_rot - 0.5) * 15); ctx.stroke();
    ctx.strokeStyle = '#1e293b'; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(Math.sin(armL_rot) * 15, -15 + Math.cos(armL_rot) * 15); ctx.stroke();
    ctx.restore();
  };

  const drawFloatingText = (ctx: CanvasRenderingContext2D) => {
      gameRef.current.floatingTexts.forEach(ft => {
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 20px "Orbitron"';
          ctx.shadowColor = ft.color;
          ctx.shadowBlur = 5;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.shadowBlur = 0;
      });
  };

  // --- BIT SPAWNING PATTERNS ---
  // Replaces random logic with specific patterns for specific obstacles or empty space
  
  const spawnPattern = (type: 'ARC' | 'LINE_HIGH' | 'LINE_LOW' | 'WAVE' | 'DIAGONAL', startX: number, startY: number, length: number = 5) => {
      for(let i=0; i<length; i++) {
          let x = startX + i * 50;
          let y = startY;

          if (type === 'ARC') {
              // Parabola: -a(x-h)^2 + k
              // Simplified: rise in middle
              const mid = length / 2;
              const dist = Math.abs(i - mid);
              const offset = Math.max(0, (mid - dist) * 40);
              y -= offset;
          } else if (type === 'WAVE') {
              y += Math.sin(i * 0.8) * 60;
          } else if (type === 'DIAGONAL') {
              y -= i * 30; // Upwards
          }

          gameRef.current.bits.push({
              id: Math.random(),
              x, y, w: BIT_SIZE, h: BIT_SIZE,
              type: EntityType.BIT, active: true, collected: false
          });
      }
      // Update last entity X to ensure we don't spawn things on top of these bits
      gameRef.current.lastEntityX = Math.max(gameRef.current.lastEntityX, startX + length * 50);
  };

  const drawPopups = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Spam random windows if active
      if (playerRef.current.popupTimer > 0) {
          const numWindows = 5;
          for(let i=0; i<numWindows; i++) {
               const seed = Math.floor(gameRef.current.frameCount / 5) + i;
               const x = (seed * 123) % (width - 200);
               const y = (seed * 456) % (height - 150);
               
               ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
               ctx.fillRect(x, y, 200, 100); ctx.strokeRect(x, y, 200, 100);
               ctx.fillStyle = '#1e3a8a'; ctx.fillRect(x, y, 200, 25);
               ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText(i % 2 === 0 ? "ERROR 404" : "WINNER!", x + 10, y + 18);
               ctx.fillStyle = '#000'; ctx.font = '12px monospace'; ctx.fillText("CRITICAL FAILURE", x + 20, y + 55); ctx.fillText("CLICK TO CLAIM PRIZE", x + 20, y + 75);
          }
      }
  };

  // GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (time: number) => {
      const game = gameRef.current;
      const player = playerRef.current;
      
      // Update Timers
      if (player.flyTimer > 0) player.flyTimer--; else player.isFlying = false;
      if (player.magnetTimer > 0) player.magnetTimer--; else player.isMagnet = false;
      if (player.popupTimer > 0) player.popupTimer--; 
      
      if (player.overclockTimer > 0) {
          player.overclockTimer--;
          player.invincibleTimer = 5; 
      } else {
          player.isOverclock = false;
      }
      if (player.slowMoTimer > 0) player.slowMoTimer--; else player.isSlowMo = false;

      // Shake
      let shakeX = 0; let shakeY = 0;
      if (game.shake > 0) {
        shakeX = (Math.random() - 0.5) * game.shake;
        shakeY = (Math.random() - 0.5) * game.shake;
        game.shake *= 0.9;
      }
      
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      if (gameState === GameState.PLAYING || gameState === GameState.GAME_OVER) {
          drawBackground(ctx, canvas.height, canvas.width);
      } else {
           // Fallback if needed, but menu usually handles its own bg or uses game bg
           drawBackground(ctx, canvas.height, canvas.width);
      }

      ctx.translate(shakeX, shakeY);

      if (gameState === GameState.PLAYING) {
        // Logic Updates
        let currentSpeed = game.baseSpeed;
        if (player.isSlowMo) currentSpeed *= 0.6; 
        if (player.isOverclock) currentSpeed *= 1.5; 

        const speedInc = equipped.ability === 'ability_time_dilation' ? SPEED_INCREMENT * 0.5 : SPEED_INCREMENT;
        if (game.baseSpeed < MAX_SPEED) game.baseSpeed += speedInc;
        
        game.speed = currentSpeed;
        game.distance += game.speed;
        
        // Update lastEntityX as the world moves
        game.lastEntityX -= game.speed;
        
        let scoreFactor = equipped.ability === 'ability_score_hack' ? 1.2 : 1;
        if (player.isOverclock) scoreFactor *= 2;
        game.internalScore += (game.speed * 0.1) * game.scoreMultiplier * scoreFactor;
        
        if (player.invincibleTimer > 0) player.invincibleTimer--;
        game.frameCount++;

        // Physics & Player Movement
        if (player.isFlying) {
            // Lateral Movement (X-axis)
            if (keysRef.current.has('ArrowLeft')) player.x -= 3;
            if (keysRef.current.has('ArrowRight')) player.x += 3;
            player.x = Math.max(-50, Math.min(player.x, 200)); // Clamp X position

            // Vertical Movement (Y-axis)
            let targetY = -300; // Base cruising altitude (Higher than before)
            if (keysRef.current.has('ArrowUp') || keysRef.current.has('Space')) targetY = -380; // Boost up
            if (keysRef.current.has('ArrowDown')) targetY = -150; // Dive down

            player.y += (targetY - player.y) * 0.05; // Smooth flight
            player.vy = 0; 
            player.isJumping = false;
            
            // Spawn high bits occasionally
            if (game.frameCount % 20 === 0) {
                 game.bits.push({ id: Math.random(), x: canvas.width, y: canvas.height - GROUND_HEIGHT - 300 + (Math.random()-0.5)*100, w: BIT_SIZE, h: BIT_SIZE, type: EntityType.BIT, active: true, collected: false });
            }
        } else {
            // Standard Physics
            if (player.isJumping) {
                player.vy += GRAVITY; player.y += player.vy;
                if (player.y > 0) {
                    player.y = 0; player.vy = 0; player.isJumping = false; player.jumpCount = 0;
                    spawnParticles(100 + player.x + PLAYER_WIDTH/2, canvas.height - GROUND_HEIGHT, skinColor, 8, false);
                }
            } else player.y = 0;
            
            // Reset lateral position slowly if not flying
            player.x += (0 - player.x) * 0.1;
        }

        // --- SPAWNING LOGIC ---
        // 1. Check if we need to spawn an obstacle (Priority)
        if (game.distance >= game.nextSpawnDistance) {
             game.consecutiveObstacles++;
             const tier = Math.min(5, Math.floor(game.distance / 2000)); 
             const possibleVariants: ObstacleVariant[] = ['SPIKES'];
             if (tier >= 0) possibleVariants.push('VIRUS');
             if (tier >= 1) possibleVariants.push('DRONE');
             if (tier >= 2) possibleVariants.push('FIREWALL');
             if (tier >= 3) possibleVariants.push('VOID');
             if (tier >= 4) possibleVariants.push('CRAWLER');
             if (tier >= 5) possibleVariants.push('LASER');
             if (tier >= 1) possibleVariants.push('POPUP');

             const variant = possibleVariants[Math.floor(Math.random() * possibleVariants.length)];
             
             let obsW = 0, obsH = 0, obsY = 0, obsType = EntityType.OBSTACLE_GROUND;

             switch (variant) {
                 case 'SPIKES':
                    obsW = 60; obsH = 40; obsType = EntityType.OBSTACLE_GROUND;
                    obsY = canvas.height - GROUND_HEIGHT - obsH;
                    break;
                 case 'FIREWALL':
                    obsW = 40; obsH = 90; obsType = EntityType.OBSTACLE_GROUND;
                    obsY = canvas.height - GROUND_HEIGHT - obsH;
                    break;
                 case 'DRONE':
                    obsW = 70; obsH = 40; obsType = EntityType.OBSTACLE_AIR;
                    obsY = canvas.height - GROUND_HEIGHT - 60 - obsH;
                    break;
                 case 'VIRUS':
                    obsW = 50; obsH = 50; obsType = EntityType.OBSTACLE_AIR;
                    obsY = canvas.height - GROUND_HEIGHT - 130 - obsH;
                    break;
                 case 'VOID':
                    obsW = 120; obsH = 10; obsType = EntityType.OBSTACLE_GROUND;
                    obsY = canvas.height - GROUND_HEIGHT; 
                    break;
                 case 'POPUP':
                    obsW = 50; obsH = 50; obsType = EntityType.OBSTACLE_AIR;
                    obsY = canvas.height - GROUND_HEIGHT - 100;
                    break;
                 case 'CRAWLER':
                    obsW = 60; obsH = 40; obsType = EntityType.OBSTACLE_GROUND;
                    obsY = canvas.height - GROUND_HEIGHT - obsH;
                    break;
                 case 'LASER':
                    // NERFED LASER: 100 height (jumpable) and thinner
                    obsW = 30; obsH = 100; obsType = EntityType.OBSTACLE_GROUND;
                    obsY = canvas.height - GROUND_HEIGHT - obsH;
                    break;
             }

             // Push Obstacle
             game.obstacles.push({
                id: Date.now(), x: canvas.width, y: obsY, w: obsW, h: obsH, type: obsType, variant: variant, passed: false, state: 1
             });
             
             // Update Last Entity X
             const obsEndX = canvas.width + obsW;
             game.lastEntityX = Math.max(game.lastEntityX, obsEndX);

             // --- COORDINATED BIT SPAWNING (OBSTACLE LINKED) ---
             // Spawn bits that act as guides for the obstacle
             if (variant === 'SPIKES' || variant === 'CRAWLER') {
                 // Jump Arc guide
                 spawnPattern('ARC', canvas.width - 50, canvas.height - GROUND_HEIGHT - 80, 5);
             } else if (variant === 'VOID') {
                 // Bridge guide over the void
                 spawnPattern('LINE_HIGH', canvas.width - 20, canvas.height - GROUND_HEIGHT - 80, 4);
             } else if (variant === 'DRONE' || variant === 'VIRUS') {
                 // Ground slide guide
                 spawnPattern('LINE_LOW', canvas.width, canvas.height - GROUND_HEIGHT - 30, 4);
             } else if (variant === 'FIREWALL' || variant === 'LASER') {
                 // High Jump guide for laser too now that it is jumpable
                 spawnPattern('ARC', canvas.width - 60, canvas.height - GROUND_HEIGHT - 110, 5);
             }

             const minGap = 400 + (game.speed * 10);
             game.nextSpawnDistance = game.distance + minGap + Math.random() * 400;
        }

        // 2. Check for Gap Filling (Free Run Coins)
        // If there's a huge gap on the screen (no obstacles recently spawned), add fun patterns
        if (canvas.width - game.lastEntityX > 400) {
            // Pick a random free-run pattern
            const rand = Math.random();
            const startX = canvas.width;
            
            if (rand < 0.3) {
                // Wave Pattern (Fun to jump through)
                spawnPattern('WAVE', startX, canvas.height - GROUND_HEIGHT - 100, 8);
            } else if (rand < 0.6) {
                // Diagonal Ramp (Up into the sky)
                spawnPattern('DIAGONAL', startX, canvas.height - GROUND_HEIGHT - 50, 6);
            } else {
                // Simple straight line
                spawnPattern('LINE_HIGH', startX, canvas.height - GROUND_HEIGHT - 80, 5);
            }
            
            // Ensure we don't spawn another gap filler immediately
            game.lastEntityX = startX + 400; 
        }

        // Powerups (Independent of pattern, rare)
        if (game.distance >= game.nextPowerupDistance) {
            const types = [PowerupType.OVERCLOCK, PowerupType.SHIELD, PowerupType.ROOT_ACCESS, PowerupType.LAG_SWITCH, PowerupType.MAGNET, PowerupType.DEBUGGER];
            const pType = types[Math.floor(Math.random() * types.length)];
            const pY = canvas.height - GROUND_HEIGHT - 100 - (Math.random() * 50);
            
            // Ensure powerup doesn't spawn inside an existing obstacle by checking lastEntityX roughly
            // Or just put it high enough.
            game.powerups.push({ id: Date.now(), x: Math.max(canvas.width, game.lastEntityX + 50), y: pY, w: POWERUP_SIZE, h: POWERUP_SIZE, type: EntityType.POWERUP, powerupType: pType, active: true });
            
            game.nextPowerupDistance = game.distance + 2000 + Math.random() * 3000;
        }

        // --- UPDATE ENTITIES ---
        game.obstacles.forEach(o => {
            if (o.variant === 'CRAWLER') {
                o.x -= (game.speed + 3); // Faster than scroll
            } else {
                o.x -= game.speed;
            }

            // Laser Flicker
            if (o.variant === 'LASER') {
                // NERFED TIMING: ON for 40 frames, OFF for 80. Easier to wait out.
                if (game.frameCount % 120 < 40) o.state = 1; // ON
                else o.state = 0; // OFF
            }
        });
        game.obstacles = game.obstacles.filter(o => o.x > -200);
        
        // ... [Bit & Powerup movement logic same] ...
        game.powerups.forEach(p => p.x -= game.speed); game.powerups = game.powerups.filter(p => p.x > -100);
        game.bits.forEach(b => {
            if (b.collected) { b.y -= 2; } else {
                if ((player.isMagnet || equipped.ability === 'ability_magnet') && b.x < canvas.width && b.x > 0) {
                     const dx = 100 - b.x; const dy = (canvas.height - GROUND_HEIGHT - 40 + player.y) - b.y;
                     b.x += dx * 0.1; b.y += dy * 0.1;
                } else { b.x -= game.speed; }
            }
        });
        game.bits = game.bits.filter(b => b.x > -100);
        game.floatingTexts.forEach(ft => { ft.y += ft.vy; ft.life -= 0.02; }); game.floatingTexts = game.floatingTexts.filter(ft => ft.life > 0);
        game.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; }); game.particles = game.particles.filter(p => p.life > 0);

        // Stats Sync
        if (game.frameCount % 10 === 0) {
            const activeP: ActivePowerup[] = [];
            if (player.isOverclock) activeP.push({ type: PowerupType.OVERCLOCK, progress: player.overclockTimer / player.overclockMax });
            if (player.isFlying) activeP.push({ type: PowerupType.ROOT_ACCESS, progress: player.flyTimer / player.flyMax });
            if (player.isSlowMo) activeP.push({ type: PowerupType.LAG_SWITCH, progress: player.slowMoTimer / player.slowMoMax });
            if (player.isMagnet) activeP.push({ type: PowerupType.MAGNET, progress: player.magnetTimer / player.magnetMax });
            if (player.hasShield) activeP.push({ type: PowerupType.SHIELD, progress: 1 });

            updateStats({
                distance: Math.floor(game.distance / 10),
                score: Math.floor(game.internalScore),
                speedMultiplier: parseFloat((game.speed / BASE_SPEED).toFixed(1)),
                hasShield: player.hasShield,
                scoreMultiplier: game.scoreMultiplier,
                bitsCollected: game.bitsCollected,
                revivesLeft: player.revivesLeft,
                activePowerups: activeP
            });
        }

        // --- COLLISION ---
        const playerHitbox = { x: 100 + player.x + 10, y: canvas.height - GROUND_HEIGHT - player.height + player.y + 5, w: player.width - 20, h: player.height - 10 };

        // Bit & Powerup Collection
        game.bits.forEach(b => {
            if (!b.collected && b.active && b.x < playerHitbox.x + playerHitbox.w + 20 && b.x + b.w > playerHitbox.x - 20 && b.y < playerHitbox.y + playerHitbox.h + 20 && b.y + b.h > playerHitbox.y - 20) {
                b.collected = true; game.bitsCollected++; game.internalScore += 50; soundManager.playCollect();
            }
        });
        game.powerups.forEach(p => {
             if (p.active && p.x < playerHitbox.x + playerHitbox.w && p.x + p.w > playerHitbox.x && p.y < playerHitbox.y + playerHitbox.h && p.y + p.h > playerHitbox.y) {
                p.active = false; soundManager.playPowerup(); spawnFloatingText(p.x, p.y - 50, p.powerupType.replace('_', ' '), COLORS.cyan);
                
                // --- UPGRADE LOGIC APPLICATION ---
                const level = powerupLevels[p.powerupType] || 1;
                const bonusDuration = (level - 1) * 120; // 2 seconds per level

                switch (p.powerupType) {
                    case PowerupType.OVERCLOCK: 
                        player.isOverclock = true; 
                        player.overclockTimer = 600 + bonusDuration; 
                        player.overclockMax = 600 + bonusDuration;
                        break;
                    case PowerupType.SHIELD: 
                        player.hasShield = true; 
                        break;
                    case PowerupType.ROOT_ACCESS: 
                        player.isFlying = true; 
                        player.flyTimer = 1200 + bonusDuration; 
                        player.flyMax = 1200 + bonusDuration;
                        spawnFloatingText(100, 100, "ROOT ACCESS GRANTED", COLORS.magenta); 
                        break;
                    case PowerupType.LAG_SWITCH: 
                        player.isSlowMo = true; 
                        player.slowMoTimer = 300 + bonusDuration; 
                        player.slowMoMax = 300 + bonusDuration;
                        break;
                    case PowerupType.MAGNET: 
                        player.isMagnet = true; 
                        player.magnetTimer = 900 + bonusDuration; 
                        player.magnetMax = 900 + bonusDuration;
                        break;
                    case PowerupType.DEBUGGER: 
                        game.obstacles.forEach(o => { 
                            o.passed = true; o.x = -1000; 
                            spawnParticles(o.x + 1000, o.y, COLORS.red, 10); 
                            // Upgrade Effect: Score bonus per cleared item
                            game.internalScore += (level * 200);
                        }); 
                        game.shake = 10; 
                        spawnFloatingText(300, 300, `BUGS DELETED (+${level * 200 * game.obstacles.length})`, COLORS.lime); 
                        break;
                }
            }
        });

        // Obstacle Collision
        for (const ob of game.obstacles) {
            if (ob.x < playerHitbox.x + playerHitbox.w && ob.x + ob.w > playerHitbox.x &&
                ob.y < playerHitbox.y + playerHitbox.h && ob.y + ob.h > playerHitbox.y) {
                
                // VOID DEATH CHECK (Different logic)
                if (ob.variant === 'VOID') {
                    // Die if on ground
                    if (!player.isFlying && !player.isJumping && player.y >= 0) {
                         // FALL IN
                         game.shake = 30;
                         setGameState(GameState.GAME_OVER);
                         spawnParticles(playerHitbox.x, playerHitbox.y, COLORS.dark, 50);
                         soundManager.playCrash();
                         return; // Immediate end
                    }
                    continue; // Safe if jumping/flying
                }

                // POPUP TRIGGER
                if (ob.variant === 'POPUP') {
                     ob.passed = true; ob.x = -1000;
                     player.popupTimer = 120; // 2 seconds of spam
                     soundManager.playError(); // Annoying sound
                     continue;
                }

                // Overclock destroy
                if (player.isOverclock) {
                     ob.passed = true; ob.x = -1000; game.shake = 5;
                     spawnParticles(playerHitbox.x + playerHitbox.w, playerHitbox.y + playerHitbox.h/2, COLORS.cyan, 15);
                     spawnFloatingText(playerHitbox.x, playerHitbox.y, "DELETED", COLORS.cyan);
                     continue;
                }

                // Laser Safety Check
                if (ob.variant === 'LASER' && ob.state === 0) {
                    continue; // Laser is OFF, safe to pass
                }

                if (player.invincibleTimer > 0) {
                    // Ignore
                } else if (player.hasShield) {
                    player.hasShield = false; 
                    // Shield Upgrade Effect: Longer invincibility after break
                    const shieldLvl = powerupLevels[PowerupType.SHIELD] || 1;
                    player.invincibleTimer = 60 + (shieldLvl * 20); 

                    game.shake = 10;
                    spawnParticles(playerHitbox.x, playerHitbox.y, COLORS.cyan, 10); soundManager.playCrash(); spawnFloatingText(playerHitbox.x, playerHitbox.y, "SHIELD BROKEN", COLORS.white);
                } else if (player.revivesLeft > 0) {
                    player.revivesLeft--; onConsumeRevive(); player.invincibleTimer = 120; game.shake = 20;
                    ob.passed = true; ob.x = -1000; spawnFloatingText(playerHitbox.x, playerHitbox.y - 50, "SYSTEM RESTORED", COLORS.lime);
                    spawnParticles(playerHitbox.x, playerHitbox.y, COLORS.lime, 30, true); soundManager.playPowerup(); 
                } else {
                    game.shake = 30; setGameState(GameState.GAME_OVER);
                    spawnParticles(playerHitbox.x, playerHitbox.y, COLORS.red, 50); soundManager.playCrash();
                }
            }
        }
      } 

      // Drawing
      drawFloor(ctx, canvas.width, canvas.height);
      game.obstacles.forEach(o => drawObstacle(ctx, o));
      game.bits.forEach(b => drawBit(ctx, b));
      game.powerups.forEach(p => drawPowerup(ctx, p));
      
      if (gameState === GameState.PLAYING || game.shake > 0) {
          const py = canvas.height - GROUND_HEIGHT - player.height + player.y;
          drawPlayer(ctx, 100 + player.x, py, player.width, player.height);
      }
      
      game.particles.forEach(p => {
          ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
          if (p.text) { ctx.font = '12px monospace'; ctx.fillText(p.text, p.x, p.y); } 
          else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); }
          ctx.globalAlpha = 1;
      });

      drawFloatingText(ctx);
      drawPopups(ctx, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, equipped, availableRevives, powerupLevels]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 block" width={window.innerWidth} height={window.innerHeight} />;
};

export default GameCanvas;
