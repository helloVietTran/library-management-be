import moment from 'moment';
import { Schema, model } from 'mongoose';
import { IAuthor } from '../interfaces/common-interfaces';
import { formatHumanReadableDate } from '../utils/utils';

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    biography: { type: String },
    dob: { type: Date },
    awards: { type: [String], default: [] },
    imgSrc: { type: String },
    nationality: { type: String }
  },
  { timestamps: true, versionKey: false }
);

AuthorSchema.set('toJSON', {
  transform: function (doc, ret) {
    // ret is doc copy
    ret.createAt = formatHumanReadableDate(ret.createdAt);
    ret.updatedAt = formatHumanReadableDate(ret.updatedAt);

    if (ret.dob) {
      ret.dob = moment(ret.dob).format('YYYY-MM-DD');
    }
    return ret;
  }
});

const Author = model<IAuthor>('Author', AuthorSchema);

export default Author;
