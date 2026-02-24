"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Module-level scroll state — avoids React re-renders on every scroll event
const scroll = { y: 0, progress: 0 };

if (typeof window !== "undefined") {
  const updateScroll = () => {
    scroll.y = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    scroll.progress = max > 0 ? Math.min(scroll.y / max, 1) : 0;
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
}

// ─── Mood Orb ──────────────────────────────────────────────────────────────
interface OrbProps {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  floatAmp?: number;
}

const Orb: React.FC<OrbProps> = ({
  position,
  color,
  size,
  speed,
  floatAmp = 0.5,
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const baseX = position[0];
  const baseY = position[1];

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    mesh.current.position.y = baseY + Math.sin(t * speed) * floatAmp;
    mesh.current.position.x = baseX + Math.cos(t * speed * 0.55) * 0.3;
    // Orbs glide toward camera as page scrolls — creates depth parallax
    mesh.current.position.z = position[2] + scroll.progress * 3.5;
    mesh.current.rotation.y += 0.006 * speed;
    mesh.current.rotation.z += 0.003 * speed;
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 28, 28]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.72}
        roughness={0.05}
        metalness={0.45}
        emissive={color}
        emissiveIntensity={0.18}
      />
    </mesh>
  );
};

// ─── Particle Field ─────────────────────────────────────────────────────────
const ParticleField: React.FC = () => {
  const pts = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(750 * 3);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (Math.random() - 0.5) * 30;
      arr[i + 1] = (Math.random() - 0.5) * 30;
      arr[i + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pts.current) return;
    const t = clock.elapsedTime * 0.04;
    pts.current.rotation.x = Math.sin(t) * 0.13;
    pts.current.rotation.y = t;
    // Spin speed increases subtly with scroll progress
    pts.current.rotation.z = scroll.progress * Math.PI * 0.45;
  });

  return (
    <Points ref={pts} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#d8b4fe"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.65}
      />
    </Points>
  );
};

// ─── Camera Rig ─────────────────────────────────────────────────────────────
// Smoothly flies the camera through the orb field as you scroll
const CameraRig: React.FC = () => {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const p = scroll.progress;
    // Gentle idle sway
    const sway = Math.sin(clock.elapsedTime * 0.18) * 0.12;

    const tZ = 8 - p * 4.8;
    const tY = -p * 2.8 + sway;
    const tX = Math.sin(p * Math.PI) * 1.4;

    camera.position.z += (tZ - camera.position.z) * 0.024;
    camera.position.y += (tY - camera.position.y) * 0.024;
    camera.position.x += (tX - camera.position.x) * 0.024;
  });

  return null;
};

// ─── Scene ───────────────────────────────────────────────────────────────────
const Scene: React.FC = () => (
  <>
    <ambientLight intensity={0.55} />
    <pointLight position={[7, 6, 4]} intensity={2.2} color="#ff69b4" />
    <pointLight position={[-6, -5, 4]} intensity={1.6} color="#818cf8" />
    <pointLight position={[0, 8, -2]} intensity={1.1} color="#7dd3fc" />
    <pointLight position={[0, -6, 2]} intensity={0.8} color="#f0abfc" />

    <CameraRig />
    <ParticleField />

    {/* Front cluster */}
    <Orb position={[-3.6, 1.6, 2.2]} color="#ff69b4" size={0.55} speed={0.8} />
    <Orb position={[3.3, -0.9, 1.8]} color="#c084fc" size={0.68} speed={0.65} />
    <Orb position={[0.4, 2.6, 0.6]} color="#7dd3fc" size={0.44} speed={1.1} />
    <Orb position={[-0.8, -1.6, 2.8]} color="#38bdf8" size={0.38} speed={1.0} />
    <Orb position={[1.2, 3.9, 1.2]} color="#f472b6" size={0.32} speed={1.6} />

    {/* Mid cluster */}
    <Orb position={[-2.1, -2.6, 0.2]} color="#6ee7b7" size={0.6} speed={0.9} />
    <Orb position={[2.9, 2.3, -0.8]} color="#fcd34d" size={0.38} speed={1.3} />
    <Orb position={[-4.6, 0.6, -1.8]} color="#ff69b4" size={0.78} speed={0.5} floatAmp={0.35} />
    <Orb position={[4.3, 1.6, -2.3]} color="#a78bfa" size={0.47} speed={1.0} />
    <Orb position={[0.3, -3.6, -1.3]} color="#f9a8d4" size={0.57} speed={0.75} />

    {/* Deep cluster */}
    <Orb position={[-1.6, 3.6, -3.3]} color="#818cf8" size={0.42} speed={1.2} />
    <Orb position={[3.6, -3.1, -3.8]} color="#34d399" size={0.52} speed={0.85} />
    <Orb position={[-3.1, 2.2, -4.8]} color="#fb923c" size={0.36} speed={1.4} floatAmp={0.3} />
    <Orb position={[1.6, 0.6, -5.8]} color="#e879f9" size={0.66} speed={0.68} />
    <Orb position={[-0.4, -4.5, -5.2]} color="#fbbf24" size={0.4} speed={1.15} />
  </>
);

// ─── Export ───────────────────────────────────────────────────────────────────
const ScrollCanvas: React.FC = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  </div>
);

export default ScrollCanvas;
