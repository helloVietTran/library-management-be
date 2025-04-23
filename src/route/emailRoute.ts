import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import emailController from "../controllers/emailController";
import authMiddleware from "../middlewares/authMiddleware";
import authorizeRole from "../middlewares/authorizeRole";
import { sendEmailSchema } from "../validators/emailValidation";

const router = Router();

router.post(
  "/send-overdue-email",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  celebrate({ [Segments.BODY]: sendEmailSchema }),
  emailController.sendOverdueEmail
);

export default router;
