import { NextFunction, Request, Response } from 'express';
import { bookService } from '../services/book-service';
import { AppError } from '../config/error';
import { successResponse } from '../utils/utils';
import { config } from '../config/config';

class UploadController {
  async uploadBookCoverImage(req: Request<{ bookId: string }>, res: Response, next: NextFunction) {
    try {
      const book = await bookService.findById(req.params.bookId);

      if (!req.file?.path)
        throw AppError.from(new Error('Không có ảnh để upload')).withMessage('Không có ảnh để upload');
      book.coverImage = req.file.path;
      await book.save();

      res.json(
        successResponse('Tải ảnh thành công', {
          path: config.be_domain + '/' + req.file.path
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
