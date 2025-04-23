import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";

import User from "../models/User";
import Role, { IRole } from "../models/Role";
import DisabledToken from "../models/DisabledToke";
import AppError from "../error-handlers/AppError";
import {
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from "../types/request";
import { LoginBody, RefreshTokenBody, RegisterBody } from "../types/response";

dotenv.config();

// tạo access token
const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "30m",
  });
};

// tạo refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET as string, {
    expiresIn: "2d",
  });
};

class AuthController {
  // đăng nhập
  async login(req: LoginRequest, res: Response<LoginBody>, next: NextFunction) {
    const { email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email }).populate<{
        role: IRole;
      }>("role");

      if (!existingUser)
        throw new AppError("Email không tồn tại", 404, "/auth/login");

      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordCorrect)
        throw new AppError("Mật khẩu không chính xác", 400, "/auth/login");

      const accessToken = generateAccessToken(
        existingUser._id.toString(),
        existingUser.role.name.toString()
      );
      const refreshToken = generateRefreshToken(existingUser._id.toString());

      res.status(200).json({
        accessToken,
        refreshToken,
        user: existingUser,
      });
    } catch (err) {
      next(err);
    }
  }
  // đăng ký
  async register(
    req: RegisterRequest,
    res: Response<RegisterBody>,
    next: NextFunction
  ) {
    const { email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser)
        throw new AppError("Email đã tồn tại", 400, "/auth/register");

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const defaultRole = await Role.findOne({ name: "user" });
      if (!defaultRole) {
        throw new AppError(
          "Không tìm thấy vai trò mặc định",
          500,
          "/auth/register"
        );
      }

      const newUser = new User({
        ...req.body,
        password: hashedPassword,
        dob: new Date(req.body.dob),
        role: defaultRole._id,
        status: "active",
        avatar: req.file?.path || "",
      });

      await newUser.save();
      await newUser.populate<{ role: IRole }>("role");

      const accessToken = generateAccessToken(
        newUser._id.toString(),
        defaultRole.name
      );
      const refreshToken = generateRefreshToken(newUser._id.toString());

      res.status(201).json({
        message: "Đăng ký thành công",
        accessToken,
        refreshToken,
        user: newUser,
      });
    } catch (err) {
      next(err);
    }
  }

  // tạo token mới
  async refreshToken(
    req: RefreshTokenRequest,
    res: Response<RefreshTokenBody>,
    next: NextFunction
  ) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(
        new AppError(
          "Refresh Token không được cung cấp",
          401,
          "/auth/refresh-token"
        )
      );
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET as string
      ) as { id: string };

      const user = await User.findById(decoded.id).populate<{ role: IRole }>(
        "role"
      );

      if (!user) {
        return next(
          new AppError("Người dùng không tồn tại", 404, "/auth/refresh-token")
        );
      }

      const newAccessToken = generateAccessToken(
        user._id.toString(),
        user.role.name.toString()
      );

      res.status(200).json({
        accessToken: newAccessToken,
      });
    } catch (err) {
      return next(
        new AppError("Refresh Token không hợp lệ", 403, "/auth/refresh-token")
      );
    }
  }

  // đăng xuất
  async logout(req: LogoutRequest, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.lib_jwt_token;

      if (!token) {
        throw new AppError("Không tìm thấy token", 401, "/auth/logout");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
        exp: number;
      };

      const expiresAt = new Date(decoded.exp * 1000);

      await DisabledToken.create({
        token,
        expiresAt,
      });

      res.status(200).json({
        status: "success",
        message: "Đăng xuất thành công",
      });
    } catch (err) {
      next(new AppError("Token không hợp lệ", 401, "/auth/logout"));
    }
  }
}

export default new AuthController();
