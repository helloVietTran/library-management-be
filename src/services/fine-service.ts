import { FilterQuery } from 'mongoose';
import { IBook, IBorrowRecord, IFine } from '../interfaces/common';
import Fine from '../models/fine.model';
import { AppError } from '../config/error';

class FineService {
  async count(cond: FilterQuery<IFine>): Promise<number> {
    return await Fine.countDocuments(cond);
  }

  async findByCondAndPaginate(cond: FilterQuery<IFine>, page: number, pageSize: number) {
    return await Fine.find(cond)
      .populate([{ path: 'borrowRecord' }, { path: 'collectedBy', select: 'fullName' }])
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
  }

  async updateFine(fineId: string, updateData: any): Promise<any> {
    try {
      const updatedFine = await Fine.findByIdAndUpdate(
        fineId,
        {
          $set: {
            ...updateData,
            paidDate : Date.now(),
            paid: true
          },
        },
        { new: true }
      );
  
      if (!updatedFine) {
        throw AppError.from(new Error('Không tìm thấy khoản phạt tương ứng'), 404);
      }
  
      return updatedFine;
    } catch (error) {
      throw error;
    }
  }

  async create(fine: IFine): Promise<IFine> {
    const newfine = new Fine(fine);

    return await newfine.save();
  }

  async createFineIfNeeded(status: string, returnDate: Date, record: any, book: any): Promise<IFine | null> {
    let fine: IFine | null = null;

    if (status !== 'ok') {
      fine = new Fine({
        amount: book.price,
        paid: false,
        reason: 'Sách bị mất hoặc hư hỏng',
        borrowRecord: record._id
      });
    }

    if (status === 'ok' && returnDate > record.dueDate) {
      const overdueDays = Math.ceil((returnDate.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = overdueDays * 1000;

      fine = new Fine({
        amount: fineAmount,
        paid: false,
        reason: `Trả sách muộn ${overdueDays} ngày`,
        borrowRecord: record._id
      });
    }

    if(!fine) return null;
    return fine.save();
  }

}

export const fineService = new FineService();
