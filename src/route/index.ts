import { Express } from "express";
import dotenv from "dotenv";

import authRoute from "./authRoute";
import userRoute from "./userRoute";
import bookRoute from "./bookRoute";
import authorRoute from "./authorRoute";
import borrowRecordRoute from "./borrowReturnRoute";
import fineRoute from "./fineRoute";
import messageRoute from "./messageRoute";
import commentRoute from "./commentRoute";
import emailRoute from "./emailRoute";

dotenv.config();

function route(app: Express) {
  app.use(`${process.env.API_PREFIX}/auth`, authRoute);
  app.use(`${process.env.API_PREFIX}/users`, userRoute);
  app.use(`${process.env.API_PREFIX}/books`, bookRoute);
  app.use(`${process.env.API_PREFIX}/authors`, authorRoute);
  app.use(`${process.env.API_PREFIX}/borrow-return`, borrowRecordRoute);
  app.use(`${process.env.API_PREFIX}/messages`, messageRoute);
  app.use(`${process.env.API_PREFIX}/fines`, fineRoute);
  app.use(`${process.env.API_PREFIX}/comments`, commentRoute);
  app.use(`${process.env.API_PREFIX}/email`, emailRoute);
}

export default route;
