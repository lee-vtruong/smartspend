import React, { useEffect } from 'react';
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
// 1. IMPORT TRANG CREATE PASSWORD
import CreatePassword from './pages/CreatePassword'; 

import AchievementUnlockedModal from './components/AchievementUnlockedModal';
import ChatbotModal from './components/ChatbotModal';
import ChatbotFAB from './components/ChatbotFAB';
import { useAppContext } from './contexts/AppContext';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemReports from './pages/admin/SystemReports';
import NotificationsManagement from './pages/admin/NotificationsManagement';

const App: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, // Cần cái này để xử lý URL
    unlockedAchievement, 
    setUnlockedAchievement,
    // 2. LẤY LOGIC CHATBOT TỪ CONTEXT (Không viết lại ở đây)
    isChatbotOpen,
    setChatbotOpen,
    chatHistory,
    handleSendChatMessage,
    isChatbotLoading,
    isAuthenticated,
    isLoadingAuth
  } = useAppContext();

  // 3. EFFECT XỬ LÝ URL (Sửa lỗi Google Login chuyển trang)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/create-password') {
      setCurrentPage('createPassword');
    }
  }, [setCurrentPage]);

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
      
      // 4. THÊM CASE CREATE PASSWORD
      case 'createPassword':
        return <CreatePassword />;

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
    <div className="flex h-screen bg-background text-text font-sans transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            {/* Thêm key để React biết khi nào cần vẽ lại component mới hoàn toàn */}
            <div key={currentPage} className="animate-fade-in-up">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Danh hiệu */}
      <AchievementUnlockedModal 
        achievement={unlockedAchievement} 
        onClose={() => setUnlockedAchievement(null)} 
      />
      
      {/* Chatbot Modal - Dùng data từ Context */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setChatbotOpen(false)}
        chatHistory={chatHistory}
        onSend={handleSendChatMessage}
        isLoading={isChatbotLoading}
      />
      
      <ChatbotFAB onClick={() => setChatbotOpen(true)} />
    </div>
  );
};

export default App;