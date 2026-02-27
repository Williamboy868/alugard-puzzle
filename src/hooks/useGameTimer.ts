// ============================================================
// useGameTimer — Ticks 'TICK' action every second during solving
// ============================================================

import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../store/gameStore';
import type { GamePhase } from '../types/puzzle';

export function useGameTimer(phase: GamePhase, dispatch: Dispatch<GameAction>) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'solving' || phase === 'scrambled') {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [phase, dispatch]);
}
