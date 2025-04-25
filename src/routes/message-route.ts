import express from 'express';

import messageController from '../controllers/message-controller';

const router = express.Router();

router.get('/conversations', messageController.getConversations);
router.get('/:otherUserId', messageController.getMessages);
router.post('/', messageController.sendMessage);

export default router;
