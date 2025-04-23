import { Request, Response, NextFunction } from 'express';

import Fine from '../models/fine.model';
import User from '../models/user.model';

import AppError from '../error-handlers/AppError';
import { FineQuery } from '../interfaces/query';
import { PayFineRequestBody } from '../interfaces/request-body';

class FineController {
  // lấy danh sách khoản phạt có phân trang
  async getFines(req: Request<any, any, any, FineQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || '';
      const paidQuery = req.query.paid;

      let paidFilter: boolean | undefined;

      if (paidQuery === 'false') paidFilter = false;
      else if (paidQuery === 'true') paidFilter = true;

      // Tìm kiếm khoản phạt theo tên user
      const searchFilter: any = {};
      if (search) {
        const matchingUsers = await User.find({ fullName: { $regex: search, $options: 'i' } }, { _id: 1 });
        const userIds = matchingUsers.map((user) => user._id);
        searchFilter.user = { $in: userIds };
      }

      if (paidFilter !== undefined) {
        searchFilter.paid = paidFilter;
      }

      const totalFines = await Fine.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalFines / pageSize);

      const fines = await Fine.find(searchFilter)
        .populate([{ path: 'borrowRecord' }, { path: 'collectedBy', select: 'fullName' }])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec();

      const response = {
        data: fines,
        currentPage: page,
        pageSize,
        totalPages,
        totalElement: totalFines
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async payFine(
    req: Request<{ fineId: string }, {}, PayFineRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { paymentMethod, collectorId } = req.body;
      const { fineId } = req.params;

      const updatedFine = await Fine.findByIdAndUpdate(
        fineId,
        {
          paymentMethod,
          collectedBy: collectorId,
          paid: true,
          paidDate: new Date()
        },
        { new: true }
      );

      if (!updatedFine) {
        throw new AppError('Phiếu phạt không tồn tại', 404, '/fines', 'PUT');
      }

      res.status(200).json(updatedFine);
    } catch (err) {
      next(err);
    }
  }
}

export default new FineController();
