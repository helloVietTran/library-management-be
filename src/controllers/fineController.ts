import { Request, Response, NextFunction } from "express";

import Fine, { IFine } from "../models/Fine";
import User from "../models/User";

import AppError from "../error-handlers/AppError";
import { PaginatedBody } from "../types/response";
import { FineQuery, PayFineRequest } from "../types/request";

class FineController {
  // lấy danh sách khoản phạt có phân trang
  async getFines(
    req: Request<any, any, any, FineQuery>,
    res: Response<PaginatedBody<IFine>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || "";

      const paidQuery = req.query.paid;

      let paidFilter: boolean | undefined;
      
      if (paidQuery === "false") paidFilter = false;
      else if (paidQuery === "true") paidFilter = true;
      else paidFilter = undefined;

      //  tìm kiếm khoản phạt theo tên user
      let searchFilter: any = {};
      if (search) {
        const matchingUsers = await User.find(
          { fullName: { $regex: search, $options: "i" } },
          { _id: 1 }
        );
        const userIds = matchingUsers.map((user) => user._id);
        searchFilter.user = { $in: userIds };
      }

      if (paidFilter !== undefined) {
        searchFilter.paid = paidFilter;
      }

      const totalFines = await Fine.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalFines / pageSize);

      const fines = await Fine.find(searchFilter)
        .populate([
          { path: "borrowRecord" },
          { path: "collectedBy", select: "fullName" }
        ])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      const response = {
        data: fines,
        currentPage: page,
        pageSize,
        totalPages,
        totalElement: totalFines,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async payFine(
    req: PayFineRequest,
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
          paidDate: new Date(),
        },
        { new: true }
      );

      if (!updatedFine) {
        throw new AppError("Phiếu phạt không tồn tại", 404, "/fines", "PUT");
      }

      res.status(200).json(updatedFine);
    } catch (err) {
      next(err);
    }
  }
}

export default new FineController();
