// src/app/components/playerId.ts
// Safely access localStorage only on the client

export function getPlayerId(): string {
    if (typeof window === 'undefined') {
        // Server-side rendering: no localStorage available
        return '';
    }

    let id = localStorage.getItem('playerId');
    if (!id) {
        // Generate a new UUID for the player and persist it
        id = crypto.randomUUID();
        localStorage.setItem('playerId', id);
    }
    return id;
}
