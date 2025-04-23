import mongoose from "mongoose";

import dotenv from "dotenv";
import logger from "./logger";
import userController from "../controllers/userController";
import roleController from "../controllers/roleController";

dotenv.config();

const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions
    );

    logger.info("MongoDB connected successfully!");

    await roleController.initializeDefaultRoles();
    await userController.initializeAdminUser();
  } catch (err) {
    logger.error(`MongoDB connection failed: ${(err as Error).message}`);
    process.exit(1);
  }
};

export default connectMongo;
