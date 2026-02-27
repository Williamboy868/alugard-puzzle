// ============================================================
// useCanvasRenderer — Drives ghost grid + border canvas
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { drawGhostGrid, drawBorders } from '../utils/canvasRenderer';
import type { OctagonCell } from '../types/puzzle';

export function useCanvasRenderer(
  ghostCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  borderCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  cells: OctagonCell[],
  occupancyMap: Record<string, string | null>,
  sideLength: number,
  active: boolean,
) {
  const rafRef = useRef<number | null>(null);
  // Keep a stable ref to occupancy for RAF closure
  const occupancyRef = useRef(occupancyMap);
  useEffect(() => { occupancyRef.current = occupancyMap; }, [occupancyMap]);

  // Draw ghost grid whenever cells change (level/resize)
  useEffect(() => {
    const canvas = ghostCanvasRef.current;
    if (!canvas || cells.length === 0 || sideLength === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGhostGrid(ctx, cells, sideLength);
  }, [ghostCanvasRef, cells, sideLength]);

  // RAF render function — defined as a regular function so there's no hoisting issue
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  const rafCallback = useRef<() => void>(() => undefined);

  const doRender = useCallback(() => {
    const canvas = borderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorders(ctx, cells, occupancyRef.current, sideLength);
    if (activeRef.current) {
      rafRef.current = requestAnimationFrame(rafCallback.current);
    }
  }, [borderCanvasRef, cells, sideLength]);

  // Point rafCallback to the latest doRender
  useEffect(() => {
    rafCallback.current = doRender;
  }, [doRender]);

  // Start/stop RAF loop
  useEffect(() => {
    if (active) {
      rafRef.current = requestAnimationFrame(doRender);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Final draw when deactivated
      const canvas = borderCanvasRef.current;
      if (canvas && cells.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBorders(ctx, cells, occupancyRef.current, sideLength);
        }
      }
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, doRender, borderCanvasRef, cells, sideLength]);
}
