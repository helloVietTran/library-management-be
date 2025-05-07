import bcrypt from 'bcryptjs';
import Role from '../models/role.model';
import User from '../models/user.model';
import Logger from '../config/logger';
import { config } from '../config/config';
import { IUser, UserStatus } from '../interfaces/common';
import { AppError } from '../config/error';
import { UpdateUserBody } from '../interfaces/request';
import { FilterQuery, ObjectId } from 'mongoose';

type Projection = Record<string, 1 | 0>;

class UserService {
  async initializeAdminUser(): Promise<void> {
    try {
      let adminRole = await Role.findOne({ name: 'admin' });
      const adminExists = await User.findOne({
        email: config.admin.email
      });

      if (!adminExists && adminRole) {
        const hashedPassword = await bcrypt.hash(config.admin.password, 10);

        const adminUser = new User({
          email: config.admin.email,
          password: hashedPassword,
          fullName: 'Admin Việt Anh',
          dob: new Date('2003-09-02'),
          role: adminRole._id,
          status: UserStatus.ACTIVE
        });

        await adminUser.save();
      }
    } catch (error) {
      Logger.error(`Failed to create admin user: ${(error as Error).message}`);
    }
  }

  async getById(userId: string | ObjectId): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw AppError.from(new Error('User not found'), 404);
    return user;
  }

  async updateUser(userId: string, updateData: UpdateUserBody, avatarPath?: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw AppError.from(new Error('User not found'), 404).withMessage('Không tìm thấy người dùng');
    }
    Object.assign(user, updateData);
    if (avatarPath) {
      user.avatar = avatarPath;
    }

    return await user.save();
  }

  async countByCond(cond: FilterQuery<IUser>): Promise<number> {
    return await User.countDocuments(cond);
  }

  async findByCondAndPaginate(cond: FilterQuery<IUser>, page: number, pageSize: number) {
    return await User.find(cond)
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  }

  async findByCond(cond: FilterQuery<IUser>, projection: Projection) {
    return await User.find(cond, projection);
  }

  async deleteUser(userId: string) {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw AppError.from(new Error('User not found'), 404).withMessage('Không tìm thấy người dùng');
    }
  }

  async updateUserRole(userId: string, roleId: ObjectId): Promise<IUser> {
    const updatedUser = await User.findByIdAndUpdate(userId, { role: roleId }, { new: true }).populate('role');
    if (!updatedUser) {
      throw AppError.from(new Error('User not found'), 404).withMessage('Không tìm thấy người dùng');
    }

    return updatedUser;
  }

  async updateUserStatus(userId: string, status: string) {
    const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!updatedUser) {
      throw AppError.from(new Error('User not found'), 404).withMessage('Không tìm thấy người dùng');
    }
    return updatedUser;
  }

  async existsByCond(cond: FilterQuery<IUser>): Promise<boolean> {
    const result = await User.exists(cond);
    return !!result; 
  }
}

export const userService = new UserService();
