import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import bookController from '../controllers/book-controller';
import { updateBookSchema } from '../validate-schemas/updat-book-schema';
import upload from '../config/upload';
import { UserRole } from '../interfaces/common-interfaces';
import { initMiddlewares } from '../middlewares';
import { createBookSchema } from '../validate-schemas/create-book-schema';

const router = Router();
const { auth, checkingRoles, convertFormData } = initMiddlewares();

router.get('/', bookController.getBooks);
router.post(
  '/',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  upload.single('file'),
  convertFormData,
  celebrate({ [Segments.BODY]: createBookSchema }),
  bookController.createBook
);
router.delete('/', auth, checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]), bookController.deleteManyBooks); // delete many

// insert many (admin only)
router.post('/list', auth, checkingRoles([UserRole.ADMIN]), bookController._createBooks);

router.get('/count', bookController.getBooksCount);
router.get('/stats', bookController.getBooksStatsByBorrowedTurnsCount);
router.get('/:bookId', bookController.getBookById);
router.put(
  '/:bookId',
  auth,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  upload.single('file'),
  convertFormData,
  celebrate({ [Segments.BODY]: updateBookSchema }),
  bookController.updateBook
);
router.delete('/:bookId', auth, checkingRoles([UserRole.ADMIN]), bookController.deleteBook);

router.get('/stats/new-books', bookController.getBooksCountThisAndLastMonth);
router.get('/authors/:authorId', bookController.getBooksByAuthor);

export default router;
