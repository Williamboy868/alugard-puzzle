// ============================================================
// LevelSelector — Screen for choosing which level to play
// ============================================================

import React from 'react';
import { LEVELS } from '../config/levels';
import './LevelSelector.css';

interface LevelSelectorProps {
  onSelectLevel: (level: number) => void;
}

const STARS = ['★', '★★', '★★★', '★★★★', '★★★★★'];
const DESCRIPTIONS = [
  '16 pieces — perfect for beginners',
  '25 pieces — warming up',
  '36 pieces — getting tricky',
  '49 pieces — challenging',
  '64 pieces — master level',
];

export function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="level-selector">
      <div className="level-selector__header">
        <h1 className="level-selector__title">
          <span className="level-selector__title-gradient">Alugard</span>
          <span className="level-selector__title-sub"> Puzzle</span>
        </h1>
        <p className="level-selector__subtitle">
          Reassemble the shattered image. Drag octagon pieces into place.
        </p>
      </div>

      <div className="level-selector__grid">
        {LEVELS.map((lvl, i) => (
          <button
            key={lvl.level}
            className="level-card"
            onClick={() => onSelectLevel(lvl.level)}
          >
            <div className="level-card__image-wrap">
              <img
                src={lvl.imagePath}
                alt={lvl.label}
                className="level-card__image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/images/placeholder.jpg';
                }}
              />
              <div className="level-card__overlay">
                <span className="level-card__play">▶ Play</span>
              </div>
            </div>
            <div className="level-card__body">
              <div className="level-card__top">
                <span className="level-card__number">Level {lvl.level}</span>
                <span className="level-card__stars">{STARS[i]}</span>
              </div>
              <h3 className="level-card__name">{lvl.label}</h3>
              <p className="level-card__desc">{DESCRIPTIONS[i]}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
