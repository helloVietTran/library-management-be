import { Schema, model } from 'mongoose';
import { IConversation } from '../interfaces/common';

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      seen: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
