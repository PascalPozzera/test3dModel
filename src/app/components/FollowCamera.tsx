import { useFrame, useThree } from '@react-three/fiber';
import { RefObject } from 'react';
import * as THREE from 'three';

type FollowCameraProps = {
  target: RefObject<THREE.Group | null>;
};

export default function FollowCamera({ target }: FollowCameraProps) {
  const { camera } = useThree();
  const offset = new THREE.Vector3(0, 7, 7);

  useFrame(() => {
    if (target.current) {
      const targetPosition = target.current.position.clone();
      const cameraPosition = targetPosition.clone().add(offset);
      camera.position.lerp(cameraPosition, 0.1);
      camera.lookAt(targetPosition);
    }
  });

  return null;
}
