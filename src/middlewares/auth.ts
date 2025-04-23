import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { jwtTokenService } from '../services/jwt-token';

import DisabledToken from '../models/disabled-token.model';
import { AuthRequest } from '../interfaces/request-body';
import { ErrTokenInvalid } from '../config/error';
import { Requester } from '../interfaces/common-interfaces';

dotenv.config();

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw ErrTokenInvalid.withLog('Token is missing');
  }

  const disabledToken = await DisabledToken.findOne({ token });

  if (disabledToken) {
    throw ErrTokenInvalid.withLog('Token is disabled');
  }

  const decodedPayload = jwtTokenService.verifyToken(token) as JwtPayload;
  if (!decodedPayload) {
    throw ErrTokenInvalid.withLog('Token parse failed');
  }

  const requester = decodedPayload as Requester;
  res.locals['requester'] = requester;

  next();
};

export default authMiddleware;
