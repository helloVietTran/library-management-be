import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import bookController from "../controllers/bookController";

import authMiddleware from "../middlewares/authMiddleware";
import authorizeRole from "../middlewares/authorizeRole";
import {
  createBookSchema,
  updateBookSchema,
} from "../validators/bookValidation";
import convertFormData from "../middlewares/covertFormData";
import upload from "../middlewares/upload";

const router = Router();

router.get("/", bookController.getBooks);
router.post(
  "/",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  upload.single("file"),
  convertFormData,
  celebrate({ [Segments.BODY]: createBookSchema }),
  bookController.createBook
);

// xóa nhiều
router.delete(
  "/",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  bookController.deleteBook
);

// insert many (admin only)
router.post(
  "/list",
  authMiddleware,
  authorizeRole(["admin"]),
  bookController.createBooks
);

router.get("/count", bookController.getBooksCount);

// thống kê theo lượt mượn
router.get("/stats", bookController.getBooksStatsByBorrowedTurnsCount);

router.get("/:bookId", bookController.getBookById);

router.put(
  "/:bookId",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  upload.single("file"),
  convertFormData,
  celebrate({ [Segments.BODY]: updateBookSchema }),
  bookController.updateBook
);

router.delete(
  "/:bookId",
  authMiddleware,
  authorizeRole(["admin"]),
  bookController.deleteBook
);

// thống kê sách mới
router.get(
  "/stats/new-books",
  bookController.getBooksCountThisAndLastMonth
);

// lấy tất cả sách của 1 tác giả nào đó
router.get("/authors/:authorId", bookController.getBooksByAuthor);

export default router;
