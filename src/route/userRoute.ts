import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import userController from '../controllers/userController';
import { promoteUserSchema } from '../schemas/promote-user-schema';
import upload from '../config/upload';
import { initMiddlewares } from '../middlewares';
import { UserRole } from '../interfaces/common-interfaces';
import { updateUserSchema } from '../schemas/update-user-schema';
import { updateUserStatusSchema } from '../schemas/update-user-status-schema';

const router = Router();
const { auth, checkingRoles, convertFormData } = initMiddlewares();

router.get('/', userController.getUsers);
router.get('/my', auth, userController.getMyInfo);

router.get('/:userId', userController.getUserById);
router.delete('/:userId', auth, checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]), userController.deleteUser);
router.put(
  '/:userId',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  upload.single('file'),
  convertFormData,
  celebrate({ [Segments.BODY]: updateUserSchema }),
  userController.updateUser
);

router.get('/stats/new-users', userController.getUsersCountThisAndLastMonth);
router.put(
  '/:userId/promote',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  celebrate({ [Segments.BODY]: promoteUserSchema }),
  userController.promoteUser
);
router.put(
  '/:userId/status',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  celebrate({ [Segments.BODY]: updateUserStatusSchema }),
  userController.updateUserStatus
);

export default router;
