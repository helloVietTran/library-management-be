import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import commentController from '../controllers/commentController';
import authMiddleware from '../middlewares/auth';
import { createCommentSchema } from '../schemas/create-comment-schema';
import { UserRole } from '../interfaces/common-interfaces';
import { initMiddlewares } from '../middlewares';

const router = Router();
const { checkingRoles } = initMiddlewares();

router.post('/', authMiddleware, celebrate({ [Segments.BODY]: createCommentSchema }), commentController.createComment);

router.get('/books/:bookId', commentController.getCommentsByBookId);
router.get('/users/:userId', commentController.getCommentsByUserId);

router.delete(
  '/:commentId',
  authMiddleware,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  commentController.deleteComment
);

router.get('/stats/:bookId', commentController.countCommentsByRating);

router.put('/:commentId/like', authMiddleware, commentController.likeComment);

export default router;
