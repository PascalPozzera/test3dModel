import { useEffect } from 'react';
import { gameSocket } from './WebSocketClient';
import { usePlayerStore } from './PlayerStore';
import { getPlayerId } from './playerId';

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
    const currentId = getPlayerId();

    useEffect(() => {
        gameSocket.connect();

        gameSocket.onMessage((data: IncomingMessage) => {
            if (data.type === 'playerMoved' && data.playerId !== currentId) {
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

    return {
        send: (data: any) => gameSocket.send(data),
        playerId: currentId
    };
}
