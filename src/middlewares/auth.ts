import dotenv from 'dotenv';
import { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtTokenService } from '../services/jwt-token-service';

import DisabledToken from '../models/disabled-token.model';
import { ErrTokenInvalid } from '../config/error';
import { Requester } from '../interfaces/common';

dotenv.config();

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      return next(ErrTokenInvalid.withMessage('Token is missing'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(ErrTokenInvalid.withMessage('Token is missing'));
    }

    const disabledToken = await DisabledToken.findOne({ token });
    if (disabledToken) {
      return next(ErrTokenInvalid.withMessage('Token is disabled'));
    }

    const decodedPayload = await jwtTokenService.verifyToken(token) as JwtPayload;
    if (!decodedPayload) {
      return next(ErrTokenInvalid.withMessage('Token parse failed'));
    }

    const requester = decodedPayload as Requester;
    res.locals['requester'] = requester;

    next();
  } catch (err) {
    next(err); 
  }
};

export default authMiddleware;
