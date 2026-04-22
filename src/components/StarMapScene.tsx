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
  isPlaying: boolean;
  speed: number;
  onProgressChange: (v: number) => void;
};

// Base duration for 1x speed to traverse 0 -> 100% (in seconds)
const BASE_DURATION_SEC = 60;

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

const BRIGHT_MAGNITUDE = 5.0; // absolute magnitude threshold (smaller = brighter)
const PROXIMITY_THRESHOLD = 3; // light-years

function radiusFromMagnitude(mag: number): number {
  const m = Math.max(-2, Math.min(17, mag));
  const t = (m + 2) / 19;
  return 0.55 - t * 0.43;
}

function StarLabel({
  name,
  quadrant = "tr",
}: {
  name: string;
  quadrant?: "tr" | "bl";
}) {
  const transform =
    quadrant === "bl" ? "translate(-12px, 12px)" : "translate(12px, -12px)";
  const transformOrigin =
    quadrant === "bl" ? "right top" : "left bottom";
  return (
    <Html
      center
      sprite
      zIndexRange={[10, 0]}
      style={{
        pointerEvents: "none",
        color: "#ffffff",
        fontFamily: "'Microgramma', monospace",
        fontWeight: 400,
        fontSize: "11px",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        textShadow: "0 0 4px rgba(0,0,0,0.9)",
        transform,
        transformOrigin,
      }}
    >
      {name.toUpperCase()}
    </Html>
  );
}

function StarObj({
  star,
  showLabels,
  index,
}: {
  star: Star;
  showLabels: boolean;
  index: number;
}) {
  const starPos = useMemo(
    () => new THREE.Vector3(star.x, star.y, star.z),
    [star.x, star.y, star.z],
  );

  const r = radiusFromMagnitude(star.magnitude);
  const quadrant: "tr" | "br" = index % 2 === 0 ? "tr" : "br";
  const isBright = star.magnitude < BRIGHT_MAGNITUDE;

  return (
    <group position={[star.x, star.y, star.z]}>
      <mesh>
        <sphereGeometry args={[r, 32, 32]} />
        <meshBasicMaterial color={star.color} toneMapped={false} />
      </mesh>
      {showLabels &&
        (isBright ? (
          <StarLabel name={star.name} quadrant={quadrant} />
        ) : (
          <ProximityLabel
            name={star.name}
            starPos={starPos}
            quadrant={quadrant}
          />
        ))}
    </group>
  );
}

function ProximityLabel({
  name,
  starPos,
  quadrant,
}: {
  name: string;
  starPos: THREE.Vector3;
  quadrant: "tr" | "br";
}) {
  const [visible, setVisible] = useState(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const d = camera.getWorldPosition(tmp).distanceTo(starPos);
    const next = d < PROXIMITY_THRESHOLD;
    setVisible((prev) => (prev !== next ? next : prev));
  });
  if (!visible) return null;
  return <StarLabel name={name} quadrant={quadrant} />;
}

function Stars({ showLabels }: { showLabels: boolean }) {
  const stars = useMemo(
    () => (starData as Star[]).filter((s) => !PLANET_NAMES.has(s.name)),
    [],
  );
  return (
    <>
      {stars.map((s, i) => (
        <StarObj key={s.name} star={s} showLabels={showLabels} index={i} />
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

function Autoplay({
  isPlaying,
  speed,
  progress,
  onProgressChange,
}: {
  isPlaying: boolean;
  speed: number;
  progress: number;
  onProgressChange: (v: number) => void;
}) {
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    const inc = (100 / BASE_DURATION_SEC) * speed * delta;
    let next = progressRef.current + inc;
    if (next >= 100) next = next - 100;
    if (next < 0) next = 0;
    progressRef.current = next;
    onProgressChange(next);
  });
  return null;
}

export function StarMapScene({
  curve,
  progress,
  shipPos,
  showLabels,
  zoomRef,
  isPlaying,
  speed,
  onProgressChange,
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
      <Autoplay
        isPlaying={isPlaying}
        speed={speed}
        progress={progress}
        onProgressChange={onProgressChange}
      />
    </Canvas>
  );
}
