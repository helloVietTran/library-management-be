import { FilterQuery, QueryOptions } from 'mongoose';
import { AppError } from '../config/error';
import { IBorrowRecord } from '../interfaces/common';
import BorrowRecord from '../models/borrow-record.model';

class BorrowRecordService {
  async findById(recordId: string, options: QueryOptions): Promise<IBorrowRecord> {
    const record = await BorrowRecord.findById(recordId).setOptions(options);

    if (!record) {
      throw AppError.from(new Error('Phiếu mượn không tồn tại'), 404);
    }
    return record;
  }
  
  async findByIdAndPopulate(recordId: string) {
    const record = await BorrowRecord.findById(recordId).populate('user', 'fullName email').populate('book', 'title');
    if (!record)
      throw AppError.from(new Error('Borrow record not found'), 404).withMessage('Không tìm thấy bản ghi mượn sách');

    return record;
  }

  async existsByCond(cond: FilterQuery<IBorrowRecord>): Promise<boolean> {
    const result = await BorrowRecord.exists(cond);
    return !!result; // covert to boolean
  }

  async countByCond(cond: FilterQuery<IBorrowRecord>): Promise<number> {
    return await BorrowRecord.countDocuments(cond);
  }

  async findByCondAndPaginate(cond: FilterQuery<IBorrowRecord>, page: number, pageSize: number) {
    return await BorrowRecord.find(cond)
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  }

  async create(record: Pick<IBorrowRecord, 'user' | 'book' | 'dueDate'>): Promise<IBorrowRecord> {
    const newRecord = new BorrowRecord(record);
    return await newRecord.save();
  }
}

export const borrowRecordService = new BorrowRecordService();
