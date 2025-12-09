
import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import UIOverlay from './components/UIOverlay';
import { GameState, GameStats, GlobalSettings, EquippedItems, PowerupType } from './types';
import { SHOP_DATA, UPGRADE_MAX_LEVEL } from './constants';
import { soundManager } from './utils/SoundManager';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  
  // Persistent Settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    totalBits: 0, 
    equipped: {
        character: 'char_ninja',
        theme: 'theme_cyber',
        skin: 'skin_cyan',
        audio: 'audio_cyber',
        ability: 'ability_none'
    },
    unlockedItems: ['char_ninja', 'theme_cyber', 'skin_cyan', 'audio_cyber', 'ability_none'],
    consumables: {
        systemRestore: 0
    },
    powerupLevels: {
        [PowerupType.OVERCLOCK]: 1,
        [PowerupType.SHIELD]: 1,
        [PowerupType.ROOT_ACCESS]: 1,
        [PowerupType.LAG_SWITCH]: 1,
        [PowerupType.MAGNET]: 1,
        [PowerupType.DEBUGGER]: 1
    }
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    distance: 0,
    speedMultiplier: 1,
    speedHistory: [],
    hasShield: false,
    scoreMultiplier: 1,
    bitsCollected: 0,
    revivesLeft: 0,
    activePowerups: []
  });

  // Load Data
  useEffect(() => {
    const savedScore = localStorage.getItem('glitchRunner_highScore');
    const savedBits = localStorage.getItem('glitchRunner_bits');
    const savedEquipped = localStorage.getItem('glitchRunner_equipped');
    const savedUnlocked = localStorage.getItem('glitchRunner_unlockedItems');
    const savedConsumables = localStorage.getItem('glitchRunner_consumables');
    const savedPowerups = localStorage.getItem('glitchRunner_powerupLevels');

    setStats(s => ({ ...s, highScore: savedScore ? parseInt(savedScore, 10) : 0 }));
    
    setGlobalSettings(prev => ({
        totalBits: savedBits ? parseInt(savedBits, 10) : 0, 
        equipped: savedEquipped ? JSON.parse(savedEquipped) : prev.equipped,
        unlockedItems: savedUnlocked ? JSON.parse(savedUnlocked) : prev.unlockedItems,
        consumables: savedConsumables ? JSON.parse(savedConsumables) : prev.consumables,
        powerupLevels: savedPowerups ? JSON.parse(savedPowerups) : prev.powerupLevels
    }));
  }, []);

  // Sync Audio Pack
  useEffect(() => {
      soundManager.setPack(globalSettings.equipped.audio);
  }, [globalSettings.equipped.audio]);

  const updateStats = (newStats: Partial<GameStats>) => {
    setStats(prev => {
       const updated = { ...prev, ...newStats };
       if (newStats.speedMultiplier && prev.speedMultiplier !== newStats.speedMultiplier) {
          updated.speedHistory = [...prev.speedHistory, { time: prev.distance, speed: prev.speedMultiplier }];
       }
       return updated;
    });
  };

  const handleConsumeRevive = () => {
      setGlobalSettings(prev => {
          const newConsumables = { 
              ...prev.consumables, 
              systemRestore: Math.max(0, prev.consumables.systemRestore - 1) 
          };
          localStorage.setItem('glitchRunner_consumables', JSON.stringify(newConsumables));
          return { ...prev, consumables: newConsumables };
      });
  };

  const handleEquipItem = (category: keyof EquippedItems, id: string) => {
      if (globalSettings.unlockedItems.includes(id)) {
          const newEquipped = { ...globalSettings.equipped, [category]: id };
          setGlobalSettings(prev => ({ ...prev, equipped: newEquipped }));
          localStorage.setItem('glitchRunner_equipped', JSON.stringify(newEquipped));
          soundManager.playBuy(); 
      }
  };

  const handleUnlockItem = (id: string, cost: number, isConsumable: boolean = false, isUpgrade: boolean = false) => {
    if (globalSettings.totalBits >= cost) {
      
      const newBits = globalSettings.totalBits - cost;

      // Consumable Logic
      if (isConsumable) {
          if (id === 'item_restore') {
              const current = globalSettings.consumables.systemRestore || 0;
              if (current >= 5) return false; // Max limit
              
              const newConsumables = { ...globalSettings.consumables, systemRestore: current + 1 };
              setGlobalSettings(prev => ({ ...prev, totalBits: newBits, consumables: newConsumables }));
              localStorage.setItem('glitchRunner_bits', newBits.toString());
              localStorage.setItem('glitchRunner_consumables', JSON.stringify(newConsumables));
              soundManager.playBuy();
              return true;
          }
      }

      // Upgrade Logic
      if (isUpgrade) {
          const currentLevel = globalSettings.powerupLevels[id as PowerupType] || 1;
          if (currentLevel < UPGRADE_MAX_LEVEL) {
              const newLevels = { ...globalSettings.powerupLevels, [id]: currentLevel + 1 };
              setGlobalSettings(prev => ({ ...prev, totalBits: newBits, powerupLevels: newLevels }));
              localStorage.setItem('glitchRunner_bits', newBits.toString());
              localStorage.setItem('glitchRunner_powerupLevels', JSON.stringify(newLevels));
              soundManager.playBuy();
              return true;
          }
          return false;
      }

      // Standard Unlock Logic
      if (!globalSettings.unlockedItems.includes(id)) {
          const newUnlocked = [...globalSettings.unlockedItems, id];
          setGlobalSettings(prev => ({ ...prev, totalBits: newBits, unlockedItems: newUnlocked }));
          localStorage.setItem('glitchRunner_bits', newBits.toString());
          localStorage.setItem('glitchRunner_unlockedItems', JSON.stringify(newUnlocked));
          soundManager.playBuy();
          return true;
      }
    }
    
    soundManager.playError();
    return false;
  };

  // Handle Game Over persistence
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      if (stats.score > stats.highScore) {
        localStorage.setItem('glitchRunner_highScore', stats.score.toString());
        setStats(s => ({ ...s, highScore: s.score }));
      }
      
      const newTotal = globalSettings.totalBits + stats.bitsCollected;
      setGlobalSettings(prev => ({ ...prev, totalBits: newTotal }));
      localStorage.setItem('glitchRunner_bits', newTotal.toString());
    }
  }, [gameState, stats.score, stats.highScore, stats.bitsCollected]);

  const handleStart = () => {
    soundManager.init();
    soundManager.resume();
    // Reset game stats for new run
    setStats(prev => ({ ...prev, revivesLeft: globalSettings.consumables.systemRestore }));
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden text-white select-none">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState} 
        updateStats={updateStats}
        equipped={globalSettings.equipped}
        availableRevives={globalSettings.consumables.systemRestore}
        powerupLevels={globalSettings.powerupLevels}
        onConsumeRevive={handleConsumeRevive}
      />
      
      <UIOverlay 
        gameState={gameState} 
        stats={stats} 
      />

      {(gameState === GameState.MENU || gameState === GameState.GAME_OVER) && (
        <MainMenu 
          onStart={handleStart} 
          gameState={gameState} 
          highScore={stats.highScore}
          lastScore={stats.score}
          speedHistory={stats.speedHistory}
          totalBits={globalSettings.totalBits}
          equipped={globalSettings.equipped}
          unlockedItems={globalSettings.unlockedItems}
          consumables={globalSettings.consumables}
          powerupLevels={globalSettings.powerupLevels}
          onUnlock={handleUnlockItem}
          onEquip={handleEquipItem}
        />
      )}
    </div>
  );
};

export default App;
