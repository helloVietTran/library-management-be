import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import authorController from "../controllers/authorController";

import authMiddleware from "../middlewares/authMiddleware";
import authorizeRole from "../middlewares/authorizeRole";
import {
  createAuthorSchema,
  updateAuthorSchema,
} from "../validators/authorValidation";
import convertFormData from "../middlewares/covertFormData";
import upload from "../middlewares/upload";

const router = Router();

router.get("/", authorController.getAuthors);

router.get("/:authorId", authorController.getAuthorById);

router.post(
  "/",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  upload.single("file"),
  convertFormData,
  celebrate({ [Segments.BODY]: createAuthorSchema }),
  authorController.createAuthor
);

// thêm danh sách author
router.post(
  "/list",
  authMiddleware,
  authorizeRole(["admin"]),
  authorController.createAuthors
);

router.put(
  "/:authorId",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  upload.single("file"),
  convertFormData,
  celebrate({ [Segments.BODY]: updateAuthorSchema }),
  authorController.updateAuthor
);


export default router;
