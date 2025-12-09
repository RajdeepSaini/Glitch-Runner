
import React, { useState } from 'react';
import { GameState, EquippedItems, GlobalSettings } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { SHOP_DATA, ShopCategory, UPGRADE_MAX_LEVEL, UPGRADE_BASE_COST } from '../constants';
import * as Icons from './Icons';

interface MainMenuProps {
  onStart: () => void;
  highScore: number;
  gameState: GameState;
  lastScore?: number;
  speedHistory?: { time: number; speed: number }[];
  totalBits: number;
  equipped: EquippedItems;
  unlockedItems: string[];
  consumables: GlobalSettings['consumables'];
  powerupLevels?: Record<string, number>;
  onUnlock: (id: string, cost: number, isConsumable?: boolean, isUpgrade?: boolean) => boolean;
  onEquip: (category: keyof EquippedItems, id: string) => void;
}

interface CyberButtonProps {
    onClick: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    active?: boolean;
    variant?: 'cyan' | 'fuchsia' | 'yellow' | 'lime';
    className?: string;
}

const CyberButton = ({ 
    onClick, 
    disabled, 
    children, 
    active = false, 
    variant = 'cyan', 
    className = '' 
}: CyberButtonProps) => {
    
    const colorClasses = {
        cyan: active ? 'bg-cyan-500 text-black border-cyan-400' : 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-900/30',
        fuchsia: active ? 'bg-fuchsia-500 text-black border-fuchsia-400' : 'text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-900/30',
        yellow: active ? 'bg-yellow-500 text-black border-yellow-400' : 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-900/30',
        lime: active ? 'bg-lime-500 text-black border-lime-400' : 'text-lime-400 border-lime-500/30 hover:bg-lime-900/30',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative px-6 py-3 font-bold uppercase tracking-widest text-sm
                transition-all duration-150 border-r-2 border-l-2
                clip-angled flex items-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed
                ${colorClasses[variant || 'cyan']}
                ${className}
            `}
        >
            {children}
            {/* Corner decorations */}
            <div className={`absolute top-0 left-0 w-2 h-0.5 ${active ? 'bg-black' : `bg-${variant}-500`}`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-0.5 ${active ? 'bg-black' : `bg-${variant}-500`}`}></div>
        </button>
    );
};

const UpgradeIconsMap: Record<string, React.ElementType> = {
    OVERCLOCK: Icons.OverclockIcon,
    ROOT_ACCESS: Icons.RootAccessIcon,
    LAG_SWITCH: Icons.LagSwitchIcon,
    MAGNET: Icons.MagnetIcon,
    SHIELD: Icons.ShieldIcon,
    DEBUGGER: Icons.DebuggerIcon,
}

// Mock Leaderboard Data
const MOCK_LEADERBOARD = [
  { name: 'NEO_DRIFTER', score: 45200 },
  { name: 'GHOST_IN_SHELL', score: 38900 },
  { name: 'BYTE_SLAYER', score: 32100 },
  { name: 'CHROME_HEART', score: 28400 },
  { name: 'NULL_POINTER', score: 25000 },
  { name: 'SYS_ADMIN', score: 21200 },
  { name: 'DATA_MINER', score: 18500 },
  { name: 'PIXEL_PUNK', score: 15300 },
  { name: 'VAPOR_WAVE', score: 12000 },
];

