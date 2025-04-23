import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';
import User from '../models/user.model';
import Role from '../models/role.model';
import { IRole } from '../interfaces/common-interfaces';
import DisabledToken from '../models/disabled-token.model';
import {
  AppError,
  ErrInternalServer,
  ErrInvalidRequest,
  ErrNotFound,
  ErrTokenInvalid,
  ErrUnauthorized
} from '../config/error';
import { LoginBody, RefreshTokenBody, RegisterBody } from '../interfaces/response-body';
import {
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody
} from '../interfaces/request-body';

dotenv.config();

// tạo access token
const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: '30m'
  });
};

// tạo refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET as string, {
    expiresIn: '2d'
  });
};

class AuthController {
  // đăng nhập
  async login(req: Request<{}, {}, LoginRequestBody>, res: Response<LoginBody>, next: NextFunction) {
    const { email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email }).populate<{ role: IRole }>('role');

      if (!existingUser) {
        return next(ErrNotFound.withMessage('Email không tồn tại').withDetail('body.email', 'Email chưa được đăng ký'));
      }

      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordCorrect) {
        return next(
          ErrInvalidRequest.withMessage('Mật khẩu không chính xác').withDetail('body.password', 'Sai mật khẩu')
        );
      }

      const accessToken = generateAccessToken(existingUser._id.toString(), existingUser.role.name.toString());
      const refreshToken = generateRefreshToken(existingUser._id.toString());

      res.status(200).json({
        accessToken,
        refreshToken,
        user: existingUser
      });
    } catch (err) {
      next(AppError.from(err as Error, 500).withLog('Lỗi khi đăng nhập'));
    }
  }

  // đăng ký
  async register(req: Request<{}, {}, RegisterRequestBody>, res: Response<RegisterBody>, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return next(
          ErrInvalidRequest.withMessage('Email đã tồn tại').withDetail('body.email', 'Email đã được đăng ký')
        );
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const defaultRole = await Role.findOne({ name: 'user' });
      if (!defaultRole) {
        return next(
          ErrInternalServer.withMessage('Không tìm thấy vai trò mặc định').withLog(
            'Vai trò mặc định user không tồn tại trong DB'
          )
        );
      }

      const newUser = new User({
        ...req.body,
        password: hashedPassword,
        dob: new Date(req.body.dob),
        role: defaultRole._id,
        status: 'active',
        avatar: req.file?.path || ''
      });

      await newUser.save();
      await newUser.populate<{ role: IRole }>('role');

      const accessToken = generateAccessToken(newUser._id.toString(), defaultRole.name);
      const refreshToken = generateRefreshToken(newUser._id.toString());

      res.status(201).json({
        message: 'Đăng ký thành công',
        accessToken,
        refreshToken,
        user: newUser
      });
    } catch (err) {
      next(AppError.from(err as Error, 500).withLog('Lỗi khi đăng ký người dùng'));
    }
  }

  // tạo token mới
  async refreshToken(
    req: Request<{}, {}, RefreshTokenRequestBody>,
    res: Response<RefreshTokenBody>,
    next: NextFunction
  ) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(
        ErrUnauthorized.withMessage('Refresh Token không được cung cấp').withDetail(
          'body.refreshToken',
          'Vui lòng gửi refresh token'
        )
      );
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as { id: string };

      const user = await User.findById(decoded.id).populate<{ role: IRole }>('role');

      if (!user) {
        return next(
          ErrNotFound.withMessage('Người dùng không tồn tại').withDetail(
            'decoded.id',
            'Không tìm thấy người dùng với id trong refresh token'
          )
        );
      }

      const newAccessToken = generateAccessToken(user._id.toString(), user.role.name.toString());

      res.status(200).json({
        accessToken: newAccessToken
      });
    } catch (err) {
      return next(
        ErrTokenInvalid.wrap(err as Error)
          .withMessage('Refresh Token không hợp lệ')
          .withDetail('body.refreshToken', 'Token không hợp lệ hoặc đã hết hạn')
      );
    }
  }

  // đăng xuất
  async logout(req: Request<{}, {}, LogoutRequestBody>, res: Response, next: NextFunction) {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        return next(
          ErrUnauthorized.withMessage('Không tìm thấy token').withDetail('body.accessToken', 'Token bắt buộc')
        );
      }

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
        exp: number;
      };

      const expiresAt = new Date(decoded.exp * 1000);

      await DisabledToken.create({
        accessToken,
        expiresAt
      });

      res.status(200).json({
        status: 'success',
        message: 'Đăng xuất thành công'
      });
    } catch (err) {
      next(AppError.from(err as Error, 500).withLog('Lỗi trong hàm logout'));
    }
  }
}

export default new AuthController();
