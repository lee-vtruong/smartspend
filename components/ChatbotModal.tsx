import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from './Modal';
import { ChatMessage } from '../types';

// 1. Định nghĩa Interface khớp với những gì App.tsx truyền vào
interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];       // Nhận lịch sử chat từ Context
  onSend: (msg: string) => Promise<void>; // Hàm gửi tin nhắn từ Context
  isLoading: boolean;               // Trạng thái loading từ Context
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ 
  isOpen, 
  onClose, 
  chatHistory, 
  onSend, 
  isLoading 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Tự động cuộn xuống cuối khi chatHistory thay đổi
  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  // 3. Xử lý gửi tin nhắn
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const msg = input;
    setInput(''); // Xóa ô nhập liệu ngay lập tức để trải nghiệm mượt hơn
    await onSend(msg); // Gọi hàm của cha (AppContext)
  };

  // Hàm xử lý gợi ý nhanh
  const handleQuickSuggestion = (text: string) => {
      if(isLoading) return;
      // Gửi luôn hoặc điền vào ô input (ở đây chọn gửi luôn cho tiện)
      onSend(text);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Trợ lý tài chính AI (Mony)"
    >
      <div className="flex flex-col h-[70vh] md:h-[600px]">
        
        {/* --- KHUNG HIỂN THỊ TIN NHẮN --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 rounded-xl border border-gray-100 mb-4">
          
          {/* Thông báo chào mừng nếu chưa có tin nhắn nào */}
          {chatHistory.length === 0 && (
             <div className="text-center text-gray-400 text-sm mt-10">
                <p>👋 Xin chào! Tôi có thể giúp bạn phân tích chi tiêu,</p>
                <p>lập ngân sách hoặc đưa ra lời khuyên tài chính.</p>
             </div>
          )}

          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {/* Render Markdown cho tin nhắn của AI (để hiển thị bảng, list đẹp hơn) */}
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Tùy chỉnh CSS cho các thẻ Markdown nếu cần
                            table: ({node, ...props}) => <table className="border-collapse table-auto w-full text-xs my-2" {...props} />,
                            th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100" {...props} />,
                            td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-500 underline" {...props} />
                        }}
                    >
                        {typeof msg.parts === 'object' ? msg.parts[0].text : (msg.content || "")}
                    </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* --- KHUNG NHẬP LIỆU --- */}
        <div className="space-y-3">
            {/* Gợi ý nhanh (Chỉ hiện khi không loading) */}
            {!isLoading && chatHistory.length < 2 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button onClick={() => handleQuickSuggestion("Tình hình tài chính tháng này thế nào?")} className="btn btn-xs btn-outline rounded-full whitespace-nowrap">📊 Tổng quan tháng này</button>
                    <button onClick={() => handleQuickSuggestion("Tôi nên tiết kiệm tiền như thế nào?")} className="btn btn-xs btn-outline rounded-full whitespace-nowrap">💡 Mẹo tiết kiệm</button>
                    <button onClick={() => handleQuickSuggestion("Phân tích các khoản chi tiêu lớn nhất")} className="btn btn-xs btn-outline rounded-full whitespace-nowrap">💰 Chi tiêu lớn</button>
                </div>
            )}

            <form onSubmit={handleSend} className="flex space-x-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 input input-bordered focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                autoFocus
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn btn-primary px-4"
            >
                {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                )}
            </button>
            </form>
        </div>
      </div>
    </Modal>
  );
};

export default ChatbotModal;