import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

// Middleware xác thực socket.io, nếu xác thực có userId
const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): void => {
  const token = socket.handshake.auth?.token; // Lấy token từ handshake.auth
  const signature = process.env.JWT_SECRET as string;

  if (!token) {
    return next(new Error("Unauthorized: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, signature) as JwtPayload;
    socket.userId = decoded.id;
    socket.role = decoded.role;

    next();
  } catch (err) {
    return next(new Error("Unauthorized: Invalid token"));
  }
};

export default socketAuthMiddleware;
