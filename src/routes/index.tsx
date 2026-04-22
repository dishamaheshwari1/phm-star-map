import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { StarMapScene } from "@/components/StarMapScene";
import { StarMapUI } from "@/components/StarMapUI";
import starData from "@/data/stellarSystems20ly.json";

type StarRec = { name: string; x: number; y: number; z: number };

const PLANET_NAMES = new Set([
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
]);

const NEAREST_SYSTEM_THRESHOLD = 0.5; // LY
const EARTH_POS: [number, number, number] = [0.000015, 0, 0];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Local Stellar Area" },
      { name: "description", content: "Retro-futuristic interactive 3D star map." },
    ],
  }),
});

// Path waypoints: Earth -> Tau Ceti -> pivot -> 40 Eridani A
const PATH_POINTS: [number, number, number][] = [
  [0.000015, 0, 0],
  [10.29, 5.02, -3.27],
  [7.5, 8.0, -4.5],
  [7.14, 14.53, -2.17],
];

function Index() {
  const [progress, setProgress] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(1); // 1x default
  const zoomRef = useRef<((dir: 1 | -1) => void) | null>(null);

  const SPEED_STOPS = [0.5, 1, 1.5, 2, 3, 4, 5];
  const speed = SPEED_STOPS[speedIndex];

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        PATH_POINTS.map((p) => new THREE.Vector3(...p)),
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );

  const shipPos = useMemo(() => {
    const t = Math.min(Math.max(progress / 100, 0), 1);
    return curve.getPoint(t);
  }, [curve, progress]);

  const shipCoords: [number, number, number] = [shipPos.x, shipPos.y, shipPos.z];

  // Distance from Earth
  const dxE = shipPos.x - EARTH_POS[0];
  const dyE = shipPos.y - EARTH_POS[1];
  const dzE = shipPos.z - EARTH_POS[2];
  const distanceFromEarth = Math.sqrt(dxE * dxE + dyE * dyE + dzE * dzE);

  // Filtered stars (exclude planets) memoized once
  const stars = useMemo(
    () => (starData as StarRec[]).filter((s) => !PLANET_NAMES.has(s.name)),
    [],
  );

  // Distance to nearest star + system identification
  const { nearestDistance, nearestName } = useMemo(() => {
    let best = Infinity;
    let bestName = "";
    for (const s of stars) {
      const dx = shipPos.x - s.x;
      const dy = shipPos.y - s.y;
      const dz = shipPos.z - s.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < best) {
        best = d;
        bestName = s.name;
      }
    }
    return { nearestDistance: best, nearestName: bestName };
  }, [stars, shipPos.x, shipPos.y, shipPos.z]);

  const systemName =
    nearestDistance < NEAREST_SYSTEM_THRESHOLD ? nearestName : "";

  const onZoomIn = useCallback(() => zoomRef.current?.(1), []);
  const onZoomOut = useCallback(() => zoomRef.current?.(-1), []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <StarMapScene
          curve={curve}
          progress={progress}
          shipPos={shipCoords}
          showLabels={showLabels}
          zoomRef={zoomRef}
          isPlaying={isPlaying}
          speed={speed}
          onProgressChange={setProgress}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[100]">
        <StarMapUI
          progress={progress}
          onProgressChange={setProgress}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          shipPos={shipCoords}
          distanceFromEarth={distanceFromEarth}
          nearestDistance={nearestDistance}
          systemName={systemName}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          speedIndex={speedIndex}
          onSpeedIndexChange={setSpeedIndex}
        />
      </div>
    </div>
  );
}
