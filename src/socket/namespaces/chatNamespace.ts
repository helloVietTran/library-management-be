import { Server } from "socket.io";
import socketAuthMiddleware, {
  AuthenticatedSocket,
} from "../../middlewares/socketAuthMiddleware";

import Message from "../../models/Message";
import Conversation from "../../models/Conversation";

interface UserSocketMap {
  [key: string]: string;
}

// quản lý trạng thái online của user
const userSocketMap: UserSocketMap = {}; // lưu key - value: userId - socketId

export const getRecipientSocketId = (
  recipientId: string
): string | undefined => {
  return userSocketMap[recipientId];
};

const chatNamespace = (io: Server) => {
  const chat = io.of("/chat");

  chat.use(socketAuthMiddleware);

  chat.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔵 [chat] User connected: ${socket.id}`);
    const userId = socket.userId;

    if (userId && userId !== "undefined") userSocketMap[userId] = socket.id;

    // danh sách user online
    chat.emit("getOnlineUsers", Object.keys(userSocketMap));

    // đánh dấu đã đọc
    socket.on(
      "markMessagesAsSeen",
      async ({
        conversationId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        try {
          await Message.updateMany(
            { conversationId: conversationId, seen: false },
            { $set: { seen: true } }
          );
          await Conversation.updateOne(
            { _id: conversationId },
            { $set: { "lastMessage.seen": true } }
          );

          if (userSocketMap[userId])
            chat
              .to(userSocketMap[userId])
              .emit("messagesSeen", { conversationId });
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      if (userId) {
        delete userSocketMap[userId];
        
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });
};

export default chatNamespace;
