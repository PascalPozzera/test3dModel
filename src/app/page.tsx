// Datei: app/page.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import AnimatedCharacter from './components/testmodel';
import FollowCamera from './components/FollowCamera';

export default function Page() {
  const charRef = useRef<THREE.Group>(null);
  const [animation, setAnimation] = useState<'walk_forward' | 'walk_back' | 'dance'>('walk_forward');

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
        <ambientLight />
        <directionalLight position={[5, 10, 5]} />
        <FollowCamera targetRef={charRef} />
        <AnimatedCharacter ref={charRef} activeAnimation={animation} />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, background: 'white', padding: 10, borderRadius: 8 }}>
        <button onClick={() => setAnimation('walk_forward')}>Walk Forward</button>
        <button onClick={() => setAnimation('walk_back')}>Walk Back</button>
        <button onClick={() => setAnimation('dance')}>Dance</button>
      </div>
    </div>
  );
}