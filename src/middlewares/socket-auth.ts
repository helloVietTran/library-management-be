import { Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';
import { jwtTokenService } from '../services/jwt-token-service';
import { ErrTokenInvalid } from '../config/error';
import { Requester } from '../interfaces/common';

const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized: No token provided'));
  }

  let decodedPayload: JwtPayload;
  try {
    decodedPayload = await jwtTokenService.verifyToken(token) as JwtPayload;
  } catch (err) {
    return next(ErrTokenInvalid.withLog('Token parse failed'));
  }

  const requester = decodedPayload as Requester;
  socket.data.requester = requester;

  next();
};

export default socketAuthMiddleware;
