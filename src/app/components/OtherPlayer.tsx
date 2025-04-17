// Optimierte Version von OtherPlayer.tsx mit Buffered Interpolation
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

type Props = {
    position: THREE.Vector3;
    rotationY: number;
    timestamp: number;
};

export default function OtherPlayer({ position, rotationY, timestamp }: Props) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/character2.glb');

    // Buffer für Positionen
    const targetPos = useRef<THREE.Vector3>(position.clone());
    const currentPos = useRef<THREE.Vector3>(position.clone());
    const lastTimestamp = useRef<number>(timestamp);
    const targetRotation = useRef<number>(rotationY);

    // Zeitlich gepufferte Positions-Updates
    useEffect(() => {
        targetPos.current.copy(position);
        targetRotation.current = rotationY;
        lastTimestamp.current = timestamp;
    }, [position, rotationY, timestamp]);

    useFrame((_, delta) => {
        if (!group.current) return;

        // Smarte Interpolation mit Geschwindigkeit basierend auf Zeit
        const lerpFactor = 1 - Math.pow(0.01, delta); // langsamer bei kleinen Deltas
        currentPos.current.lerp(targetPos.current, lerpFactor);
        group.current.position.copy(currentPos.current);

        // Smoothe Rotation
        group.current.rotation.y += (targetRotation.current - group.current.rotation.y) * lerpFactor;
    });

    return <primitive ref={group} object={scene} scale={2} />;
}