import { Schema, model, Document, Query } from "mongoose";
import moment from "moment";

import { IRole } from "./Role";
import dateFormatter from "../utils/datetimeFormatter";

interface IAddress {
  street: string;
  city: string;
  zipCode: string;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
});

export interface IUser extends Document {
  _id: string;
  avatar?: string;
  password: string;
  email: string;
  role: Schema.Types.ObjectId | IRole;
  fullName: string;
  dob: Date;
  phoneNumber?: string;
  address: IAddress;
  status: "active" | "locked" | "banned";
  readBooksCount: number;
  bio?: string;
}

const UserSchema = new Schema<IUser>(
  {
    avatar: { type: String },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    phoneNumber: { type: String },
    address: { type: AddressSchema, required: true },
    status: {
      type: String,
      enum: ["active", "locked", "banned"],
      default: "active",
    },
    readBooksCount: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    ret.createdAt = moment(ret.createdAt).format("DD/MM/YYYY");

    ret.updatedAt = dateFormatter(ret.updatedAt);
    return ret;
  },
});

UserSchema.pre(/^find/, function (this: Query<any, IUser>, next) {
  this.populate("role");
  next();
});

const User = model<IUser>("User", UserSchema);

export default User;
