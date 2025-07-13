"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = new Float32Array(500 * 3);
  for (let i = 0; i < particles.length; i += 3) {
    particles[i] = (Math.random() - 0.5) * 20;
    particles[i + 1] = (Math.random() - 0.5) * 20;
    particles[i + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      pointsRef.current.rotation.y =
        Math.cos(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Points
      ref={pointsRef}
      positions={particles}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#ff69b4"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

export default AnimatedParticles;
