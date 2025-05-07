import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import fineController from '../controllers/fine-controller';
import { payFineSchema } from '../validate-schemas/pay-fine-schema';
import { initMiddlewares } from '../middlewares';
import { UserRole } from '../interfaces/common';

const router = Router();
const { auth, checkingRoles } = initMiddlewares();

router.get('/', fineController.getFines);

router.put(
  '/:fineId/pay',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  celebrate({ [Segments.BODY]: payFineSchema }),
  fineController.payFine
);

export default router;
