import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIChat({ user }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. I can help you build workflows, analyze markets, and create videos.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response (replace with real OpenAI API)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: 'I understand you want to ' + input + '. Let me help you with that...'
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-demon-red to-red-700 flex items-center justify-center animate-pulse">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold">AI Assistant</h3>
            <p className="text-xs text-gray-500">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-demon-red/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-demon-red/20 ml-auto'
                    : 'liquid-glass'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-gray-500"
          >
            <Bot size={16} />
            <span className="text-sm">Thinking...</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-demon-red rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-demon-red rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-demon-red rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-demon-red/50 outline-none transition-all"
        />
        <motion.button
          onClick={sendMessage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-demon-red to-red-700 hover-force"
        >
          <Send size={20} />
        </motion.button>
      </div>
    </div>
  );
}