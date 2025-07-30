/**
 * Gemini API Service
 * Handles communication with Google's Gemini API for AI chatbot functionality
 */

const GEMINI_API_KEY = 'AIzaSyCC8aYtlnrwJOaJ_5ea7bBBPlU0cpUqrBY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  requestQueue: [],
  lastRequestTime: 0,
  requestCount: { minute: 0, hour: 0 }
};

// Error types for better error handling
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

/**
 * Sanitizes user input to prevent potential security issues
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') return '';

  // Remove potential XSS vectors
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // Limit input length
  return sanitized.substring(0, 1000).trim();
};

/**
 * Checks if we're within rate limits
 * @returns {boolean} - True if within limits
 */
const checkRateLimit = () => {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  // Reset counters if time windows have passed
  if (now - RATE_LIMIT.lastRequestTime > oneMinute) {
    RATE_LIMIT.requestCount.minute = 0;
  }
  if (now - RATE_LIMIT.lastRequestTime > oneHour) {
    RATE_LIMIT.requestCount.hour = 0;
  }

  return (
    RATE_LIMIT.requestCount.minute < RATE_LIMIT.maxRequestsPerMinute &&
    RATE_LIMIT.requestCount.hour < RATE_LIMIT.maxRequestsPerHour
  );
};

/**
 * Updates rate limit counters
 */
const updateRateLimit = () => {
  RATE_LIMIT.requestCount.minute++;
  RATE_LIMIT.requestCount.hour++;
  RATE_LIMIT.lastRequestTime = Date.now();
};

/**
 * Creates a system prompt based on platform context
 * @param {Object} platformContext - Current platform context
 * @returns {string} - System prompt for Gemini
 */
export const formatSystemPrompt = (platformContext = {}) => {
  const { page, user, cart, currentRestaurant, recentOrders } = platformContext;

  let systemPrompt = `You are Foodie, a helpful AI assistant for the Foodify food delivery platform. You help customers with:
- Finding restaurants and menu items
- Placing orders and managing cart
- Order tracking and support
- General platform navigation
- Account management

Current context:`;

  if (page) {
    systemPrompt += `\n- User is on: ${page.route} (${page.title})`;
  }

  if (user?.isAuthenticated) {
    systemPrompt += `\n- User: ${user.name || 'Authenticated user'}`;
  } else {
    systemPrompt += `\n- User: Not logged in`;
  }

  if (cart?.items?.length > 0) {
    systemPrompt += `\n- Cart: ${cart.items.length} items, Total: Rs. ${cart.total}`;
    if (cart.restaurant) {
      systemPrompt += ` from ${cart.restaurant.name}`;
    }
  }

  if (currentRestaurant) {
    systemPrompt += `\n- Viewing restaurant: ${currentRestaurant.name} (${currentRestaurant.cuisine})`;
  }

  if (recentOrders?.length > 0) {
    systemPrompt += `\n- Recent orders: ${recentOrders.length} orders`;
  }

  systemPrompt += `\n\nBe helpful, friendly, and concise. Provide specific assistance based on the current context. If you can't help with something, suggest contacting support.`;

  return systemPrompt;
};

/**
 * Retry mechanism with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with the function result
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Don't retry on certain error types
      if (error.type === ERROR_TYPES.VALIDATION_ERROR || error.type === ERROR_TYPES.RATE_LIMIT_ERROR) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Main Gemini API service class
 */
class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;
    this.conversationHistory = new Map(); // sessionId -> messages
  }

  /**
   * Sends a message to Gemini API
   * @param {string} message - User message
   * @param {Object} platformContext - Current platform context
   * @param {string} sessionId - Session identifier
   * @returns {Promise<string>} - AI response
   */
  async sendMessage(message, platformContext = {}, sessionId = 'default') {
    try {
      // Validate input
      if (!message || typeof message !== 'string') {
        throw {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Message is required and must be a string'
        };
      }

      // Sanitize input
      const sanitizedMessage = sanitizeUserInput(message);
      if (!sanitizedMessage) {
        throw {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Message cannot be empty after sanitization'
        };
      }

      // Check rate limits
      if (!checkRateLimit()) {
        throw {
          type: ERROR_TYPES.RATE_LIMIT_ERROR,
          message: 'Rate limit exceeded. Please wait before sending another message.'
        };
      }

      // Generate response with retry mechanism
      const response = await retryWithBackoff(async () => {
        return await this.generateResponse(sanitizedMessage, platformContext, sessionId);
      });

      // Update rate limit counters
      updateRateLimit();

      return response;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Generates AI response using Gemini API
   * @param {string} message - Sanitized user message
   * @param {Object} platformContext - Platform context
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(message, platformContext, sessionId) {
    const systemPrompt = formatSystemPrompt(platformContext);
    const conversationHistory = this.getConversationHistory(sessionId);

    // Build the prompt with context and history
    let fullPrompt = systemPrompt + '\n\nConversation:\n';

    // Add recent conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      fullPrompt += `${msg.role}: ${msg.content}\n`;
    });

    fullPrompt += `user: ${message}\nassistant:`;

    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        type: ERROR_TYPES.API_ERROR,
        message: `API request failed: ${response.status}`,
        details: errorData
      };
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw {
        type: ERROR_TYPES.API_ERROR,
        message: 'Invalid response format from Gemini API'
      };
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Update conversation history
    this.updateConversationHistory(sessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ]);

    return aiResponse;
  }

  /**
   * Gets conversation history for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} - Conversation history
   */
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  /**
   * Updates conversation history for a session
   * @param {string} sessionId - Session ID
   * @param {Array} messages - Messages to add
   */
  updateConversationHistory(sessionId, messages) {
    const history = this.getConversationHistory(sessionId);
    history.push(...messages);

    // Keep only last 50 messages to prevent memory issues
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    this.conversationHistory.set(sessionId, history);
  }

  /**
   * Clears conversation history for a session
   * @param {string} sessionId - Session ID
   */
  clearConversationHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Provides fallback responses when API fails
   * @param {Object} error - Error object
   * @returns {string} - Fallback response
   */
  getFallbackResponse(error) {
    const fallbackResponses = {
      [ERROR_TYPES.NETWORK_ERROR]: "I'm having trouble connecting right now. Please check your internet connection and try again.",
      [ERROR_TYPES.API_ERROR]: "I'm experiencing some technical difficulties. Please try again in a moment.",
      [ERROR_TYPES.RATE_LIMIT_ERROR]: "I'm receiving too many requests right now. Please wait a moment before trying again.",
      [ERROR_TYPES.VALIDATION_ERROR]: "I didn't understand that message. Could you please rephrase your question?",
      default: "I'm sorry, I'm having trouble processing your request right now. You can contact our support team at support@foodify.com for immediate assistance."
    };

    return fallbackResponses[error.type] || fallbackResponses.default;
  }

  /**
   * Gets current rate limit status
   * @returns {Object} - Rate limit information
   */
  getRateLimitStatus() {
    return {
      requestsThisMinute: RATE_LIMIT.requestCount.minute,
      requestsThisHour: RATE_LIMIT.requestCount.hour,
      maxPerMinute: RATE_LIMIT.maxRequestsPerMinute,
      maxPerHour: RATE_LIMIT.maxRequestsPerHour,
      canMakeRequest: checkRateLimit()
    };
  }
}

// Export singleton instance
export default new GeminiService();