'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const mapData = [
  [1, 0, 0, 2, 2, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 0],
  [2, 0, 0, 1, 0, 0, 0, 0, 0],
  [2, 2, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 0, 0, 1, 0, 0, 0, 0],
  [2, 2, 0, 0, 1, 0, 0, 0, 0],
];

const AnimatedCharacter = forwardRef<THREE.Group>((_, ref) => {
  const group = useRef<THREE.Group>(null);
  const pressedKeys = useRef<Set<string>>(new Set());

  useImperativeHandle(ref, () => group.current!, []);

  const [gridPos, setGridPos] = useState({ x: 2, z: 2 });
  const [movementDirection, setMovementDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [activeAnimation, setActiveAnimation] = useState<'walk_forward' | 'walk_back' | 'idle'>('idle');
  const [rotationY, setRotationY] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  const targetPosition = useRef(new THREE.Vector3(gridPos.x - 2, 0, gridPos.z - 2));

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  const { scene: characterScene } = useGLTF('/models/character.glb');
  const walkForward = useGLTF('/models/walk_forward.glb');
  const walkBack = useGLTF('/models/walk_forward.glb');
  const idle = useGLTF('/models/idle.glb');

  const animationsMap: Record<string, THREE.AnimationClip[]> = {
    walk_forward: walkForward.animations,
    walk_back: walkBack.animations,
    idle: idle.animations,
  };

  useEffect(() => {
    if (!group.current) return;
    mixer.current = new THREE.AnimationMixer(group.current);
    setTimeout(() => setActiveAnimation('idle'), 0);
    return () => mixer.current?.stopAllAction();
  }, []);

  useEffect(() => {
    if (!mixer.current || !activeAnimation) return;
    const clips = animationsMap[activeAnimation];
    if (!clips || clips.length === 0) return;
    const clip = clips.reduce((longest, current) =>
      current.duration > longest.duration ? current : longest,
      clips[0]
    );
    clip.tracks = clip.tracks.filter(
      (track) => !track.name.endsWith('.position') || !track.name.includes('Hips')
    );

    const action = mixer.current.clipAction(clip);
    if (currentAction.current !== action) {
      currentAction.current?.fadeOut(0.2);
      action.reset().fadeIn(0.2).play();
      currentAction.current = action;
    }
  }, [activeAnimation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pressedKeys.current.has(e.key)) return;
      pressedKeys.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
      if (pressedKeys.current.size === 0) {
        setMovementDirection(null);
        setActiveAnimation('idle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (!group.current) return;

    const pos = group.current.position;
    const speed = 4;
    const gridOffset = 2;

    if (!isMoving) {
      let dir: 'up' | 'down' | 'left' | 'right' | null = null;
      let nextAnim: typeof activeAnimation = 'walk_forward';
      let rot = rotationY;

      if (pressedKeys.current.has('w') || pressedKeys.current.has('ArrowUp')) {
        dir = 'up'; nextAnim = 'walk_forward'; rot = 0;
      } else if (pressedKeys.current.has('s') || pressedKeys.current.has('ArrowDown')) {
        dir = 'down'; nextAnim = 'walk_back'; rot = Math.PI;
      } else if (pressedKeys.current.has('a') || pressedKeys.current.has('ArrowLeft')) {
        dir = 'left'; nextAnim = 'walk_forward'; rot = Math.PI / 2;
      } else if (pressedKeys.current.has('d') || pressedKeys.current.has('ArrowRight')) {
        dir = 'right'; nextAnim = 'walk_forward'; rot = -Math.PI / 2;
      }

      if (dir) {
        const next = { ...gridPos };
        if (dir === 'up') next.z -= 1;
        if (dir === 'down') next.z += 1;
        if (dir === 'left') next.x -= 1;
        if (dir === 'right') next.x += 1;

        const isInside =
          next.z >= 0 && next.z < mapData.length &&
          next.x >= 0 && next.x < mapData[0].length;

        const isNotBlocked = isInside && mapData[next.z][next.x] !== 1;

        if (isNotBlocked) {
          setGridPos(next);
          targetPosition.current.set(next.x - gridOffset, 0, next.z - gridOffset);
          setIsMoving(true);
          setMovementDirection(dir);
          setRotationY(rot);
          setActiveAnimation(nextAnim);
        }
      }
    }

    const target = targetPosition.current;
    const dir = new THREE.Vector3().subVectors(target, pos);
    const distance = dir.length();
    const step = speed * delta;

    if (distance <= step) {
      pos.copy(target);
      setIsMoving(false);
    } else {
      dir.normalize();
      pos.addScaledVector(dir, step);
    }

    group.current.rotation.y = rotationY + Math.PI;
  });

  return <primitive ref={group} object={characterScene} />;
});

export default AnimatedCharacter;
