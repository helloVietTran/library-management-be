import { Query } from "mongoose";
import { Schema, model, Document } from "mongoose";
import moment from "moment";

import { IBook } from "./Book";
import { IUser } from "./User";

export interface IBorrowRecord extends Document {
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
  borrowDate: Date;
  dueDate: Date; // ngày dự kiến trả
  returnDate?: Date; // ngày trả thực tế
  fine?: Schema.Types.ObjectId;
  status: "ok" | "break" | "lost"; // tình trạng sách khi trả
  note?: string; 

  createdAt: Date;
  updatedAt: Date;

  isOverdue: () => boolean;
  getOverdueDays(): number;
}

export interface IBorrowRecordPopulated extends Omit<IBorrowRecord, "user" | "book"> {
  user: IUser;
  book: IBook;
}

const BorrowRecordSchema = new Schema<IBorrowRecord>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fine: { type: Schema.Types.ObjectId, ref: "Fine" }, 
    status: {
      type: String,
      enum: ["ok", "break", "lost"],
      default: "ok",
    },
    note: { type: String }, 
  },
  { timestamps: true }
);

BorrowRecordSchema.pre(/^find/, function (this: Query<any, IBook, IUser>, next) {
  const options = this.getOptions();

  if (!options.skipPopulate) {
    this.populate("user");
    this.populate("book");
  }

  next();
});

BorrowRecordSchema.methods.isOverdue = function () {
  return moment(this.dueDate).isBefore(moment());
};

BorrowRecordSchema.methods.getOverdueDays = function () {
  if (this.returnDate) {
    // Nếu có ngày trả thực tế
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

const BorrowRecord = model<IBorrowRecord>("BorrowRecord", BorrowRecordSchema);

export default BorrowRecord;
