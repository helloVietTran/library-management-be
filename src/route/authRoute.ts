import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';

import authController from '../controllers/authController';

import convertFormData from '../middlewares/convert-formdata';
import upload from '../config/upload';
import { loginSchema } from '../schemas/login-schema';
import { registerSchema } from '../schemas/authValidation';
import { refreshTokenSchema } from '../schemas/refresh-token-schema';
import { logoutSchema } from '../schemas/logout-schema';

const router = Router();

router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), authController.login);

router.post(
  '/register',
  upload.single('file'),
  convertFormData,
  celebrate({ [Segments.BODY]: registerSchema }),
  authController.register
);

router.post('/refresh', celebrate({ body: refreshTokenSchema }), authController.refreshToken);

router.post('/logout', celebrate({ body: logoutSchema }), authController.logout);

export default router;
