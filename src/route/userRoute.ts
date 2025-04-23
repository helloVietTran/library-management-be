import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import authorizeRole from "../middlewares/authorizeRole";
import {
  promoteUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "../validators/userValidation";
import convertFormData from "../middlewares/covertFormData";
import upload from "../middlewares/upload";

const router = Router();

router.get("/", userController.getUsers);
router.get("/my", authMiddleware, userController.getMyInfo);

router.get("/:userId", userController.getUserById);

router.delete(
  "/:userId",
  authMiddleware,
  authorizeRole(["admin"]),
  userController.deleteUser
);

router.put(
  "/:userId",
  authMiddleware,
  authorizeRole(["librarian", "admin"]),
  upload.single("file"),
  convertFormData,
  celebrate({ [Segments.BODY]: updateUserSchema }),
  userController.updateUser
);

router.get(
  "/stats/new-users",
  userController.getUsersCountThisAndLastMonth
)

router.put(
  "/promote/:userId",
  authMiddleware,
  authorizeRole(["admin"]),
  celebrate({ [Segments.BODY]: promoteUserSchema }),
  userController.promoteUser
);

router.put(
  "/status/:userId",
  authMiddleware,
  authorizeRole(["admin", "librarian"]),
  celebrate({ [Segments.BODY]: updateUserStatusSchema }),
  userController.updateUserStatus
);

export default router;
