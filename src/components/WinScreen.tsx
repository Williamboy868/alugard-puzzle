// ============================================================
// WinScreen — Displayed on puzzle completion
// ============================================================

import React from 'react';
import './WinScreen.css';

interface WinScreenProps {
  level: number;
  levelLabel: string;
  elapsedSeconds: number;
  moveCount: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
  hasNextLevel: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function WinScreen({
  level,
  levelLabel,
  elapsedSeconds,
  moveCount,
  onNextLevel,
  onReplay,
  onMenu,
  hasNextLevel,
}: WinScreenProps) {
  return (
    <div className="win-screen">
      <div className="win-screen__confetti" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="win-screen__confetti-piece" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      <div className="win-screen__card">
        <div className="win-screen__crown">🏆</div>
        <h2 className="win-screen__title">Puzzle Complete!</h2>
        <p className="win-screen__subtitle">{levelLabel} — Level {level}</p>

        <div className="win-screen__stats">
          <div className="win-screen__stat">
            <span className="win-screen__stat-label">Time</span>
            <span className="win-screen__stat-value">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="win-screen__divider" />
          <div className="win-screen__stat">
            <span className="win-screen__stat-label">Moves</span>
            <span className="win-screen__stat-value">{moveCount}</span>
          </div>
        </div>

        <div className="win-screen__actions">
          {hasNextLevel && (
            <button className="win-screen__btn win-screen__btn--primary" onClick={onNextLevel}>
              Next Level →
            </button>
          )}
          <button className="win-screen__btn win-screen__btn--secondary" onClick={onReplay}>
            Replay
          </button>
          <button className="win-screen__btn win-screen__btn--ghost" onClick={onMenu}>
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}
