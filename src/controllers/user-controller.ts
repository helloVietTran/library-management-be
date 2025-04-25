import dotenv from 'dotenv';
import moment from 'moment';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user-model';
import { ApiResponse, TimeBasedStatsBody } from '../interfaces/response';
import {
  PaginationQuery,
  PromoteUserBody,
  UpdateUserBody,
  UpdateUserStatusBody,
  UserParam
} from '../interfaces/request';
import { paginateResponse, parsePaginationQuery, successResponse } from '../utils/utils';
import { AppError } from '../config/error';
import { userService } from '../services/user-service';
import { roleService } from '../services/role-service';
import { borrowRecordService } from '../services/borrow-record-service';

dotenv.config();

class UserController {
  async getMyInfo(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.requester.sub; // lấy userId từ res.locals.requester
    try {
      const user = await userService.getById(userId);
      res.status(200).json(successResponse('Lấy thông tin chính chủ thành công', user));
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request<UserParam>, res: Response, next: NextFunction) {
    const { userId } = req.params;
    try {
      const user = await userService.getById(userId);
      res.status(200).json(successResponse('Lấy thông tin người dùng', user));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request<{ userId: string }, {}, UpdateUserBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await userService.updateUser(userId, req.body, req.file?.path);
      res.status(200).json(successResponse('Cập nhật người dùng thành công', updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request<any, any, any, PaginationQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, pageSize, search } = parsePaginationQuery(req);
      const searchFilter = search ? { fullName: { $regex: search, $options: 'i' } } : {};

      const totalUsers = await userService.countByCond(searchFilter);
      const users = await userService.findByCondAndPaginate(searchFilter, page, pageSize);

      res.status(200).json(paginateResponse(users, page, pageSize, totalUsers));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const hasBorrowedBook = await borrowRecordService.existsByCond({
        user: userId,
        returnDate: { $exists: false }
      });

      if (hasBorrowedBook) {
        throw AppError.from(new Error('User has an unreturned book')).withMessage('Người dùng có sách chưa trả');
      }
      await userService.deleteUser(userId);

      res.status(200).json(successResponse('Xóa người dùng thành công'));
    } catch (error) {
      next(error);
    }
  }

  async promoteUser(
    req: Request<{ userId: string }, {}, PromoteUserBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;

      const role = await roleService.findByName(newRole);
      const updatedUser = await userService.updateUserRole(userId, role._id);

      res.status(200).json(successResponse(`User promoted to ${newRole} successfully!`, updatedUser));
    } catch (error) {
      next(error);
    }
  }

  // chặn hoặc mở khóa user
  async updateUserStatus(
    req: Request<{ userId: string }, {}, UpdateUserStatusBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const updatedUser = await userService.updateUserStatus(userId, status);

      res.status(200).json(successResponse(`User status updated to ${status} successfully!`, updatedUser));
    } catch (error) {
      next(error);
    }
  }
  // hàm thống kê người dùng tháng này và tháng trước
  async getUsersCountThisAndLastMonth(
    req: Request,
    res: Response<ApiResponse<TimeBasedStatsBody>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const now = moment().utc();
      const currentMonthEnd = now.clone().endOf('month').toDate();

      const previousMonthEnd = now.clone().subtract(1, 'months').endOf('month').toDate();

      const usersCurrentMonth = await User.countDocuments({
        createdAt: { $lte: currentMonthEnd }
      });

      const usersPreviousMonth = await User.countDocuments({
        createdAt: { $lte: previousMonthEnd }
      });

      res.json(
        successResponse('Statistic successfully', {
          currentMonth: usersCurrentMonth,
          previousMonth: usersPreviousMonth
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
