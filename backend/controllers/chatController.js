const prisma = require('../db/prismaClient');
const OllamaClient = require('../utils/ollamaClient');

const ollamaClient = new OllamaClient();

// Store active streams for cancellation
const activeStreams = new Map();

const chatController = {
  // Create new chat
  createChat: async (req, res) => {
    try {
      const { title } = req.body;
      
      const chat = await prisma.chat.create({
        data: {
          title: title || 'New Chat',
        },
      });

      res.status(201).json(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  },

  // Get all chats
  getChats: async (req, res) => {
    try {
      const chats = await prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  },

  // Get chat with messages
  getChat: async (req, res) => {
    try {
      const { chatId } = req.params;

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json(chat);
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ error: 'Failed to fetch chat' });
    }
  },

  // Send message and stream response
  sendMessage: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content } = req.body;

      // Verify chat exists
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          chatId,
          role: 'user',
          content,
        },
      });

      // Update chat title if this is the first message
      if (chat.messages.length === 0) {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        await prisma.chat.update({
          where: { id: chatId },
          data: { title },
        });
      }

      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      let assistantContent = '';
      const streamId = `${chatId}_${Date.now()}`;

      // Build conversation context
      const messages = [...chat.messages, userMessage];
      const conversationContext = messages
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      const prompt = `${conversationContext}\nAssistant:`;

      const stream = await ollamaClient.generateStream(
        prompt,
        // onChunk
        (chunk) => {
          if (activeStreams.has(streamId)) {
            assistantContent += chunk;
            res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
          }
        },
        // onError
        (error) => {
          console.error('Ollama streaming error:', error);
          res.write(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`);
          res.end();
          activeStreams.delete(streamId);
        },
        // onComplete
        async () => {
          try {
            // Save assistant message
            await prisma.message.create({
              data: {
                chatId,
                role: 'assistant',
                content: assistantContent,
              },
            });

            // Update chat timestamp
            await prisma.chat.update({
              where: { id: chatId },
              data: { updatedAt: new Date() },
            });

            res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
            res.end();
            activeStreams.delete(streamId);
          } catch (error) {
            console.error('Error saving assistant message:', error);
            res.write(`data: ${JSON.stringify({ error: 'Failed to save message' })}\n\n`);
            res.end();
            activeStreams.delete(streamId);
          }
        }
      );

      activeStreams.set(streamId, stream);

      // Handle client disconnect
      req.on('close', () => {
        if (activeStreams.has(streamId)) {
          stream.destroy();
          activeStreams.delete(streamId);
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Stop streaming
  stopStream: async (req, res) => {
    try {
      const { chatId } = req.params;
      
      // Find and stop active streams for this chat
      for (const [streamId, stream] of activeStreams.entries()) {
        if (streamId.startsWith(chatId)) {
          stream.destroy();
          activeStreams.delete(streamId);
        }
      }

      res.json({ message: 'Stream stopped' });
    } catch (error) {
      console.error('Error stopping stream:', error);
      res.status(500).json({ error: 'Failed to stop stream' });
    }
  },

  // Delete chat
  deleteChat: async (req, res) => {
    try {
      const { chatId } = req.params;

      await prisma.chat.delete({
        where: { id: chatId },
      });

      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  },
};

module.exports = chatController;