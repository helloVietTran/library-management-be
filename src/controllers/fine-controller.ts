import { Request, Response, NextFunction } from 'express';

import { FinePaginationQuery, PayFineBody } from '../interfaces/request';
import { paginateResponse, parsePaginationQuery, successResponse } from '../utils/utils';
import { fineService } from '../services/fine-service';
import { userService } from '../services/user-service';
import Fine from '../models/fine.model';
import { AppError } from '../config/error';

class FineController {
  async getFines(req: Request<any, any, any, FinePaginationQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, pageSize, search } = parsePaginationQuery(req);
      const paidQuery = req.query.paid;

      let paidFilter: boolean | undefined;

      if (paidQuery === 'false') paidFilter = false;
      else if (paidQuery === 'true') paidFilter = true;

      // Tìm kiếm khoản phạt theo tên user
      const searchFilter: any = {};
      if (search) {
        const matchingUsers = await userService.findByCond({ fullName: { $regex: search, $options: 'i' } }, { _id: 1 });
        const userIds = matchingUsers.map((user) => user._id);
        searchFilter.user = { $in: userIds };
      }

      if (paidFilter !== undefined) {
        searchFilter.paid = paidFilter;
      }
      const totalFines = await fineService.count(searchFilter);
      const fines = await fineService.findByCondAndPaginate(searchFilter, page, pageSize);

      res.status(200).json(paginateResponse(fines, page, pageSize, totalFines));
    } catch (error) {
      next(error);
    }
  }

  async payFine(req: Request<{ fineId: string }, {}, PayFineBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fineId } = req.params;
      const collectorId = res.locals.requester.sub;

      const updatedFine = await Fine.findByIdAndUpdate(
        fineId,
        {
          $set: {
            ...req.body,
            paidDate: Date.now(),
            paid: true,
            collectedBy: collectorId
          }
        },
        { new: true }
      );

      if (!updatedFine) {
        throw AppError.from(new Error('Không tìm thấy khoản phạt tương ứng'), 404);
      }

      res.status(200).json(successResponse('Thanh toán thành công rồi!', updatedFine));
    } catch (err) {
      next(err);
    }
  }
}

export default new FineController();
