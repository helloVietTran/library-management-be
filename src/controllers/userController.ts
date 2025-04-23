import dotenv from 'dotenv';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model';
import Role from '../models/role.model';
import AppError from '../error-handlers/AppError';
import { PaginatedBody, TimeBasedStatsBody } from '../interfaces/response-body';
import BorrowRecord from '../models/borrow-record.model';
import { IUser } from '../interfaces/common-interfaces';
import { PrimaryQuery } from '../interfaces/query';
import { PromoteUserRequestBody, UpdateUserRequestBody, UpdateUserStatusRequestBody } from '../interfaces/request-body';

dotenv.config();

class UserController {
  // khởi tạo admin
  async initializeAdminUser(): Promise<void> {
    try {
      let adminRole = await Role.findOne({ name: 'admin' });
      const adminExists = await User.findOne({
        email: process.env.ADMIN_EMAIL
      });

      if (!adminExists && adminRole) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

        const adminUser = new User({
          email: process.env.ADMIN_EMAIL || 'admin@example.com',
          password: hashedPassword,
          fullName: 'Admin User',
          dob: new Date('2003-09-02'),
          phoneNumber: '0000000000',
          address: {
            street: '123 Admin Street',
            city: 'Admin City',
            zipCode: '000000'
          },
          role: adminRole._id,
          status: 'active'
        });

        await adminUser.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // lấy dữ liệu của bản thân
  async getMyInfo(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.requester.id; // lấy id người gửi từ token

    try {
      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 400, '/users/my', 'get');

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  // lấy user theo Id
  async getUserById(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 400, '/users/:id', 'get');

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  // chỉnh sửa user
  async updateUser(
    req: Request<{ userId: string }, {}, UpdateUserRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const existingUser = await User.findById(userId);
      if (!existingUser) {
        throw new AppError('Tác giả không tồn tại.', 404, '/authors', 'GET');
      }

      Object.assign(existingUser, req.body);

      if (req.file?.path) {
        existingUser.avatar = req.file.path;
      }

      const updatedUser = await existingUser.save();

      res.status(200).json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  // lấy danh sách user có phân trang
  async getUsers(
    req: Request<any, any, any, PrimaryQuery>,
    res: Response<PaginatedBody<IUser>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || '';

      // Điều kiện tìm kiếm theo fullName
      const searchFilter = search ? { fullName: { $regex: search, $options: 'i' } } : {};

      const totalUsers = await User.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalUsers / pageSize);

      const users = await User.find(searchFilter)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      const response = {
        data: users,
        currentPage: page,
        pageSize,
        totalPages,
        totalElement: totalUsers
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const borrowRecord = await BorrowRecord.findOne({
        user: userId,
        returnDate: { $exists: false }
      });

      if (borrowRecord) {
        throw new AppError('Không thể xóa người này vì người này có sách chưa trả', 400, '/users', 'DELETE');
      }

      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        res.status(404).json({ success: false, message: 'User not found!' });
        return;
      }

      res.status(200).json({ success: true, message: 'User deleted successfully!' });
    } catch (error) {
      next(error);
    }
  }

  // nâng quyền
  async promoteUser(
    req: Request<{ userId: string }, {}, PromoteUserRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;

      const role = await Role.findOne({ name: newRole });
      if (!role) {
        res.status(400).json({ success: false, message: 'Invalid role' });
        return;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, { role: role._id }, { new: true }).populate('role');

      if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: `User promoted to ${newRole} successfully!`,
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // chặn hoặc mở khóa user
  async updateUserStatus(
    req: Request<{ userId: string }, {}, UpdateUserStatusRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true });

      if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: `User status updated to ${status} successfully!`,
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
  // hàm thống kê người dùng tháng này và tháng trước
  async getUsersCountThisAndLastMonth(
    req: Request,
    res: Response<TimeBasedStatsBody>,
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

      res.json({
        currentMonth: usersCurrentMonth,
        previousMonth: usersPreviousMonth
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
