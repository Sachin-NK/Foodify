/**
 * Chatbot Component
 * Main chatbot interface using ChatContext and AI services
 */

import React from 'react';
import ChatButton from './chat/ChatButton';
import ChatInterface from './chat/ChatInterface';
import { useChat } from '../context/ChatContext';

const Chatbot = () => {
  const {
    isOpen,
    toggleChat,
    closeChat,
    getUnreadCount,
    hasUserMessages
  } = useChat();

  const unreadCount = getUnreadCount();
  const hasUnread = unreadCount > 0;

  return (
    <>
      {/* Chat Toggle Button */}
      <ChatButton
        isOpen={isOpen}
        onClick={toggleChat}
        hasUnreadMessages={hasUnread}
        unreadCount={unreadCount}
      />

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isOpen}
        onClose={closeChat}
        position="bottom-right"
      />
    </>
  );
};

export default Chatbot;