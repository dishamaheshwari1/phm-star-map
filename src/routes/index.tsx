import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

// Path waypoints: Sol -> Tau Ceti -> 40 Eridani A
const PATH_POINTS: [number, number, number][] = [
  [0, 0, 0],
  [10.29, 5.02, -3.27],
  [7.14, 14.53, -2.17],
];

function Index() {
  const [progress, setProgress] = useState(0); // 0 - 100
  const [showLabels, setShowLabels] = useState(true);

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
  const distanceFromSol = Math.sqrt(
    shipPos.x * shipPos.x + shipPos.y * shipPos.y + shipPos.z * shipPos.z,
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <StarMapScene
          curve={curve}
          progress={progress}
          shipPos={shipCoords}
          showLabels={showLabels}
        />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <StarMapUI
          progress={progress}
          onProgressChange={setProgress}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          shipPos={shipCoords}
          distanceFromSol={distanceFromSol}
        />
      </div>
    </div>
  );
}
