import moment from 'moment';
import { Request, Response, NextFunction } from 'express';

import Author from '../models/author.model';
import Book from '../models/book.model';
import { AppError } from '../config/error';
import { BorrowedTurnsCountStatsBody, PaginatedBody, TimeBasedStatsBody } from '../interfaces/response';
import { IBook } from '../interfaces/common';
import { CreateBookBody, DeleteBooksBody, PaginationQuery, UpdateBookBody } from '../interfaces/request';
import { paginateResponse, parsePaginationQuery, successResponse } from '../utils/utils';
import { bookService } from '../services/book-service';
import { authorService } from '../services/author-service';
import { config } from '../config/config';

class BookController {
  async getBooks(
    req: Request<any, any, any, PaginationQuery>,
    res: Response<PaginatedBody<IBook>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, pageSize, search } = parsePaginationQuery(req);
      // Điều kiện tìm kiếm theo tiêu đề sách
      const searchFilter = search ? { title: { $regex: search, $options: 'i' } } : {};

      const totalBooks = await bookService.countByCond(searchFilter);
      const books = await bookService.findByCondAndPaginate(searchFilter, page, pageSize);

      res.status(200).json(paginateResponse(books, page, pageSize, totalBooks));
    } catch (error) {
      next(error);
    }
  }

  async getBookById(req: Request<{ bookId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId } = req.params;
      const book = await bookService.findById(bookId);

      res.status(200).json(successResponse('Lấy thông tin sách thành công', book));
    } catch (error) {
      next(error);
    }
  }

  async createBook(req: Request<{}, {}, CreateBookBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, authors } = req.body;

      const foundAuthors = await authorService.getByIds(authors);
      const authorIds = foundAuthors.map((author) => author._id);

      const existingBook = await bookService.existsByCond({
        title: title,
        authors: { $all: authorIds }
      });

      if (existingBook) {
        throw AppError.from(new Error('Sách với tiêu đề này đã tồn tại với tác giả này.'), 400).withMessage(
          'Tạo sách không thành công: sách đã tồn tại'
        );
      }

      const newBook = new Book({
        ...req.body,
        authors: authorIds,
        coverImage: req.file?.path || '',
        publishedDate: req.body.publishedDate ? new Date(req.body.publishedDate) : undefined
      });
      await newBook.save();

      res.status(201).json(successResponse('Tạo sách thành công', newBook));
    } catch (error) {
      next(error);
    }
  }

  async updateBook(
    req: Request<{ bookId: string }, {}, UpdateBookBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookId } = req.params;
      const updatedBook = await bookService.updateBook(bookId, req.body);

      res.status(200).json(successResponse('Cập nhật sách thành công', updatedBook));
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req: Request<{ bookId: string }, any, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId } = req.params;
      await bookService.deleteBook(bookId);

      res.status(200).json(successResponse('Xóa sách thành công'));
    } catch (error) {
      next(error);
    }
  }

  async deleteManyBooks(req: Request<{}, {}, DeleteBooksBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookIds } = req.body;
      const result = await bookService.deleteManyBooks(bookIds);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBooksByAuthor(req: Request<{ authorId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorId } = req.params;

      const books = await Book.find({ authors: authorId }).populate('authors').lean();

      res.status(200).json(successResponse('Lấy sách theo tác giả thành công', books));
    } catch (error) {
      next(error);
    }
  }

  // lấy tổng số sách tháng này và tháng trước
  async getBooksCountThisAndLastMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = moment().utc();
      const currentMonthEnd = now.clone().endOf('month').toDate();
      const previousMonthEnd = now.clone().subtract(1, 'months').endOf('month').toDate();

      const booksCurrentMonth = await Book.countDocuments({
        createdAt: { $lte: currentMonthEnd }
      });

      const booksPreviousMonth = await Book.countDocuments({
        createdAt: { $lte: previousMonthEnd }
      });

      const result: TimeBasedStatsBody = {
        currentMonth: booksCurrentMonth,
        previousMonth: booksPreviousMonth
      };
      res.json(successResponse('Lấy số lượng sách tháng này và tháng trước thành công', result));
    } catch (error) {
      next(error);
    }
  }

  async getBooksCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booksCount = await bookService.countByCond({});

      res.status(200).json(
        successResponse('Lấy số lượng sách thành công', {
          quantity: booksCount
        })
      );
    } catch (error) {
      next(error);
    }
  }
  // thống kê sách theo số lượt mượn
  async getBooksStatsByBorrowedTurnsCount(
    req: Request<any, any, any, { by: string }>,
    res: Response<BorrowedTurnsCountStatsBody[] | any>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.query.by === 'borrowedTurn') {
        const rawResult = await Book.aggregate([
          {
            $bucket: {
              groupBy: '$borrowedTurnsCount',
              boundaries: [0, 10, 101, Infinity],
              default: 'unknown',
              output: {
                count: { $sum: 1 }
              }
            }
          }
        ]);

        const labeledResult = rawResult.map((group: any) => {
          let label = 'unknown';
          if (group._id === 0) label = '< 10';
          else if (group._id === 10) label = '10 - 100';
          else if (group._id === 101) label = '> 100';

          return {
            ...group,
            label: label
          };
        });

        res.status(200).json(labeledResult);
      } else {
        res.status(400).json({ message: "Tham số 'by' không hợp lệ. Hợp lệ: borrowedTurn" });
      }
    } catch (error) {
      next(error);
    }
  }

  async _createBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (config.envName !== 'development') {
        throw AppError.from(new Error('Chỉ có thể sử dụng trong môi trường phát triển'), 403);
      }
      const booksData = req.body;

      const authorNames = [...new Set(booksData.flatMap((book: any) => book.authors))];

      let foundAuthors = await Author.find({ name: { $in: authorNames } });

      let defaultAuthor = await Author.findOne({ name: 'Nguyễn Văn A' });
      if (!defaultAuthor) {
        defaultAuthor = await Author.create({ name: 'Nguyễn Văn A' });
      }

      const authorMap = new Map(foundAuthors.map((author) => [author.name, author._id]));

      const booksToInsert = booksData.map((book: any) => ({
        ...book,
        authors: book.authors.map((name: string) => authorMap.get(name) || defaultAuthor._id)
      }));

      const insertedBooks = await Book.insertMany(booksToInsert);

      res.status(201).json({
        success: true,
        message: 'Danh sách sách đã được tạo thành công.',
        books: insertedBooks
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookController();
