
import React from 'react';
import { GameStats, GameState, PowerupType } from '../types';
import * as Icons from './Icons';

interface UIOverlayProps {
  stats: GameStats;
  gameState: GameState;
  activeAbility?: string; 
}

const UIOverlay: React.FC<UIOverlayProps> = ({ stats, gameState }) => {
  if (gameState !== GameState.PLAYING) return null;

  const getPowerupColor = (type: PowerupType) => {
      switch(type) {
          case PowerupType.OVERCLOCK: return '#22d3ee';
          case PowerupType.ROOT_ACCESS: return '#f472b6';
          case PowerupType.LAG_SWITCH: return '#fb923c';
          case PowerupType.MAGNET: return '#ef4444';
          case PowerupType.SHIELD: return '#4ade80';
          default: return '#ffffff';
      }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      
      {/* SVG HUD Frame */}
      <svg className="absolute inset-0 w-full h-full text-cyan-500/30" preserveAspectRatio="none">
         <path d="M 20 100 L 20 20 L 150 20 L 160 30" fill="none" stroke="currentColor" strokeWidth="2" />
         <path d="M calc(100% - 20px) 100 L calc(100% - 20px) 20 L calc(100% - 150px) 20 L calc(100% - 160px) 30" fill="none" stroke="currentColor" strokeWidth="2" />
         <path d="M 20 calc(100% - 100px) L 20 calc(100% - 20px) L 150 calc(100% - 20px) L 160 calc(100% - 30px)" fill="none" stroke="currentColor" strokeWidth="2" />
         <path d="M calc(100% - 20px) calc(100% - 100px) L calc(100% - 20px) calc(100% - 20px) L calc(100% - 150px) calc(100% - 20px) L calc(100% - 160px) calc(100% - 30px)" fill="none" stroke="currentColor" strokeWidth="2" />
         
         <line x1="170" y1="25" x2="calc(50% - 100px)" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
         <line x1="calc(50% + 100px)" y1="25" x2="calc(100% - 170px)" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
        {/* TOP LEFT: Score & Multiplier */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
              <Icons.TrophyIcon className="w-8 h-8 text-cyan-400" />
              <h2 className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-[Orbitron] tabular-nums">
              {stats.score.toString().padStart(6, '0')}
              </h2>
          </div>
          <div className="flex items-center gap-2 text-cyan-400/80 text-xs font-mono tracking-[0.3em]">
             <span>CURRENT_SCORE</span>
             {stats.scoreMultiplier > 1 && (
                 <span className="text-yellow-400 font-bold animate-pulse flex items-center gap-1">
                     <Icons.ZapIcon className="w-3 h-3" />
                     [x{stats.scoreMultiplier} BOOST]
                 </span>
             )}
          </div>
        </div>

        {/* TOP RIGHT: Velocity */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <div className="w-40 h-2 bg-slate-900/80 skew-x-[-12deg] border border-slate-600 overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300 ease-out"
                 style={{ width: `${Math.min(100, (stats.speedMultiplier / 3.0) * 100)}%` }}
               ></div>
            </div>
            <span className="text-3xl font-bold text-white font-[Orbitron] tabular-nums flex items-center gap-2">
              {stats.speedMultiplier.toFixed(1)} <span className="text-sm text-slate-400">MACH</span>
            </span>
            <Icons.FastForwardIcon className="w-6 h-6 text-fuchsia-400" />
          </div>
          <span className="text-xs text-fuchsia-400/80 tracking-[0.3em]">VELOCITY_VECTOR</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
         {/* BOTTOM LEFT: System Status / Revives / Powerups */}
         <div className="flex flex-col gap-2 items-start">
            
            {/* Active Powerups List */}
            {stats.activePowerups && stats.activePowerups.map((p, i) => {
                const color = getPowerupColor(p.type);
                return (
                    <div key={i} className="flex flex-col gap-1 mb-2 w-48">
                        <div className="flex items-center justify-between text-xs font-bold font-mono tracking-widest" style={{ color }}>
                            <div className="flex items-center gap-2">
                                <Icons.PowerIcon className="w-3 h-3" />
                                {p.type.replace('_', ' ')}
                            </div>
                            <span>{Math.ceil(p.progress * 100)}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-900 border border-slate-700 relative overflow-hidden">
                             <div 
                                className="h-full transition-all duration-200 ease-linear"
                                style={{ 
                                    width: `${p.progress * 100}%`,
                                    backgroundColor: color,
                                    boxShadow: `0 0 10px ${color}`
                                }}
                             ></div>
                        </div>
                    </div>
                );
            })}

            <div className={`flex items-center gap-3 transition-opacity ${stats.revivesLeft > 0 ? 'opacity-100' : 'opacity-30'}`}>
                <Icons.HeartIcon className={`w-6 h-6 ${stats.revivesLeft > 0 ? 'text-lime-500' : 'text-slate-700'}`} />
                <div className="text-sm font-mono text-slate-300">
                    AUTO_RESTORE_MODULES: <span className="text-lime-400 font-bold text-lg">{stats.revivesLeft}</span>
                </div>
            </div>
         </div>

         {/* BOTTOM RIGHT: Bits */}
         <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                 <span className="text-4xl font-mono font-bold text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                     {stats.bitsCollected}
                 </span>
                 <span className="text-xs text-yellow-600 tracking-widest">BITS_COLLECTED</span>
             </div>
             <div className="w-12 h-12 border-2 border-yellow-500/50 rounded-full flex items-center justify-center animate-[spin_4s_linear_infinite]">
                 <Icons.BitIcon className="w-6 h-6 text-yellow-400" />
             </div>
         </div>
      </div>
      
    </div>
  );
};

export default UIOverlay;
