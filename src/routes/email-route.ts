import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';

import emailController from '../controllers/email-controller';
import authMiddleware from '../middlewares/auth';
import { sendEmailSchema } from '../validate-schemas/send-email-schema';
import { initMiddlewares } from '../middlewares';
import { UserRole } from '../interfaces/common';

const router = Router();
const { checkingRoles } = initMiddlewares();

router.post(
  '/send-overdue-email',
  authMiddleware,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  celebrate({ [Segments.BODY]: sendEmailSchema }),
  emailController.sendOverdueEmail
);

export default router;
