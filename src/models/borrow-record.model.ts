import moment from 'moment';
import { Query } from 'mongoose';
import { Schema, model } from 'mongoose';
import { BookStatus, IBook, IBorrowRecord, IUser } from '../interfaces/common';

const BorrowRecordSchema = new Schema<IBorrowRecord>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fine: { type: Schema.Types.ObjectId, ref: 'Fine' },
    status: {
      type: String,
      enum: ['ok', 'break', 'lost'],
      default: BookStatus.OK
    },
    note: { type: String }
  },
  { timestamps: true }
);

BorrowRecordSchema.pre(/^find/, function (this: Query<any, IBook, IUser>, next) {
  const options = this.getOptions();

  if (!options.skipPopulate) {
    this.populate('user');
    this.populate('book');
  }

  next();
});

BorrowRecordSchema.methods.isOverdue = function () {
  return moment(this.dueDate).isBefore(moment());
};

BorrowRecordSchema.methods.getOverdueDays = function () {
  if (this.returnDate) {
    const dueDate = moment(this.dueDate);
    const returnDate = moment(this.returnDate);
    const diffDays = returnDate.diff(dueDate, 'days');

    return diffDays > 0 ? diffDays : 0;
  }

  const dueDate = moment(this.dueDate);
  const now = moment();
  const diffDays = now.diff(dueDate, 'days');

  return diffDays > 0 ? diffDays : 0;
};

const BorrowRecord = model<IBorrowRecord>('BorrowRecord', BorrowRecordSchema);

export default BorrowRecord;
