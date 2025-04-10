'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export default function GameMap() {
  const tiles = useMemo(() => {
    const rows = 20;
    const cols = 20;
    const size = 4;
    const tiles = [];

    for (let x = -cols / 2; x < cols / 2; x++) {
      for (let z = -rows / 2; z < rows / 2; z++) {
        tiles.push(
          <mesh position={[x * size, 0, z * size]} key={`${x}-${z}`}>
            <boxGeometry args={[size, 0.1, size]} />
            <meshStandardMaterial color={(x + z) % 2 === 0 ? '#dddddd' : '#bbbbbb'} />
          </mesh>
        );
      }
    }

    return tiles;
  }, []);

  return <group>{tiles}</group>;
}
