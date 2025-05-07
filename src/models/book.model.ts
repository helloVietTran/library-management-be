import moment from 'moment';
import { Schema, model, Query } from 'mongoose';
import { IAuthor, IBook } from '../interfaces/common';
import { formatHumanReadableDate } from '../utils/utils';

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    description: { type: String },
    publishedDate: { type: Date },
    authors: [{ type: Schema.Types.ObjectId, ref: 'Author' }],
    genres: { type: [String], default: [] },
    coverImage: { type: String },
    language: { type: String, default: 'tiếng Việt' },
    publisher: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    pageCount: { type: Number, required: true, min: 1, default: 100 },
    borrowedTurnsCount: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    ratingPoint: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

BookSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.createdAt = moment(ret.createdAt).format('DD-MM-YYYY');
    ret.updatedAt = formatHumanReadableDate(ret.updatedAt);

    if (ret.publishedDate) {
      ret.publishedDate = moment(ret.publishedDate).format('DD-MM-YYYY');
    }
    return ret;
  }
});

BookSchema.pre(['find', 'findOne'], function (this: Query<any, IAuthor>, next) {
  // If skipPopulate option is not set, populate the "authors" field
  if (!this.getOptions().skipPopulate) {
    this.populate('authors');
  }
  next();
});

const Book = model<IBook>('Book', BookSchema);
export default Book;
