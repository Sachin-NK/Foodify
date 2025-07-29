/**
 * Unit tests for ChatContext
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from '../ChatContext';
import GeminiService from '../../services/geminiService';
import PlatformContextService from '../../services/platformContextService';

// Mock the services
vi.mock('../../services/geminiService');
vi.mock('../../services/platformContextService');
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-123'
}));

// Test component that uses the chat context
const TestComponent = () => {
  const {
    isOpen,
    isTyping,
    messages,
    quickActions,
    toggleChat,
    sendMessage,
    clearConversation,
    getMessageCount,
    hasUserMessages
  } = useChat();

  return (
    <div>
      <div data-testid="is-open">{isOpen.toString()}</div>
      <div data-testid="is-typing">{isTyping.toString()}</div>
      <div data-testid="message-count">{getMessageCount()}</div>
      <div data-testid="has-user-messages">{hasUserMessages().toString()}</div>
      <div data-testid="messages">
        {messages.map(msg => (
          <div key={msg.id} data-testid={`message-${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div data-testid="quick-actions">
        {quickActions.map(action => (
          <div key={action.id} data-testid={`action-${action.id}`}>
            {action.label}
          </div>
        ))}
      </div>
      <button onClick={toggleChat} data-testid="toggle-chat">
        Toggle Chat
      </button>
      <button onClick={() => sendMessage('Hello')} data-testid="send-message">
        Send Message
      </button>
      <button onClick={clearConversation} data-testid="clear-conversation">
        Clear Conversation
      </button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    // Mock PlatformContextService methods
    PlatformContextService.getFullPlatformContext.mockResolvedValue({
      page: { route: '/', title: 'Home' },
      user: { isAuthenticated: false },
      cart: { items: [], total: 0 }
    });

    PlatformContextService.getContextualQuickActions.mockReturnValue([
      { id: 'browse', label: 'Find Restaurants', action: 'navigate' },
      { id: 'popular', label: 'Popular Dishes', action: 'search' }
    ]);

    // Mock GeminiService methods
    GeminiService.sendMessage.mockResolvedValue('Hello! How can I help you?');
    GeminiService.clearConversationHistory.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
      expect(screen.getByTestId('is-typing')).toHaveTextContent('false');
      expect(screen.getByTestId('message-count')).toHaveTextContent('1'); // Welcome message
      expect(screen.getByTestId('has-user-messages')).toHaveTextContent('false');
    });

    // Should have welcome message
    expect(screen.getByTestId('message-bot')).toHaveTextContent(
      "Hello! I'm Foodie, your virtual assistant. How can I help you today?"
    );
  });

  it('should load quick actions on initialization', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('action-browse')).toHaveTextContent('Find Restaurants');
      expect(screen.getByTestId('action-popular')).toHaveTextContent('Popular Dishes');
    });
  });

  it('should toggle chat open/closed', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const toggleButton = screen.getByTestId('toggle-chat');

    // Initially closed
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');

    // Toggle open
    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('is-open')).toHaveTextContent('true');

    // Toggle closed
    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('should send message and receive AI response', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const sendButton = screen.getByTestId('send-message');

    // Send message
    act(() => {
      sendButton.click();
    });

    // Should show typing indicator
    await waitFor(() => {
      expect(screen.getByTestId('is-typing')).toHaveTextContent('true');
    });

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByTestId('is-typing')).toHaveTextContent('false');
      expect(screen.getByTestId('message-count')).toHaveTextContent('3'); // Welcome + user + bot
      expect(screen.getByTestId('has-user-messages')).toHaveTextContent('true');
    });

    // Check messages
    const userMessages = screen.getAllByTestId('message-user');
    const botMessages = screen.getAllByTestId('message-bot');

    expect(userMessages).toHaveLength(1);
    expect(userMessages[0]).toHaveTextContent('Hello');

    expect(botMessages).toHaveLength(2); // Welcome + response
    expect(botMessages[1]).toHaveTextContent('Hello! How can I help you?');

    // Verify service calls
    expect(GeminiService.sendMessage).toHaveBeenCalledWith(
      'Hello',
      expect.any(Object),
      'mock-uuid-123'
    );
  });

  it('should handle AI service errors gracefully', async () => {
    GeminiService.sendMessage.mockRejectedValue(new Error('API Error'));

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const sendButton = screen.getByTestId('send-message');

    // Send message
    act(() => {
      sendButton.click();
    });

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByTestId('is-typing')).toHaveTextContent('false');
    });

    // Should have error message
    const botMessages = screen.getAllByTestId('message-bot');
    expect(botMessages[1]).toHaveTextContent(
      "I'm sorry, I'm having trouble processing your request right now"
    );
  });

  it('should clear conversation', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Send a message first
    const sendButton = screen.getByTestId('send-message');
    act(() => {
      sendButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-count')).toHaveTextContent('3');
    });

    // Clear conversation
    const clearButton = screen.getByTestId('clear-conversation');
    act(() => {
      clearButton.click();
    });

    // Should only have welcome message
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    expect(screen.getByTestId('has-user-messages')).toHaveTextContent('false');

    // Should clear service history
    expect(GeminiService.clearConversationHistory).toHaveBeenCalledWith('mock-uuid-123');
  });

  it('should update platform context on route changes', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Wait for initial context load
    await waitFor(() => {
      expect(PlatformContextService.getFullPlatformContext).toHaveBeenCalled();
    });

    // Simulate route change
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Should update context again
    await waitFor(() => {
      expect(PlatformContextService.getFullPlatformContext).toHaveBeenCalledTimes(2);
    });
  });

  it('should update context on storage changes', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Wait for initial context load
    await waitFor(() => {
      expect(PlatformContextService.getFullPlatformContext).toHaveBeenCalled();
    });

    // Simulate storage change for cart
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }));
    });

    // Should update context
    await waitFor(() => {
      expect(PlatformContextService.getFullPlatformContext).toHaveBeenCalledTimes(2);
    });
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useChat must be used within a ChatProvider');

    consoleSpy.mockRestore();
  });

  it('should handle empty messages gracefully', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const { sendMessage } = useChat();

    // Try to send empty message
    await act(async () => {
      await sendMessage('');
    });

    // Should not add any new messages
    expect(screen.getByTestId('message-count')).toHaveTextContent('1'); // Only welcome message
    expect(GeminiService.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle whitespace-only messages', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const { sendMessage } = useChat();

    // Try to send whitespace-only message
    await act(async () => {
      await sendMessage('   ');
    });

    // Should not add any new messages
    expect(screen.getByTestId('message-count')).toHaveTextContent('1'); // Only welcome message
    expect(GeminiService.sendMessage).not.toHaveBeenCalled();
  });
});