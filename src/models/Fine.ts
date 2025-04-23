import moment from "moment";
import { Schema, model, Document } from "mongoose";

export interface IFine extends Document {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId; // người bị phạt
  amount: number;
  paid: boolean;
  paidDate?: Date;
  reason: string;
  paymentMethod?: "cash" | "bank_transfer";
  collectedBy?: Schema.Types.ObjectId; // người thu tiền phạt
  borrowRecord: Schema.Types.ObjectId;
}

const FineSchema = new Schema<IFine>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
    reason: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cash", "bank_transfer"] },
    borrowRecord: {
      type: Schema.Types.ObjectId,
      ref: "BorrowRecord",
      required: true,
    },
    collectedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


FineSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.createdAt = moment(ret.createdAt).format("DD/MM/YYYY");

    ret.updatedAt = moment(ret.updatedAt).format("DD/MM/YYYY");
    return ret;
  },
});


const Fine = model<IFine>("Fine", FineSchema);

export default Fine;
