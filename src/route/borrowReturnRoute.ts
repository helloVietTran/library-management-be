import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import borrowRecordController from "../controllers/borrowReturnController";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createBorrowRecordSchema,
  returnBookSchema,
} from "../validators/borrowReturnValidation";
import authorizeRole from "../middlewares/authorizeRole";

const router = Router();

router.get("/", borrowRecordController.getBorrowRecords);

// Lập phiếu mượn
router.post(
  "/",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  celebrate({ [Segments.BODY]: createBorrowRecordSchema }),
  borrowRecordController.createBorrowRecord
);

router.get(
  "/stats",
  borrowRecordController.countBorrowedAndReturnedBooksLastMonth
);

router.get(
  "/count",
  borrowRecordController.getBorrowRecordsCount
);

router.get("/:recordId", borrowRecordController.getBorrowRecordById);

// trả sách
router.put(
  "/:recordId",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  celebrate({ [Segments.BODY]: returnBookSchema }),
  borrowRecordController.returnBook
);

router.get(
  "/stats/monthly",
  borrowRecordController.getMonthlyBorrowedBooksCounts
);
router.get(
  "/stats/new-records",
  borrowRecordController.getBorrowRecordsCountThisAndLastMonth
);

export default router;
