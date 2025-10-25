// AI Service for handling AI chat responses
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'your-openai-api-key-here';

export const generateAIResponse = async (userMessage, conversationHistory = [], aiPersonality = 'friendly') => {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Fallback responses if no API key
      return getFallbackResponse(userMessage, aiPersonality);
    }

    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(aiPersonality)
      },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.senderId === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return getFallbackResponse(userMessage, aiPersonality);
  }
};

const getSystemPrompt = (personality) => {
  switch (personality) {
    case 'maya':
      return 'You are Maya Patel, a friendly and helpful AI companion. You are warm, empathetic, and always ready to engage in meaningful conversations. Keep your responses natural and conversational, like a good friend would.';
    case 'alex':
    default:
      return 'You are Alex Rivera, a witty and intelligent AI assistant. You are helpful, knowledgeable, and have a good sense of humor. Keep your responses engaging and informative, with a touch of personality.';
  }
};

const getFallbackResponse = (userMessage, personality) => {
  const responses = {
    maya: [
      "That's interesting! Tell me more about that.",
      "I understand how you feel. What would you like to talk about?",
      "I'm here to listen. How can I help you today?",
      "That's a great point! What are your thoughts on it?",
      "I love hearing about your experiences. Please continue!",
      "How does that make you feel?",
      "That's fascinating! Can you elaborate?",
      "I'm really enjoying our conversation. What's next on your mind?"
    ],
    alex: [
      "Interesting! I've got some thoughts on that.",
      "Let me think about that for a moment...",
      "You know, that's a really good question.",
      "I see what you mean. Here's my take on it:",
      "That's clever! I hadn't thought of it that way.",
      "Well, from what I know...",
      "That's a fascinating topic. Let me share some insights.",
      "I appreciate you sharing that with me."
    ]
  };

  const personalityResponses = responses[personality] || responses.alex;
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
};

export const isAIContact = (contactId) => {
  return contactId === 'ai-contact-1' || contactId === 'ai-contact-2';
};

export const getAIPersonality = (contactId) => {
  if (contactId === 'ai-contact-1') return 'alex';
  if (contactId === 'ai-contact-2') return 'maya';
  return 'friendly';
};
