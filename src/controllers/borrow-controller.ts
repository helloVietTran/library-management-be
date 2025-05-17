import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AppError } from '../config/error';
import { PaginatedBody } from '../interfaces/response';
import { IBorrowRecord, IFine, UserStatus } from '../interfaces/common';
import { BorrowRecordPaginationQuery, CreateBorrowRecordBody, ReturnBookBody } from '../interfaces/request';
import { paginateResponse, parsePaginationQuery, successResponse } from '../utils/utils';
import { borrowRecordService } from '../services/borrow-record-service';
import { userService } from '../services/user-service';
import { bookService } from '../services/book-service';
import { statsService } from '../services/stats-service';
import Fine from '../models/fine.model';

class BorrowRecordController {
  async getBorrowRecords(
    req: Request<any, any, any, BorrowRecordPaginationQuery>,
    res: Response<PaginatedBody<IBorrowRecord>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, pageSize, search } = parsePaginationQuery(req);
      const filterType = (req.query.filter as string)?.trim() || 'all';

      let filter: any = {};

      if (search) {
        const users = await User.find({
          fullName: { $regex: search, $options: 'i' }
        }).select('_id');
        const userIds = users.map((user) => user._id);
        filter = { user: { $in: userIds } };
      }

      if (filterType === 'not-returned') {
        filter = { returnDate: { $exists: false } };
      } else if (filterType === 'returned') {
        filter = { returnDate: { $exists: true } };
      }

      const totalRecords = await borrowRecordService.countByCond(filter);
      const records = await borrowRecordService.findByCondAndPaginate(filter, page, pageSize);

      res.status(200).json(paginateResponse(records, page, pageSize, totalRecords));
    } catch (error) {
      next(error);
    }
  }

  async getBorrowRecordById(req: Request<{ recordId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId } = req.params;
      const record = await borrowRecordService.findByIdAndPopulate(recordId);

      res.status(200).json(successResponse('Lấy thông tin phiếu mượn thành công', record));
    } catch (error) {
      next(error);
    }
  }

  async createBorrowRecord(
    req: Request<{}, {}, CreateBorrowRecordBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, bookId, dueDate } = req.body;

      const foundUser = await userService.getById(userId);
      if (!foundUser) {
        throw AppError.from(new Error('Người dùng không tồn tại'), 404);
      }

        if (foundUser.status != UserStatus.ACTIVE) {
        throw AppError.from(new Error('Tài khoản này đã bị khóa'), 404);
      }

      const foundBook = await bookService.findById(bookId);
      if (foundBook.quantity <= 0) {
        throw AppError.from(new Error('Sách không khả dụng để mượn'), 400);
      }
      foundBook.quantity -= 1;
      await foundBook.save();

      const newRecord = await borrowRecordService.create({
        user: userId,
        book: bookId,
        dueDate
      });

      res.status(201).json(successResponse('Tạo bản ghi mượn thành công!', newRecord));
    } catch (error) {
      next(error);
    }
  }

  async returnBook(
    req: Request<{ recordId: string }, {}, ReturnBookBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { recordId } = req.params;
      const { status } = req.body;

      const record = await borrowRecordService.findById(recordId, {
        skipPopulate: true
      });

      // cập nhật số lượng sách
      const book = await bookService.findById(record.book);
      if (status === 'ok') {
        book.quantity += 1;
      }

      // tăng số sách người dùng đã đọc
      const user = await userService.getById(record.user);
      user.readBooksCount += 1;

      const returnDate = new Date();
      record.returnDate = returnDate;

      Object.assign(record, req.body);

      let fine: IFine | null = null;
      // sách bị hư hại
      if (status !== 'ok') {
        fine = new Fine({
          amount: book.price,
          paid: false,
          reason: 'Sách bị mất hoặc hư hỏng',
          borrowRecord: record._id
        });
      }
      // sách không bị hư hại nhưng trả muộn
      if (status === 'ok' && returnDate.getTime() > record.dueDate.getTime()) {
        const overdueDays = Math.ceil((returnDate.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const fineAmount = overdueDays * 1000;

        fine = new Fine({
          amount: fineAmount,
          paid: false,
          reason: `Trả sách muộn ${overdueDays} ngày`,
          borrowRecord: record._id
        });
      }

      if(fine)
          await fine.save();

      await Promise.all([book.save(), record.save(), user.save()]);

      res.status(200).json(successResponse('Trả sách thành công!', record));
    } catch (error) {
      next();
    }
  }

  // đếm sách được mượn và được trả trong tháng trước
  async countBorrowedAndReturnedBooksLastMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.countBorrowedAndReturnedBooksLastMonth();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyBorrowedBooksCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const monthlyStats = await statsService.getMonthlyBorrowedBooksCounts();
      res.status(200).json(monthlyStats);
    } catch (error) {
      next(error);
    }
  }

  async getBorrowRecordsCountThisAndLastMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await statsService.getBorrowRecordsCountThisAndLastMonth();
      res.status(200).json(successResponse('Statistic successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getBorrowRecordsCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const borrowedCount = await borrowRecordService.countByCond({});

      res.status(200).json(
        successResponse('Lấy số lượng phiếu mượn thành công', {
          quantity: borrowedCount
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async countBorrowedBooksByUser(req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const borrowedCount = await borrowRecordService.countByCond({
        user: userId,
        returnDate: { $exists: false }
      });

      res.status(200).json(
        successResponse('successfully', {
          quantity: borrowedCount
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
export default new BorrowRecordController();
