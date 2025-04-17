class WebSocketClient {
    private socket: WebSocket | null = null;
    private listeners: ((data: any) => void)[] = [];
    private queue: any[] = [];

    constructor(private url: string) {}

    connect() {
        if (this.socket) return;

        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('✅ WebSocket verbunden');
            this.queue.forEach((msg) => this.socket?.send(JSON.stringify(msg)));
            this.queue = [];
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.listeners.forEach((fn) => fn(data));
        };

        this.socket.onerror = (e) => {
            console.error('❌ WebSocket Fehler:', e);
        };

        this.socket.onclose = () => {
            console.warn('🔌 WebSocket getrennt');
            this.socket = null;
        };
    }

    send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            this.queue.push(data);
        }
    }

    onMessage(fn: (data: any) => void) {
        this.listeners.push(fn);
    }
}

export const gameSocket = new WebSocketClient('ws://192.168.0.157:8080/ws/game');
