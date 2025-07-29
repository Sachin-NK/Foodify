/**
 * Unit tests for GeminiService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GeminiService, { sanitizeUserInput, formatSystemPrompt, ERROR_TYPES } from '../geminiService';

// Mock fetch globally
global.fetch = vi.fn();

describe('GeminiService', () => {
  beforeEach(() => {
    // Reset fetch mock
    fetch.mockClear();

    // Clear conversation history
    GeminiService.conversationHistory.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sanitizeUserInput', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> world';
      const result = sanitizeUserInput(input);
      expect(result).toBe('Hello  world');
    });

    it('should remove javascript: protocols', () => {
      const input = 'Click javascript:alert("xss") here';
      const result = sanitizeUserInput(input);
      expect(result).toBe('Click  here');
    });

    it('should remove event handlers', () => {
      const input = 'Hello onclick="alert()" world';
      const result = sanitizeUserInput(input);
      expect(result).toBe('Hello  world');
    });

    it('should limit input length to 1000 characters', () => {
      const input = 'a'.repeat(1500);
      const result = sanitizeUserInput(input);
      expect(result.length).toBe(1000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeUserInput(null)).toBe('');
      expect(sanitizeUserInput(undefined)).toBe('');
      expect(sanitizeUserInput(123)).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeUserInput(input);
      expect(result).toBe('hello world');
    });
  });

  describe('formatSystemPrompt', () => {
    it('should create basic system prompt without context', () => {
      const prompt = formatSystemPrompt();
      expect(prompt).toContain('You are Foodie');
      expect(prompt).toContain('Foodify food delivery platform');
      expect(prompt).toContain('User: Not logged in');
    });

    it('should include page context', () => {
      const context = {
        page: { route: '/browse', title: 'Browse Restaurants' }
      };
      const prompt = formatSystemPrompt(context);
      expect(prompt).toContain('User is on: /browse (Browse Restaurants)');
    });

    it('should include authenticated user context', () => {
      const context = {
        user: { isAuthenticated: true, name: 'John Doe' }
      };
      const prompt = formatSystemPrompt(context);
      expect(prompt).toContain('User: John Doe');
    });

    it('should include cart context', () => {
      const context = {
        cart: {
          items: [{ id: 1 }, { id: 2 }],
          total: 1500,
          restaurant: { name: 'Pizza Palace' }
        }
      };
      const prompt = formatSystemPrompt(context);
      expect(prompt).toContain('Cart: 2 items, Total: Rs. 1500 from Pizza Palace');
    });

    it('should include current restaurant context', () => {
      const context = {
        currentRestaurant: { name: 'Burger King', cuisine: 'Fast Food' }
      };
      const prompt = formatSystemPrompt(context);
      expect(prompt).toContain('Viewing restaurant: Burger King (Fast Food)');
    });

    it('should include recent orders context', () => {
      const context = {
        recentOrders: [{ id: 1 }, { id: 2 }, { id: 3 }]
      };
      const prompt = formatSystemPrompt(context);
      expect(prompt).toContain('Recent orders: 3 orders');
    });
  });

  describe('sendMessage', () => {
    it('should validate input message', async () => {
      const response = await GeminiService.sendMessage('');
      expect(response).toContain('Message cannot be empty');
    });

    it('should validate non-string input', async () => {
      const response = await GeminiService.sendMessage(null);
      expect(response).toContain('Message is required');
    });

    it('should sanitize input before processing', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: 'Hello! How can I help you?' }]
            }
          }]
        })
      });

      const maliciousInput = 'Hello <script>alert("xss")</script>';
      await GeminiService.sendMessage(maliciousInput);

      // Check that the API was called with sanitized input
      const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).not.toContain('<script>');
    });

    it('should handle API success response', async () => {
      const mockResponse = 'Hello! How can I help you with your order?';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: mockResponse }]
            }
          }]
        })
      });

      const response = await GeminiService.sendMessage('Hello');
      expect(response).toBe(mockResponse);
    });

    it('should handle API error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' })
      });

      const response = await GeminiService.sendMessage('Hello');
      expect(response).toContain('technical difficulties');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await GeminiService.sendMessage('Hello');
      expect(response).toContain('trouble processing');
    });

    it('should update conversation history', async () => {
      const mockResponse = 'Hello! How can I help you?';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: mockResponse }]
            }
          }]
        })
      });

      await GeminiService.sendMessage('Hello', {}, 'test-session');

      const history = GeminiService.getConversationHistory('test-session');
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({ role: 'user', content: 'Hello' });
      expect(history[1]).toEqual({ role: 'assistant', content: mockResponse });
    });
  });

  describe('conversation history management', () => {
    it('should store conversation history by session', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ];

      GeminiService.updateConversationHistory('session1', messages);

      const history = GeminiService.getConversationHistory('session1');
      expect(history).toEqual(messages);
    });

    it('should return empty array for non-existent session', () => {
      const history = GeminiService.getConversationHistory('non-existent');
      expect(history).toEqual([]);
    });

    it('should limit conversation history to 50 messages', () => {
      const messages = Array.from({ length: 60 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`
      }));

      GeminiService.updateConversationHistory('session1', messages);

      const history = GeminiService.getConversationHistory('session1');
      expect(history).toHaveLength(50);
      expect(history[0].content).toBe('Message 10'); // First 10 should be removed
    });

    it('should clear conversation history', () => {
      GeminiService.updateConversationHistory('session1', [
        { role: 'user', content: 'Hello' }
      ]);

      GeminiService.clearConversationHistory('session1');

      const history = GeminiService.getConversationHistory('session1');
      expect(history).toEqual([]);
    });
  });

  describe('rate limiting', () => {
    it('should return rate limit status', () => {
      const status = GeminiService.getRateLimitStatus();

      expect(status).toHaveProperty('requestsThisMinute');
      expect(status).toHaveProperty('requestsThisHour');
      expect(status).toHaveProperty('maxPerMinute');
      expect(status).toHaveProperty('maxPerHour');
      expect(status).toHaveProperty('canMakeRequest');
    });
  });

  describe('fallback responses', () => {
    it('should provide appropriate fallback for network errors', () => {
      const error = { type: ERROR_TYPES.NETWORK_ERROR };
      const response = GeminiService.getFallbackResponse(error);
      expect(response).toContain('trouble connecting');
    });

    it('should provide appropriate fallback for API errors', () => {
      const error = { type: ERROR_TYPES.API_ERROR };
      const response = GeminiService.getFallbackResponse(error);
      expect(response).toContain('technical difficulties');
    });

    it('should provide appropriate fallback for rate limit errors', () => {
      const error = { type: ERROR_TYPES.RATE_LIMIT_ERROR };
      const response = GeminiService.getFallbackResponse(error);
      expect(response).toContain('too many requests');
    });

    it('should provide default fallback for unknown errors', () => {
      const error = { type: 'UNKNOWN_ERROR' };
      const response = GeminiService.getFallbackResponse(error);
      expect(response).toContain('support@foodify.com');
    });
  });
});