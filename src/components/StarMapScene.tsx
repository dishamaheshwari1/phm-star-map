import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export function StarMapScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ background: "#000000" }}
    >
      <OrbitControls
        enablePan
        enableRotate
        enableZoom
        zoomSpeed={0.8}
        rotateSpeed={0.6}
        panSpeed={0.6}
      />
    </Canvas>
  );
}
