import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import fineController from "../controllers/fineController";
import authMiddleware from "../middlewares/authMiddleware";
import authorizeRole from "../middlewares/authorizeRole";

import { payFineSchema } from "../validators/fineValidation";

const router = Router();

router.get("/", fineController.getFines);

router.put(
  "/:fineId/pay",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  celebrate({ [Segments.BODY]: payFineSchema }),
  fineController.payFine
);

export default router;
