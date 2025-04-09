"use client";

import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  activeAnimation: "walk_forward" | "walk_back" | "dance";
};

export default function AnimatedCharacter({ activeAnimation }: Props) {
  const group = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  const { scene: characterScene } = useGLTF("/models/character.glb");
  const walkForward = useGLTF("/models/walk_forward_animation.glb");
  const walkBack = useGLTF("/models/walk_back_animation.glb");
  const dance = useGLTF("/models/dance_animation.glb");

  const animationsMap: Record<string, THREE.AnimationClip[]> = {
    walk_forward: walkForward.animations,
    walk_back: walkBack.animations,
    dance: dance.animations,
  };

  useEffect(() => {
    if (!group.current) return;

    mixer.current = new THREE.AnimationMixer(group.current);

    return () => {
      mixer.current?.stopAllAction(); // hier keine Rückgabe!
    };
  }, []);

  useEffect(() => {
    if (!mixer.current) return;
    if (currentAction.current) {
      currentAction.current.fadeOut(0.2);
    }
    
    console.log("Wechsle zu:", activeAnimation);
    console.log("Clips:", animationsMap[activeAnimation]);

    const clips = animationsMap[activeAnimation];
   
    const clip = clips.reduce((longest, current) =>
      current.duration > longest.duration ? current : longest, clips[0]);
    const action = mixer.current.clipAction(clip);
    action.reset().fadeIn(0.2).play();
    currentAction.current = action;
  }, [activeAnimation]);

  useFrame((_, delta: number) => {
    mixer.current?.update(delta);
  });

  return <primitive ref={group} object={characterScene} />;
}
