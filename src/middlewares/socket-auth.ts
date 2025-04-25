import { Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';
import { jwtTokenService } from '../services/jwt-token-service';
import { ErrTokenInvalid } from '../config/error';
import { Requester } from '../interfaces/common-interfaces';

const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
  // 1. Get token from handshake.auth
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized: No token provided'));
  }

  const decodedPayload = jwtTokenService.verifyToken(token) as JwtPayload;
  if (!decodedPayload) {
    throw ErrTokenInvalid.withLog('Token parse failed');
  }

  // 2. Attach the requester to the socket object
  const requester = decodedPayload as Requester;
  socket.data.requester = requester;

  next();
};

export default socketAuthMiddleware;
