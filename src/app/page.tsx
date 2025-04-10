// Datei: app/page.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import AnimatedCharacter from './components/testmodel';
import FollowCamera from './components/FollowCamera';

const mapData = [
  [1, 0, 0, 2, 2,0,0,0,0],
  [0, 0, 1, 0, 0,0,0,0,0],
  [0, 1, 0, 0, 1,0,0,0,0],
  [2, 0, 0, 1, 0,0,0,0,0],
  [2, 2, 0, 0, 1,0,0,0,0],
  [2, 2, 0, 0, 1,0,0,0,0],
  [2, 2, 0, 0, 1,0,0,0,0],
  [2, 2, 0, 0, 1,0,0,0,0],
  [2, 2, 0, 0, 1,0,0,0,0],
];

function MapGrid() {
  return (
    <>
      {mapData.map((row, z) =>
        row.map((cell, x) => {
          let color = 'white';
          if (cell === 1) color = 'brown'; // Wand
          if (cell === 2) color = 'green'; // Gras

          return (
            <mesh key={`${x}-${z}`} position={[x - 2, 0, z - 2]}>
              <boxGeometry args={[1, 0.2, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        })
      )}
    </>
  );
}

export default function Page() {
  const charRef = useRef<THREE.Group>(null);
  const [animation, setAnimation] = useState<'walk_forward' | 'walk_back' | 'dance'>('walk_forward');

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
        <ambientLight />
        <directionalLight position={[5, 10, 5]} />
        <FollowCamera targetRef={charRef} />
        <AnimatedCharacter ref={charRef} />
        <MapGrid />

      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, background: 'white', padding: 10, borderRadius: 8 }}>
        <button onClick={() => setAnimation('walk_forward')}>Walk Forward</button>
        <button onClick={() => setAnimation('walk_back')}>Walk Back</button>
        <button onClick={() => setAnimation('dance')}>Dance</button>
      </div>
    </div>
  );
}