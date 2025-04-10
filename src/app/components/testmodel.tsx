'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { obstacleRefs } from './GameMap'; // Import obstacleRefs from GameMap

const AnimatedCharacter = forwardRef<THREE.Group>((_, ref) => {
  const group = useRef<THREE.Group>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const { camera } = useThree();

  useImperativeHandle(ref, () => group.current!, []);

  const [activeAnimation, setActiveAnimation] = useState<'walk_forward' | 'walk_back' | 'idle'>('idle');

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
      pressedKeys.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
      if (pressedKeys.current.size === 0) {
        setActiveAnimation('idle');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (!group.current) return;

    const pos = group.current.position;
    const speed = 4;
    const direction = new THREE.Vector3();

    if (pressedKeys.current.has('w') || pressedKeys.current.has('ArrowUp')) direction.z -= 1;
    if (pressedKeys.current.has('s') || pressedKeys.current.has('ArrowDown')) direction.z += 1;
    if (pressedKeys.current.has('a') || pressedKeys.current.has('ArrowLeft')) direction.x -= 1;
    if (pressedKeys.current.has('d') || pressedKeys.current.has('ArrowRight')) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const newPos = pos.clone().addScaledVector(direction, speed * delta);

      const characterBox = new THREE.Box3().setFromCenterAndSize(
        newPos,
        new THREE.Vector3(1, 2, 1) // approximate size
      );

      const collides = obstacleRefs.some(ref => {
        if (!ref.current) return false;
        const obstacleBox = new THREE.Box3().setFromObject(ref.current);
        return characterBox.intersectsBox(obstacleBox);
      });

      if (!collides) {
        pos.copy(newPos);
        setActiveAnimation(direction.z > 0 ? 'walk_back' : 'walk_forward');
      } else {
        setActiveAnimation('idle');
      }
    } else {
      setActiveAnimation('idle');
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse.current, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, point);

    const lookDir = new THREE.Vector3().subVectors(point, pos);
    const angle = Math.atan2(lookDir.x, lookDir.z);
    group.current.rotation.y = angle;
  });

  return <primitive ref={group} object={characterScene} scale={2} />;
});

export default AnimatedCharacter;
