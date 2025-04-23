import moment from 'moment';
import { Request, Response, NextFunction } from 'express';

import Fine from '../models/fine.model';
import Book from '../models/book.model';
import User from '../models/user.model';
import BorrowRecord from '../models/borrow-record.model';
import { AppError } from '../config/error';
import {
  StatsBorrowedAndReturnedBooksBody,
  MonthlyBorrowedBookCountBody,
  TimeBasedStatsBody,
  BorrowRecordsCountBody,
  PaginatedBody
} from '../interfaces/response-body';
import { IBorrowRecord } from '../interfaces/common-interfaces';
import { BorrowRecordQuery } from '../interfaces/query';
import { CreateBorrowRecordRequestBody, ReturnBookRequestBody } from '../interfaces/request-body';

class BorrowRecordController {
  async getBorrowRecords(
    req: Request<any, any, any, BorrowRecordQuery>,
    res: Response<PaginatedBody<IBorrowRecord>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || '';
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
      }

      const totalRecords = await BorrowRecord.countDocuments(filter);
      const totalPages = Math.ceil(totalRecords / pageSize);

      const records = await BorrowRecord.find(filter)
        .populate('user', 'fullName email')
        .populate('book', 'title')
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      const response = {
        data: records,
        currentPage: page,
        pageSize,
        totalPages,
        elementsPerPage: records.length
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // lấy danh sách mượn theo Id
  async getBorrowRecordById(req: Request<{ recordId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId } = req.params;

      const record = await BorrowRecord.findById(recordId).populate('user', 'fullName email').populate('book', 'title');

      if (!record) return next(AppError.from(new Error('Phiếu mượn không tồn tại'), 404));

      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  }

  async createBorrowRecord(
    req: Request<{}, {}, CreateBorrowRecordRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, bookId, dueDate } = req.body;

      const foundUser = await User.exists({ _id: userId });
      if (!foundUser) {
        throw AppError.from(new Error('Người dùng không tồn tại'), 404); // Sử dụng AppError để ném lỗi nếu người dùng không tồn tại
      }

      const foundBook = await Book.findById(bookId);
      if (!foundBook || foundBook.quantity <= 0) {
        throw AppError.from(new Error('Sách không khả dụng để mượn'), 400); // Sử dụng AppError để ném lỗi nếu sách không khả dụng
      }

      foundBook.quantity -= 1;
      await foundBook.save();

      const newRecord = new BorrowRecord({
        user: userId,
        book: bookId,
        dueDate
      });
      await newRecord.save();

      res.status(201).json({
        success: true,
        message: 'Bản ghi mượn sách đã được tạo thành công.',
        record: newRecord
      });
    } catch (error) {
      next(error); // Sử dụng AppError để xử lý lỗi
    }
  }

  // trả sách
  async returnBook(
    req: Request<{ recordId: string }, {}, ReturnBookRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { recordId } = req.params;
      const { status } = req.body;

      const record = await BorrowRecord.findById(recordId).setOptions({
        skipPopulate: true
      });

      if (!record) {
        throw AppError.from(new Error('Phiếu mượn không tồn tại'), 404); // Sử dụng AppError để ném lỗi nếu không tìm thấy bản ghi
      }

      const book = await Book.findById(record.book);
      if (!book) {
        throw AppError.from(new Error('Sách không tồn tại'), 404); // Sử dụng AppError để ném lỗi nếu sách không tồn tại
      }

      const returnDate = new Date();
      record.returnDate = returnDate;

      Object.assign(record, req.body);

      let fine: any = null;

      if (status !== 'ok') {
        fine = new Fine({
          amount: book.price,
          paid: false,
          reason: `Sách bị mất hoặc hư hỏng`,
          borrowRecord: record._id,
          user: record.user
        });

        await fine.save();
        record.fine = fine._id;
      }

      if (status === 'ok' && returnDate > record.dueDate) {
        const overdueDays = Math.ceil((returnDate.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const fineAmount = overdueDays * 1000; // Mỗi ngày trễ 1000 VNĐ

        fine = new Fine({
          amount: fineAmount,
          paid: false,
          reason: `Trả sách muộn ${overdueDays} ngày`,
          borrowRecord: record._id,
          user: record.user
        });

        await fine.save();
        record.fine = fine._id;
      }

      if (status === 'ok') {
        book.quantity += 1;
      }

      await book.save();
      await record.save();

      res.status(200).json({
        success: true,
        message: 'Sách đã được trả thành công.',
        record
      });
    } catch (error) {
      next();
    }
  }

  // đếm sách được mượn và được trả trong tháng trước
  async countBorrowedAndReturnedBooksLastMonth(
    req: Request,
    res: Response<StatsBorrowedAndReturnedBooksBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentDate = moment();
      const stats: {
        [key: string]: {
          borrowedBooksCount: number;
          returnedBooksCount: number;
        };
      } = {};

      for (let i = 4; i > -1; i--) {
        const month = currentDate.clone().subtract(i, 'months');
        const startOfMonth = month.clone().startOf('month').toDate();
        const endOfMonth = month.clone().endOf('month').toDate();
        const monthKey = month.format('YYYY-MM');

        const borrowedBooksCount = await BorrowRecord.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const returnedBooksCount = await BorrowRecord.countDocuments({
          returnDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        stats[monthKey] = { borrowedBooksCount, returnedBooksCount };
      }

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  // đếm lượt mượn theo tháng
  async getMonthlyBorrowedBooksCounts(
    req: Request,
    res: Response<MonthlyBorrowedBookCountBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const numberOfMonths = 6; // Mặc định thống kê 6 tháng
      const monthlyCounts: MonthlyBorrowedBookCountBody = {};
      const currentDate = moment();

      for (let i = 0; i < numberOfMonths; i++) {
        const month = currentDate.clone().subtract(i, 'months');
        const startOfMonth = month.clone().startOf('month').toDate();
        const endOfMonth = month.clone().endOf('month').toDate();
        const monthKey = month.format('YYYY-MM');

        const borrowCount = await BorrowRecord.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        monthlyCounts[monthKey] = borrowCount;
      }

      // Sắp xếp theo tháng
      const sortedMonthlyCounts = Object.entries(monthlyCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .reduce((obj: any, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      res.status(200).json(sortedMonthlyCounts);
    } catch (error) {
      next(error);
    }
  }

  async getBorrowRecordsCountThisAndLastMonth(
    req: Request,
    res: Response<TimeBasedStatsBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const now = moment().utc();
      const currentMonthEnd = now.clone().endOf('month').toDate();

      const previousMonthEnd = now.clone().subtract(1, 'months').endOf('month').toDate();

      const borrowsCurrentMonth = await BorrowRecord.countDocuments({
        createdAt: { $lte: currentMonthEnd }
      });

      const borrowsPreviousMonth = await BorrowRecord.countDocuments({
        createdAt: { $lte: previousMonthEnd }
      });

      res.json({
        currentMonth: borrowsCurrentMonth,
        previousMonth: borrowsPreviousMonth
      });
    } catch (error) {
      next(error);
    }
  }

  async getBorrowRecordsCount(req: Request, res: Response<BorrowRecordsCountBody>, next: NextFunction): Promise<void> {
    try {
      const borrowedCount = await BorrowRecord.countDocuments({});

      res.status(200).json({
        quantity: borrowedCount
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new BorrowRecordController();
