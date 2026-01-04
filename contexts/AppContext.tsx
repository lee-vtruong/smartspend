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

import vi from '../i18n/vi.json'; 
import en from '../i18n/en.json';

// Firebase imports
import { User as FirebaseUser } from 'firebase/auth';

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
  handleResetPassword: (email: string, pass: string) => Promise<void>;
  handleChangePassword: (old: string, newP: string) => Promise<void>;
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
  handleWalletTransfer: (from: string, to: string, amount: number, date: string) => Promise<void>;
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
  handleRecordPayment: (id: string, amount: number) => Promise<void>;

  // --- Features: Groups, Chatbot, Achievements, Travel ---
  groups: any[];
  handleAddGroup: (group: any) => Promise<void>;
  handleAddGroupTransaction: (groupId: string, data: any) => Promise<void>; // Đã khai báo ở đây
  
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

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'special');
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'special') root.classList.add('special');
    localStorage.setItem('smartspend_theme', theme);
  }, [theme]);

  // Translation helper
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

  // Currency helper
  const formatCurrency = useCallback((amount: number, useWalletCurrency = false, currency?: string) => {
    const curr = currency || (travelMode.enabled ? travelMode.currency : 'VND');
    const rate = CURRENCY_RATES[curr as CurrencyCode] || 1;
    const value = curr === 'VND' ? amount : amount / rate;
    
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: curr,
    }).format(value);
  }, [language, travelMode]);

  // --- 3. DATA FETCHING ---
  const initAppData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [
        walletsData, 
        txData, 
        budgetsData, 
        goalsData, 
        debtsData, 
        groupsData, 
        notifsData, 
        customCats
      ] = await Promise.all([
        apiService.getWallets(),
        apiService.getTransactions(),
        apiService.getBudgets(),
        apiService.getGoals(),
        apiService.getDebts(),
        apiService.getGroups(),
        apiService.getNotifications(),
        apiService.getCustomCategories(),
      ]);

      setWallets(walletsData.map((w: any) => ({
          ...w,
          icon: React.createElement(iconMap[w.type + 'Icon'] || iconMap.FoodIcon, { className: 'w-8 h-8' })
      })));

      const allCats = [...INITIAL_TRANSACTION_CATEGORIES, ...customCats];
      setTransactionCategories(allCats);

      setTransactions(txData.map((tx: any) => {
          const cat = allCats.find(c => c.name === tx.category);
          return {
              ...tx,
              icon: React.createElement(iconMap[cat?.iconName || 'FoodIcon'], { className: 'w-6 h-6' })
          };
      }));

      setBudgets(budgetsData);
      setGoals(goalsData.map((g: any) => ({
          ...g,
          icon: React.createElement(iconMap[g.iconName || 'PiggyBankIcon'], { className: 'w-8 h-8' })
      })));
      setDebtsLoans(debtsData);
      setGroups(groupsData);
      setNotifications(notifsData);

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
    setCurrentPage('dashboard'); 
    showToast("Đã đăng xuất");
  };

  // --- 5. FUNCTIONAL ACTIONS ---

  const handleAddWallet = async (data: any) => {
    try {
      const newWalletData = await apiService.addWallet(data);
      setWallets((prevWallets) => [
        ...prevWallets, 
        { 
          ...newWalletData, 
          icon: React.createElement(iconMap[newWalletData.type + 'Icon'] || iconMap.FoodIcon, { className: 'w-8 h-8' })
        }
      ]);
      showToast("Đã thêm ví mới", "success");
    } catch (error: any) {
      console.error("Lỗi thêm ví:", error);
      showToast(error.message || "Không thể thêm ví, vui lòng thử lại!", "error");
      throw error;
    }
  };

  const handleWalletTransfer = async (from: string, to: string, amount: number, date: string) => {
    await apiService.transferMoney({ fromWalletName: from, toWalletName: to, amount, date });
    await initAppData();
    showToast("Chuyển tiền thành công", "success");
  };

  const handleAddTransaction = async (data: any) => {
    try {
      const newTransactionData = await apiService.addTransaction(data);
      const allCats = [...INITIAL_TRANSACTION_CATEGORIES, ...transactionCategories.filter(c => !INITIAL_TRANSACTION_CATEGORIES.some(ic => ic.name === c.name))];
      const cat = allCats.find(c => c.name === newTransactionData.category);
      
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        {
          ...newTransactionData,
          icon: React.createElement(iconMap[cat?.iconName || 'FoodIcon'], { className: 'w-6 h-6' })
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
      console.error("Lỗi thêm giao dịch:", error);
      showToast(error.message || "Không thể thêm giao dịch!", "error");
      throw error;
    }
  };

  const handleFundGoal = async (id: string, amount: number, wallet: string) => {
    await apiService.fundGoal(id, { amount, walletName: wallet });
    await initAppData();
    showToast("Đã nạp tiền tiết kiệm", "success");
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
        console.log("Đang gửi thông báo...", title); 
        await apiService.adminBroadcastNotification(title, message);
        await initAppData(); 
        showToast("Đã gửi thông báo thành công!", "success");
    } catch (error: any) {
        console.error("Gửi thất bại:", error);
        showToast("Gửi thất bại: " + error.message, "error");
    }
  };

  // --- HÀM THÊM GIAO DỊCH NHÓM (QUAN TRỌNG) ---
  const handleAddGroupTransaction = async (groupId: string, data: any) => {
    try {
      await apiService.addGroupTransaction(groupId, data);
      await initAppData(); // Load lại dữ liệu
      showToast("Đã thêm chi tiêu vào nhóm!", "success");
    } catch (error: any) {
      showToast(error.message || "Lỗi thêm giao dịch nhóm", "error");
    }
  };

  // --- 6. RENDER PROVIDER ---
  return (
    <AppContext.Provider value={{
      // State
      currentPage, setCurrentPage, 
      wallets, transactions, budgets, goals, debtsLoans, 
      achievements, unlockedAchievement, setUnlockedAchievement,
      systemUsers, adminStats,
      notifications, unreadNotificationCount: notifications.filter(n => !n.read).length,
      transactionCategories, 
      user, isAuthenticated, isLoadingAuth,
      language, changeLanguage: setLanguage, t,
      theme, changeTheme: setTheme,
      showToast,
      groups, 
      
      // Features
      isChatbotOpen, setChatbotOpen, chatHistory, handleSendChatMessage, isChatbotLoading,
      travelMode, toggleTravelMode: () => setTravelMode(p => ({ ...p, enabled: !p.enabled })),
      setTravelCurrency: (c: any) => setTravelMode(p => ({ ...p, currency: c })),
      formatCurrency, 
      exportData, 
      notificationSettings, 
      updateNotificationSettings: async (k: any, v: any) => { setNotificationSettings(p => ({...p, [k]: v})); },
      
      // Auth Actions
      login, signup, logout, loginWithGoogle, setPassword,
      updateProfile: async (n: any, e: any) => { const u = await apiService.updateProfile({name:n, email:e}); setUser(u); localStorage.setItem('smartspend_user', JSON.stringify(u)); },
      handleUpdateAvatar: async () => { const r = await apiService.uploadAvatar(); setUser({...user, avatar: r.avatarUrl}); },
      handleResetPassword: async (e: any, p: any) => { await apiService.resetPassword(e, p); },
      handleChangePassword: async (o: any, n: any) => { await apiService.changePassword({oldPassword: o, newPassword: n}); },

      // CRUD Actions
      fetchInitialData: initAppData,
      handleAddWallet, 
      handleEditWallet: async (w: any) => { await apiService.editWallet(w.id, w); await initAppData(); },
      handleDeleteWallet: async (id: any) => { await apiService.deleteWallet(id); await initAppData(); },
      
      handleAddTransaction, 
      handleUpdateTransaction: () => {}, 
      handleDeleteTransaction: async (id: any) => { await apiService.deleteTransaction(id); await initAppData(); },
      handleWalletTransfer, 
      
      handleAddBudget: async (d: any) => { await apiService.addBudget(d); await initAppData(); },
      handleDeleteBudget: async (id: any) => { await apiService.deleteBudget(id); await initAppData(); },
      
      handleAddGoal: async (d: any) => { await apiService.addGoal({...d, iconName: d.icon}); await initAppData(); },
      handleFundGoal, 
      
      handleAddDebtLoan: async (d: any) => { await apiService.addDebt(d); await initAppData(); },
      handleRecordPayment: async (id: any, a: any) => { await apiService.recordDebtPayment(id, a); await initAppData(); },
      
      handleAddGroup: async (g: any) => { await apiService.addGroup(g); await initAppData(); },
      
      // SỬA Ở ĐÂY: Dùng biến hàm đã khai báo bên trên, KHÔNG khai báo inline nữa
      handleAddGroupTransaction, 
      
      toggleUserLock: async (id: any) => { await apiService.adminToggleUserLock(id); await initAppData(); },
      
      handleAddCategory: async (d: any) => { await apiService.addCategory(d); await initAppData(); },
      handleEditCategory: async (n: any, d: any) => { await apiService.editCategory(n, d); await initAppData(); },
      handleDeleteCategory: async (n: any, r: any) => { await apiService.deleteCategory(n, r); await initAppData(); },
      
      markNotificationsAsRead: async () => { await apiService.markNotificationsRead(); setNotifications(p => p.map(n => ({...n, read: true}))); },
      sendNotification, 
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