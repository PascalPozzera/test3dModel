'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import AnimatedCharacter from './components/testmodel';
import FollowCamera from './components/FollowCamera';
import * as THREE from 'three';
import GameMap from './components/GameMap';

export default function Page() {
  const characterRef = useRef<THREE.Group>(null);


  return (
    <Canvas shadows>
      <color attach="background" args={['#87ceeb']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} castShadow />
      <Suspense fallback={null}>
      <GameMap />
        <AnimatedCharacter ref={characterRef} />
        <FollowCamera target={characterRef} />
      </Suspense>
    </Canvas>
  );
}
