import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
type OrbitControlsImpl = {
  target: THREE.Vector3;
  update: () => void;
  enablePan: boolean;
  zoomToCursor: boolean;
};
import * as THREE from "three";
import starData from "@/data/stellarSystems20ly.json";

type Star = {
  name: string;
  x: number;
  y: number;
  z: number;
  distance: number;
  magnitude: number;
  color: string;
};

type Props = {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  shipPos: [number, number, number];
  showLabels: boolean;
  zoomRef: React.MutableRefObject<((dir: 1 | -1) => void) | null>;
};

const ALWAYS_LABELED = new Set([
  "Sol",
  "Earth",
  "Tau Ceti",
  "40 Eridani A",
  "Hail Mary",
]);

// Solar system planets — render Sol + Earth but skip the rest
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

const PROXIMITY_THRESHOLD = 8; // LY-ish units

function radiusFromMagnitude(mag: number): number {
  const m = Math.max(-2, Math.min(17, mag));
  const t = (m + 2) / 19;
  return 0.55 - t * 0.43;
}

function StarLabel({ name }: { name: string }) {
  return (
    <Html
      center
      transform
      sprite
      scale={0.6}
      position={[0, 0.45, 0]}
      style={{
        pointerEvents: "none",
        color: "#ffffff",
        fontFamily: "'Microgramma', monospace",
        fontWeight: 400,
        fontSize: "11px",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        textShadow: "0 0 4px rgba(0,0,0,0.9)",
      }}
    >
      {name.toUpperCase()}
    </Html>
  );
}

function StarObj({
  star,
  showLabels,
}: {
  star: Star;
  showLabels: boolean;
}) {
  const showAlways = ALWAYS_LABELED.has(star.name);
  const starPos = useMemo(
    () => new THREE.Vector3(star.x, star.y, star.z),
    [star.x, star.y, star.z],
  );

  const r = radiusFromMagnitude(star.magnitude);

  return (
    <group position={[star.x, star.y, star.z]}>
      {/* Crisp solid sphere — saturated color, no halo */}
      <mesh>
        <sphereGeometry args={[r, 32, 32]} />
        <meshBasicMaterial color={star.color} toneMapped={false} />
      </mesh>
      {showLabels &&
        (showAlways ? (
          <StarLabel name={star.name} />
        ) : (
          <ProximityLabel name={star.name} starPos={starPos} />
        ))}
    </group>
  );
}

function ProximityLabel({
  name,
  starPos,
}: {
  name: string;
  starPos: THREE.Vector3;
}) {
  const [visible, setVisible] = useState(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const d = camera.getWorldPosition(tmp).distanceTo(starPos);
    const next = d < PROXIMITY_THRESHOLD;
    setVisible((prev) => (prev !== next ? next : prev));
  });
  if (!visible) return null;
  return <StarLabel name={name} />;
}

function Stars({ showLabels }: { showLabels: boolean }) {
  const stars = useMemo(
    () => (starData as Star[]).filter((s) => !PLANET_NAMES.has(s.name)),
    [],
  );
  return (
    <>
      {stars.map((s) => (
        <StarObj key={s.name} star={s} showLabels={showLabels} />
      ))}
    </>
  );
}

function PathAndShip({
  curve,
  progress,
  shipPos,
  showLabels,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  shipPos: [number, number, number];
  showLabels: boolean;
}) {
  const t = Math.min(Math.max(progress / 100, 0), 1);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const { behindPoints, aheadPoints } = useMemo(() => {
    const SEGMENTS = 200;
    const all = curve.getPoints(SEGMENTS);
    const cutIdx = Math.round(t * SEGMENTS);
    const behind = all.slice(0, Math.max(cutIdx + 1, 1));
    const ahead = all.slice(Math.max(cutIdx, 0));
    return { behindPoints: behind, aheadPoints: ahead };
  }, [curve, t]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const v = (Math.sin(clock.elapsedTime * 4) + 1) / 2;
      matRef.current.opacity = 0.35 + v * 0.65;
    }
  });

  return (
    <>
      {behindPoints.length >= 2 && (
        <Line
          points={behindPoints}
          color="#ff2a2a"
          lineWidth={2}
          transparent
          opacity={0.95}
        />
      )}
      {aheadPoints.length >= 2 && (
        <Line
          points={aheadPoints}
          color="#ff2a2a"
          lineWidth={2}
          dashed
          dashSize={0.3}
          gapSize={0.25}
          transparent
          opacity={0.85}
        />
      )}

      <group position={shipPos}>
        <mesh renderOrder={999}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial
            ref={matRef}
            color="#FF0000"
            transparent
            opacity={1}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
        {showLabels && <StarLabel name="Hail Mary" />}
      </group>
    </>
  );
}

function ZoomBridge({
  controlsRef,
  zoomRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  zoomRef: React.MutableRefObject<((dir: 1 | -1) => void) | null>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    zoomRef.current = (dir: 1 | -1) => {
      const controls = controlsRef.current;
      if (!controls) return;
      const toTarget = new THREE.Vector3().subVectors(
        controls.target,
        camera.position,
      );
      const distToTarget = toTarget.length();
      if (distToTarget < 1e-4) return;
      toTarget.normalize();
      const ZOOM_FRACTION = 0.25;
      const minDist = 0.01;
      const maxDist = 200;
      let step = distToTarget * ZOOM_FRACTION * (dir === 1 ? 1 : -1);
      const nextDist = distToTarget - step;
      if (nextDist < minDist) step = distToTarget - minDist;
      if (nextDist > maxDist) step = distToTarget - maxDist;
      camera.position.addScaledVector(toTarget, step);
      controls.update();
    };
    return () => {
      zoomRef.current = null;
    };
  }, [camera, controlsRef, zoomRef]);
  return null;
}

export function StarMapScene({
  curve,
  progress,
  shipPos,
  showLabels,
  zoomRef,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      camera={{ position: [14, 10, 18], fov: 60, near: 0.1, far: 1000 }}
      style={{ background: "#000000" }}
    >
      <ambientLight intensity={0.4} />

      <OrbitControls
        ref={controlsRef as never}
        makeDefault
        enableRotate={true}
        enableZoom={true}
        enablePan={false}
        zoomToCursor={true}
        zoomSpeed={0.9}
        rotateSpeed={0.7}
        minDistance={0.01}
        maxDistance={200}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
      />
      <ZoomBridge
        controlsRef={controlsRef as React.RefObject<OrbitControlsImpl>}
        zoomRef={zoomRef}
      />

      <Stars showLabels={showLabels} />
      <PathAndShip
        curve={curve}
        progress={progress}
        shipPos={shipPos}
        showLabels={showLabels}
      />
    </Canvas>
  );
}
