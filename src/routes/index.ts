import { Express } from 'express';
import authRoute from './auth-route';
import userRoute from './user-route';
import bookRoute from './book-route';
import authorRoute from './author-route';
import borrowRecordRoute from './borrow-return-route';
import fineRoute from './fine-route';
import messageRoute from './message-route';
import commentRoute from './comment-route';
import emailRoute from './email-route';
import uploadRoute from "./upload-route";
import { config } from '../config/config';

function route(app: Express) {
  const urlPrefix = config.api_prefix + config.api_version;

  app.use(`${urlPrefix}/auth`, authRoute);
  app.use(`${urlPrefix}/users`, userRoute);
  app.use(`${urlPrefix}/books`, bookRoute);
  app.use(`${urlPrefix}/authors`, authorRoute);
  app.use(`${urlPrefix}/borrow-return`, borrowRecordRoute);
  app.use(`${urlPrefix}/messages`, messageRoute);
  app.use(`${urlPrefix}/fines`, fineRoute);
  app.use(`${urlPrefix}/comments`, commentRoute);
  app.use(`${urlPrefix}/email`, emailRoute);
  app.use(`${urlPrefix}/upload`, uploadRoute);
}

export default route;
