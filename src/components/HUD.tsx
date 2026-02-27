// ============================================================
// HUD — Heads-Up Display (timer, moves, level, completion)
// ============================================================

import React from 'react';
import './HUD.css';

interface HUDProps {
  level: number;
  levelLabel: string;
  elapsedSeconds: number;
  moveCount: number;
  completionPct: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function HUD({ level, levelLabel, elapsedSeconds, moveCount, completionPct }: HUDProps) {
  const pct = Math.round(completionPct * 100);

  return (
    <div className="hud">
      <div className="hud__left">
        <div className="hud__badge">
          <span className="hud__badge-label">Level</span>
          <span className="hud__badge-value">{level}</span>
        </div>
        <span className="hud__level-name">{levelLabel}</span>
      </div>

      <div className="hud__center">
        <div className="hud__progress-bar">
          <div
            className="hud__progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="hud__pct">{pct}%</span>
      </div>

      <div className="hud__right">
        <div className="hud__stat">
          <span className="hud__stat-icon">⏱</span>
          <span className="hud__stat-value">{formatTime(elapsedSeconds)}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__stat-icon">↕</span>
          <span className="hud__stat-value">{moveCount} moves</span>
        </div>
      </div>
    </div>
  );
}
