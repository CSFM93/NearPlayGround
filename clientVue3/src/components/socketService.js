import { io } from 'socket.io-client';

class SocketService {
    socket;
    constructor() { }

    setupSocketConnection() {
        this.socket = io(process.env.VUE_APP_BASE_URL);
    }
}

export default new SocketService();