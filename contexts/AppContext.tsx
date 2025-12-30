
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

// FIX: Sử dụng đường dẫn tương đối đúng chuẩn browser
import vi from '../i18n/vi.json' with { type: 'json' };
import en from '../i18n/en.json' with { type: 'json' };

const translations: any = { vi, en };

export const MOCK_REVENUE_DATA = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 2100 },
  { month: 'Mar', revenue: 1800 },
  { month: 'Apr', revenue: 2400 },
  { month: 'May', revenue: 3200 },
  { month: 'Jun', revenue: 2900 },
];

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  achievements: Achievement[];
  unlockedAchievement: Achievement | null;
  setUnlockedAchievement: (achievement: Achievement | null) => void;
  debtsLoans: DebtLoanItem[];
  systemUsers: SystemUser[];
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  showToast: (message: string, type?: ToastType) => void;
  transactionCategories: TransactionCategory[];
  t: (key: string, params?: any) => string;
  language: Language;
  changeLanguage: (lang: Language) => void;
  theme: 'light' | 'dark' | 'special';
  changeTheme: (theme: 'light' | 'dark' | 'special') => void;
  user: any;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  handleUpdateAvatar: () => Promise<void>;
  handleAddWallet: (wallet: Omit<Wallet, 'id' | 'icon'>) => Promise<void>;
  handleEditWallet: (wallet: Wallet) => Promise<void>;
  handleDeleteWallet: (id: string) => Promise<void>;
  handleAddTransaction: (tx: Omit<Transaction, 'id' | 'icon'>) => Promise<void>;
  handleUpdateTransaction: (tx: Transaction) => void;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleWalletTransfer: (from: string, to: string, amount: number, date: string) => Promise<void>;
  handleAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  handleDeleteBudget: (id: string) => Promise<void>;
  handleAddGoal: (goal: Omit<Goal, 'id' | 'icon'> & { icon: string }) => Promise<void>;
  handleFundGoal: (id: string, amount: number, wallet: string) => Promise<void>;
  handleAddDebtLoan: (item: Omit<DebtLoanItem, 'id' | 'paidAmount'>) => Promise<void>;
  handleRecordPayment: (id: string, amount: number) => Promise<void>;
  handleAddGroup: (group: any) => Promise<void>;
  handleAddGroupTransaction: (groupId: string, data: any) => Promise<void>;
  groups: any[];
  isChatbotOpen: boolean;
  setChatbotOpen: (open: boolean) => void;
  chatHistory: ChatMessage[];
  handleSendChatMessage: (msg: string) => Promise<void>;
  isChatbotLoading: boolean;
  travelMode: TravelMode;
  toggleTravelMode: () => void;
  setTravelCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number, useWalletCurrency?: boolean, currency?: string) => string;
  exportData: () => Promise<void>;
  toggleUserLock: (id: string) => Promise<void>;
  handleAddCategory: (cat: any) => Promise<void>;
  handleEditCategory: (originalName: string, data: any) => Promise<void>;
  handleDeleteCategory: (name: string, reassignTo: string) => Promise<void>;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (key: string, value: boolean) => Promise<void>;
  handleResetPassword: (email: string, pass: string) => Promise<void>;
  sendNotification: (title: string, message: string) => Promise<void>;
  handleChangePassword: (old: string, newP: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
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
  const [language, setLanguage] = useState<Language>('vi');
  const [theme, setTheme] = useState<'light' | 'dark' | 'special'>(
    (localStorage.getItem('smartspend_theme') as any) || 'dark'
  );
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('smartspend_user') || 'null'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('smartspend_token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>({ enabled: false, currency: 'USD' });
  const [groups, setGroups] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
      emailWeekly: true,
      emailMonthly: true,
      pushBudget: true,
      pushBills: true,
      pushDebts: true,
  });

  const showToast = (message: string, type: ToastType = 'info') => setToast({ message, type });

  // --- THEME EFFECT ---
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

  const initAppData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [walletsData, txData, budgetsData, goalsData, debtsData, groupsData, notifsData, customCats] = await Promise.all([
        apiService.getWallets(),
        apiService.getTransactions(),
        apiService.getBudgets(),
        apiService.getGoals(),
        apiService.getDebts(),
        apiService.getGroups(),
        apiService.getNotifications(),
        apiService.getCustomCategories()
      ]);

      setWallets(walletsData.map((w: any) => ({
          ...w,
          icon: React.createElement(iconMap[w.type + 'Icon'] || iconMap.FoodIcon, { className: 'w-8 h-8' })
      })));

      const allCats = [...INITIAL_TRANSACTION_CATEGORIES, ...customCats];
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
      setTransactionCategories(allCats);

      if (user?.isAdmin) {
          const users = await apiService.adminGetUsers();
          setSystemUsers(users);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  }, [isAuthenticated, user?.isAdmin]);

  useEffect(() => {
    if (isAuthenticated) initAppData();
  }, [isAuthenticated, initAppData]);

  // --- ACTIONS ---
  const login = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    try {
      const data = await apiService.login({ email, password: pass });
      localStorage.setItem('smartspend_token', data.token);
      localStorage.setItem('smartspend_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      showToast("Đăng nhập thành công!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
    setIsAuthenticated(false);
    setUser(null);
    showToast("Đã đăng xuất");
  };

  const signup = async (name: string, email: string, pass: string) => {
    await apiService.signup({ name, email, password: pass });
    showToast("Đăng ký thành công!", "success");
  };

  const handleAddWallet = async (data: any) => {
    await apiService.addWallet(data);
    await initAppData();
    showToast("Đã thêm ví mới", "success");
  };

  const handleWalletTransfer = async (from: string, to: string, amount: number, date: string) => {
    await apiService.transferMoney({ fromWalletName: from, toWalletName: to, amount, date });
    await initAppData();
    showToast("Chuyển tiền thành công", "success");
  };

  const handleAddTransaction = async (data: any) => {
    await apiService.addTransaction(data);
    await initAppData();
    showToast("Giao dịch đã được ghi lại", "success");
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

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage, wallets, transactions, budgets, goals, achievements, unlockedAchievement, setUnlockedAchievement, debtsLoans,
      systemUsers, notifications, unreadNotificationCount: notifications.filter(n => !n.read).length,
      markNotificationsAsRead: async () => { await apiService.markNotificationsRead(); setNotifications(p => p.map(n => ({...n, read: true}))); },
      showToast, transactionCategories, t, language, changeLanguage: setLanguage, theme, changeTheme: setTheme,
      user, isAuthenticated, isLoadingAuth, login, signup, logout,
      updateProfile: async (n:any, e:any) => { const u = await apiService.updateProfile({name:n, email:e}); setUser(u); localStorage.setItem('smartspend_user', JSON.stringify(u)); },
      handleUpdateAvatar: async () => { const r = await apiService.uploadAvatar(); setUser({...user, avatar: r.avatarUrl}); },
      handleAddWallet, 
      handleEditWallet: async (w: any) => { await apiService.editWallet(w.id, w); await initAppData(); },
      handleDeleteWallet: async (id:any) => { await apiService.deleteWallet(id); await initAppData(); },
      handleAddTransaction, 
      handleUpdateTransaction: () => {}, 
      handleDeleteTransaction: async (id:any) => { await apiService.deleteTransaction(id); await initAppData(); },
      handleWalletTransfer, 
      handleAddBudget: async (d:any) => { await apiService.addBudget(d); await initAppData(); },
      handleDeleteBudget: async (id:any) => { await apiService.deleteBudget(id); await initAppData(); },
      handleAddGoal: async (d:any) => { await apiService.addGoal({...d, iconName: d.icon}); await initAppData(); },
      handleFundGoal, 
      handleAddDebtLoan: async (d:any) => { await apiService.addDebt(d); await initAppData(); },
      handleRecordPayment: async (id:any, a:any) => { await apiService.recordDebtPayment(id, a); await initAppData(); },
      handleAddGroup: async (g:any) => { await apiService.addGroup(g); await initAppData(); },
      handleAddGroupTransaction: async (id:any, d:any) => { await apiService.addGroupTransaction(id, d); await initAppData(); },
      groups, isChatbotOpen, setChatbotOpen, chatHistory, handleSendChatMessage, isChatbotLoading,
      travelMode, toggleTravelMode: () => setTravelMode(p => ({ ...p, enabled: !p.enabled })),
      setTravelCurrency: (c:any) => setTravelMode(p => ({ ...p, currency: c })),
      formatCurrency, exportData, 
      toggleUserLock: async (id:any) => { await apiService.adminToggleUserLock(id); await initAppData(); },
      handleAddCategory: async (d:any) => { await apiService.addCategory(d); await initAppData(); },
      handleEditCategory: async (n:any, d:any) => { await apiService.editCategory(n, d); await initAppData(); },
      handleDeleteCategory: async (n:any, r:any) => { await apiService.deleteCategory(n, r); await initAppData(); },
      notificationSettings, 
      updateNotificationSettings: async (k:any, v:any) => { setNotificationSettings(p => ({...p, [k]: v})); },
      handleResetPassword: async (e:any, p:any) => { await apiService.resetPassword(e, p); },
      sendNotification: async (t:any, m:any) => { await apiService.sendNotification({title: t, message:m}); await initAppData(); },
      handleChangePassword: async (o:any, n:any) => { await apiService.changePassword({oldPassword: o, newPassword: n}); }
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
