'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import AnimatedCharacter from './components/testmodel';
import FollowCamera from './components/FollowCamera';
import * as THREE from 'three';
import GameMap from './components/GameMap';
import OtherPlayer from '@/app/components/OtherPlayer';
import { usePlayerStore } from './components/PlayerStore';
import { useGameSocket } from './components/useGameSocket';
import { playerId } from './components/playerId';

export default function Page() {
    const characterRef = useRef<THREE.Group>(null);
    useGameSocket();
    const players = usePlayerStore((state) => state.players);

    return (
        <Canvas shadows>
            <color attach="background" args={["#87ceeb"]} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} />
            <Suspense fallback={null}>
                <GameMap />
                <AnimatedCharacter ref={characterRef} />
                {Object.entries(players)
                    .filter(([id]) => id !== playerId)
                    .map(([id, player]) => (
                        <OtherPlayer
                            key={id}
                            position={player.position}
                            rotationY={player.rotationY}
                            timestamp={player.timestamp}
                        />
                    ))}
                <FollowCamera target={characterRef} />
            </Suspense>
        </Canvas>
    );
}
