/**
 * ChatInterface Component
 * Main chat window container with header, messages, and input
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import QuickActions from './QuickActions';
import { useChat } from '../../context/ChatContext';

const ChatInterface = ({ 
  isOpen, 
  onClose, 
  className = '',
  position = 'bottom-right' 
}) => {
  const {
    messages,
    isTyping,
    quickActions,
    sendMessage,
    handleQuickAction,
    clearConversation,
    error
  } = useChat();

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when chat is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Position classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-24 left-6';
      case 'bottom-right':
        return 'bottom-24 right-6';
      case 'top-left':
        return 'top-24 left-6';
      case 'top-right':
        return 'top-24 right-6';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-24 right-6';
    }
  };

  const interfaceVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Chat Interface */}
          <motion.div
            variants={interfaceVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed ${getPositionClasses()} w-80 h-96 md:w-96 md:h-[500px] z-50 ${className}`}
          >
            <Card className="h-full shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Foodie Assistant</h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Online</span>
                        </div>
                        {error && (
                          <Badge variant="destructive" className="text-xs py-0 px-1">
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Clear conversation button */}
                    <Button
                      onClick={clearConversation}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-7 w-7"
                      title="Clear conversation"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>

                    {/* Close button */}
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-7 w-7"
                      aria-label="Close chat"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  className="flex-1"
                />

                {/* Quick Actions */}
                {quickActions.length > 0 && (
                  <QuickActions
                    actions={quickActions}
                    onActionClick={handleQuickAction}
                  />
                )}

                {/* Input */}
                <MessageInput
                  onSendMessage={sendMessage}
                  disabled={isTyping}
                  placeholder="Type your message..."
                />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatInterface;