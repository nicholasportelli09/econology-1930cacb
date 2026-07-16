import { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const W = 1.0;
const H = 568 / 685;

function BrainMesh() {
  const group = useRef<THREE.Group>(null!);
  const [color, height, normal] = useLoader(THREE.TextureLoader, [
    "/brain-color.png", "/brain-height.png", "/brain-normal.png",
  ]);
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 8;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const g = group.current;
    if (!g) return;
    // springy entrance with slight overshoot: 0 - 1s
    const x = Math.min(t / 1.0, 1);
    const c1 = 1.30158, c3 = c1 + 1;
    const ein = 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    // topple back + recede: 2.1 - 4.2s
    const p = easeInOut(Math.max(0, Math.min((t - 2.1) / 2.1, 1)));
    // swing in from the left, settle into a gentle endless sway
    g.rotation.y = (1 - ein) * -1.4 + 0.15 + Math.sin(t * 0.55) * 0.25;
    g.rotation.x = p * 0.5;
    g.position.y = 0.15 - p * 0.75;
    g.position.z = -p * 1.4;
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspectScale = Math.min(1, cam.aspect / 1.15);
    g.scale.setScalar((0.35 + 1.2 * ein + p * 0.1) * aspectScale);
    state.gl.domElement.style.opacity = String(1 - p * 0.86);
  });

  const matProps = {
    map: color,
    displacementMap: height,
    displacementScale: 0.22,
    normalMap: normal,
    normalScale: new THREE.Vector2(1.2, 1.2),
    emissiveMap: color,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 0.22,
    transparent: true,
    alphaTest: 0.55,
    depthWrite: false,
    roughness: 0.38,
    metalness: 0.06,
  };

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[W, H, 256, 256]} />
        <meshStandardMaterial {...matProps} side={THREE.FrontSide} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H, 256, 256]} />
        <meshStandardMaterial {...matProps} side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}

export const Brain3D = () => {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div aria-hidden className="absolute inset-0 pointer-events-none" />;
  }
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <directionalLight position={[-3, -2, -1]} intensity={0.4} />
        <Suspense fallback={null}>
          <BrainMesh />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Brain3D;