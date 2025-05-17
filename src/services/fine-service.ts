import { FilterQuery } from 'mongoose';
import { IFine } from '../interfaces/common';
import Fine from '../models/fine.model';

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

  async create(fine: IFine): Promise<IFine> {
    const newfine = new Fine(fine);

    return await newfine.save();
  }
}

export const fineService = new FineService();
