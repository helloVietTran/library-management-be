import { Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

import { AuthRequest } from "../types/request";
import DisabledToken from "../models/DisabledToke";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const disabledToken = await DisabledToken.findOne({ token });

    if (disabledToken) {
      res.status(401).json({ message: "Invalid Token" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.id = decoded.id;
    req.role = decoded.role;
    
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export default authMiddleware;
