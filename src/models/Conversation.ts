import mongoose, { Document, Schema, Model } from "mongoose";

interface ILastMessage {
  text: string;
  sender: mongoose.Types.ObjectId;
  seen: boolean;
}

interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // người tham gia cuộc trò chuyện
  lastMessage: ILastMessage; // Message cuối cùng
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: {
      text: { type: String, required: true },
      sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
      seen: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default Conversation;
