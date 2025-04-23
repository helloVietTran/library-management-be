import { Request, Response, Router } from "express";
import { celebrate, Segments } from "celebrate";

import authController from "../controllers/authController";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  logoutSchema,
} from "../validators/authValidation";

import convertFormData from "../middlewares/covertFormData";
import upload from "../middlewares/upload";

const router = Router();

router.post(
  "/login",
  celebrate({ [Segments.BODY]: loginSchema }),
  authController.login
);

router.post(
  "/register",
  upload.single("file"),
  convertFormData,
  celebrate({ [Segments.BODY]: registerSchema }),
  authController.register
);

router.post(
  "/refresh",
  celebrate({ body: refreshTokenSchema }),
  authController.refreshToken
);

router.post(
  "/logout",
  celebrate({ body: logoutSchema }),
  authController.logout
);

export default router;
