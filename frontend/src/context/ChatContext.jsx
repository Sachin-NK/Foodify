/**
 * Chat Context Provider
 * Manages chat state, conversation history, and AI interactions
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GeminiService from '../services/geminiService';
import PlatformContextService from '../services/platformContextService';

// Chat action types
const CHAT_ACTIONS = {
  SET_OPEN: 'SET_OPEN',
  SET_TYPING: 'SET_TYPING',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_QUICK_ACTIONS: 'SET_QUICK_ACTIONS',
  UPDATE_PLATFORM_CONTEXT: 'UPDATE_PLATFORM_CONTEXT',
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial chat state
const initialState = {
  isOpen: false,
  isTyping: false,
  messages: [],
  quickActions: [],
  platformContext: {},
  sessionId: null,
  error: null,
  lastActivity: null
};

// Chat reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_OPEN:
      return {
        ...state,
        isOpen: action.payload,
        error: action.payload ? state.error : null // Clear error when opening
      };

    case CHAT_ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };

    case CHAT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        lastActivity: new Date().toISOString()
      };

    case CHAT_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        )
      };

    case CHAT_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        lastActivity: null
      };

    case CHAT_ACTIONS.SET_QUICK_ACTIONS:
      return {
        ...state,
        quickActions: action.payload
      };

    case CHAT_ACTIONS.UPDATE_PLATFORM_CONTEXT:
      return {
        ...state,
        platformContext: action.payload
      };

    case CHAT_ACTIONS.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload
      };

    case CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isTyping: false
      };

    case CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Chat Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize session on mount
  useEffect(() => {
    const sessionId = uuidv4();
    dispatch({ type: CHAT_ACTIONS.SET_SESSION_ID, payload: sessionId });
    
    // Add welcome message
    const welcomeMessage = {
      id: uuidv4(),
      text: "Hello! I'm Foodie, your virtual assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: welcomeMessage });
    
    // Set initial quick actions
    updateQuickActions();
  }, []);

  // Update platform context when page changes
  useEffect(() => {
    const updateContext = async () => {
      try {
        const context = await PlatformContextService.getFullPlatformContext();
        dispatch({ type: CHAT_ACTIONS.UPDATE_PLATFORM_CONTEXT, payload: context });
        updateQuickActions();
      } catch (error) {
        console.warn('Failed to update platform context:', error);
      }
    };

    updateContext();
    
    // Listen for route changes
    const handleRouteChange = () => {
      updateContext();
    };

    // Listen for storage changes (cart updates, auth changes)
    const handleStorageChange = (e) => {
      if (['user', 'token', 'cart'].includes(e.key)) {
        updateContext();
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update quick actions based on current context
  const updateQuickActions = useCallback(() => {
    const actions = PlatformContextService.getContextualQuickActions();
    dispatch({ type: CHAT_ACTIONS.SET_QUICK_ACTIONS, payload: actions });
  }, []);

  // Toggle chat open/closed
  const toggleChat = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.SET_OPEN, payload: !state.isOpen });
  }, [state.isOpen]);

  // Open chat
  const openChat = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.SET_OPEN, payload: true });
  }, []);

  // Close chat
  const closeChat = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.SET_OPEN, payload: false });
  }, []);

  // Send message to AI
  const sendMessage = useCallback(async (text, type = 'text') => {
    if (!text.trim()) return;

    // Clear any existing errors
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });

    // Add user message
    const userMessage = {
      id: uuidv4(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type
    };

    dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: userMessage });

    // Set typing indicator
    dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: true });

    try {
      // Get current platform context
      const platformContext = await PlatformContextService.getFullPlatformContext();
      dispatch({ type: CHAT_ACTIONS.UPDATE_PLATFORM_CONTEXT, payload: platformContext });

      // Send message to Gemini API
      const aiResponse = await GeminiService.sendMessage(
        text.trim(),
        platformContext,
        state.sessionId
      );

      // Add AI response
      const botMessage = {
        id: uuidv4(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: botMessage });

      // Update quick actions based on new context
      updateQuickActions();

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        id: uuidv4(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'error'
      };

      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: errorMessage });
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message || 'Failed to send message' });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: false });
    }
  }, [state.sessionId, updateQuickActions]);

  // Handle quick action click
  const handleQuickAction = useCallback(async (action) => {
    switch (action.action) {
      case 'navigate':
        // Navigate to a specific route
        window.location.href = action.data;
        break;

      case 'search':
        // Perform a search
        await sendMessage(`Help me find ${action.data}`);
        break;

      case 'show_filters':
        await sendMessage('Show me the available filter options');
        break;

      case 'location_search':
        await sendMessage('Find restaurants near my location');
        break;

      case 'menu_help':
        await sendMessage('Can you recommend some popular items from this menu?');
        break;

      case 'delivery_info':
        await sendMessage('What are the delivery details for this restaurant?');
        break;

      case 'checkout_help':
        await sendMessage('I need help with the checkout process');
        break;

      case 'modify_order':
        await sendMessage('I want to modify my current order');
        break;

      case 'track_order':
        await sendMessage('Help me track my order');
        break;

      case 'contact_delivery':
        await sendMessage('I need to contact the delivery person');
        break;

      case 'login_help':
        await sendMessage('I need help logging into my account');
        break;

      case 'register_help':
        await sendMessage('I need help creating a new account');
        break;

      case 'account_help':
        await sendMessage('I need help with my account settings');
        break;

      case 'order_history':
        await sendMessage('Show me my recent orders');
        break;

      case 'contact_support':
        await sendMessage('I need to contact customer support');
        break;

      case 'faq':
        await sendMessage('Show me frequently asked questions');
        break;

      default:
        // Default to sending the action label as a message
        await sendMessage(action.label);
    }
  }, [sendMessage]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_MESSAGES });
    
    // Clear conversation history in Gemini service
    if (state.sessionId) {
      GeminiService.clearConversationHistory(state.sessionId);
    }

    // Add welcome message back
    const welcomeMessage = {
      id: uuidv4(),
      text: "Hello! I'm Foodie, your virtual assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: welcomeMessage });
    updateQuickActions();
  }, [state.sessionId, updateQuickActions]);

  // Update platform context manually
  const updatePlatformContext = useCallback(async (updates = {}) => {
    try {
      const context = await PlatformContextService.getFullPlatformContext();
      const updatedContext = { ...context, ...updates };
      
      dispatch({ type: CHAT_ACTIONS.UPDATE_PLATFORM_CONTEXT, payload: updatedContext });
      PlatformContextService.updateContext(updates);
      updateQuickActions();
    } catch (error) {
      console.warn('Failed to update platform context:', error);
    }
  }, [updateQuickActions]);

  // Get message count
  const getMessageCount = useCallback(() => {
    return state.messages.length;
  }, [state.messages.length]);

  // Get unread message count (messages since last time chat was opened)
  const getUnreadCount = useCallback(() => {
    // This would typically be stored in localStorage or state
    // For now, return 0 as we don't have a read/unread system
    return 0;
  }, []);

  // Check if chat has any user messages
  const hasUserMessages = useCallback(() => {
    return state.messages.some(msg => msg.sender === 'user');
  }, [state.messages]);

  // Get last message
  const getLastMessage = useCallback(() => {
    return state.messages[state.messages.length - 1] || null;
  }, [state.messages]);

  // Context value
  const contextValue = {
    // State
    isOpen: state.isOpen,
    isTyping: state.isTyping,
    messages: state.messages,
    quickActions: state.quickActions,
    platformContext: state.platformContext,
    sessionId: state.sessionId,
    error: state.error,
    lastActivity: state.lastActivity,

    // Actions
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    clearConversation,
    updatePlatformContext,
    updateQuickActions,

    // Utilities
    getMessageCount,
    getUnreadCount,
    hasUserMessages,
    getLastMessage
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;