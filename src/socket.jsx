import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? process.env.VITE_SOCKET_URL : 'http://localhost:3001';

export const socket = io(URL);