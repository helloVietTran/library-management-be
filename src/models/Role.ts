import { Schema, model, Document } from "mongoose";

export interface IRole extends Document {
  name: "admin" | "librarian" | "user";
  description?: string;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ["admin", "librarian", "user"],
      required: true,
    },
    description: { type: String },
  },
  { timestamps: false, versionKey: false }
);

const Role = model<IRole>("Role", RoleSchema);

export default Role;
