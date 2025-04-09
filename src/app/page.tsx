'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AnimatedCharacter from './components/testmodel';
import { useState } from 'react';

export default function Page() {
  const [animation, setAnimation] = useState<'walk_forward' | 'walk_back' | 'dance'>('walk_forward');

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Szene */}
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight />
        <directionalLight position={[5, 10, 5]} />
        <OrbitControls />
        <AnimatedCharacter activeAnimation={animation} />
      </Canvas>

      {/* UI – Buttons im normalen DOM */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'white',
        padding: 10,
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 1
      }}>
        <button onClick={() => setAnimation('walk_forward')}>Walk Forward</button><br />
        <button onClick={() => setAnimation('walk_back')}>Walk Back</button><br />
        <button onClick={() => setAnimation('dance')}>Dance</button>
      </div>
    </div>
  );
}
