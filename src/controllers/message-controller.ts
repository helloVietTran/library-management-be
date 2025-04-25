import { Request, Response } from 'express';

import Conversation from '../models/conversation-model';
import Message from '../models/message-model';
//import { getRecipientSocketId, io } from "../socket/socket";
import AppError from '../error-handlers/AppError';
import { getRecipientSocketId } from '../socket/namespaces/chatNamespace';
import { getIO } from '../socket';

class MessageController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId, message } = req.body;
      let { img } = req.body;

      const senderId = res.locals.requester.id; // lấy id người gửi từ token

      // tìm conversation giữa 2 người
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
      });

      // không tìm thấy
      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, recipientId],
          lastMessage: {
            text: message,
            sender: senderId
          }
        });
        await conversation.save();
      }

      const newMessage = new Message({
        conversationId: conversation._id,
        sender: senderId,
        text: message,
        img: img || ''
      });

      await Promise.all([
        newMessage.save(),
        conversation.updateOne({
          lastMessage: {
            text: message,
            sender: senderId
          }
        })
      ]);
      // gửi tin real time
      const io = getIO();
      const recipientSocketId = getRecipientSocketId(recipientId);
      if (recipientSocketId) io.of('/chat').to(recipientSocketId).emit('newMessage', newMessage);

      res.status(201).json(newMessage);
    } catch (error: any) {
      throw new AppError(error.message, 500, '/messages/send');
    }
  }

  // lấy tin nhắn
  async getMessages(req: Request, res: Response): Promise<void> {
    const { otherUserId } = req.params;
    const userId = res.locals.requester.id; // lấy id người gửi từ token

    try {
      // tìm hội thoại
      const conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] }
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404, '/messages');
      }

      const messages = await Message.find({
        conversationId: conversation._id
      }).sort({ createdAt: 1 });

      res.status(200).json(messages);
    } catch (error: any) {
      throw new AppError(error.message, 500, '/messages');
    }
  }

  // lấy cuooicj trò chuyện
  async getConversations(req: Request, res: Response): Promise<void> {
    {
      const userId = res.locals.requester.id; // lấy id người gửi từ token
      try {
        const conversations = await Conversation.find({
          participants: userId
        }).populate({
          path: 'participants',
          select: 'username avatar'
        });

        // loại người tham gia cuộc hội thoại
        conversations.forEach((conversation) => {
          conversation.participants = conversation.participants.filter(
            (participant) => participant._id.toString() !== userId.toString()
          );
        });
        res.status(200).json(conversations);
      } catch (error: any) {
        throw new AppError(error.message, 500, '/conversations');
      }
    }
  }
}

export default new MessageController();
