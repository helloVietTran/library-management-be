import { Request, Response, NextFunction } from 'express';

import Author from '../models/author.model';
import { AppError } from '../config/error';
import { CreateAuthorBody, PaginationQuery } from '../interfaces/request';
import { paginateResponse, parsePaginationQuery, successResponse } from '../utils/utils';
import { authorService } from '../services/author-service';
import { config } from '../config/config';

class AuthorController {
  async getAuthors(req: Request<any, any, any, PaginationQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, pageSize, search } = parsePaginationQuery(req);
      const searchFilter = search ? { name: { $regex: search, $options: 'i' } } : {};

      const { authors, totalAuthors } = await authorService.getAllAuthors(searchFilter, page, pageSize);

      res.status(200).json(paginateResponse(authors, page, pageSize, totalAuthors));
    } catch (error) {
      next(error);
    }
  }

  async getAuthorById(req: Request<{ authorId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorId } = req.params;
      const author = await authorService.getAuthorById(authorId);
      res.status(200).json(successResponse('Lấy thông tin tác giả thành công.', author));
    } catch (error) {
      next(error);
    }
  }

  async createAuthor(req: Request<{}, {}, CreateAuthorBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const newAuthor = await authorService.createAuthor(req.body, req.file?.path);
      res.status(201).json(successResponse('Tác giả đã được tạo thành công.', newAuthor));
    } catch (error) {
      next(error);
    }
  }

  async _createAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authors = await Author.insertMany(req.body);
      if (config.envName !== 'development') {
        throw AppError.from(new Error('Chỉ có thể sử dụng API này trong môi trường phát triển.'));
      }
      res.status(201).json(successResponse('Tác giả đã được tạo thành công.', authors));
    } catch (error) {
      next(error);
    }
  }

  async updateAuthor(
    req: Request<{ authorId: string }, {}, CreateAuthorBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorId } = req.params;
      const updatedAuthor = await authorService.updateAuthor(authorId, req.body, req.file);

      res.status(200).json(successResponse('Cập nhật tác giả thành công.', updatedAuthor));
    } catch (error) {
      next(error);
    }
  }

  // Xóa tác giả
  async deleteAuthor(req: Request<{ authorId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorId } = req.params;
      await authorService.deleteAuthor(authorId);

      res.status(200).json({
        success: true,
        message: 'Tác giả đã được xóa thành công.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthorController();
