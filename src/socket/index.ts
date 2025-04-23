import { Server } from 'socket.io';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  console.log('✅ Socket.IO server started');

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io chưa được khởi tạo!');
  }
  return io;
};
