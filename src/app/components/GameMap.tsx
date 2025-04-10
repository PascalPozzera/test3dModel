'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Box } from '@react-three/drei';

export const obstacleRefs: React.RefObject<
  THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null
>[] = [];

export default function GameMap() {
  const tiles = useMemo(() => {
    const rows = 20;
    const cols = 20;
    const size = 4;
    const tiles = [];

    for (let x = -cols / 2; x < cols / 2; x++) {
      for (let z = -rows / 2; z < rows / 2; z++) {
        tiles.push(
          <mesh position={[x * size, 0, z * size]} key={`tile-${x}-${z}`}>
            <boxGeometry args={[size, 0.1, size]} />
            <meshStandardMaterial color={(x + z) % 2 === 0 ? '#dddddd' : '#bbbbbb'} />
          </mesh>
        );
      }
    }

    return tiles;
  }, []);

  // Beispielhafte Hindernisse
  const ref1 = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>(null);
  const ref2 = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>(null);
  obstacleRefs.push(ref1, ref2);

  return (
    <group>
      {tiles}
      <Box ref={ref1} position={[0, 1, 4]} args={[4, 2, 4]} castShadow>
        <meshStandardMaterial color="red" />
      </Box>
      <Box ref={ref2} position={[8, 1, -4]} args={[4, 2, 4]} castShadow>
        <meshStandardMaterial color="green" />
      </Box>
    </group>
  );
}