const MainMenu: React.FC<MainMenuProps> = ({ 
  onStart, 
  highScore, 
  gameState, 
  lastScore, 
  speedHistory,
  totalBits,
  equipped,
  unlockedItems,
  consumables,
  powerupLevels,
  onUnlock,
  onEquip
}) => {
  const [currentView, setCurrentView] = useState<'HOME' | 'SHOP' | 'UPGRADES' | 'LEADERBOARD'>('HOME');
  const [shopCategory, setShopCategory] = useState<ShopCategory>('CHARACTERS');

  const renderLeaderboard = () => {
    // Merge player score
    const allScores: Array<{ name: string; score: number; isPlayer?: boolean }> = [...MOCK_LEADERBOARD, { name: 'YOU', score: highScore, isPlayer: true }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return (
        <div className="h-full flex flex-col animate-[fadeIn_0.3s_ease-out] p-4">
             <div className="flex items-center gap-4 mb-6">
                 <Icons.TrophyIcon className="w-8 h-8 text-yellow-400" />
                 <h2 className="text-2xl font-bold font-[Orbitron] text-white">GLOBAL RANKINGS</h2>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b-2 border-slate-700 text-slate-500 font-mono text-sm uppercase">
                             <th className="p-4">Rank</th>
                             <th className="p-4">Operator</th>
                             <th className="p-4 text-right">Score</th>
                         </tr>
                     </thead>
                     <tbody>
                         {allScores.map((entry, index) => (
                             <tr 
                                key={index} 
                                className={`
                                    border-b border-slate-800 font-mono transition-colors
                                    ${entry.isPlayer ? 'bg-cyan-900/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-900/50'}
                                    ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : ''}
                                `}
                             >
                                 <td className="p-4 font-bold">
                                     {index === 0 && '👑'} {index + 1}
                                 </td>
                                 <td className="p-4 flex items-center gap-2">
                                     {entry.isPlayer && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
                                     {entry.name}
                                 </td>
                                 <td className="p-4 text-right font-bold tracking-wider">
                                     {entry.score.toLocaleString()}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    );
  };

  const renderUpgradeItem = (item: any) => {
    const currentLevel = powerupLevels ? (powerupLevels[item.id] || 1) : 0;
    const upgradeCost = UPGRADE_BASE_COST * currentLevel;
    const isMaxLevel = currentLevel >= UPGRADE_MAX_LEVEL;
    const canAfford = totalBits >= upgradeCost;
    
    const IconComponent = UpgradeIconsMap[item.id] || Icons.ChipIcon;

    return (
        <div key={item.id} className="relative group bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50 p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors"></div>

            <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-4">
                    <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        <IconComponent className="w-12 h-12" />
                    </div>
                    <div>
                        <h4 className="font-bold font-[Orbitron] text-lg text-white group-hover:text-cyan-400 transition-colors">{item.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-slate-400 font-mono">LEVEL {currentLevel}</span>
                            <span className="text-xs text-slate-600">/</span>
                            <span className="text-xs text-slate-500 font-mono">{UPGRADE_MAX_LEVEL}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Level Bars */}
            <div className="flex gap-1 h-1.5 w-full">
                {[...Array(UPGRADE_MAX_LEVEL)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`
                            flex-1 transition-all duration-500
                            ${i < currentLevel 
                                ? 'bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.8)]' 
                                : 'bg-slate-800'
                            }
                        `}
                    />
                ))}
            </div>

            <p className="text-sm text-slate-400 font-mono min-h-[3em]">
                {item.description}
            </p>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                {!isMaxLevel ? (
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">Next Upgrade</span>
                        <div className="text-yellow-400 font-bold font-mono text-lg flex items-center gap-2">
                             <Icons.BitIcon className="w-4 h-4" />
                             {upgradeCost}
                        </div>
                     </div>
                ) : (
                    <div className="text-lime-500 font-bold font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                        <Icons.CheckIcon className="w-5 h-5" /> MAXIMUM LEVEL
                    </div>
                )}
                
                <button
                    onClick={() => onUnlock(item.id, upgradeCost, false, true)}
                    disabled={!canAfford || isMaxLevel}
                    className={`
                        px-6 py-2 text-xs font-bold uppercase tracking-wider clip-angled transition-all flex items-center gap-2
                        ${isMaxLevel 
                            ? 'bg-slate-800 text-slate-500 cursor-default opacity-50'
                            : (canAfford 
                                ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            )
                        }
                    `}
                >
                    {isMaxLevel ? 'MAXED' : <><Icons.ZapIcon className="w-3 h-3" /> UPGRADE</>}
                </button>
            </div>
        </div>
    );
  };

  const renderShopItem = (category: ShopCategory, item: any) => {
    const isConsumable = category === 'CONSUMABLES';
    const isUnlocked = !isConsumable && (unlockedItems.includes(item.id) || item.price === 0);
    
    let isEquipped = false;
    if (category === 'CHARACTERS') isEquipped = equipped.character === item.id;
    if (category === 'THEMES') isEquipped = equipped.theme === item.id;
    if (category === 'SKINS') isEquipped = equipped.skin === item.id;
    if (category === 'AUDIO') isEquipped = equipped.audio === item.id;
    if (category === 'ABILITIES') isEquipped = equipped.ability === item.id;

    const price = item.price;
    const canAfford = totalBits >= price;
    
    let inventoryCount = 0;
    if (isConsumable && item.id === 'item_restore') inventoryCount = consumables.systemRestore;
    const isMaxed = (isConsumable && inventoryCount >= item.max);

    return (
        <div 
            key={item.id}
            className={`
                relative p-4 flex flex-col justify-between h-full min-h-[140px]
                transition-all duration-200 border group
                ${isEquipped 
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                    : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                }
            `}
        >
            <div className="mb-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        {category === 'SKINS' && (
                            <div className="w-6 h-6 rounded-sm border border-white/20" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                        )}
                        <h4 className={`font-bold font-[Orbitron] text-sm ${isEquipped ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                            {item.name}
                        </h4>
                    </div>
                    {isConsumable && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${inventoryCount > 0 ? 'border-lime-500 text-lime-400' : 'border-slate-600 text-slate-500'}`}>
                            {inventoryCount}/{item.max}
                        </span>
                    )}
                </div>
                
                <p className="text-[10px] text-slate-400 leading-tight min-h-[2.5em]">
                    {item.description || "No description available."}
                </p>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                 {/* Only show price if NOT unlocked or IF it's a consumable (repeatable purchase) */}
                 {(!isUnlocked || isConsumable) && !isMaxed && (
                    <div className="text-yellow-500 text-xs font-mono flex items-center gap-1">
                        <Icons.BitIcon className="w-3 h-3" />
                        {price}
                    </div>
                 )}
                 
                 <button
                    onClick={() => (!isConsumable && isUnlocked) 
                        ? onEquip(category === 'CHARACTERS' ? 'character' : category === 'THEMES' ? 'theme' : category === 'SKINS' ? 'skin' : category === 'AUDIO' ? 'audio' : 'ability', item.id)
                        : onUnlock(item.id, price, isConsumable, false)
                    }
                    disabled={(!isConsumable && isEquipped) || ((!isUnlocked && !isConsumable) && !canAfford) || (!isMaxed && !canAfford) || isMaxed}
                    className={`
                        flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1
                        ${isEquipped 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 cursor-default'
                            : (canAfford && !isMaxed ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed')
                        }
                    `}
                 >
                    {isEquipped ? <><Icons.CheckIcon className="w-3 h-3"/> ACTIVE</> : isMaxed ? 'MAXED' : isConsumable ? <><Icons.ShoppingBagIcon className="w-3 h-3"/> BUY</> : (isUnlocked ? 'EQUIP' : <><Icons.LockIcon className="w-3 h-3"/> UNLOCK</>)}
                 </button>
            </div>
        </div>
    );
  };

  const getCategoryIcon = (cat: ShopCategory) => {
      switch(cat) {
          case 'CHARACTERS': return <Icons.UserIcon className="w-4 h-4" />;
          case 'THEMES': return <Icons.MonitorIcon className="w-4 h-4" />;
          case 'SKINS': return <Icons.PaletteIcon className="w-4 h-4" />;
          case 'AUDIO': return <Icons.HeadphonesIcon className="w-4 h-4" />;
          case 'ABILITIES': return <Icons.ZapIcon className="w-4 h-4" />;
          case 'CONSUMABLES': return <Icons.FirstAidIcon className="w-4 h-4" />;
          default: return null;
      }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 lg:p-12 pointer-events-auto">
      {/* Dark Overlay Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm -z-10 moving-grid"></div>
      
      {/* Decorative Background Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-10 left-0 w-full h-[1px] bg-cyan-500"></div>
         <div className="absolute bottom-10 left-0 w-full h-[1px] bg-cyan-500"></div>
         <div className="absolute left-10 top-0 h-full w-[1px] bg-cyan-500"></div>
         <div className="absolute right-10 top-0 h-full w-[1px] bg-cyan-500"></div>
      </div>

      <div className="w-full max-w-7xl h-full flex flex-col">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div className="flex flex-col items-center md:items-start">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest italic" style={{ fontFamily: 'Orbitron' }}>
                    <span className="glitch-text mr-4" data-text="GLITCH">GLITCH</span>
                    <span className="text-cyan-400">RUNNER</span>
                </h1>
                <div className="text-xs text-cyan-500 font-mono tracking-[0.5em] mt-1">SYSTEM_VERSION_2.1</div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mt-6 md:mt-0">
                <CyberButton 
                    active={currentView === 'HOME'} 
                    onClick={() => setCurrentView('HOME')}
                    variant="cyan"
                >
                    <Icons.TerminalIcon className="w-4 h-4" /> TERMINAL
                </CyberButton>
                <CyberButton 
                    active={currentView === 'LEADERBOARD'} 
                    onClick={() => setCurrentView('LEADERBOARD')}
                    variant="yellow"
                >
                    <Icons.LeaderboardIcon className="w-4 h-4" /> RANKINGS
                </CyberButton>
                <CyberButton 
                    active={currentView === 'UPGRADES'} 
                    onClick={() => setCurrentView('UPGRADES')}
                    variant="lime"
                >
                    <Icons.ChipIcon className="w-4 h-4" /> UPGRADES
                </CyberButton>
                <CyberButton 
                    active={currentView === 'SHOP'} 
                    onClick={() => setCurrentView('SHOP')}
                    variant="fuchsia"
                >
                    <Icons.ShoppingBagIcon className="w-4 h-4" /> MARKET
                </CyberButton>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            
            {/* VIEW: HOME */}
            {currentView === 'HOME' && (
                <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-6 animate-[fadeIn_0.3s_ease-out]">
                    
                    {/* Left Panel: Stats */}
                    <div className="md:col-span-4 bg-slate-900/50 border border-slate-700 p-6 flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                        
                        <div>
                            <div className="text-slate-500 text-xs font-mono mb-1 flex items-center gap-2">
                                <Icons.WifiIcon className="w-3 h-3" /> OPERATOR_STATUS
                            </div>
                            <div className={`text-2xl font-[Orbitron] ${gameState === GameState.GAME_OVER ? 'text-red-500 glitch-text' : 'text-white'}`} data-text={gameState === GameState.GAME_OVER ? 'CRITICAL FAILURE' : 'ONLINE'}>
                                {gameState === GameState.GAME_OVER ? 'DISCONNECTED' : 'ONLINE'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-3 border border-slate-800">
                                <div className="text-cyan-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Icons.TrophyIcon className="w-3 h-3" /> High Score
                                </div>
                                <div className="text-xl text-white font-mono">{highScore}</div>
                            </div>
                            <div className="bg-black/40 p-3 border border-slate-800">
                                <div className="text-yellow-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Icons.BitIcon className="w-3 h-3" /> Bit Balance
                                </div>
                                <div className="text-xl text-white font-mono">{totalBits}</div>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            <div className="text-slate-500 text-xs font-mono mb-2 flex items-center gap-2">
                                <Icons.ActivityIcon className="w-3 h-3" /> PERFORMANCE_LOG
                            </div>
                            <div className="flex-1 bg-black/40 border border-slate-800 p-2 relative">
                                {speedHistory && speedHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={speedHistory}>
                                            <defs>
                                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5}/>
                                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="speed" stroke="#22d3ee" strokeWidth={2} fill="url(#grad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-700 text-xs font-mono">
                                        NO DATA AVAILABLE
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Panel: Action */}
                    <div className="md:col-span-8 flex flex-col justify-center items-center relative">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                            <div className="w-[500px] h-[500px] border border-cyan-500 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute w-[400px] h-[400px] border border-fuchsia-500 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {gameState === GameState.GAME_OVER ? 
                                <span className="glitch-text text-red-500" data-text="CRITICAL FAILURE">CRITICAL FAILURE</span> : 
                                'SYSTEM READY'
                            }
                        </h2>
                        <p className="text-cyan-400 font-mono text-sm mb-12 tracking-wider">
                            {gameState === GameState.GAME_OVER ? 'REBOOT SEQUENCE REQUIRED' : 'INITIATING NEURAL LINK...'}
                        </p>

                        <button 
                            onClick={onStart}
                            className="group relative px-16 py-6 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-2xl tracking-[0.2em] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] clip-angled flex items-center gap-4"
                        >
                            {gameState === GameState.GAME_OVER ? <Icons.RefreshIcon className="w-8 h-8" /> : <Icons.PlayIcon className="w-8 h-8" />}
                            {gameState === GameState.GAME_OVER ? 'REBOOT' : 'JACK_IN'}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW: LEADERBOARD */}
            {currentView === 'LEADERBOARD' && renderLeaderboard()}

            {/* VIEW: UPGRADES */}
            {currentView === 'UPGRADES' && (
                <div className="h-full flex flex-col animate-[fadeIn_0.3s_ease-out]">
                     <div className="bg-slate-900 border border-slate-700 p-4 mb-4 flex items-center justify-between">
                         <span className="text-slate-400 text-xs">AVAILABLE FUNDS:</span>
                         <span className="text-yellow-400 font-mono font-bold text-lg flex items-center gap-2">
                             <Icons.BitIcon className="w-5 h-5 text-yellow-400" />
                             {totalBits} BITS
                         </span>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SHOP_DATA['UPGRADES'].map((item: any) => renderUpgradeItem(item))}
                        </div>
                     </div>
                </div>
            )}

            {/* VIEW: SHOP */}
            {currentView === 'SHOP' && (
                <div className="h-full flex flex-col md:flex-row gap-6 animate-[fadeIn_0.3s_ease-out]">
                    {/* Categories */}
                    <div className="md:w-64 flex flex-col gap-2 overflow-y-auto pr-2">
                        {/* Balance Display */}
                        <div className="bg-slate-900 border border-slate-700 p-4 mb-4 flex items-center justify-between">
                             <span className="text-slate-400 text-xs">BITS:</span>
                             <span className="text-yellow-400 font-mono font-bold text-lg flex items-center gap-2">
                                <Icons.BitIcon className="w-5 h-5" />
                                {totalBits}
                             </span>
                        </div>

                        {(['CHARACTERS', 'THEMES', 'SKINS', 'AUDIO', 'ABILITIES', 'CONSUMABLES'] as ShopCategory[]).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setShopCategory(cat)}
                                className={`
                                    text-left px-4 py-4 font-bold font-mono text-sm border-l-4 transition-all flex items-center gap-3
                                    ${shopCategory === cat 
                                        ? 'bg-gradient-to-r from-fuchsia-900/50 to-transparent border-fuchsia-500 text-white pl-6' 
                                        : 'border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                    }
                                `}
                            >
                                {getCategoryIcon(cat)}
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex-1 bg-slate-900/30 border border-white/5 p-1 overflow-y-auto custom-scrollbar">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
                             {SHOP_DATA[shopCategory].map((item: any) => renderShopItem(shopCategory, item))}
                         </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default MainMenu;
