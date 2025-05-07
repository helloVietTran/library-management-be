import { Server, Socket } from 'socket.io';
import Message from '../../models/message.model';
import Conversation from '../../models/conversation.model';
import { initMiddlewares } from '../../middlewares';
import { UserSocketMap } from '../../interfaces/common';

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
    const userId = socket.data.requester.sub;
    if (userId && userId !== 'undefined') userSocketMap[userId] = socket.id;

    if (userId && userId !== 'undefined') {
      userSocketMap[userId] = socket.id;
      const onlineUsers = Object.keys(userSocketMap);
      chat.emit('onlineUsers', onlineUsers);
    }

    socket.on('markMessagesAsSeen', async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      try {
        await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
        
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { $set: { 'lastMessage.seen': true } },
          { new: true }
        );

        if (userSocketMap[userId]) chat.to(userSocketMap[userId]).emit('messagesSeen', { updatedConversation });
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        delete userSocketMap[userId];
        chat.emit('onlineUsers', Object.keys(userSocketMap));
      }
    });
  });
};

export default chatNamespace;
