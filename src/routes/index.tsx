import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { StarMapScene } from "@/components/StarMapScene";
import { StarMapUI } from "@/components/StarMapUI";

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
  const zoomRef = useRef<((dir: 1 | -1) => void) | null>(null);

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
  // Distance from Earth (~origin)
  const dx = shipPos.x - 0.000015;
  const dy = shipPos.y;
  const dz = shipPos.z;
  const distanceFromSol = Math.sqrt(dx * dx + dy * dy + dz * dz);

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
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[100]">
        <StarMapUI
          progress={progress}
          onProgressChange={setProgress}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          shipPos={shipCoords}
          distanceFromSol={distanceFromSol}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>
    </div>
  );
}
