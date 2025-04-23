import mongoose from "mongoose";
import moment from "moment";
import { Request, Response, NextFunction } from "express";

import Author from "../models/Author";
import Book, { IBook } from "../models/Book";

import AppError from "../error-handlers/AppError";
import {
  BooksCountBody,
  BorrowedTurnsCountStatsBody,
  PaginatedBody,
  TimeBasedStatsBody,
} from "../types/response";
import {
  CreateBookRequest,
  DeleteBooksRequest,
  PrimaryQuery,
  UpdateBookRequest,
} from "../types/request";
import logger from "../config/logger";

class BookController {
  // lấy danh sách sách có phân trang
  async getBooks(
    req: Request<any, any, any, PrimaryQuery>,
    res: Response<PaginatedBody<IBook>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || "";

      // Điều kiện tìm kiếm theo tiêu đề sách
      const searchFilter = search
        ? { title: { $regex: search, $options: "i" } }
        : {};

      const totalBooks = await Book.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalBooks / pageSize);

      const books: IBook[] = await Book.find(searchFilter)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      res.status(200).json({
        data: books,
        currentPage: page,
        pageSize,
        totalPages,
        totalElement: totalBooks,
      });
    } catch (error) {
      next(error);
    }
  }

  // lấy sách theo bookId
  async getBookById(
    req: Request<{ bookId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookId } = req.params;
      const book = await Book.findById(bookId);
      if (!book)
        throw new AppError("Book not found", 400, "/books/:bookId", "get");

      res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  }

  // tạo mới 1 quyển sách
  async createBook(
    req: CreateBookRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, authors } = req.body;

      const foundAuthors = await Author.find({ name: { $in: authors } });
      if (foundAuthors.length === 0) {
        throw new AppError(
          `Không có tác giả nào tồn tại`,
          400,
          "/books",
          "POST"
        );
      }
      const authorIds = foundAuthors.map((author) => author._id);

      const existingBook = await Book.findOne({
        title: title,
        authors: { $all: authorIds },
      });
      if (existingBook) {
        throw new AppError(
          "Sách với tiêu đề này đã tồn tại với tác giả này.",
          400,
          "/books",
          "POST"
        );
      }

      const newBook = new Book({
        ...req.body,
        authors: authorIds,
        coverImage: req.file?.path || "",
      });

      await newBook.save();

      res.status(201).json({
        success: true,
        message: "Sách đã được tạo thành công.",
        book: newBook,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // chỉnh sửa sách
  async updateBook(
    req: UpdateBookRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookId } = req.params;

      const existingBook = await Book.findById(bookId);
      if (!existingBook) {
        throw new AppError("Sách không tồn tại.", 404, "/books/:bookId", "PUT");
      }

      Object.assign(existingBook, req.body);

      if (req.file?.path) {
        existingBook.coverImage = req.file.path;
      }
      const updatedBook = await existingBook.save();

      res.status(200).json({
        success: true,
        message: "Sách đã được cập nhật thành công.",
        book: updatedBook,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // Xóa sách
  async deleteBook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookId } = req.params;
      const deletedBook = await Book.findByIdAndDelete(bookId);
      if (!deletedBook) {
        throw new AppError("Book not found", 400, "/books/:bookId", "get");
      }
      res
        .status(200)
        .json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  // thêm danh sách sách
  // để có nhiều dữ liệu
  async createBooks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const booksData = req.body;

      const authorNames = [
        ...new Set(booksData.flatMap((book: any) => book.authors)),
      ];

      let foundAuthors = await Author.find({ name: { $in: authorNames } });

      // Luôn tìm hoặc tạo tác giả mặc định "Nguyễn Văn A"
      let defaultAuthor = await Author.findOne({ name: "Nguyễn Văn A" });
      if (!defaultAuthor) {
        defaultAuthor = await Author.create({ name: "Nguyễn Văn A" });
      }

      const authorMap = new Map(
        foundAuthors.map((author) => [author.name, author._id])
      );

      const booksToInsert = booksData.map((book: any) => ({
        ...book,
        authors: book.authors.map(
          (name: string) => authorMap.get(name) || defaultAuthor._id
        ),
      }));

      const insertedBooks = await Book.insertMany(booksToInsert);

      res.status(201).json({
        success: true,
        message: "Danh sách sách đã được tạo thành công.",
        books: insertedBooks,
      });
    } catch (error) {
      next(error);
    }
  }

  // lấy tất cả sách viết bởi 1 tác giả
  async getBooksByAuthor(
    req: Request<{ authorId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorId } = req.params;

      const objectId = new mongoose.Types.ObjectId(authorId);

      const books = await Book.find({
        authors: { $in: [objectId] },
      })
        .setOptions({ skipPopulate: true })
        .lean();

      const populatedBooks = await Book.populate(books, {
        path: "authors",
      });

      res.status(200).json(populatedBooks);
    } catch (error) {
      next(error);
    }
  }

  // lấy tổng số sách tháng này và tháng trước
  async getBooksCountThisAndLastMonth(
    req: Request,
    res: Response<TimeBasedStatsBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const now = moment().utc();
      const currentMonthEnd = now.clone().endOf("month").toDate();

      const previousMonthEnd = now
        .clone()
        .subtract(1, "months")
        .endOf("month")
        .toDate();

      const booksCurrentMonth = await Book.countDocuments({
        createdAt: { $lte: currentMonthEnd },
      });

      const booksPreviousMonth = await Book.countDocuments({
        createdAt: { $lte: previousMonthEnd },
      });

      res.json({
        currentMonth: booksCurrentMonth,
        previousMonth: booksPreviousMonth,
      });
    } catch (error) {
      next(error);
    }
  }

  // đếm số lượng sách
  async getBooksCount(
    req: Request,
    res: Response<BooksCountBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const booksCount = await Book.countDocuments({});

      res.status(200).json({
        quantity: booksCount,
      });
    } catch (error) {
      next(error);
    }
  }

  // thống kê sách theo số lượt mượn
  // tương lai có thể thêm thống kê kiểu khác
  async getBooksStatsByBorrowedTurnsCount(
    req: Request<any, any, any, { by: string }>,
    res: Response<BorrowedTurnsCountStatsBody[] | any>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.query.by === "borrowedTurn") {
        const rawResult = await Book.aggregate([
          {
            $bucket: {
              groupBy: "$borrowedTurnsCount",
              boundaries: [0, 10, 101, Infinity],
              default: "unknown",
              output: {
                count: { $sum: 1 },
              },
            },
          },
        ]);

        const labeledResult = rawResult.map((group: any) => {
          let label = "unknown";
          if (group._id === 0) label = "< 10";
          else if (group._id === 10) label = "10 - 100";
          else if (group._id === 101) label = "> 100";

          return {
            ...group,
            label: label,
          };
        });

        res.status(200).json(labeledResult);
      } else {
        res
          .status(400)
          .json({ message: "Tham số 'by' không hợp lệ. Hợp lệ: borrowedTurn" });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteManyBooks(
    req: DeleteBooksRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookIds } = req.body;

      if (!Array.isArray(bookIds) || bookIds.length === 0) {
        throw new AppError(
          "Danh sách bookIds không hợp lệ.",
          400,
          "/books",
          "POST"
        );
      }

      // Xóa các sách với bookId trong danh sách
      const result = await Book.deleteMany({
        _id: { $in: bookIds },
      });

      if (result.deletedCount === 0) {
        throw new AppError(
          "Không tìm thấy sách nào để xóa.",
          404,
          "/books",
          "DELETE"
        );
      }

      res.status(200).json({
        success: true,
        message: `${result.deletedCount} sách đã được xóa thành công.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookController();
