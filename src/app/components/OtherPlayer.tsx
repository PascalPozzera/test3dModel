import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

type Props = {
    position: THREE.Vector3;
    rotationY: number;
};

export default function OtherPlayer({ position, rotationY }: Props) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/character2.glb');

    useFrame(() => {
        if (group.current) {
            group.current.position.lerp(position, 1);
            group.current.rotation.y = rotationY;
        }
    });

    return <primitive ref={group} object={scene} scale={2} />;
}
