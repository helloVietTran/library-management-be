import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';
import User from '../models/user.model';
import Role from '../models/role.model';
import DisabledToken from '../models/disabled-token.model';
import { IRole, TokenPayload } from '../interfaces/common';
import { LoginResponseBody, RefreshTokenResponseBody, RegisterResponseBody } from '../interfaces/response';
import {
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody
} from '../interfaces/request';
import { AppError, ErrInternalServer, ErrInvalidRequest, ErrNotFound, ErrTokenInvalid } from '../config/error';
import { jwtTokenService } from '../services/jwt-token-service';
import { config } from '../config/config';

class AuthController {
  async login(req: Request<{}, {}, LoginRequestBody>, res: Response<LoginResponseBody>, next: NextFunction) {
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

      const tokenPayLoad: TokenPayload = {
        sub: existingUser._id.toString(),
        role: existingUser.role.name
      };

      const accessToken = await jwtTokenService.generateToken(tokenPayLoad);
      const refreshToken = await jwtTokenService.generateRefreshToken(tokenPayLoad);

      res.status(200).json({
        accessToken,
        refreshToken,
        user: existingUser
      });
    } catch (err) {
      next(AppError.from(err as Error, 500).withLog('Lỗi khi đăng nhập'));
    }
  }

  async register(req: Request<{}, {}, RegisterRequestBody>, res: Response<RegisterResponseBody>, next: NextFunction) {
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

      const tokenPayLoad: TokenPayload = {
        sub: newUser._id.toString(),
        role: defaultRole.name
      };

      const accessToken = await jwtTokenService.generateToken(tokenPayLoad);
      const refreshToken = await jwtTokenService.generateRefreshToken(tokenPayLoad);

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

  async refreshToken(
    req: Request<{}, {}, RefreshTokenRequestBody>,
    res: Response<RefreshTokenResponseBody>,
    next: NextFunction
  ) {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(refreshToken, config.refreshSecret) as TokenPayload;

      const user = await User.findById(decoded.sub).populate<{ role: IRole }>('role');

      if (!user) {
        return next(
          ErrNotFound.withMessage('Người dùng không tồn tại').withDetail(
            'decoded.id',
            'Không tìm thấy người dùng với id trong refresh token'
          )
        );
      }

      const tokenPayLoad: TokenPayload = {
        sub: user._id.toString(),
        role: user.role.name
      };

      const newAccessToken = await jwtTokenService.generateToken(tokenPayLoad);

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

  async logout(req: Request<{}, {}, LogoutRequestBody>, res: Response, next: NextFunction) {
    try {
      const { accessToken } = req.body;

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
        exp: number;
      };

      const expiresAt = new Date(decoded.exp * 1000);

      await DisabledToken.create({
        token: accessToken,
        expiresAt
      });

      res.status(200).json({
        status: 'success',
        message: 'Đăng xuất thành công'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
