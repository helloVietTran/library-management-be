import { Server } from 'socket.io';
import { config } from '../config/config';

class SocketServer {
  private static io: Server;

  public static init(server: any): Server {
    if (!SocketServer.io) {
      SocketServer.io = new Server(server, {
        cors: {
          origin: config.fe_domain,
          methods: ['GET', 'POST'],
        },
      });
      console.log('✅ Socket.IO server started');
    }
    return SocketServer.io;
  }

  public static getIO(): Server {
    if (!SocketServer.io) {
      throw new Error('Socket.io chưa được khởi tạo!');
    }
    return SocketServer.io;
  }
}

export default SocketServer;
