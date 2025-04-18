import { create } from 'zustand';
import * as THREE from 'three';

type PlayerData = {
    position: THREE.Vector3;
    rotationY: number;
    timestamp: number;
};

type PlayerState = {
    players: Record<string, PlayerData>;
    updatePlayer: (id: string, data: PlayerData) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
    players: {},
    updatePlayer: (id, data) =>
        set((state) => ({
            players: {
                ...state.players,
                [id]: data,
            },
        })),
}));

// Optional: direkter Zugriff außerhalb von React
export const getPlayerStore = () => usePlayerStore.getState();
