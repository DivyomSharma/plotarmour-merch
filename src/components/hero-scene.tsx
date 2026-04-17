"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ArmourForm() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.x += delta * 0.16;
    groupRef.current.rotation.y += delta * 0.32;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.12;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.1}>
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshStandardMaterial
            color="#ff2323"
            roughness={0.42}
            metalness={0.15}
          />
        </mesh>
        <mesh rotation={[0.2, 0.8, 0]} scale={1.15}>
          <torusGeometry args={[1.55, 0.035, 24, 120]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[1.15, 0.3, 0.6]} scale={1.45}>
          <torusGeometry args={[1.6, 0.02, 20, 120]} />
          <meshStandardMaterial color="#ff7979" wireframe />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} color="#ffffff" />
      <directionalLight position={[-4, -2, 3]} intensity={0.7} color="#ff2323" />
      <ArmourForm />
    </Canvas>
  );
}
