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
  useImperativeHandle(ref, () => group.current!, []);

  const [gridPos, setGridPos] = useState({ x: 2, z: 2 });
  const [activeAnimation, setActiveAnimation] = useState<'walk_forward' | 'walk_back' | ''>('');
  const [rotationY, setRotationY] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  const { scene: characterScene } = useGLTF('/models/character.glb');
  const walkForward = useGLTF('/models/walk_forward_animation.glb');
  const walkBack = useGLTF('/models/walk_forward_animation.glb');

  const animationsMap: Record<string, THREE.AnimationClip[]> = {
    walk_forward: walkForward.animations,
    walk_back: walkBack.animations,
  };

  useEffect(() => {
    if (!group.current) return;
    mixer.current = new THREE.AnimationMixer(group.current);
    return () => {
      mixer.current?.stopAllAction();
    };
  }, []);

  useEffect(() => {
    if (!mixer.current) return;

    if (activeAnimation === '') {
      currentAction.current?.fadeOut(0.2);
      currentAction.current = null;
      return;
    }

    if (currentAction.current) {
      currentAction.current.fadeOut(0.2);
    }

    const clips = animationsMap[activeAnimation];

    if (!clips || clips.length === 0) {
      console.warn('⚠️ Keine Animationen gefunden für:', activeAnimation);
      return;
    }

    const clip = clips.reduce((longest, current) =>
        current.duration > longest.duration ? current : longest, clips[0]);

    clip.tracks = clip.tracks.filter(
        (track) =>
            !track.name.endsWith('.position') || !track.name.includes('Hips')
    );

    const action = mixer.current.clipAction(clip);
    action.reset().fadeIn(0.2).play();
    currentAction.current = action;
  }, [activeAnimation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMoving) return;

      let targetX = gridPos.x;
      let targetZ = gridPos.z;
      let nextAnimation: '' | 'walk_forward' | 'walk_back' = '';
      let newRotation = rotationY;

      if (e.key === 'w' || e.key === 'ArrowUp') {
        targetZ -= 1;
        nextAnimation = 'walk_forward';
        newRotation = 0;
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        targetZ += 1;
        nextAnimation = 'walk_back';
        newRotation = Math.PI;
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        targetX -= 1;
        nextAnimation = 'walk_forward'; // gleiche Animation nach links
        newRotation = Math.PI / 2; // 90° nach links
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        targetX += 1;
        nextAnimation = 'walk_forward'; // gleiche Animation nach rechts
        newRotation = -Math.PI / 2; // -90° nach rechts
      }

      const isInsideMap =
          targetZ >= 0 &&
          targetZ < mapData.length &&
          targetX >= 0 &&
          targetX < mapData[0].length;

      const isNotBlocked = isInsideMap && mapData[targetZ][targetX] !== 1;
      const hasMoved = targetX !== gridPos.x || targetZ !== gridPos.z;

      if (isNotBlocked && hasMoved) {
        setGridPos({ x: targetX, z: targetZ });
        setIsMoving(true);
        setActiveAnimation(nextAnimation);
        setRotationY(newRotation);
      }
    };

    const handleKeyUp = () => {
      // Animation wird gestoppt, sobald Bewegung fertig
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gridPos, rotationY, isMoving]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);

    if (group.current) {
      const targetPos = new THREE.Vector3(gridPos.x - 2, 0, gridPos.z - 2);
      group.current.position.lerp(targetPos, 0.1);

      if (group.current.position.distanceTo(targetPos) < 0.01) {
        group.current.position.copy(targetPos);
        setIsMoving(false);
        setActiveAnimation('');
      }

      group.current.rotation.y = rotationY + Math.PI; // Rücken in Bewegungsrichtung
    }
  });

  return <primitive ref={group} object={characterScene} />;
});

export default AnimatedCharacter;
