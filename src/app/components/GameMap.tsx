'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from '@react-three/drei';
import { createSmoothTileMaterial } from '@/shaders/smoothTileBlenderShader';

export const obstacleRefs: React.RefObject<THREE.Mesh>[] = [];

export default function GameMap() {
    const size = 4;
    const rows = 40;
    const cols = 40;

    const woodTexture = useLoader(THREE.TextureLoader, '/wood.png');
    const grassTexture = useLoader(THREE.TextureLoader, '/gras.png');
    const desertTexture = useLoader(THREE.TextureLoader, '/desert.png');

    useEffect(() => {
        [woodTexture, grassTexture, desertTexture].forEach((texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.repeat.set(0.8, 0.8);
        });
    }, [woodTexture, grassTexture, desertTexture]);

    const [tileMap, setTileMap] = useState<string[][]>([]);

    function generateRandomMap(rows: number, cols: number): string[][] {
        const map: string[][] = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => 'G') // alles Gras als Default
        );

        const desertDensity = 0.1; // Nur 10 % Desert
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (Math.random() < desertDensity) {
                    map[y][x] = 'D';
                }
            }
        }
        return map;
    }

    function calcBlender(map: string[][], x: number, z: number): number {
        const current = map[z][x];
        if (current === 'G') return 1.0;

        const isNearGrass =
            (z > 0 && map[z - 1][x] === 'G') ||
            (z < map.length - 1 && map[z + 1][x] === 'G') ||
            (x > 0 && map[z][x - 1] === 'G') ||
            (x < map[0].length - 1 && map[z][x + 1] === 'G');

        return isNearGrass ? 0.5 : 0.0;
    }

    useEffect(() => {
        const generated = generateRandomMap(rows, cols);
        setTileMap(generated);
    }, []);

    const tiles = useMemo(() => {
        const elements: JSX.Element[] = [];

        if (tileMap.length === 0) return elements;

        const startX = -cols / 2;
        const startZ = -rows / 2;

        for (let z = 0; z < tileMap.length; z++) {
            for (let x = 0; x < tileMap[z].length; x++) {
                const blend = calcBlender(tileMap, x, z);
                const material = createSmoothTileMaterial(grassTexture, desertTexture, blend);

                elements.push(
                    <mesh
                        key={`tile-${x}-${z}`}
                        position={[(startX + x) * size, 0, (startZ + z) * size]}
                    >
                        <boxGeometry args={[size, 0.1, size]} />
                        <primitive object={material} attach="material" />
                    </mesh>
                );
            }
        }

        return elements;
    }, [tileMap, size, grassTexture, desertTexture, cols, rows]);

    const obstaclePositions: [number, number, number][] = [
        [-4, 1, 0],
        [0, 1, 0],
        [4, 1, 0]
    ];

    const obstacles = obstaclePositions.map((pos, i) => {
        const ref = useRef<THREE.Mesh>(null!);
        obstacleRefs.push(ref);

        useFrame(() => {
            if (ref.current) {
                ref.current.rotation.y += 0.005;
            }
        });

        return (
            <mesh key={`obstacle-${i}`} position={pos} ref={ref}>
                <torusGeometry args={[2, 0.4, 16, 100]} />
                <meshStandardMaterial
                    map={woodTexture}
                    polygonOffset
                    polygonOffsetFactor={-1}
                    polygonOffsetUnits={-1}
                    metalness={0.2}
                    roughness={0.5}
                />
            </mesh>
        );
    });

    const fenceElements: JSX.Element[] = [];
    const halfWidth = (cols * size) / 2;
    const halfHeight = (rows * size) / 2;

    for (let x = 0; x < cols; x++) {
        const worldX = x * size - halfWidth + size / 2;

        const topRef = useRef<THREE.Mesh>(null!);
        const bottomRef = useRef<THREE.Mesh>(null!);
        obstacleRefs.push(topRef, bottomRef);

        fenceElements.push(
            <Box key={`fence-top-${x}`} ref={topRef} position={[worldX, 1, -halfHeight - size / 2]} args={[size, 2, 0.5]}>
                <meshStandardMaterial map={woodTexture} />
            </Box>,
            <Box key={`fence-bottom-${x}`} ref={bottomRef} position={[worldX, 1, halfHeight + size / 2]} args={[size, 2, 0.5]}>
                <meshStandardMaterial map={woodTexture} />
            </Box>
        );
    }

    for (let z = 0; z < rows; z++) {
        const worldZ = z * size - halfHeight + size / 2;

        const leftRef = useRef<THREE.Mesh>(null!);
        const rightRef = useRef<THREE.Mesh>(null!);
        obstacleRefs.push(leftRef, rightRef);

        fenceElements.push(
            <Box key={`fence-left-${z}`} ref={leftRef} position={[-halfWidth - size / 2, 1, worldZ]} args={[0.5, 2, size]}>
                <meshStandardMaterial map={woodTexture} />
            </Box>,
            <Box key={`fence-right-${z}`} ref={rightRef} position={[halfWidth + size / 2, 1, worldZ]} args={[0.5, 2, size]}>
                <meshStandardMaterial map={woodTexture} />
            </Box>
        );
    }

    return (
        <group>
            {tiles}
            {obstacles}
            {fenceElements}
        </group>
    );
}