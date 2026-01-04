import { AIResponse, ChatMessage, Transaction, Budget, Goal } from '../types';
import { GoogleGenAI } from "@google/genai";

// This is a mock service. In a real application, this would make a call
// to a secure backend endpoint which then communicates with the Google Gemini API.
// The backend would handle prompt engineering and data aggregation.

export const getSpendingForecastAndSuggestions = (): Promise<AIResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const mockResponse: AIResponse = {
        summary: "Dựa trên phân tích, chi tiêu tháng tới của bạn được dự báo sẽ tương tự tháng này. Có một vài cơ hội để tối ưu hóa chi tiêu ở hạng mục Ăn uống và Mua sắm.",
        forecasts: [
          {
            category: "Ăn uống",
            predictedSpend: 4200000,
            confidenceInterval: [3800000, 4600000],
          },
          {
            category: "Mua sắm",
            predictedSpend: 2500000,
            confidenceInterval: [2100000, 2900000],
          },
          {
            category: "Di chuyển",
            predictedSpend: 950000,
            confidenceInterval: [800000, 1100000],
          },
        ],
        suggestions: [
          {
            title: "Tối ưu chi tiêu Ăn uống",
            description: "Bạn chi trung bình 250,000đ cho việc ăn ngoài vào cuối tuần. Hãy thử tự nấu ăn 1 ngày cuối tuần để tiết kiệm khoảng 10-15%.",
            priority: 'high',
          },
          {
            title: "Xem lại các gói đăng ký Mua sắm online",
            description: "Bạn có 3 gói đăng ký dịch vụ đang hoạt động. Hãy xem lại và hủy những gói không cần thiết để tiết kiệm chi phí.",
            priority: 'medium',
          },
          {
            title: "Sử dụng phương tiện công cộng",
            description: "Xem xét sử dụng xe buýt hoặc các phương tiện công cộng cho các quãng đường ngắn để giảm chi phí di chuyển hàng tháng.",
            priority: 'low',
          },
        ],
      };
      resolve(mockResponse);
    }, 1500); // Simulate 1.5 second delay
  });
};

export const getAIChatResponse = async (
    chatHistory: ChatMessage[],
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
): Promise<string> => {
    
    console.log("=== BẮT ĐẦU GỌI AI CHAT ===");
    
    try {
        // Kiểm tra API Key có tồn tại không
        const apiKey = process.env.API_KEY;
        console.log("1. Kiểm tra API Key:", apiKey ? "Đã tìm thấy Key (vui lòng không log chi tiết key vì bảo mật)" : "KHÔNG TÌM THẤY KEY!");

        const ai = new GoogleGenAI({ apiKey: apiKey! });

        // Tạo Prompt
        const lastMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text || '';
        const fullPrompt = `Dữ liệu: ${transactions.length} giao dịch. Câu hỏi: ${lastMessage}. Trả lời ngắn gọn tiếng Việt.`;
        
        console.log("2. Prompt gửi đi:", fullPrompt);

        // Gọi API
        console.log("3. Đang đợi Google phản hồi...");
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: fullPrompt,
        });

        // LOG KẾT QUẢ THÔ TỪ GOOGLE
        console.log("4. Phản hồi thô từ Google:", response);

        if (response && response.text) {
            console.log("5. Nội dung văn bản chiết xuất được:", response.text);
            return response.text;
        } else {
            console.warn("⚠️ Google trả về object nhưng không có thuộc tính .text");
            return "AI phản hồi trống (không có text).";
        }

    } catch (error: any) {
        // LOG LỖI CHI TIẾT
        console.error("❌ LỖI API AI:");
        console.error("- Message:", error.message);
        console.error("- Stack:", error.stack);
        
        if (error.message.includes("403")) return "Lỗi 403: Có thể API Key của bạn bị sai hoặc chưa bật quyền cho Gemini.";
        if (error.message.includes("429")) return "Lỗi 429: Bạn đã hết lượt dùng thử miễn phí trong lúc này.";
        
        return `Lỗi hệ thống: ${error.message}`;
    }
};