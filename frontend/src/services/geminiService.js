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

// Circuit breaker for handling overload situations
const CIRCUIT_BREAKER = {
  failureCount: 0,
  maxFailures: 5, // Allow more failures before opening
  resetTimeout: 30000, // 30 seconds instead of 1 minute
  lastFailureTime: 0,
  state: 'CLOSED' // CLOSED, OPEN, HALF_OPEN
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
 * Checks circuit breaker state
 * @returns {boolean} - True if requests should be allowed
 */
const checkCircuitBreaker = () => {
  const now = Date.now();

  if (CIRCUIT_BREAKER.state === 'OPEN') {
    if (now - CIRCUIT_BREAKER.lastFailureTime > CIRCUIT_BREAKER.resetTimeout) {
      CIRCUIT_BREAKER.state = 'HALF_OPEN';
      console.log('Circuit breaker moving to HALF_OPEN state');
      return true;
    }
    return false;
  }

  return true;
};

/**
 * Records a successful request for circuit breaker
 */
const recordSuccess = () => {
  if (CIRCUIT_BREAKER.state === 'HALF_OPEN') {
    CIRCUIT_BREAKER.state = 'CLOSED';
    CIRCUIT_BREAKER.failureCount = 0;
    console.log('Circuit breaker reset to CLOSED state');
  }
};

/**
 * Records a failure for circuit breaker
 * @param {Object} error - Error object
 */
const recordFailure = (error) => {
  // Only count overload errors for circuit breaker
  const isOverloadError = error.details && error.details.error &&
    (error.details.error.code === 503 ||
      (error.details.error.status === 'UNAVAILABLE' &&
        error.details.error.message &&
        error.details.error.message.toLowerCase().includes('overloaded')));

  if (isOverloadError) {
    CIRCUIT_BREAKER.failureCount++;
    CIRCUIT_BREAKER.lastFailureTime = Date.now();

    if (CIRCUIT_BREAKER.failureCount >= CIRCUIT_BREAKER.maxFailures) {
      CIRCUIT_BREAKER.state = 'OPEN';
      console.log(`Circuit breaker OPEN after ${CIRCUIT_BREAKER.failureCount} overload failures`);
    }
  }
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
 * Retry mechanism with exponential backoff and smart overload handling
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with the function result
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 800) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        console.error(`Final retry attempt failed after ${maxRetries} retries:`, error);
        throw error;
      }

      // Don't retry on certain error types
      if (error.type === ERROR_TYPES.VALIDATION_ERROR) {
        throw error;
      }

      // Check for specific API error codes that should be retried
      const isOverloadError = error.details && error.details.error &&
        (error.details.error.code === 503 ||
          (error.details.error.status === 'UNAVAILABLE' &&
            error.details.error.message &&
            error.details.error.message.toLowerCase().includes('overloaded')));

      const isRateLimitError = error.details && error.details.error && error.details.error.code === 429;
      const isServerError = error.details && error.details.error && error.details.error.code >= 500;

      const shouldRetry = isOverloadError || isRateLimitError || isServerError;

      if (!shouldRetry && error.type === ERROR_TYPES.RATE_LIMIT_ERROR) {
        throw error;
      }

      if (!shouldRetry) {
        console.log('Error not retryable:', error);
        throw error;
      }

      // For first attempt with overload error, try a quick retry
      if (attempt === 0 && isOverloadError) {
        console.log('Quick retry for overload error (attempt 1)');
        await new Promise(resolve => setTimeout(resolve, 500)); // Just 500ms delay
        continue;
      }

      // Optimized backoff strategy for faster responses
      let delay;
      if (isOverloadError) {
        // For overload errors, use shorter delays but still with jitter
        const jitter = Math.random() * 800; // Less randomness
        delay = (baseDelay * Math.pow(1.8, attempt)) + jitter; // Faster growth
        console.log(`Model overloaded - retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      } else if (isRateLimitError) {
        // For rate limit errors, use moderate backoff
        const jitter = Math.random() * 600;
        delay = (baseDelay * Math.pow(2, attempt)) + jitter;
        console.log(`Rate limited - retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      } else {
        // For other server errors, use quick backoff
        const jitter = Math.random() * 500;
        delay = (baseDelay * Math.pow(1.5, attempt)) + jitter;
        console.log(`Server error - retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      }

      // Cap maximum delay at 8 seconds for better UX
      delay = Math.min(delay, 8000);

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
    const startTime = Date.now();
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

      // Check circuit breaker
      if (!checkCircuitBreaker()) {
        throw {
          type: ERROR_TYPES.API_ERROR,
          message: 'Service temporarily unavailable due to overload. Please try again in a minute.',
          details: { error: { code: 503, status: 'CIRCUIT_BREAKER_OPEN' } }
        };
      }

      // Generate response with retry mechanism
      const response = await retryWithBackoff(async () => {
        return await this.generateResponse(sanitizedMessage, platformContext, sessionId);
      });

      // Record success for circuit breaker
      recordSuccess();

      // Update rate limit counters
      updateRateLimit();

      const responseTime = Date.now() - startTime;
      console.log(`✅ Gemini API response received in ${responseTime}ms`);

      return response;
    } catch (error) {
      console.error('Gemini API Error Details:', {
        type: error.type,
        message: error.message,
        details: error.details,
        stack: error.stack
      });

      // Record failure for circuit breaker
      recordFailure(error);

      const responseTime = Date.now() - startTime;
      console.log(`❌ Gemini API failed after ${responseTime}ms`);

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

    console.log('Making Gemini API request to:', this.apiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
    });

    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }),
      timeoutPromise
    ]);

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });

      // Enhanced error detection for overload situations
      const isOverloadError = response.status === 503 ||
        (errorData.error &&
          (errorData.error.message?.toLowerCase().includes('overloaded') ||
            errorData.error.message?.toLowerCase().includes('unavailable') ||
            errorData.error.status === 'UNAVAILABLE'));

      if (isOverloadError) {
        console.log('Detected model overload error, will retry with backoff');
      }

      throw {
        type: ERROR_TYPES.API_ERROR,
        message: `API request failed: ${response.status} ${response.statusText}`,
        details: { error: { code: response.status, status: response.statusText, ...errorData.error } }
      };
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini API response format:', data);
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
    console.log('Generating fallback response for error:', error);

    // Check for specific API error codes
    if (error.details && error.details.error) {
      const apiError = error.details.error;

      // Handle model overload specifically with more helpful messages
      if (apiError.code === 503 ||
        (apiError.status === 'UNAVAILABLE') ||
        (apiError.message && apiError.message.toLowerCase().includes('overloaded'))) {
        return "I'm experiencing high demand right now! The AI service is temporarily overloaded. Please try your question again in a few seconds - I'll be right back to help you with your food delivery needs!";
      }

      // Handle quota exceeded
      if (apiError.code === 429) {
        return "I've reached my usage limit for now. Please try again in a few minutes, and I'll be happy to help you find great food options!";
      }

      // Handle bad request errors
      if (apiError.code === 400) {
        return "I had trouble understanding your request. Could you please rephrase your question? I'm here to help with restaurants, orders, and food delivery!";
      }

      // Handle authentication errors
      if (apiError.code === 401 || apiError.code === 403) {
        return "I'm having authentication issues with my AI service. Please try again in a moment, or contact support if this continues.";
      }

      // Handle circuit breaker open state
      if (apiError.status === 'CIRCUIT_BREAKER_OPEN') {
        return "I'm temporarily pausing requests due to service overload. Please try again in 30 seconds - I'll be back to help you soon!";
      }
    }

    const fallbackResponses = {
      [ERROR_TYPES.NETWORK_ERROR]: "I'm having trouble connecting right now. Please check your internet connection and try again.",
      [ERROR_TYPES.API_ERROR]: "I'm experiencing some technical difficulties. Please try asking your question again in a few seconds.",
      [ERROR_TYPES.RATE_LIMIT_ERROR]: "I'm receiving too many requests right now. Please wait a moment before trying again.",
      [ERROR_TYPES.VALIDATION_ERROR]: "I didn't understand that message. Could you please rephrase your question?",
      default: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment, or contact our support team at support@foodify.com for immediate assistance."
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

  /**
   * Gets current circuit breaker status
   * @returns {Object} - Circuit breaker information
   */
  getCircuitBreakerStatus() {
    return {
      state: CIRCUIT_BREAKER.state,
      failureCount: CIRCUIT_BREAKER.failureCount,
      maxFailures: CIRCUIT_BREAKER.maxFailures,
      lastFailureTime: CIRCUIT_BREAKER.lastFailureTime,
      resetTimeout: CIRCUIT_BREAKER.resetTimeout,
      canMakeRequest: checkCircuitBreaker()
    };
  }

  /**
   * Manually resets the circuit breaker (for testing/admin purposes)
   */
  resetCircuitBreaker() {
    CIRCUIT_BREAKER.state = 'CLOSED';
    CIRCUIT_BREAKER.failureCount = 0;
    CIRCUIT_BREAKER.lastFailureTime = 0;
    console.log('Circuit breaker manually reset');
  }
}

// Export singleton instance
export default new GeminiService();