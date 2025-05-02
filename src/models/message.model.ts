import mongoose, { Document, Schema, Model } from 'mongoose';

interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId; // thuộc về cuộc hội thoại nào
  sender: mongoose.Types.ObjectId; // người gửi
  text: string; // nội dung tin nhắn
  seen: boolean; // đã xem chưa
  img: string; // ảnh đính kèm
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    seen: { type: Boolean, default: false },
    img: { type: String, default: '' }
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
