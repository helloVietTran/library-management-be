import { Router } from 'express';

import upload from '../config/upload';
import { initMiddlewares } from '../middlewares';
import { UserRole } from '../interfaces/common';
import { uploadController } from '../controllers/upload-controller';

const router = Router();
const { auth, checkingRoles } = initMiddlewares();

router.put('/books/:bookId', auth, checkingRoles([UserRole.ADMIN, UserRole.LIBRARIAN]), upload.single('file'), uploadController.uploadBookCoverImage);

export default router;
