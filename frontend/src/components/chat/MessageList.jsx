/**
 * MessageList Component
 * Scrollable container for chat messages with auto-scroll functionality
 */

import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ 
  messages = [], 
  isTyping = false, 
  className = '',
  autoScroll = true 
}) => {
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, isTyping, autoScroll]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, []);

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className={`flex-1 px-4 py-2 ${className}`}
    >
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.sender === 'user'}
            />
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <TypingIndicator key="typing-indicator" />
          )}
        </AnimatePresence>
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;