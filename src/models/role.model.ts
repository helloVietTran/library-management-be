import { Schema, model } from 'mongoose';
import { IRole } from '../interfaces/common';

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ['admin', 'librarian', 'user'],
      required: true
    },
    description: { type: String }
  },
  { timestamps: false, versionKey: false }
);

const Role = model<IRole>('Role', RoleSchema);

export default Role;
