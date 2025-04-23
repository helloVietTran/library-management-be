import { Schema, model, Document } from "mongoose";

import dateFormatter from "../utils/datetimeFormatter";
import moment from "moment";

export interface IAuthor extends Document {
  name: string;
  biography?: string;
  dob?: Date;
  awards?: string[];
  imgSrc?: string;
  nationality?: string;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    biography: { type: String },
    dob: { type: Date },
    awards: { type: [String], default: [] },
    imgSrc: { type: String },
    nationality: { type: String },
  },
  { timestamps: true, versionKey: false }
);

AuthorSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.createAt = dateFormatter(ret.createdAt);
    ret.updatedAt = dateFormatter(ret.updatedAt);

    if (ret.dob) {
      ret.dob = moment(ret.dob).format("YYYY-MM-DD");
    }

    return ret;
  },
});

const Author = model<IAuthor>("Author", AuthorSchema);

export default Author;
