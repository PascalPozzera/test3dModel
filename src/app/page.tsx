'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import AnimatedCharacter from './components/testmodel';
import FollowCamera from './components/FollowCamera';
import * as THREE from 'three';
import GameMap from './components/GameMap';
import OtherPlayer from "@/app/components/OtherPlayer";
import { usePlayerStore } from './components/PlayerStore';

export default function Page() {
    const characterRef = useRef<THREE.Group>(null);
    const players = usePlayerStore((state) => state.players);

    return (
        <Canvas shadows>
            <color attach="background" args={['#87ceeb']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} />
            <Suspense fallback={null}>
                <GameMap />
                <AnimatedCharacter ref={characterRef} />
                {players.map((player) => (
                    <OtherPlayer
                        key={player.id}
                        position={new THREE.Vector3(player.x, player.y, player.z)}
                        rotationY={player.rotationY}
                    />
                ))}
                <FollowCamera target={characterRef} />
            </Suspense>
        </Canvas>
    );
}
