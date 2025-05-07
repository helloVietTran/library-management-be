import moment from 'moment';
import { Schema, model, Query } from 'mongoose';
import { IAddress, IUser, UserStatus } from '../interfaces/common';
import { formatHumanReadableDate } from '../utils/utils';

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true }
});

const UserSchema = new Schema<IUser>(
  {
    avatar: { type: String },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: AddressSchema },
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: UserStatus.ACTIVE
    },
    readBooksCount: {
      type: Number,
      default: 0
    },
    bio: {
      type: String
    }
  },
  { timestamps: true, versionKey: false }
);

// when res.json() called
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password; // remove password from response

    ret.createdAt = moment(ret.createdAt).format('DD/MM/YYYY');
    ret.updatedAt = formatHumanReadableDate(ret.updatedAt);

    return ret;
  }
});

UserSchema.pre(/^find/, function (this: Query<any, IUser>, next) {
  this.populate('role');
  next();
});

const User = model<IUser>('User', UserSchema);

export default User;
