import { Request, Response, NextFunction } from 'express';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { getRecipientSocketId } from '../socket/namespaces/chatNamespace';
import { AppError } from '../config/error';
import SocketServer from '../socket';
import { successResponse } from '../utils/utils';
import { CreateConversationBody, SendMessageBody } from '../interfaces/request';

class MessageController {
  async createConversation(req: Request<{}, any, CreateConversationBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipientId } = req.body;
      const senderId = res.locals.requester.sub;

      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
      });

      if (conversation) {
        res.status(200).json(successResponse('Cuộc trò chuyện đã tồn tại', conversation));
      }

      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: null
      });

      await conversation.save();

      res.status(201).json(successResponse('Tạo cuộc trò chuyện thành công', conversation));
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request<{}, any, SendMessageBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipientId, message } = req.body;
      const senderId = res.locals.requester.sub;

      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
      });
      // create new conversation
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
        text: message
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

      const io = SocketServer.getIO();
      const recipientSocketId = getRecipientSocketId(recipientId);

      if (recipientSocketId) io.of('/chat').to(recipientSocketId).emit('newMessage', newMessage);

      res.status(201).json(successResponse('', newMessage));
    } catch (error: any) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { otherUserId } = req.params;
    const userId = res.locals.requester.sub;
    try {
      const conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] }
      });

      if (!conversation) {
        throw AppError.from(new Error('Không tìm thấy hội thoại giữa 2 người'), 404).withMessage(
          'Không tìm thấy hội thoại giữa 2 người'
        );
      }

      const messages = await Message.find({
        conversationId: conversation._id
      }).sort({ createdAt: 1 });

      res.status(200).json(successResponse('', messages));
    } catch (error: any) {
      next(error);
    }
  }

  async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    {
      const userId = res.locals.requester.sub;
      try {
        const conversations = await Conversation.find({
          participants: userId
        }).populate({
          path: 'participants',
          select: 'fullName avatar'
        });

        // loại người tham gia cuộc hội thoại
        conversations.forEach((conversation) => {
          conversation.participants = conversation.participants.filter(
            (participant) => participant._id.toString() !== userId.toString()
          );
        });
        res.status(200).json(successResponse('', conversations));
      } catch (error: any) {
        next(error);
      }
    }
  }
}

export default new MessageController();
