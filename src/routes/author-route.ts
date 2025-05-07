import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import authorController from '../controllers/author-controller';
import upload from '../config/upload';
import { initMiddlewares } from '../middlewares';
import { UserRole } from '../interfaces/common';
import { createAuthorSchema } from '../validate-schemas/create-author-schema';
import { updateAuthorSchema } from '../validate-schemas/update-author-schema';

const router = Router();
const { auth, checkingRoles, convertFormData } = initMiddlewares();

router.get('/', authorController.getAuthors);
router.post(
  '/',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  upload.single('file'),
  convertFormData,
  celebrate({ [Segments.BODY]: createAuthorSchema }),
  authorController.createAuthor
);

router.post('/list', auth, checkingRoles([UserRole.ADMIN]), authorController._createAuthors); // development only

router.get('/:authorId', authorController.getAuthorById);
router.put(
  '/:authorId',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  upload.single('file'),
  convertFormData,
  celebrate({ [Segments.BODY]: updateAuthorSchema }),
  authorController.updateAuthor
);

export default router;
