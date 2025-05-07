import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import borrowRecordController from '../controllers/borrow-controller';
import authMiddleware from '../middlewares/auth';
import { returnBookSchema } from '../validate-schemas/return-book-schema';
import { initMiddlewares } from '../middlewares';
import { UserRole } from '../interfaces/common';
import { createBorrowRecordSchema } from '../validate-schemas/create-borrow-record-schema';

const router = Router();
const { checkingRoles } = initMiddlewares();

router.get('/', borrowRecordController.getBorrowRecords);
router.post(
  '/',
  authMiddleware,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  celebrate({ [Segments.BODY]: createBorrowRecordSchema }),
  borrowRecordController.createBorrowRecord
);

router.get('/stats', borrowRecordController.countBorrowedAndReturnedBooksLastMonth);
router.get('/count', borrowRecordController.getBorrowRecordsCount);
router.get('/:recordId', borrowRecordController.getBorrowRecordById);
router.put(
  '/:recordId',
  authMiddleware,
  checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]),
  celebrate({ [Segments.BODY]: returnBookSchema }),
  borrowRecordController.returnBook
);

router.get('/stats/monthly', borrowRecordController.getMonthlyBorrowedBooksCounts);
router.get('/stats/new-records', borrowRecordController.getBorrowRecordsCountThisAndLastMonth);
router.get('/users/:userId/count', borrowRecordController.countBorrowedBooksByUser);

export default router;
