import jwt, { Secret } from 'jsonwebtoken';
import { ITokenServiceProvider, TokenPayload } from '../interfaces/common';
import { config } from '../config/config';

type ExpiresInType = number | `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

class JwtTokenService implements ITokenServiceProvider {
  private readonly secretKey: Secret;
  private readonly refreshSecretKey: Secret;
  private readonly accessTokenExpiration: ExpiresInType;
  private readonly refreshTokenExpiration: ExpiresInType;

  constructor(
    secretKey: string,
    refreshSecretKey: string,
    accessTokenExpiration: ExpiresInType,
    refreshTokenExpiration?: ExpiresInType
  ) {
    this.secretKey = secretKey;
    this.refreshSecretKey = refreshSecretKey;
    this.accessTokenExpiration = accessTokenExpiration;
    this.refreshTokenExpiration = refreshTokenExpiration || '3d';
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.accessTokenExpiration });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.refreshSecretKey, { expiresIn: this.refreshTokenExpiration });
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secretKey) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export const jwtTokenService = new JwtTokenService(config.jwtSecret, config.refreshSecret, '2h', '3d');
