import { type CSSProperties } from "react";
import { Plus, Minus, Play, Pause } from "lucide-react";

export const SPEED_STOPS = [0.5, 1, 1.5, 2, 3, 4, 5];

type Props = {
  progress: number;
  onProgressChange: (v: number) => void;
  showLabels: boolean;
  onShowLabelsChange: (v: boolean) => void;
  shipPos: [number, number, number];
  distanceFromEarth: number;
  nearestDistance: number;
  systemName: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speedIndex: number;
  onSpeedIndexChange: (v: number) => void;
};

export function StarMapUI({
  progress,
  onProgressChange,
  showLabels,
  onShowLabelsChange,
  shipPos,
  distanceFromEarth,
  nearestDistance,
  systemName,
  onZoomIn,
  onZoomOut,
  isPlaying,
  onTogglePlay,
  speedIndex,
  onSpeedIndexChange,
}: Props) {
  const speed = SPEED_STOPS[speedIndex];

  const progressStyle = {
    "--progress": `${progress}%`,
  } as CSSProperties;

  const [sx, sy, sz] = shipPos;

  return (
    <>
      {/* Top Left — Title */}
      <div
        className="pointer-events-auto absolute left-6 top-6 map-widget w-fit"
        style={{ padding: "0.6rem 1.1rem", maxWidth: "none" }}
      >
        <div className="font-display-bold whitespace-nowrap text-2xl leading-none tracking-[0.18em]">
          LOCAL STELLAR AREA
        </div>
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
        <div className="font-display-bold mb-3 text-xs" style={{ color: "var(--map-muted)" }}>TELEMETRY</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="font-display">
            <span style={{ color: "var(--map-muted)" }}>DISTANCE TO NEAREST STAR:</span>{" "}
            <span className="text-white">
              {isFinite(nearestDistance)
                ? `${nearestDistance.toFixed(2)} LY`
                : "--"}
            </span>
          </div>
          <div className="font-display">
            <span style={{ color: "var(--map-muted)" }}>DISTANCE FROM EARTH:</span>{" "}
            <span className="text-white">{distanceFromEarth.toFixed(2)} LY</span>
          </div>
          <div className="font-display">
            <span style={{ color: "var(--map-muted)" }}>SHIP:</span>{" "}
            <span className="text-white">
              X {sx.toFixed(2)}, Y {sy.toFixed(2)}, Z {sz.toFixed(2)}
            </span>
          </div>
          <div className="font-display">
            <span style={{ color: "var(--map-muted)" }}>SYSTEM:</span>{" "}
            <span className="text-white">
              {systemName ? systemName.toUpperCase() : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Right — Controls */}
      <div className="pointer-events-auto absolute bottom-6 right-6 map-widget">
        <div className="font-display-bold mb-3 text-xs" style={{ color: "var(--map-muted)" }}>CONTROLS</div>

        {/* Progress */}
        <div className="mb-5 min-w-[280px]">
          <div className="font-display mb-2 flex justify-between text-[10px]">
            <span style={{ color: "var(--map-muted)" }}>PROGRESS</span>
            <span className="text-white">{progress.toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="map-slider-progress"
            style={progressStyle}
          />
        </div>

        {/* Playback speed */}
        <div className="mb-5">
          <div className="font-display mb-2 flex justify-between text-[10px]">
            <span style={{ color: "var(--map-muted)" }}>PLAYBACK SPEED</span>
            <span className="text-white">{speed}x</span>
          </div>
          <input
            type="range"
            min={0}
            max={SPEED_STOPS.length - 1}
            step={1}
            value={speedIndex}
            onChange={(e) => onSpeedIndexChange(Number(e.target.value))}
            className="map-slider-speed"
          />
          <div className="font-display mt-1.5 flex justify-between text-[9px]" style={{ color: "var(--map-muted)" }}>
            {SPEED_STOPS.map((s) => (
              <span key={s}>{s}x</span>
            ))}
          </div>
        </div>

        {/* Bottom row: Show labels + Play/Pause */}
        <div className="flex items-center justify-between gap-4">
          <label
            className="font-display flex cursor-pointer items-center gap-2.5 text-[11px]"
            style={{ color: "var(--map-muted)" }}
          >
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => onShowLabelsChange(e.target.checked)}
              className="map-checkbox map-checkbox-muted"
            />
            <span>SHOW LABELS</span>
          </label>
          <button
            onClick={onTogglePlay}
            className="flex h-9 w-9 items-center justify-center bg-transparent border-0 outline-none transition-colors cursor-pointer hover:opacity-80"
            style={{ color: "var(--map-muted)" }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={18} strokeWidth={2.5} />
            ) : (
              <Play size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
