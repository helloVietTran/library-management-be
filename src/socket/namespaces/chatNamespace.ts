import { Server, Socket } from 'socket.io';

import Message from '../../models/message-model';
import Conversation from '../../models/conversation-model';
import { initMiddlewares } from '../../middlewares';
import { UserSocketMap } from '../../interfaces/common-interfaces';

const { socketAuth } = initMiddlewares();

// quản lý trạng thái online của user
const userSocketMap: UserSocketMap = {};

export const getRecipientSocketId = (recipientId: string): string | undefined => {
  return userSocketMap[recipientId];
};

const chatNamespace = (io: Server) => {
  const chat = io.of('/chat');

  chat.use(socketAuth);

  chat.on('connection', (socket: Socket) => {
    console.log(`🔵 [chat] User connected: ${socket.data.requester.sub}`);
    const userId = socket.data.requester.sub;

    if (userId && userId !== 'undefined') userSocketMap[userId] = socket.id;

    // danh sách user online
    chat.emit('getOnlineUsers', Object.keys(userSocketMap));

    // đánh dấu đã đọc
    socket.on('markMessagesAsSeen', async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      try {
        await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
        await Conversation.updateOne({ _id: conversationId }, { $set: { 'lastMessage.seen': true } });

        if (userSocketMap[userId]) chat.to(userSocketMap[userId]).emit('messagesSeen', { conversationId });
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
      if (userId) {
        delete userSocketMap[userId];

        io.emit('getOnlineUsers', Object.keys(userSocketMap));
      }
    });
  });
};

export default chatNamespace;
