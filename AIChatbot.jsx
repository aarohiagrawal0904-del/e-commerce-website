import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MessageSquare, X, Send, Bot, RefreshCw, Sparkles } from 'lucide-react';

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: `Hello! I am Aura, your Smart E-Commerce Assistant. ${
        user ? `Welcome back, ${user.name}! ` : 'Log in to track your order details. '
      }I can recommend premium gear or answer shipping inquiries. How can I help you today?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  const handleSubmit = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    
    const activeText = textOverride || message;
    if (!activeText.trim() || loading) return;

    // Clear input
    if (!textOverride) setMessage('');

    // Update history with User message
    const userMsg = { sender: 'user', text: activeText };
    setChatHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // If user is not logged in, we send a nice mock response or allow standard chat
      if (!user) {
        setTimeout(() => {
          setChatHistory((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: "I see you are not logged in! I can offer standard suggestions, but please log into your account so that I can look up your active order tracking, order items, and shipping status details dynamically."
            }
          ]);
          setLoading(false);
        }, 800);
        return;
      }

      // Call Gemini Chat endpoint
      const response = await api.post('/api/ai/chat', {
        message: activeText,
        history: chatHistory.slice(1) // exclude the initial welcome message from LLM history
      });

      if (response.data.success) {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'bot', text: response.data.response }
        ]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having a small connection issue with my main servers, but you can track your order timeline anytime in the My Orders panel!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setChatHistory([
      {
        sender: 'bot',
        text: `Hello! Chat session reset. I'm Aura, your AI e-commerce assistant. Ask me about popular products or shipping schedules!`
      }
    ]);
  };

  const quickQuestions = [
    "Track my orders",
    "Recommend electronics",
    "What are your bestsellers?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 rounded-full shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 text-white transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[500px] glass-panel border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up">
          
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-primary-950/80 via-primary-900/40 to-dark-900 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-primary-500/20 text-primary-400 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  Aura AI Assistant
                  <Sparkles className="w-3.5 h-3.5 ml-1.5 text-primary-400 animate-pulse" />
                </h3>
                <span className="text-[10px] text-primary-400 font-medium flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                  Powered by Gemini
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleReset}
                className="p-1.5 text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Reset Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-dark-950/20">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 border-primary-500 text-white rounded-tr-none'
                      : 'bg-dark-800 border-white/5 text-dark-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-dark-900/50 flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSubmit(null, q)}
                className="text-[11px] px-2.5 py-1 bg-white/5 hover:bg-primary-950/30 border border-white/5 hover:border-primary-500/30 text-dark-200 hover:text-primary-300 rounded-full transition-all"
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-white/5 bg-dark-900/80 flex items-center space-x-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about orders..."
              className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow transition-all duration-150 hover:shadow-primary-500/10 active:scale-95 disabled:opacity-50"
              disabled={loading || !message.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default AIChatbot;
