import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Foodie, your virtual assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickReplies = [
    "Order Status",
    "Menu Help",
    "Delivery Info",
    "Payment Issues",
    "Restaurant Hours",
    "Contact Support"
  ];

  const botResponses = {
    "order status": "I can help you track your order! Please provide your order number and I'll check the status for you.",
    "menu help": "I'd be happy to help you with menu recommendations! What type of cuisine are you in the mood for?",
    "delivery info": "Our delivery typically takes 25-45 minutes depending on your location and restaurant preparation time. Free delivery on orders over Rs. 1500!",
    "payment issues": "I'm here to help with payment concerns. Common issues include: failed payments, refund requests, and payment method updates. What specific issue are you experiencing?",
    "restaurant hours": "Most restaurants on our platform operate from 10 AM to 11 PM. However, hours may vary by location. You can check specific restaurant hours on their menu page.",
    "contact support": "You can reach our support team at support@foodify.com or call us at +94 11 123 4567. We're available 24/7 to assist you!",
    "default": "I understand you're asking about that. Our support team can provide more detailed assistance. Would you like me to connect you with a human agent?"
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const userMessage = inputValue.toLowerCase();
      let botResponse = botResponses.default;
      
      // Check for keywords in user message
      for (const [key, response] of Object.entries(botResponses)) {
        if (key !== 'default' && userMessage.includes(key)) {
          botResponse = response;
          break;
        }
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    const newMessage = {
      id: messages.length + 1,
      text: reply,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = botResponses[reply.toLowerCase()] || botResponses.default;
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg chatbot-pulse"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-80 h-96 z-50"
          >
            <Card className="h-full shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span>Foodie Assistant</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs">Online</span>
                    </div>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.sender === 'bot' ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                            <span className="text-xs opacity-70">{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickReplies.map((reply, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 text-xs interactive-bounce"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="bg-orange-500 hover:bg-orange-600 text-white button-bounce"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;