import express from 'express';
import { celebrate, Segments } from 'celebrate';
import messageController from '../controllers/message-controller';
import { initMiddlewares } from '../middlewares';
import { sendMessageSchema } from '../validate-schemas/send-message-schema';
import { createConversationSchema } from '../validate-schemas/create-conversation-schema';

const { auth } = initMiddlewares();
const router = express.Router();

router.post('/', auth, celebrate({[Segments.BODY]: sendMessageSchema}), messageController.sendMessage);
router.get('/conversations', auth, messageController.getConversations);
router.post('/conversations', auth, celebrate({ [Segments.BODY]: createConversationSchema }), messageController.createConversation);
router.get('/:otherUserId', auth, messageController.getMessages);

export default router;
