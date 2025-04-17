// playerId.ts
let id = localStorage.getItem('playerId');
if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('playerId', id);
}
export const playerId = id;
