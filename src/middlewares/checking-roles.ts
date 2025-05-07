import { Handler, NextFunction, Request, Response } from 'express';
import { UserRole, Requester } from '../interfaces/common';

const checkingRoles = (roles: UserRole[]): Handler => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!res.locals.requester) return res.status(401).json({ error: 'Unauthorized' });

    const requester =  res.locals.requester as Requester;
    
    if (roles.indexOf(requester.role) === -1) return res.status(401).json({ error: 'Unauthorized' });

    next();
  };
};

export default checkingRoles;
