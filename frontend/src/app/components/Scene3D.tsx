"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import FloatingHeart from "./FloatingHeart";
import AnimatedParticles from "./AnimatedParticles";
import { Suspense } from "react";

const Scene3D: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Suspense
        fallback={
          <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200" />
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* Floating Hearts */}
          <FloatingHeart
            position={[-3, 2, 0]}
            color="#ff69b4"
            speed={1}
            size={0.5}
          />
          <FloatingHeart
            position={[3, -1, 1]}
            color="#9370db"
            speed={1.5}
            size={0.3}
          />
          <FloatingHeart
            position={[0, 3, -1]}
            color="#87ceeb"
            speed={0.8}
            size={0.4}
          />
          <FloatingHeart
            position={[-2, -2, 2]}
            color="#98fb98"
            speed={1.2}
            size={0.6}
          />
          <FloatingHeart
            position={[2, 1, -2]}
            color="#ffb6c1"
            speed={0.9}
            size={0.35}
          />

          {/* Animated Particles */}
          <AnimatedParticles />

          <Environment preset="sunset" />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene3D;
