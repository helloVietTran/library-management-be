import dotenv from 'dotenv';
import { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtTokenService } from '../services/jwt-token-service';

import DisabledToken from '../models/disabled-token-model';
import { ErrTokenInvalid } from '../config/error';
import { Requester } from '../interfaces/common-interfaces';

dotenv.config();

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    throw ErrTokenInvalid.withMessage('Token is missing');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ErrTokenInvalid.withMessage('Token is missing');
  }

  const disabledToken = await DisabledToken.findOne({ token });
  if (disabledToken) {
    throw ErrTokenInvalid.withMessage('Token is disabled');
  }

  const decodedPayload = jwtTokenService.verifyToken(token) as JwtPayload;
  if (!decodedPayload) {
    throw ErrTokenInvalid.withMessage('Token parse failed');
  }

  const requester = decodedPayload as Requester;
  res.locals['requester'] = requester;

  next();
};

export default authMiddleware;
