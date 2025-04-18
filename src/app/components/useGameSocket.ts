import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {getPlayerStore} from './PlayerStore';

export const useGameSocket = (onMessage?: (data: any) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const playerStore = getPlayerStore();

    useEffect(() => {
        const ws = new WebSocket('ws://192.168.0.157:8080/ws/game');
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'playerMoved') {
                playerStore.updatePlayer(data.playerId, {
                    position: new THREE.Vector3(data.x, data.y, data.z),
                    rotationY: data.rotationY,
                    timestamp: data.timestamp,
                });
            }

            onMessage?.(data);
        };

        return () => {
            ws.close();
        };
    }, []);

    return {
        send: (data: any) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(data));
            }
        },
    };
};
