'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Props = {
  targetRef: React.RefObject<THREE.Group | null>;
};

export default function FollowCamera({ targetRef }: Props) {
  const { camera } = useThree();
  const offset = useRef(new THREE.Vector3(0, 5, 5));

  useFrame(() => {
    if (!targetRef.current) return;
    const target = targetRef.current.position.clone();
    const cameraPos = target.clone().add(offset.current);
    camera.position.lerp(cameraPos, 0.1);
    camera.lookAt(target);
  });

  return null;
}
