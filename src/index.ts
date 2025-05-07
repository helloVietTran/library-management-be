import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import morgan from 'morgan';
import { errors } from 'celebrate';
import cors from 'cors';
import route from './routes';
import connectMongo from './config/db';
import { responseErr } from './config/error';
import { config } from './config/config';
import chatNamespace from './socket/namespaces/chatNamespace';
import path from 'path';
import SocketServer from './socket';

const PORT = config.port;

const app = express();
const server = http.createServer(app);

let io = SocketServer.init(server);
chatNamespace(io);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.fe_domain,
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

app.get('/', (req, res) => {
  res.send('Hello World');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
