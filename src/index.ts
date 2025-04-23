import dotenv from "dotenv";
import express from "express";
import http from "http";
import morgan from "morgan";
import { errors } from "celebrate";
import cors from "cors";

import route from "./route";
import connectMongo from "./config/db";
import errorHandler from "./error-handlers/errorHandler";
import validateErrorHandler from "./middlewares/validateErrorHandler";
import { initSocket } from "./socket";
import chatNamespace from "./socket/namespaces/chatNamespace";
import commentNamespace from "./socket/namespaces/commentNamespace";

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// socket.io and namespaces
let io = initSocket(server);
commentNamespace(io);
chatNamespace(io);

// Middleware logging request
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FE_DOMAIN, 
  credentials: true, 
}));

connectMongo();

route(app);

// handle error request
app.use(errors());
app.use(validateErrorHandler as express.ErrorRequestHandler);

// handle global error
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
