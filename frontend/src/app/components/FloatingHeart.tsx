"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface FloatingHeartProps {
  position: [number, number, number];
  color: string;
  speed?: number;
  size?: number;
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({
  position,
  color,
  speed = 1,
  size = 1,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y +=
        Math.sin(state.clock.elapsedTime * speed) * 0.001;
    }
  });

  return (
    <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        metalness={0.1}
        roughness={0.2}
      />
    </Sphere>
  );
};

export default FloatingHeart;
