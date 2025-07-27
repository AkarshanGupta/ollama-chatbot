const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Chat routes
router.post('/chat', chatController.createChat);
router.get('/chats', chatController.getChats);
router.get('/chat/:chatId', chatController.getChat);
router.post('/chat/:chatId/message', chatController.sendMessage);
router.post('/chat/:chatId/stop', chatController.stopStream);
router.delete('/chat/:chatId', chatController.deleteChat);

module.exports = router;