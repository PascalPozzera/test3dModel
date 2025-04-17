// Pro-Level Interpolation mit Verzögerung & Buffer
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// Wie weit in der Vergangenheit wir interpolieren (ms)
const INTERPOLATION_DELAY = 100;

// Einzelner Snapshot mit Position, Rotation & Zeit
type PositionSnapshot = {
    pos: THREE.Vector3;
    rotationY: number;
    timestamp: number;
};

type Props = {
    position: THREE.Vector3;
    rotationY: number;
    timestamp: number;
};

export default function OtherPlayer({ position, rotationY, timestamp }: Props) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/character2.glb');

    const snapshotBuffer = useRef<PositionSnapshot[]>([]);

    useEffect(() => {
        snapshotBuffer.current.push({
            pos: position.clone(),
            rotationY,
            timestamp
        });

        // Nur die letzten 10 Snapshots behalten
        if (snapshotBuffer.current.length > 10) {
            snapshotBuffer.current.shift();
        }
    }, [position, rotationY, timestamp]);

    useFrame(() => {
        if (!group.current) return;

        const now = Date.now();
        const renderTime = now - INTERPOLATION_DELAY;

        const buffer = snapshotBuffer.current;
        if (buffer.length < 2) return;

        // Finde zwei Snapshots, zwischen denen wir interpolieren können
        let older = buffer[0];
        let newer = buffer[1];

        for (let i = 1; i < buffer.length; i++) {
            if (buffer[i].timestamp > renderTime) {
                older = buffer[i - 1];
                newer = buffer[i];
                break;
            }
        }

        const total = newer.timestamp - older.timestamp;
        const progress = total > 0 ? (renderTime - older.timestamp) / total : 0;
        const clampedProgress = Math.max(0, Math.min(1, progress));

        // Interpolation
        const interpolatedPos = older.pos.clone().lerp(newer.pos, clampedProgress);
        const interpolatedRot = THREE.MathUtils.lerp(older.rotationY, newer.rotationY, clampedProgress);

        group.current.position.copy(interpolatedPos);
        group.current.rotation.y = interpolatedRot;
    });

    return <primitive ref={group} object={scene} scale={2} />;
}