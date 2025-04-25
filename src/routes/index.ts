import { Express } from 'express';
import dotenv from 'dotenv';

import authRoute from './auth-route';
import userRoute from './user-route';
import bookRoute from './book-route';
import authorRoute from './author-route';
import borrowRecordRoute from './borrow-return-route';
import fineRoute from './fine-route';
import messageRoute from './message-route';
import commentRoute from './comment-route';
import emailRoute from './email-route';

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
