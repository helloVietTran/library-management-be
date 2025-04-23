import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env' : `.env.${process.env.NODE_ENV}`
});

const port = process.env.PORT || '3001';

export const config = {
  envName: process.env.NODE_ENV,
  port,
  jwtSecret: process.env.JWT_SECRET || 'i am viet anh <3',
  refreshSecret: process.env.REFRESH_SECRET || 'i am viet anh <3',
  api_prefix: process.env.API_PREFIX || '/api',
  api_version: process.env.API_VERSION || '/v1',
  db: {
    uri: process.env.MONGO_URI
  },
  upload: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    app_pass: process.env.APP_PASS
  }
};
