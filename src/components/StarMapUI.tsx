import { useState, type CSSProperties } from "react";
import { Plus, Minus } from "lucide-react";

const SPEED_STOPS = [0.5, 1, 1.5, 2, 3, 4, 5];

type Props = {
  progress: number;
  onProgressChange: (v: number) => void;
  showLabels: boolean;
  onShowLabelsChange: (v: boolean) => void;
  shipPos: [number, number, number];
  distanceFromSol: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function StarMapUI({
  progress,
  onProgressChange,
  showLabels,
  onShowLabelsChange,
  shipPos,
  distanceFromSol,
  onZoomIn,
  onZoomOut,
}: Props) {
  const [speedIndex, setSpeedIndex] = useState(1); // 1x default

  const speed = SPEED_STOPS[speedIndex];

  const progressStyle = {
    "--progress": `${progress}%`,
  } as CSSProperties;

  const [sx, sy, sz] = shipPos;

  return (
    <>
      {/* Top Left — Title */}
      <div
        className="pointer-events-auto absolute left-6 top-6 map-widget"
        style={{ padding: "0.5rem 0.85rem" }}
      >
        <div className="font-display-bold text-2xl leading-none">LOCAL STELLAR AREA</div>
      </div>

      {/* Top Right — Zoom controls */}
      <div className="pointer-events-auto absolute right-6 top-6 flex gap-3">
        <button
          onClick={onZoomIn}
          className="map-btn flex h-11 w-11 items-center justify-center"
          aria-label="Zoom in"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={onZoomOut}
          className="map-btn flex h-11 w-11 items-center justify-center"
          aria-label="Zoom out"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Left — Telemetry */}
      <div className="pointer-events-auto absolute bottom-6 left-6 map-widget">
        <div className="font-display-bold mb-3 text-xs text-white/70">TELEMETRY</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="font-display">
            <span className="text-white/50">SYSTEM:</span>{" "}
            <span className="text-white">SOL</span>
          </div>
          <div className="font-display">
            <span className="text-white/50">DISTANCE TO NEAREST:</span>{" "}
            <span className="text-white">--</span>
          </div>
          <div className="font-display">
            <span className="text-white/50">SHIP:</span>{" "}
            <span className="text-white">
              X {sx.toFixed(2)}, Y {sy.toFixed(2)}, Z {sz.toFixed(2)}
            </span>
          </div>
          <div className="font-display">
            <span className="text-white/50">DISTANCE FROM EARTH:</span>{" "}
            <span className="text-white">{distanceFromSol.toFixed(2)} LY</span>
          </div>
        </div>
      </div>

      {/* Bottom Right — Controls */}
      <div className="pointer-events-auto absolute bottom-6 right-6 map-widget">
        <div className="font-display-bold mb-3 text-xs text-white/70">CONTROLS</div>

        {/* Progress */}
        <div className="mb-5 min-w-[280px]">
          <div className="font-display mb-2 flex justify-between text-[10px]">
            <span className="text-white/60">PROGRESS</span>
            <span className="text-white">{progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="map-slider-progress"
            style={progressStyle}
          />
        </div>

        {/* Playback speed */}
        <div className="mb-5">
          <div className="font-display mb-2 flex justify-between text-[10px]">
            <span className="text-white/60">PLAYBACK SPEED</span>
            <span className="text-white">{speed}x</span>
          </div>
          <input
            type="range"
            min={0}
            max={SPEED_STOPS.length - 1}
            step={1}
            value={speedIndex}
            onChange={(e) => setSpeedIndex(Number(e.target.value))}
            className="map-slider-speed"
          />
          <div className="font-display mt-1.5 flex justify-between text-[9px] text-white/40">
            {SPEED_STOPS.map((s) => (
              <span key={s}>{s}x</span>
            ))}
          </div>
        </div>

        {/* Show labels */}
        <label className="font-display flex cursor-pointer items-center gap-2.5 text-[11px]">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onShowLabelsChange(e.target.checked)}
            className="map-checkbox"
          />
          <span>SHOW LABELS</span>
        </label>
      </div>
    </>
  );
}
