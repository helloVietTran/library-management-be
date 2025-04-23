import { Router } from "express";
import { celebrate, Segments } from "celebrate";
import commentController from "../controllers/commentController";
import authMiddleware from "../middlewares/authMiddleware";
import { createCommentSchema } from "../validators/commentValidation";
import authorizeRole from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/",
  authMiddleware,
  celebrate({ [Segments.BODY]: createCommentSchema }),
  commentController.createComment
);

router.get("/books/:bookId", commentController.getCommentsByBookId);
router.get("/users/:userId", commentController.getCommentsByUserId);


router.delete(
  "/:commentId",
  authMiddleware,
  authorizeRole(["admin", "librarian"]),
  commentController.deleteComment
);

router.get('/stats/:bookId', commentController.countCommentsByRating);

router.put("/:commentId/like", authMiddleware, commentController.likeComment);


export default router;
