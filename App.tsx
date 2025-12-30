// import React from 'react';
// import Sidebar from './components/Sidebar';
// import Header from './components/Header';
// import Dashboard from './pages/Dashboard';
// import Reports from './pages/Reports';
// import Premium from './pages/Premium';
// import Settings from './pages/Settings';
// import TransactionsPage from './pages/Transactions';
// import GroupsPage from './pages/Groups';
// import DebtsLoansPage from './pages/DebtsLoans';
// import AuthPage from './pages/AuthPage';
// import AchievementUnlockedModal from './components/AchievementUnlockedModal';
// import ChatbotModal from './components/ChatbotModal';
// import ChatbotFAB from './components/ChatbotFAB';
// import { useAppContext } from './contexts/AppContext';

// // Admin Pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import UserManagement from './pages/admin/UserManagement';
// import SystemReports from './pages/admin/SystemReports';
// import NotificationsManagement from './pages/admin/NotificationsManagement';

// const App: React.FC = () => {
//   const { 
//     currentPage, 
//     unlockedAchievement, 
//     setUnlockedAchievement,
//     isChatbotOpen,
//     setChatbotOpen,
//     chatHistory,
//     handleSendChatMessage,
//     isChatbotLoading,
//     isAuthenticated,
//     isLoadingAuth
//   } = useAppContext();

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'transactions':
//         return <TransactionsPage />;
//       case 'reports':
//         return <Reports />;
//       case 'groups':
//         return <GroupsPage />;
//       case 'debts':
//         return <DebtsLoansPage />;
//       case 'premium':
//         return <Premium />;
//       case 'settings':
//         return <Settings />;
//       // Admin pages
//       case 'adminDashboard':
//         return <AdminDashboard />;
//       case 'userManagement':
//         return <UserManagement />;
//       case 'systemReports':
//         return <SystemReports />;
//       case 'notificationsManagement':
//         return <NotificationsManagement />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   if (isLoadingAuth) {
//     return (
//       <div className="flex h-screen w-screen items-center justify-center bg-background">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <AuthPage />;
//   }

//   return (
//     <div className="flex h-screen bg-background text-text font-sans">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header />
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
//           <div className="container mx-auto px-6 py-8">
//             <div key={currentPage} className="animate-fade-in-up">
//               {renderPage()}
//             </div>
//           </div>
//         </main>
//       </div>
//       <AchievementUnlockedModal 
//         achievement={unlockedAchievement} 
//         onClose={() => setUnlockedAchievement(null)} 
//       />
//       <ChatbotModal
//         isOpen={isChatbotOpen}
//         onClose={() => setChatbotOpen(false)}
//         chatHistory={chatHistory}
//         onSend={handleSendChatMessage}
//         isLoading={isChatbotLoading}
//       />
//       <ChatbotFAB onClick={() => setChatbotOpen(true)} />
//     </div>
//   );
// };

// export default App;

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Premium from './pages/Premium';
import Settings from './pages/Settings';
import TransactionsPage from './pages/Transactions';
import GroupsPage from './pages/Groups';
import DebtsLoansPage from './pages/DebtsLoans';
import AuthPage from './pages/AuthPage';
import AchievementUnlockedModal from './components/AchievementUnlockedModal';
import ChatbotModal from './components/ChatbotModal';
import ChatbotFAB from './components/ChatbotFAB';
import { useAppContext } from './contexts/AppContext';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemReports from './pages/admin/SystemReports';
import NotificationsManagement from './pages/admin/NotificationsManagement';

// Thêm import mới
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const { 
    currentPage, 
    unlockedAchievement, 
    setUnlockedAchievement,
    isChatbotOpen,
    setChatbotOpen,
    isAuthenticated,
    isLoadingAuth,
    // Thêm các states cần thiết từ context
    transactions,
    budgets,
    goals
  } = useAppContext();

  // Thêm state cho chatbox ở đây (hoặc trong AppContext)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Xin chào! Tôi là Mony, trợ lý tài chính AI của bạn. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  // Hàm xử lý gửi tin nhắn chat
  const handleSendChatMessage = async (message: string) => {
    if (!message.trim() || isChatbotLoading) return;

    // Thêm tin nhắn người dùng
    const userMessage = { role: 'user' as const, content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatbotLoading(true);

    try {
      // Chuẩn bị context data
      const context = {
        transactions: transactions.slice(0, 10), // 10 giao dịch gần nhất
        budgets,
        goals,
        summary: {
          totalExpense: transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          totalIncome: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          balance: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0) -
            transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        }
      };

      console.log('Sending chat message:', { message, context });

      // Gọi API qua server
      const response = await apiService.chatWithAI(message, context);
      
      // Thêm phản hồi từ AI
      const aiMessage = { 
        role: 'assistant' as const, 
        content: response.text || "Xin lỗi, tôi không thể trả lời ngay bây giờ." 
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Thêm tin nhắn lỗi
      const errorMessage = { 
        role: 'assistant' as const, 
        content: `Xin lỗi, đã xảy ra lỗi: ${error.message || 'Không xác định'}. Vui lòng thử lại sau.` 
      };
      setChatMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsChatbotLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionsPage />;
      case 'reports':
        return <Reports />;
      case 'groups':
        return <GroupsPage />;
      case 'debts':
        return <DebtsLoansPage />;
      case 'premium':
        return <Premium />;
      case 'settings':
        return <Settings />;
      // Admin pages
      case 'adminDashboard':
        return <AdminDashboard />;
      case 'userManagement':
        return <UserManagement />;
      case 'systemReports':
        return <SystemReports />;
      case 'notificationsManagement':
        return <NotificationsManagement />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-background text-text font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            <div key={currentPage} className="animate-fade-in-up">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>
      <AchievementUnlockedModal 
        achievement={unlockedAchievement} 
        onClose={() => setUnlockedAchievement(null)} 
      />
      
      {/* Chatbot Modal với props đúng */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setChatbotOpen(false)}
        chatHistory={chatMessages}
        onSend={handleSendChatMessage}
        isLoading={isChatbotLoading}
      />
      
      <ChatbotFAB onClick={() => setChatbotOpen(true)} />
    </div>
  );
};

export default App;