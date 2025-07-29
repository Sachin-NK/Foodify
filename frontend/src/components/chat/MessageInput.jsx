/**
 * MessageInput Component
 * Text input for user messages with auto-resize and keyboard shortcuts
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  maxLength = 1000,
  className = '' 
}) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Focus on textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isComposing) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    // Don't send if user is composing (IME input)
    if (isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              className="min-h-[40px] max-h-[120px] resize-none pr-12 text-sm border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400"
              aria-label="Type your message"
            />
            
            {/* Character count indicator */}
            {isNearLimit && (
              <div className={`absolute bottom-2 right-2 text-xs ${
                remainingChars <= 0 
                  ? 'text-red-500' 
                  : remainingChars <= 20 
                  ? 'text-orange-500' 
                  : 'text-gray-400'
              }`}>
                {remainingChars}
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled || isComposing}
            className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
};

export default MessageInput;