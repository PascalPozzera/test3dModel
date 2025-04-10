'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Box } from '@react-three/drei';

export const obstacleRefs: React.RefObject<THREE.Mesh>[] = [];

export default function GameMap() {
  const size = 4;
  const rows = 15;
  const cols = 15;

  const tiles = useMemo(() => {
    const elements = [];

    for (let x = -cols / 2; x < cols / 2; x++) {
      for (let z = -rows / 2; z < rows / 2; z++) {
        elements.push(
          <mesh position={[x * size, 0, z * size]} key={`tile-${x}-${z}`}>
            <boxGeometry args={[size, 0.1, size]} />
            <meshStandardMaterial color={(x + z) % 2 === 0 ? '#cccccc' : '#aaaaaa'} />
          </mesh>
        );
      }
    }

    return elements;
  }, []);

  // 🔺 Hindernisse (Symmetrisch, strategisch)
  const obstaclePositions: [number, number, number][] = [
    [0, 1, 0],
    [-8, 1, -8],
    [8, 1, -8],
    [-8, 1, 8],
    [8, 1, 8],
    [-4, 1, 0],
    [4, 1, 0],
    [0, 1, -6],
    [0, 1, 6],
  ];

  const powerUps: [number, number, number][] = [
    [-6, 0.5, -6],
    [6, 0.5, -6],
    [-6, 0.5, 6],
    [6, 0.5, 6],
    [0, 0.5, 0],
  ];
  
  const obstacles = obstaclePositions.map((pos, i) => {
    const ref = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>(null!);

    obstacleRefs.push(ref);

    return (
      <Box ref={ref} key={`obstacle-${i}`} position={pos} args={[4, 2, 4]} castShadow>
        <meshStandardMaterial color="sienna" />
      </Box>
    );
  });

  const pickups = powerUps.map((pos, i) => (
    <Box key={`powerup-${i}`} position={pos} args={[1, 1, 1]}>
      <meshStandardMaterial color="gold" emissive="orange" emissiveIntensity={1} />
    </Box>
  ));

  return (
    <group>
      {tiles}
      {obstacles}
      {pickups}
    </group>
  );
}
