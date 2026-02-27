// ============================================================
// App.tsx — Top-level game phase router
// ============================================================

import React, { useState, useCallback } from 'react';
import { GameProvider, useGameDispatch } from './store/gameStore';
import { LevelSelector } from './components/LevelSelector';
import { GameScreen } from './components/GameScreen';
import 'alugard-drop/style.css';
import './index.css';

type Screen = 'menu' | 'game';

function AppInner() {
  const [screen, setScreen] = useState<Screen>('menu');
  const dispatch = useGameDispatch();

  const handleSelectLevel = useCallback(
    (level: number) => {
      dispatch({ type: 'SET_LEVEL', level });
      setScreen('game');
    },
    [dispatch],
  );

  const handleMenu = useCallback(() => {
    dispatch({ type: 'RESET' });
    setScreen('menu');
  }, [dispatch]);

  return (
    <div className="app">
      <div className="app__bg" aria-hidden="true" />
      {screen === 'menu' ? (
        <LevelSelector onSelectLevel={handleSelectLevel} />
      ) : (
        <GameScreen onMenu={handleMenu} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
