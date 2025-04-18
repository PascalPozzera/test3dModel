'use client';

import React, { JSX, useEffect, useMemo, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from '@react-three/drei';
import { createSmoothTileMaterial } from '@/shaders/smoothTileBlenderShader';
import {Mesh} from "three";

// Live binding for obstacle refs to be used elsewhere (e.g., collision detection)
export let obstacleRefs: React.RefObject<Mesh | null>[] = [];

export default function GameMap() {
    const size = 4;
    const rows = 40;
    const cols = 40;

    // Load textures
    const woodTexture = useLoader(THREE.TextureLoader, '/wood.png');
    const grassTexture = useLoader(THREE.TextureLoader, '/gras.png');
    const desertTexture = useLoader(THREE.TextureLoader, '/desert.png');

    // Setup texture wrapping/filters
    useEffect(() => {
        [woodTexture, grassTexture, desertTexture].forEach(texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.repeat.set(0.8, 0.8);
        });
    }, [woodTexture, grassTexture, desertTexture]);

    // Generate tile map state
    const [tileMap, setTileMap] = useState<string[][]>([]);
    useEffect(() => {
        const desertDensity = 0.1;
        const generated: string[][] = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => 'G')
        );
        for (let z = 0; z < rows; z++) {
            for (let x = 0; x < cols; x++) {
                if (Math.random() < desertDensity) generated[z][x] = 'D';
            }
        }
        setTileMap(generated);
    }, [rows, cols]);

    // Calculate blend factor for smooth transitions
    function calcBlender(map: string[][], x: number, z: number) {
        const current = map[z][x];
        if (current === 'G') return 1.0;
        const isNearGrass =
            (z > 0 && map[z - 1][x] === 'G') ||
            (z < map.length - 1 && map[z + 1][x] === 'G') ||
            (x > 0 && map[z][x - 1] === 'G') ||
            (x < map[0].length - 1 && map[z][x + 1] === 'G');
        return isNearGrass ? 0.5 : 0.0;
    }

    // Create tile meshes
    const tiles = useMemo(() => {
        const elements: JSX.Element[] = [];
        if (tileMap.length === 0) return elements;
        const offsetX = -cols / 2;
        const offsetZ = -rows / 2;
        for (let z = 0; z < tileMap.length; z++) {
            for (let x = 0; x < tileMap[z].length; x++) {
                const blend = calcBlender(tileMap, x, z);
                const material = createSmoothTileMaterial(
                    grassTexture,
                    desertTexture,
                    blend
                );
                elements.push(
                    <mesh
                        key={`tile-${x}-${z}`}
                        position={[(offsetX + x) * size, 0, (offsetZ + z) * size]}
                    >
                        <boxGeometry args={[size, 0.1, size]} />
                        <primitive object={material} attach="material" />
                    </mesh>
                );
            }
        }
        return elements;
    }, [tileMap, size, grassTexture, desertTexture, cols, rows]);

    // Define static obstacle positions
    const obstaclePositions = useMemo< [number, number, number][] >(
        () => [
            [-4, 1, 0],
            [0, 1, 0],
            [4, 1, 0],
        ],
        []
    );

    // Create refs for obstacles once
    const obstacleRefsLocal = useMemo(
        () => obstaclePositions.map(() => React.createRef<THREE.Mesh>()),
        [obstaclePositions]
    );

    // Define static fence positions (top/bottom + left/right)
    const fencePositions = useMemo< [number, number, number][] >(
        () => {
            const list: [number, number, number][] = [];
            const halfW = (cols * size) / 2;
            const halfH = (rows * size) / 2;
            for (let x = 0; x < cols; x++) {
                const wx = x * size - halfW + size / 2;
                list.push([wx, 1, -halfH - size / 2], [wx, 1, halfH + size / 2]);
            }
            for (let z = 0; z < rows; z++) {
                const wz = z * size - halfH + size / 2;
                list.push([-halfW - size / 2, 1, wz], [halfW + size / 2, 1, wz]);
            }
            return list;
        },
        [cols, rows, size]
    );

    // Create refs for fences once
    const fenceRefsLocal = useMemo(
        () => fencePositions.map(() => React.createRef<THREE.Mesh>()),
        [fencePositions]
    );

    // Expose combined refs for collision detection
    useEffect(() => {
        obstacleRefs = [...obstacleRefsLocal, ...fenceRefsLocal];
    }, [obstacleRefsLocal, fenceRefsLocal]);

    // Render obstacle meshes
    const obstacles = useMemo(
        () =>
            obstaclePositions.map((pos, i) => (
                <mesh key={`obstacle-${i}`} position={pos} ref={obstacleRefsLocal[i]}>
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
            )),
        [obstaclePositions, obstacleRefsLocal, woodTexture]
    );

    // Render fence meshes
    const fences = useMemo(
        () =>
            fencePositions.map((pos, i) => {
                const isHorizontal = i < cols * 2;
                const args: [number, number, number] = isHorizontal
                    ? [size, 2, 0.5]
                    : [0.5, 2, size];
                return (
                    <Box key={`fence-${i}`} ref={fenceRefsLocal[i]} position={pos} args={args}>
                        <meshStandardMaterial map={woodTexture} />
                    </Box>
                );
            }),
        [fencePositions, fenceRefsLocal, woodTexture, size, cols]
    );

    return (
        <group>
            {tiles}
            {obstacles}
            {fences}
        </group>
    );
}
