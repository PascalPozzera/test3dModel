import { useEffect } from 'react';
import { gameSocket } from './WebSocketClient';
import { usePlayerStore } from './PlayerStore';

const PLAYER_ID = 'macbook'; // kannst du später dynamisch setzen

type IncomingMessage = {
    type: 'playerMoved';
    playerId: string;
    x: number;
    y: number;
    z: number;
    rotationY: number;
};

export function useGameSocket(onMessage?: (data: any) => void) {
    const updatePlayer = usePlayerStore((state) => state.updatePlayer);

    useEffect(() => {
        gameSocket.connect();

        gameSocket.onMessage((data: IncomingMessage) => {
            if (data.type === 'playerMoved' && data.playerId !== PLAYER_ID) {
                updatePlayer({
                    id: data.playerId,
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    rotationY: data.rotationY,
                });
            }

            onMessage?.(data);
        });
    }, [onMessage]);

    return { send: (data: any) => gameSocket.send(data) };
}
