import { IMiddlewareFactory } from '../interfaces/common';
import { NextFunction, Request, Response } from 'express';
import authMiddleware from './auth';
import checkingRoles from './checking-roles';
import socketAuthMiddleware from './socket-auth';
import convertFormDataMiddleware from './convert-formdata';

export const initMiddlewares = (): IMiddlewareFactory => {
  const auth = authMiddleware;
  const socketAuth = socketAuthMiddleware;
  const convertFormData = convertFormDataMiddleware;

  const optionAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await auth(req, res, next);
    } catch (e) {
      return next();
    }
  };

  return {
    auth,
    optionAuth,
    checkingRoles,
    socketAuth,
    convertFormData
  };
};
