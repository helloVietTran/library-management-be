import { Schema, model, Document } from "mongoose";

export interface IComment extends Document {
  content: string;
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
  rating: number;
  likes: number;
  replies: { user: Schema.Types.ObjectId; content: string; createdAt: Date }[];
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    rating: { type: Number, min: 1, max: 5 },
    likes: { type: Number, default: 0 },
    replies: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const Comment = model<IComment>("Comment", CommentSchema);
export default Comment;
