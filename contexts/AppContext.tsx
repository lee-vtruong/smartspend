import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  Page, Wallet, Transaction, Budget, Goal, Achievement, ChatMessage, 
  DebtLoanItem, SystemUser, Notification, TransactionCategory, 
  Language, CurrencyCode, TravelMode, NotificationSettings
} from '../types';
import { 
  MOCK_ACHIEVEMENTS, INITIAL_TRANSACTION_CATEGORIES,
  CURRENCY_RATES, iconMap
} from '../constants';
import { apiService } from '../services/apiService';
import Toast, { ToastType } from '../components/Toast';
// IMPORT DEFAULT ICON ĐỂ DỰ PHÒNG (QUAN TRỌNG)
import { DefaultIcon } from '../components/Icons';

import vi from '../i18n/vi.json'; 
import en from '../i18n/en.json';

const translations: any = { vi, en };

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalTransactions: number;
  revenue: number;
  monthlyRevenue: { month: string; revenue: number }[]; 
}

interface AppContextType {
  // --- UI & Settings ---
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  language: Language;
  changeLanguage: (lang: Language) => void;
  theme: 'light' | 'dark' | 'special';
  changeTheme: (theme: 'light' | 'dark' | 'special') => void;
  t: (key: string, params?: any) => string;
  showToast: (message: string, type?: ToastType) => void;

  // --- Auth & User ---
  user: any;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<any>;
  setPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  handleUpdateAvatar: () => Promise<void>;
  handleResetPassword: (email: string) => Promise<void>;
  handleChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  toggleUserLock: (id: string) => Promise<void>;
  
  // --- Data: Wallets & Transactions ---
  wallets: Wallet[];
  transactions: Transaction[];
  transactionCategories: TransactionCategory[];
  handleAddWallet: (wallet: Omit<Wallet, 'id' | 'icon'>) => Promise<void>;
  handleEditWallet: (wallet: Wallet) => Promise<void>;
  handleDeleteWallet: (id: string) => Promise<void>;
  handleAddTransaction: (tx: Omit<Transaction, 'id' | 'icon'>) => Promise<void>;
  handleUpdateTransaction: (tx: Transaction) => void;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleWalletTransfer: (from: string, to: string, amount: number, date: string, note?: string) => Promise<void>;
  handleAddCategory: (cat: any) => Promise<void>;
  handleEditCategory: (originalName: string, data: any) => Promise<void>;
  handleDeleteCategory: (name: string, reassignTo: string) => Promise<void>;
  exportData: () => Promise<void>;

  // --- Data: Planning (Budgets, Goals, Debts) ---
  budgets: Budget[];
  goals: Goal[];
  debtsLoans: DebtLoanItem[];
  handleAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  handleDeleteBudget: (id: string) => Promise<void>;
  handleAddGoal: (goal: Omit<Goal, 'id' | 'icon'> & { icon: string }) => Promise<void>;
  handleFundGoal: (id: string, amount: number, wallet: string) => Promise<void>;
  handleAddDebtLoan: (item: Omit<DebtLoanItem, 'id' | 'paidAmount'>) => Promise<void>;
  handleRecordPayment: (id: string, amount: number, walletName: string) => Promise<void>;

  // --- Features: Groups, Chatbot, Achievements, Travel ---
  groups: any[];
  handleAddGroup: (group: any) => Promise<void>;
  handleAddGroupTransaction: (groupId: string, data: any) => Promise<void>;
  
  achievements: Achievement[];
  unlockedAchievement: Achievement | null;
  setUnlockedAchievement: (achievement: Achievement | null) => void;
  
  isChatbotOpen: boolean;
  setChatbotOpen: (open: boolean) => void;
  chatHistory: ChatMessage[];
  handleSendChatMessage: (msg: string) => Promise<void>;
  isChatbotLoading: boolean;

