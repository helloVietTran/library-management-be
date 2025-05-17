import moment from 'moment';
import { Query, Schema, model } from 'mongoose';
import { IFine } from '../interfaces/common';

const FineSchema = new Schema<IFine>(
  {
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
    reason: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'card'] },
    borrowRecord: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRecord',
      required: true
    },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

FineSchema.pre<Query<any, IFine>>(/^find/, function (next) {
  this.populate('borrowRecord').populate('collectedBy');
  next();
});

FineSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.createdAt = moment(ret.createdAt).format('DD/MM/YYYY');
    ret.updatedAt = moment(ret.updatedAt).format('DD/MM/YYYY');

    return ret;
  }
});

const Fine = model<IFine>('Fine', FineSchema);

export default Fine;
