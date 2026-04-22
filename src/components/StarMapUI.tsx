import { useState } from "react";

const SPEEDS = ["0.5x", "1x", "1.5x", "2x", "3x", "4x", "5x"];

export function StarMapUI() {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState("1x");
  const [showLabels, setShowLabels] = useState(true);

  return (
    <>
      {/* Top Left — Title */}
      <div className="pointer-events-auto absolute left-4 top-4 map-widget px-4 py-3">
        <div className="text-sm font-display">LOCAL STAR MAP</div>
      </div>

      {/* Top Right — Zoom controls */}
      <div className="pointer-events-auto absolute right-4 top-4 flex gap-2">
        <button className="map-btn h-10 w-10 text-lg font-display" aria-label="Zoom in">
          +
        </button>
        <button className="map-btn h-10 w-10 text-lg font-display" aria-label="Zoom out">
          −
        </button>
      </div>

      {/* Bottom Left — Telemetry */}
      <div className="pointer-events-auto absolute bottom-4 left-4 map-widget px-4 py-3 text-xs leading-relaxed">
        <div className="mb-2 text-[10px] tracking-[0.2em] text-white/60 font-display">
          // TELEMETRY
        </div>
        <div className="font-display">SYSTEM: SOL</div>
        <div className="font-display">DISTANCE TO NEAREST: --</div>
        <div className="font-display">SHIP X: 0.00, Y: 0.00, Z: 0.00</div>
        <div className="font-display">DISTANCE FROM EARTH: 0.00 LY</div>
      </div>

      {/* Bottom Right — Controls */}
      <div className="pointer-events-auto absolute bottom-4 right-4 map-widget w-80 px-4 py-3">
        <div className="mb-2 text-[10px] tracking-[0.2em] text-white/60 font-display">
          // CONTROLS
        </div>

        <div className="mb-3">
          <div className="mb-1 flex justify-between text-[10px] font-display">
            <span>PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="map-slider"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1 text-[10px] font-display">PLAYBACK SPEED</div>
          <div className="flex gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="map-btn flex-1 py-1 text-[10px] font-display"
                style={
                  speed === s
                    ? { color: "#fff", borderColor: "#4a7fb8" }
                    : undefined
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs font-display">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="map-checkbox"
          />
          SHOW LABELS
        </label>
      </div>
    </>
  );
}
