import { Request, Response, NextFunction } from 'express';

import Author from '../models/author.model';
import { PaginatedBody } from '../interfaces/response-body';
import { IAuthor } from '../interfaces/common-interfaces';
import { PrimaryQuery } from '../interfaces/query';
import { CreateAuthorRequestBody } from '../interfaces/request-body';
import { AppError, ErrInvalidRequest, ErrNotFound } from '../config/error';

class AuthorController {
  async getAuthors(
    req: Request<any, any, any, PrimaryQuery>,
    res: Response<PaginatedBody<IAuthor>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || '';

      const searchFilter = search ? { name: { $regex: search, $options: 'i' } } : {};

      const totalAuthors = await Author.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalAuthors / pageSize);

      const authors = await Author.find(searchFilter)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      res.status(200).json({
        data: authors,
        currentPage: page,
        pageSize,
        totalPages,
        totalElement: totalAuthors
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuthorById(req: Request<{ authorId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorId } = req.params;
      const author = await Author.findById(authorId);
      if (!author) {
        return next(ErrNotFound.withMessage('Tác giả không tồn tại.').withDetail('authorId', authorId));
      }
      res.status(200).json(author);
    } catch (error) {
      next(error);
    }
  }

  async createAuthor(req: Request<{}, {}, CreateAuthorRequestBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, dob } = req.body;
      const existingAuthor = await Author.findOne({ name, dob });

      if (existingAuthor) {
        return next(ErrInvalidRequest.withMessage('Tác giả đã tồn tại.').withDetail('name', name));
      }

      const newAuthor = new Author({
        ...req.body,
        imgSrc: req.file?.path || ''
      });

      await newAuthor.save();

      res.status(201).json({
        success: true,
        message: 'Tác giả đã được tạo thành công.',
        author: newAuthor
      });
    } catch (error: any) {
      next(AppError.from(new Error('Không thể tạo tác giả.')).wrap(error));
    }
  }

  async createAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authors = await Author.insertMany(req.body);
      res.status(201).json({
        success: true,
        message: 'Danh sách tác giả đã được tạo thành công.',
        authors
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAuthor(
    req: Request<{ authorId: string }, {}, CreateAuthorRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorId } = req.params;

      const existingAuthor = await Author.findById(authorId);
      if (!existingAuthor) {
        return next(ErrNotFound.withMessage('Tác giả không tồn tại.').withDetail('authorId', authorId));
      }

      Object.assign(existingAuthor, req.body);

      if (req.file?.path) {
        existingAuthor.imgSrc = req.file.path;
      }

      const updatedAuthor = await existingAuthor.save();

      res.status(200).json({
        success: true,
        message: 'Tác giả đã được cập nhật thành công.',
        author: updatedAuthor
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthor(req: Request<{ authorId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorId } = req.params;
      const deletedAuthor = await Author.findByIdAndDelete(authorId);
      if (!deletedAuthor) {
        return next(ErrNotFound.withMessage('Tác giả không tồn tại.').withDetail('authorId', authorId));
      }
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
