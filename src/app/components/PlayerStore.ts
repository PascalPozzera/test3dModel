import { create } from 'zustand';

export type PlayerData = {
    id: string;
    x: number;
    y: number;
    z: number;
    rotationY: number;
};

type PlayerStore = {
    players: PlayerData[];
    updatePlayer: (data: PlayerData) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
    players: [],
    updatePlayer: (data) =>
        set((state) => {
            const others = state.players.filter((p) => p.id !== data.id);
            return { players: [...others, data] }; // ✅ ersetzt alten Spieler, behält alle anderen
        }),
}));
