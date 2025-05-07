import mongoose from 'mongoose';
import Logger from './logger';
import { userService } from '../services/user-service';
import { roleService } from '../services/role-service';
import { config } from './config';

const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(
      config.db.uri as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      } as mongoose.ConnectOptions
    );

    Logger.info('MongoDB connected successfully!');

    await roleService.initializeDefaultRoles();
    await userService.initializeAdminUser();
  } catch (err) {
    Logger.error(`MongoDB connection failed: ${(err as Error).message}`);
    process.exit(1);
  }
};

export default connectMongo;
