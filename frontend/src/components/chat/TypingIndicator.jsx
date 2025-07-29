/**
 * TypingIndicator Component
 * Shows when AI is generating a response
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = ({ className = '' }) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex justify-start mb-4 ${className}`}
    >
      <div className="flex items-start space-x-2 max-w-[80%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>

        {/* Typing bubble */}
        <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg rounded-bl-sm">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              Foodie is typing
            </span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    ...dotTransition,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;