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
  const [movementDirection, setMovementDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  useImperativeHandle(ref, () => group.current!, []);

  const [gridPos, setGridPos] = useState({ x: 2, z: 2 });
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

    requestAnimationFrame(() => {
      setActiveAnimation('idle');
    });

    return () => {
      mixer.current?.stopAllAction();
    };
  }, []);

  useEffect(() => {
    if (!mixer.current || !activeAnimation) return;

    const clips = animationsMap[activeAnimation];
    if (!clips || clips.length === 0) return;

    const clip = clips.reduce((longest, current) =>
      current.duration > longest.duration ? current : longest,
      clips[0]
    );

    if (!clip) return;

    clip.tracks = clip.tracks.filter(
      (track) =>
        !track.name.endsWith('.position') || !track.name.includes('Hips')
    );

    if (currentAction.current) {
      currentAction.current.fadeOut(0.2);
    }

    const action = mixer.current.clipAction(clip);
    action.reset().fadeIn(0.2).play();
    currentAction.current = action;
  }, [activeAnimation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (movementDirection !== null) return;

      let dir: 'up' | 'down' | 'left' | 'right' | null = null;
      let nextAnim: typeof activeAnimation = 'walk_forward';
      let rot = rotationY;

      if (e.key === 'w' || e.key === 'ArrowUp') {
        dir = 'up'; nextAnim = 'walk_forward'; rot = 0;
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        dir = 'down'; nextAnim = 'walk_back'; rot = Math.PI;
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        dir = 'left'; nextAnim = 'walk_forward'; rot = Math.PI / 2;
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        dir = 'right'; nextAnim = 'walk_forward'; rot = -Math.PI / 2;
      }

      if (dir) {
        setMovementDirection(dir);
        setRotationY(rot);
        setActiveAnimation(nextAnim);
      }
    };

    const handleKeyUp = () => {
      setMovementDirection(null);
      setActiveAnimation('idle');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [rotationY, movementDirection]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);

    if (!group.current) return;

    const pos = group.current.position;
    const speed = 4;
    const gridOffset = 2;

    if (!isMoving && movementDirection) {
      const next = { ...gridPos };

      if (movementDirection === 'up') next.z -= 1;
      if (movementDirection === 'down') next.z += 1;
      if (movementDirection === 'left') next.x -= 1;
      if (movementDirection === 'right') next.x += 1;

      const isInside =
        next.z >= 0 && next.z < mapData.length &&
        next.x >= 0 && next.x < mapData[0].length;

      const isNotBlocked = isInside && mapData[next.z][next.x] !== 1;

      if (isNotBlocked) {
        setGridPos(next);
        targetPosition.current.set(next.x - gridOffset, 0, next.z - gridOffset);
        setIsMoving(true);
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