  travelMode: TravelMode;
  toggleTravelMode: () => void;
  setTravelCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number, useWalletCurrency?: boolean, currency?: string) => string;

  // --- Notifications & Admin ---
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (key: string, value: boolean) => Promise<void>;
  sendNotification: (title: string, message: string) => Promise<void>;
  
  systemUsers: SystemUser[];
  adminStats: AdminStats | null;
  fetchInitialData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- 1. STATE DECLARATIONS ---
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Data State
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [debtsLoans, setDebtsLoans] = useState<DebtLoanItem[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactionCategories, setTransactionCategories] = useState<TransactionCategory[]>(INITIAL_TRANSACTION_CATEGORIES);
  const [groups, setGroups] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // UI State
  const [language, setLanguage] = useState<Language>('vi');
  const [theme, setTheme] = useState<'light' | 'dark' | 'special'>(
    (localStorage.getItem('smartspend_theme') as any) || 'dark'
  );
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Auth State
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('smartspend_user') || 'null'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('smartspend_token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Feature State
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>({ enabled: false, currency: 'USD' });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
      emailWeekly: true,
      emailMonthly: true,
      pushBudget: true,
      pushBills: true,
      pushDebts: true,
  });

  // --- 2. EFFECTS & HELPERS ---
  const showToast = (message: string, type: ToastType = 'info') => setToast({ message, type });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'special');
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'special') root.classList.add('special');
    localStorage.setItem('smartspend_theme', theme);
  }, [theme]);

  const t = useCallback((key: string, params?: any) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') return key;

    if (params) {
      Object.keys(params).forEach(p => {
        value = (value as string).replace(`{{${p}}}`, params[p]);
      });
    }

    return value;
  }, [language]);

  const formatCurrency = useCallback((amount: number, useWalletCurrency = false, currency?: string) => {
    const curr = currency || (travelMode.enabled ? travelMode.currency : 'VND');
    const rate = CURRENCY_RATES[curr as CurrencyCode] || 1;
    const value = curr === 'VND' ? amount : amount / rate;
    
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: curr,
    }).format(value);
  }, [language, travelMode]);

  // --- 3. DATA FETCHING (ĐÃ SỬA LỖI ICON VÀ FETCH) ---
  const initAppData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // Dùng Promise.allSettled để tránh sập toàn bộ nếu 1 API lỗi
      const results = await Promise.allSettled([
        apiService.getWallets(),
        apiService.getTransactions(),
        apiService.getBudgets(),
        apiService.getGoals(),
        apiService.getDebts(),
        apiService.getGroups(),
        apiService.getNotifications(),
        apiService.getCustomCategories(),
      ]);

      // Helper function để lấy data an toàn từ kết quả Promise
      const getData = (index: number, defaultVal: any = []) => 
        results[index].status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<any>).value : defaultVal;

      // --- XỬ LÝ WALLETS (KÈM ICON FALLBACK) ---
      const walletsData = getData(0);
      setWallets(walletsData.map((w: any) => {
          const iconKey = w.type + 'Icon';
          const IconComponent = (iconMap && iconMap[iconKey]) ? iconMap[iconKey] : DefaultIcon;
          return {
              ...w,
              icon: React.createElement(IconComponent, { className: 'w-8 h-8' })
          };
      }));

      // --- XỬ LÝ CATEGORIES ---
      const customCats = getData(7);
      const allCats = [...INITIAL_TRANSACTION_CATEGORIES, ...customCats];
      setTransactionCategories(allCats);

      // --- XỬ LÝ TRANSACTIONS (KÈM ICON FALLBACK) ---
      const txData = getData(1);
      setTransactions(txData.map((tx: any) => {
          const cat = allCats.find(c => c.name === tx.category);
          const iconKey = cat?.iconName || 'FoodIcon';
          const IconComponent = (iconMap && iconMap[iconKey]) ? iconMap[iconKey] : DefaultIcon;
          return {
              ...tx,
              icon: React.createElement(IconComponent, { className: 'w-6 h-6' })
          };
      }));

      // --- CÁC DỮ LIỆU KHÁC ---
      setBudgets(getData(2));
      
      // Goals
      const goalsData = getData(3);
      setGoals(goalsData.map((g: any) => {
          const iconKey = g.iconName || 'PiggyBankIcon';
          const IconComponent = (iconMap && iconMap[iconKey]) ? iconMap[iconKey] : DefaultIcon;
          return {
              ...g,
              icon: React.createElement(IconComponent, { className: 'w-8 h-8' })
          };
      }));

      setDebtsLoans(getData(4));
      setGroups(getData(5));
      setNotifications(getData(6));

      // Admin Data
      if (user?.isAdmin) {
          try {
            const [users, stats] = await Promise.all([
                apiService.adminGetUsers(),
                apiService.adminGetStats()
            ]);
            setSystemUsers(users);
            setAdminStats(stats);
          } catch (err) {
            console.error("Lỗi tải dữ liệu Admin:", err);
          }
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      // Không throw error ở đây để tránh crash app, chỉ log
    }
  }, [isAuthenticated, user?.isAdmin]);

  useEffect(() => {
    if (isAuthenticated) initAppData();
  }, [isAuthenticated, initAppData]);

  // --- 4. AUTH ACTIONS ---
  
  const login = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    try {
      const data = await apiService.login({ email, password: pass });
      
      if (data.user.status === 'locked') {
          throw new Error('Tài khoản đã bị khóa');
      }

      localStorage.setItem('smartspend_token', data.token);
      localStorage.setItem('smartspend_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      
      if (data.user.isAdmin) {
          setCurrentPage('adminDashboard'); 
      } else {
          setCurrentPage('dashboard');      
      }

      showToast("Đăng nhập thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Đăng nhập thất bại", "error");
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setIsLoadingAuth(true);
    try {
      const data = await apiService.loginWithGoogle(idToken);
      
      if (data.user) {
        if (data.user.status === 'locked') {
           throw new Error('Tài khoản đã bị khóa');
        }

        localStorage.setItem('smartspend_token', data.token);
        localStorage.setItem('smartspend_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);

        if (!data.user.hasPassword) {
            window.history.pushState({}, '', '/create-password');
            setCurrentPage('createPassword');
        } else {
            window.history.pushState({}, '', '/');
            setCurrentPage('dashboard');
        }

        return data;
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      showToast(error.message || "Đăng nhập Google thất bại", "error");
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const setPassword = async (newPassword: string) => {
    try {
      await apiService.setPassword(newPassword);
      showToast("Tạo mật khẩu thành công!", "success");
      
      const updatedUser = { ...user, hasPassword: true };
      setUser(updatedUser);
      localStorage.setItem('smartspend_user', JSON.stringify(updatedUser));

      window.history.pushState({}, '', '/');
      setCurrentPage('dashboard');

    } catch (error: any) {
      showToast(error.message || "Không thể tạo mật khẩu", "error");
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await apiService.signup(name, email, password);
    showToast("Đăng ký thành công! Hãy đăng nhập.", "success");
  };  


  const logout = () => {
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
    
    setIsAuthenticated(false);
    setUser(null);
    setGroups([]);
    setTransactions([]);
    setWallets([]);
    setBudgets([]);
    setGoals([]);
    setCurrentPage('dashboard'); 
    showToast("Đã đăng xuất");
  };

  const updateProfile = async (name: string, email: string) => { 
    const updatedUser = await apiService.updateProfile({name, email}); 
    setUser(updatedUser); 
    localStorage.setItem('smartspend_user', JSON.stringify(updatedUser));
    showToast("Cập nhật profile thành công", "success");
  };

  const handleUpdateAvatar = async () => { 
    const result = await apiService.uploadAvatar(); 
    const updatedUser = { ...user, avatar: result.avatarUrl };
    setUser(updatedUser); 
    localStorage.setItem('smartspend_user', JSON.stringify(updatedUser));
    showToast("Cập nhật avatar thành công", "success");
  };

  const handleResetPassword = async (email: string) => { 
    await apiService.resetPassword(email); 
    showToast("Đã gửi email đặt lại mật khẩu", "success");
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => { 
    await apiService.changePassword({oldPassword, newPassword}); 
    showToast("Đổi mật khẩu thành công", "success");
  };

  // --- 5. FUNCTIONAL ACTIONS (FIXED ICON SAFE) ---

  const handleAddWallet = async (data: any) => {
    try {
      const newWalletData = await apiService.addWallet(data);
      
      const iconKey = newWalletData.type + 'Icon';
      const IconComponent = (iconMap && iconMap[iconKey]) ? iconMap[iconKey] : DefaultIcon;

      setWallets((prevWallets) => [
        ...prevWallets, 
        { 
          ...newWalletData, 
          icon: React.createElement(IconComponent, { className: 'w-8 h-8' })
        }
      ]);
      showToast("Đã thêm ví mới", "success");
    } catch (error: any) {
      console.error("Lỗi thêm ví:", error);
      showToast(error.message || "Không thể thêm ví, vui lòng thử lại!", "error");
      throw error;
    }
  };

  const handleEditWallet = async (wallet: Wallet) => {
    await apiService.editWallet(wallet.id, wallet);
    await initAppData();
    showToast("Cập nhật ví thành công", "success");
  };

  const handleDeleteWallet = async (id: string) => {
    await apiService.deleteWallet(id);
    await initAppData();
    showToast("Đã xóa ví", "success");
  };
  const handleWalletTransfer = async (from: string, to: string, amount: number, date: string, note?: string) => {
    try {
        await apiService.transferMoney({ 
            fromWalletName: from, 
            toWalletName: to, 
            amount, 
            date, 
            note 
        });
        await initAppData(); 
        showToast("Chuyển tiền thành công", "success");
    } catch (error: any) {
        showToast(error.message || "Lỗi chuyển tiền", "error");
    }
  };

  const handleAddTransaction = async (data: any) => {
    try {
      const newTransactionData = await apiService.addTransaction(data);
      
      const allCats = [...INITIAL_TRANSACTION_CATEGORIES, ...transactionCategories.filter(c => !INITIAL_TRANSACTION_CATEGORIES.some(ic => ic.name === c.name))];
      const cat = allCats.find(c => c.name === newTransactionData.category);
      
      const iconKey = cat?.iconName || 'FoodIcon';
      const IconComponent = (iconMap && iconMap[iconKey]) ? iconMap[iconKey] : DefaultIcon;

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        {
          ...newTransactionData,
          icon: React.createElement(IconComponent, { className: 'w-6 h-6' })
        }
      ]);
      
      if (newTransactionData.type === 'expense') {
        setBudgets((prevBudgets) => 
          prevBudgets.map(budget => 
            budget.category === newTransactionData.category 
              ? { ...budget, spent: budget.spent + newTransactionData.amount }
              : budget
          )
        );
      }
      showToast("Giao dịch đã được ghi lại", "success");
    } catch (error: any) {
      console.error("❌ [AppContext] Lỗi thêm giao dịch:", error);
      showToast(error.message || "Không thể thêm giao dịch!", "error");
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      
      await initAppData();
      
      showToast("Đã xóa giao dịch", "success");
    } catch (error: any) {
      console.error("Lỗi xóa giao dịch:", error);
      showToast(error.message || "Không thể xóa giao dịch", "error");
    }
  };

  const handleUpdateTransaction = async (tx: Transaction) => {
    try {
      await apiService.updateTransaction(tx.id, tx);

      setTransactions((prev) => 
        prev.map((t) => (t.id === tx.id ? { ...t, ...tx } : t))
      );

      await initAppData();

      showToast("Cập nhật giao dịch thành công", "success");
    } catch (error: any) {
      console.error("Lỗi cập nhật giao dịch:", error);
      showToast(error.message || "Không thể cập nhật giao dịch", "error");
    }
  };

  const handleAddBudget = async (data: any) => {
    await apiService.addBudget(data);
    await initAppData();
    showToast("Đã thêm ngân sách", "success");
  };

  const handleDeleteBudget = async (id: string) => {
    await apiService.deleteBudget(id);
    await initAppData();
    showToast("Đã xóa ngân sách", "success");
  };

  const handleAddGoal = async (data: any) => {
    await apiService.addGoal({...data, iconName: data.icon});
    await initAppData();
    showToast("Đã thêm mục tiêu", "success");
  };

  const handleFundGoal = async (id: string, amount: number, wallet: string) => {
    await apiService.fundGoal(id, { amount, walletName: wallet });
    await initAppData();
    showToast("Đã nạp tiền tiết kiệm", "success");
  };

  const handleAddDebtLoan = async (data: any) => {
    try {
      await apiService.addDebt(data);
      await initAppData(); 
      
      showToast("Đã thêm khoản mới thành công", "success");
    } catch (error: any) {
      console.error("Lỗi thêm khoản nợ:", error);
      showToast(error.message || "Không thể thêm khoản nợ", "error");
    }
  };

  const handleRecordPayment = async (id: string, amount: number, walletName: string) => {
    try {
        await apiService.recordDebtPayment(id, amount, walletName);
        await initAppData(); 
        showToast("Đã ghi nhận thanh toán", "success");
    } catch (error: any) {
        showToast(error.message || "Lỗi ghi nhận thanh toán", "error");
    }
  };

  const handleAddGroup = async (data: any) => {
    await apiService.addGroup(data);
    await initAppData();
    showToast("Đã tạo nhóm mới", "success");
  };

  const handleAddGroupTransaction = async (groupId: string, data: any) => {
    try {
      await apiService.addGroupTransaction(groupId, data);
      await initAppData();
      showToast("Đã thêm chi tiêu vào nhóm!", "success");
    } catch (error: any) {
      showToast(error.message || "Lỗi thêm giao dịch nhóm", "error");
    }
  };

  const toggleUserLock = async (id: string) => {
    await apiService.adminToggleUserLock(id);
    await initAppData();
    showToast("Đã cập nhật trạng thái người dùng", "success");
  };

  const handleAddCategory = async (data: any) => {
    await apiService.addCategory(data);
    await initAppData();
    showToast("Đã thêm danh mục", "success");
  };

  const handleEditCategory = async (name: string, data: any) => {
    await apiService.editCategory(name, data);
    await initAppData();
    showToast("Đã cập nhật danh mục", "success");
  };

  const handleDeleteCategory = async (name: string, reassignTo: string) => {
    await apiService.deleteCategory(name, reassignTo);
    await initAppData();
    showToast("Đã xóa danh mục", "success");
  };

  const exportData = async () => {
    await apiService.exportTransactions();
    showToast("Đã xuất file thành công", "success");
  };

  const handleSendChatMessage = async (msg: string) => {
    const userMsg: ChatMessage = { role: 'user', parts: [{ text: msg }] };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatbotLoading(true);
    try {
      const context = { 
        balance: wallets.reduce((s, w) => s + w.balance, 0),
        budgets: budgets.map(b => `${b.category}: ${b.spent}/${b.limit}`)
      };
      const response = await apiService.chatWithAI(msg, context);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Có lỗi xảy ra khi kết nối AI." }] }]);
    } finally {
      setIsChatbotLoading(false);
    }
  };

  const sendNotification = async (title: string, message: string) => {
    try {
        await apiService.adminBroadcastNotification(title, message);
        await initAppData();
        showToast("Đã gửi thông báo thành công!", "success");
    } catch (error: any) {
        console.error("Gửi thất bại:", error);
        showToast("Gửi thất bại: " + error.message, "error");
    }
  };

  const markNotificationsAsRead = async () => {
    await apiService.markNotificationsRead();
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    showToast("Đã đánh dấu tất cả thông báo đã đọc", "success");
  };

  const updateNotificationSettings = async (key: string, value: boolean) => {
    setNotificationSettings(prev => ({...prev, [key]: value}));
    showToast("Đã cập nhật cài đặt thông báo", "success");
  };

  const toggleTravelMode = () => setTravelMode(prev => ({ ...prev, enabled: !prev.enabled }));

  const setTravelCurrency = (currency: CurrencyCode) => setTravelMode(prev => ({ ...prev, currency }));

  // --- 6. RENDER PROVIDER ---
  return (
    <AppContext.Provider value={{
      // State
      currentPage, setCurrentPage, 
      wallets, transactions, budgets, goals, debtsLoans, 
      achievements, unlockedAchievement, setUnlockedAchievement,
      systemUsers, adminStats,
      notifications, 
      unreadNotificationCount: notifications.filter(n => !n.read).length,
      transactionCategories, 
      user, isAuthenticated, isLoadingAuth,
      language, changeLanguage: setLanguage, t,
      theme, changeTheme: setTheme,
      showToast,
      groups, 
      
      // Features
      isChatbotOpen, setChatbotOpen, chatHistory, handleSendChatMessage, isChatbotLoading,
      travelMode, toggleTravelMode, setTravelCurrency,
      formatCurrency, 
      exportData, 
      notificationSettings, updateNotificationSettings,
      
      // Auth Actions
      login, signup, logout, loginWithGoogle, setPassword,
      updateProfile, handleUpdateAvatar, handleResetPassword, handleChangePassword,

      // CRUD Actions
      fetchInitialData: initAppData,
      handleAddWallet, handleEditWallet, handleDeleteWallet,
      handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
      handleWalletTransfer, 
      handleAddBudget, handleDeleteBudget,
      handleAddGoal, handleFundGoal,
      handleAddDebtLoan, handleRecordPayment,
      handleAddGroup, handleAddGroupTransaction,
      toggleUserLock,
      handleAddCategory, handleEditCategory, handleDeleteCategory,
      markNotificationsAsRead, sendNotification,
    }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};