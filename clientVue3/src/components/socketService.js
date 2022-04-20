import { io } from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_SERVER
class SocketService {
    socket;
    constructor() { }

    setupSocketConnection() {
        this.socket = io(BASE_URL);
    }
}

export default new SocketService();