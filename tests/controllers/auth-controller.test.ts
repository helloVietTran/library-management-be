import { Request, Response, NextFunction } from 'express';
import AuthController from '../../src/controllers/auth-controller';
import User from '../../src/models/user.model';
import { jwtTokenService } from '../../src/services/jwt-token-service';
import bcrypt from 'bcryptjs';

// Mock các module
jest.mock('../../src/models/user.model');
jest.mock('bcryptjs');
jest.mock('../../src/services/jwt-token-service');

describe('AuthController.login', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: { email: 'test@example.com', password: 'password123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('Đăng nhập thành công', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: { name: 'user' }
    };

    (User.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser)
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (jwtTokenService.generateToken as jest.Mock).mockResolvedValue('mockAccessToken');
    (jwtTokenService.generateRefreshToken as jest.Mock).mockResolvedValue('mockRefreshToken');

    await AuthController.login(req as Request, res as Response, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwtTokenService.generateToken).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
      user: mockUser
    });
  });

  it('Email không tồn tại', async () => {
    (User.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    await AuthController.login(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Email không tồn tại'
      })
    );
  });

  it('Sai mật khẩu', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: { name: 'user' }
    };

    (User.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser)
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Mật khẩu không chính xác'
      })
    );
  });

  it('Xử lý lỗi bất ngờ - gọi next(AppError)', async () => {
    (User.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await AuthController.login(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 500,
      logMessage: 'Lỗi khi đăng nhập'
    }));
  });
});
