'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const mapData = [
  [1, 0, 0, 2, 2],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 1],
  [2, 0, 0, 1, 0],
  [2, 2, 0, 0, 1],
];

const AnimatedCharacter = forwardRef<THREE.Group>((_, ref) => {
  const group = useRef<THREE.Group>(null);
  useImperativeHandle(ref, () => group.current!, []);

  const [gridPos, setGridPos] = useState({ x: 2, z: 2 });
  const [activeAnimation, setActiveAnimation] = useState<'walk_forward' | 'walk_back' | ''>('');

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  const { scene: characterScene } = useGLTF('/models/character.glb');
  const walkForward = useGLTF('/models/walk_forward_animation.glb');
  const walkBack = useGLTF('/models/walk_back_animation.glb');

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
    const clip = clips.reduce((longest, current) =>
      current.duration > longest.duration ? current : longest, clips[0]);
  
    const action = mixer.current.clipAction(clip);
    action.reset().fadeIn(0.2).play();
    currentAction.current = action;
  }, [activeAnimation]);
  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let targetX = gridPos.x;
      let targetZ = gridPos.z;
      let nextAnimation: '' | 'walk_forward' | 'walk_back' = '';
    
      if (e.key === 'w' || e.key === 'ArrowUp') {
        targetZ -= 1;
        nextAnimation = 'walk_forward';
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        targetZ += 1;
        nextAnimation = 'walk_back';
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
        setActiveAnimation(nextAnimation); // ✅ nur bei echter Bewegung
      }
    };
    

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setActiveAnimation('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gridPos]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (group.current) {
      group.current.position.set(gridPos.x - 2, 0, gridPos.z - 2);
    }
  });

  return <primitive ref={group} object={characterScene} />;
});

export default AnimatedCharacter;
