import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';

import authController from '../controllers/auth-controller';
import convertFormData from '../middlewares/convert-formdata';

import { loginSchema } from '../validate-schemas/login-schema';
import { registerSchema } from '../validate-schemas/register-schema';
import { refreshTokenSchema } from '../validate-schemas/refresh-token-schema';
import { logoutSchema } from '../validate-schemas/logout-schema';
import upload from '../config/upload';

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
