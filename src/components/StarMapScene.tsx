import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
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
  progress: number; // 0-100
  shipPos: [number, number, number];
  showLabels: boolean;
};

// Convert apparent magnitude to a sphere radius. Lower magnitude => larger.
function radiusFromMagnitude(mag: number): number {
  // Clamp magnitude into a sensible range, then map to radius.
  const m = Math.max(-2, Math.min(17, mag));
  // Map mag from [-2 (very bright), 17 (very dim)] to [0.55, 0.12]
  const t = (m + 2) / 19; // 0 -> 1
  return 0.55 - t * 0.43;
}

function StarLabel({ name }: { name: string }) {
  return (
    <Html
      center
      distanceFactor={18}
      style={{
        pointerEvents: "none",
        color: "#ffffff",
        fontFamily: "'Microgramma', monospace",
        fontWeight: 400,
        fontSize: "11px",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        transform: "translateY(-14px)",
        textShadow: "0 0 6px rgba(0,0,0,0.9)",
      }}
    >
      {name.toUpperCase()}
    </Html>
  );
}

function Stars({ showLabels }: { showLabels: boolean }) {
  const stars = starData as Star[];
  return (
    <>
      {stars.map((s) => {
        const r = radiusFromMagnitude(s.magnitude);
        return (
          <group key={s.name} position={[s.x, s.y, s.z]}>
            <mesh>
              <sphereGeometry args={[r, 24, 24]} />
              <meshStandardMaterial
                color={s.color}
                emissive={s.color}
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>
            {/* Soft glow halo */}
            <mesh>
              <sphereGeometry args={[r * 1.8, 16, 16]} />
              <meshBasicMaterial
                color={s.color}
                transparent
                opacity={0.12}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {showLabels && <StarLabel name={s.name} />}
          </group>
        );
      })}
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

  const { behindPoints, aheadPoints } = useMemo(() => {
    const SEGMENTS = 200;
    const all = curve.getPoints(SEGMENTS);
    const cutIdx = Math.round(t * SEGMENTS);
    const behind = all.slice(0, Math.max(cutIdx + 1, 1));
    const ahead = all.slice(Math.max(cutIdx, 0));
    return { behindPoints: behind, aheadPoints: ahead };
  }, [curve, t]);

  return (
    <>
      {/* Solid red — behind ship */}
      {behindPoints.length >= 2 && (
        <Line
          points={behindPoints}
          color="#ff2a2a"
          lineWidth={2}
          transparent
          opacity={0.95}
        />
      )}
      {/* Dashed red — ahead of ship */}
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

      {/* Hail Mary ship */}
      <group position={shipPos}>
        <mesh>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial
            color="#ff2a2a"
            emissive="#ff2a2a"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color="#ff2a2a"
            transparent
            opacity={0.18}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {showLabels && <StarLabel name="Hail Mary" />}
      </group>
    </>
  );
}

export function StarMapScene({ curve, progress, shipPos, showLabels }: Props) {
  return (
    <Canvas
      camera={{ position: [14, 10, 18], fov: 60, near: 0.1, far: 1000 }}
      style={{ background: "#000000" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={1.2} />

      <OrbitControls
        enablePan
        enableRotate
        enableZoom
        zoomSpeed={0.8}
        rotateSpeed={0.6}
        panSpeed={0.6}
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
