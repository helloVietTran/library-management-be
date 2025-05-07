import { Schema, model } from 'mongoose';
import { IComment } from '../interfaces/common';

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, min: 1, max: 5 },
    likes: { type: Number, default: 0 },
    replies: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  { timestamps: true, versionKey: false }
);

const Comment = model<IComment>('Comment', CommentSchema);
export default Comment;
