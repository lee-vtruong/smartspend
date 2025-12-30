import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import Modal from './Modal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatbotModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t, transactions, budgets, goals } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Xin chào! Tôi là Mony, trợ lý tài chính AI của bạn. Tôi có thể giúp gì cho bạn?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context data
      const context = {
        transactions: transactions.slice(0, 10), // Last 10 transactions
        budgets,
        goals,
        totalTransactions: transactions.length,
        summary: {
          totalExpense: transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          totalIncome: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
        }
      };

      console.log("Sending to AI...", { message: input, context });

      // Call the backend API
      const response = await apiService.chatWithAI(input, context);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.text || "Xin lỗi, tôi không thể trả lời ngay bây giờ.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Xin lỗi, đã xảy ra lỗi: ${error.message}. Vui lòng thử lại sau.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('chatbot.title') || "Trợ lý AI Mony"}
    >
      <div className="flex flex-col h-[70vh]">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 rounded-lg mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-content rounded-br-none'
                    : 'bg-card border border-card-border rounded-bl-none'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                    </ReactMarkdown>
                </div>
                <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-content/70' : 'text-muted'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-card-border rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.placeholder') || "Nhập câu hỏi về tài chính của bạn..."}
            className="flex-1 px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-primary text-primary-content rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>

        {/* Quick suggestions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setInput("Tôi nên tiết kiệm như thế nào?")}
            className="text-xs bg-background hover:bg-card border border-card-border rounded-lg px-3 py-2 text-left transition-colors"
          >
            💡 Tiết kiệm thế nào?
          </button>
          <button
            onClick={() => setInput("Phân tích chi tiêu của tôi")}
            className="text-xs bg-background hover:bg-card border border-card-border rounded-lg px-3 py-2 text-left transition-colors"
          >
            📊 Phân tích chi tiêu
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChatbotModal;