import { Server, Socket } from 'socket.io';
import { initMiddlewares } from '../../middlewares';

const { socketAuth } = initMiddlewares();

const commentNamespace = (io: Server) => {
  const comment = io.of('/comment');

  // cần xác thực
  comment.use(socketAuth);

  comment.on('connection', (socket: Socket) => {
    console.log(`🔵 [comment] User connected: ${socket.id}`);

    socket.on('message', (data) => {
      console.log(`[comment] Message received:`, data);
      comment.emit('message', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 [comment] User disconnected: ${socket.id}`);
    });
  });
};

export default commentNamespace;
