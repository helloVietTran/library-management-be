import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import morgan from 'morgan';
import { errors } from 'celebrate';
import cors from 'cors';
import route from './route';
import connectMongo from './config/db';
import { initSocket } from './socket';
import chatNamespace from './socket/namespaces/chatNamespace';
import commentNamespace from './socket/namespaces/commentNamespace';
import { responseErr } from './config/error';

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// socket.io and namespaces
let io = initSocket(server);
commentNamespace(io);
chatNamespace(io);

// Middleware logging request
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FE_DOMAIN,
    credentials: true
  })
);

connectMongo();

route(app);
app.use(errors());

// handle global error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  responseErr(err, res);
  return next();
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
