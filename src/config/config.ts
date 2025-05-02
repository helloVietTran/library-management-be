import dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  dotenv.config({
    path: `.env.${process.env.NODE_ENV}`
  });
}

const port = process.env.PORT || 3001;
export const config = {
  envName: process.env.NODE_ENV,
  port,
  jwtSecret: process.env.JWT_SECRET || 'i am viet anh <3',
  refreshSecret: process.env.REFRESH_SECRET || 'viet anh <3',
  api_prefix: process.env.API_PREFIX || '/api',
  api_version: process.env.API_VERSION || '/v1',
  db: {
    uri: process.env.MONGO_URI
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    app_pass: process.env.APP_PASS
  },
  fe_domain: process.env.FE_DOMAIN, 
  be_domain: process.env.BE_DOMAIN, 
};

