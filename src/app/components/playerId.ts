let cachedId: string | null = null;

export function getPlayerId(): string {
    if (typeof window === 'undefined') return 'server';
    if (cachedId) return cachedId;

    let id = localStorage.getItem('playerId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('playerId', id);
    }

    cachedId = id;
    return id;
}
