import { Schema, model, Document, Query } from "mongoose";
import dateFormatter from "../utils/datetimeFormatter";
import { IAuthor } from "./Author";
import moment from "moment";

export interface IBook extends Document {
  title: string;
  description?: string;
  publishedDate?: Date;
  authors: Schema.Types.ObjectId[];
  genres?: string[];
  coverImage?: string;
  language?: string;
  publisher?: string;
  quantity: number;
  price: number;
  pageCount: number;
  borrowedTurnsCount: number; // số lượt mượn
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    description: { type: String },
    publishedDate: { type: Date },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    genres: { type: [String], default: [] },
    coverImage: { type: String },
    language: { type: String, default: "tiếng Việt" },
    publisher: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    pageCount: { type: Number, required: true, min: 1, default: 100 },
    borrowedTurnsCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

BookSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.createdAt = dateFormatter(ret.createdAt);
    ret.updatedAt = dateFormatter(ret.updatedAt);

    if (ret.publishedDate) {
      ret.publishedDate = moment(ret.publishedDate).format("YYYY-MM-DD");
    }
    return ret;
  },
});

//tìm sách kèm tác giả
BookSchema.pre(["find", "findOne"], function (this: Query<any, IAuthor>, next) {
  if (!this.getOptions().skipPopulate) {
    this.populate("authors");
  }
  next();
});

const Book = model<IBook>("Book", BookSchema);
export default Book;
