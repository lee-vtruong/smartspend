import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/Card';
import { Transaction, Budget, Goal, Wallet } from '../types';
import AddWalletModal from '../components/AddWalletModal';
import AddTransactionModal from '../components/AddTransactionModal';
import AddBudgetModal from '../components/AddBudgetModal';
import AddGoalModal from '../components/AddGoalModal';
import FundGoalModal from '../components/FundGoalModal';
import FinancialOverviewCard from '../components/FinancialOverviewCard';
import Achievements from '../components/Achievements';
import EditWalletModal from '../components/EditWalletModal';
import { useAppContext } from '../contexts/AppContext';

// --- 1. KHAI BÁO ICON TRỰC TIẾP TẠI ĐÂY ---

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LocalLaptopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-1.621A3 3 0 0 1 14.1 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
);

const LocalAirplaneIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

const LocalEmergencyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const RescueIcon: React.FC<{className?: string}> = ({ className }) => (
    <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 font-bold text-xs ${className}`} style={{ width: '24px', height: '24px' }}>
        ?
    </div>
);

// --- 2. MAP ICON SỬ DỤNG ICON NỘI BỘ ---
const GOAL_ICON_MAP: Record<string, any> = {
    'Laptop': LocalLaptopIcon,
    'Airplane': LocalAirplaneIcon,
    'Emergency': LocalEmergencyIcon,
};

// --- SUB-COMPONENTS ---
const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const { t, formatCurrency } = useAppContext();
  
  let IconDisplay = <RescueIcon className="h-6 w-6" />;
  
  try {
      if (React.isValidElement(transaction.icon)) {
          IconDisplay = React.cloneElement(transaction.icon as React.ReactElement<any>, { className: 'h-6 w-6 text-primary' });
      }
  } catch (e) {}

  return (
    <li className="flex items-center justify-between py-3.5 group hover:bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:hover:from-primary/10 dark:hover:via-primary/5 px-3 rounded-xl transition-all duration-300 border-l-4 border-transparent hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center">
        <div className="p-2.5 bg-gradient-to-br from-background to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/10">
          {IconDisplay}
        </div>
        <div className="ml-4">
          <p className="font-semibold text-text text-sm tracking-tight">{transaction.payee}</p>
          {/* Sửa dòng này - thay text-muted bằng class có contrast tốt hơn */}
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 font-medium">
            {t(transaction.category)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-sm tracking-tight ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {transaction.type === 'income' ? '↑' : '↓'} {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {new Date(transaction.date).toLocaleDateString('vi-VN')}
        </p>
      </div>
    </li>
  );
};

const BudgetProgress: React.FC<{ 
    budget: Budget; 
    onDelete: (id: string) => void;
    onEdit: (budget: Budget) => void; 
}> = ({ budget, onDelete, onEdit }) => {
  const { t, formatCurrency } = useAppContext();
  const percentage = (budget.spent / budget.limit) * 100;
  const isOverBudget = percentage > 100;
  
  const progressColor = isOverBudget 
    ? 'bg-gradient-to-r from-rose-500 to-rose-600' 
    : percentage > 90 
      ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
      : percentage > 75 
        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
        : 'bg-gradient-to-r from-emerald-400 to-emerald-500';

  const progressBgColor = isOverBudget ? 'bg-rose-100 dark:bg-rose-950/30' : 'bg-gray-100 dark:bg-white/5';

  const handleDeleteClick = () => {
      if (window.confirm("Bạn có chắc chắn muốn xóa ngân sách này không?")) {
          onDelete(budget.id);
      }
  }

  return (
    <div className="mb-4 group relative p-3.5 rounded-xl hover:bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm">
      <div className="flex justify-between mb-2.5 items-center">
        <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-text tracking-tight">{t(budget.category)}</span>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => onEdit(budget)} className="p-1.5 mr-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Sửa ngân sách">
                    <EditIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDeleteClick} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all" title="Xóa ngân sách">
                    <TrashIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
        <span className="text-xs font-medium text-muted bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
          {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
        </span>
      </div>
      
      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 mb-1.5 overflow-hidden">
        <div className={`h-2.5 rounded-full transition-all duration-700 ease-out ${progressColor} shadow-sm`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className={`h-1.5 rounded-full ${progressBgColor} overflow-hidden`}>
            <div className="h-1.5 bg-gradient-to-r from-gray-300/50 to-gray-200/50 dark:from-white/20 dark:to-white/10" style={{ width: '100%' }}></div>
          </div>
        </div>
        {isOverBudget && (
          <p className="text-rose-600 dark:text-rose-400 text-xs font-bold ml-2 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 rounded-full">
            {t('dashboard.overBudget')}
          </p>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT GOAL ITEM (Bản nâng cấp có Sửa/Xóa) ---
const GoalItem: React.FC<{ 
    goal: Goal; 
    onEdit: (g: Goal) => void; 
    onDelete: (id: string) => void; 
    onFund: (g: Goal) => void;
}> = ({ goal, onEdit, onDelete, onFund }) => {
    const { formatCurrency } = useAppContext();
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const isCompleted = percentage >= 100;
    const progressColor = isCompleted 
      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
      : percentage > 75 
        ? 'bg-gradient-to-r from-primary to-primary' 
        : 'bg-gradient-to-r from-accent to-accent/80';
    
    let RenderedIcon = <RescueIcon className={`h-6 w-6 ${isCompleted ? 'text-emerald-600' : 'text-primary'}`} />;
    try {
        if (typeof goal.icon === 'string') {
            const MappedIcon = GOAL_ICON_MAP[goal.icon];
            if (MappedIcon) {
                RenderedIcon = <MappedIcon className={`h-6 w-6 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary dark:text-primary-light'}`} />;
            }
        } else if (React.isValidElement(goal.icon)) {
            RenderedIcon = React.cloneElement(goal.icon as React.ReactElement<any>, { 
                className: `h-6 w-6 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary dark:text-primary-light'}` 
            });
        }
    } catch (err) {}

    const handleDeleteClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa mục tiêu này không?")) {
            onDelete(goal.id);
        }
    }

    return (
      <div className="flex items-center p-3.5 hover:bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl transition-all duration-300 group border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm">
        <div className={`p-3.5 rounded-xl ${isCompleted ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20' : 'bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10'}`}>
            {RenderedIcon}
        </div>
        <div className="flex-1 ml-4">
          <div className="flex justify-between items-center mb-2.5">
            <span className="font-semibold text-sm text-text tracking-tight truncate max-w-[120px]">{goal.name || "Mục tiêu"}</span>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!isCompleted && (
                  <span className={`text-xs font-bold mr-1.5 px-2 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light'}`}>
                    {Math.round(percentage || 0)}%
                  </span>
                )}
                <button onClick={() => onEdit(goal)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all" title="Sửa mục tiêu">
                    <EditIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDeleteClick} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all" title="Xóa mục tiêu">
                    <TrashIcon className="w-3.5 h-3.5" />
                </button>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-700 ease-out ${progressColor} shadow-sm`} style={{ width: `${Math.min(percentage || 0, 100)}%` }}></div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted">
              <span className="font-medium text-text">{formatCurrency(goal.currentAmount || 0)}</span>
              <span className="mx-1">/</span>
              <span>{formatCurrency(goal.targetAmount || 0)}</span>
            </p>
            {!isCompleted && (
              <button 
                onClick={() => onFund(goal)} 
                className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-gradient-to-r hover:from-primary hover:to-primary hover:text-white hover:shadow-md transition-all duration-300 transform hover:scale-105" 
                title="Nạp tiền"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
};

// --- MAIN DASHBOARD ---
const Dashboard: React.FC = () => {
  const { 
    wallets, transactions, budgets, goals, 
    handleAddWallet, handleEditWallet, handleDeleteWallet,
    handleAddTransaction, handleAddBudget, handleAddGoal, handleFundGoal,
    handleDeleteBudget, handleEditBudget, 
    handleDeleteGoal, handleEditGoal,
    t, formatCurrency
  } = useAppContext();
  
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [isEditWalletModalOpen, setEditWalletModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [isAddGoalModalOpen, setAddGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [isFundGoalModalOpen, setFundGoalModalOpen] = useState(false);
  const [goalToFund, setGoalToFund] = useState<Goal | null>(null);

  const [openWalletMenu, setOpenWalletMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenWalletMenu(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const onAddGoal = (goalData: Omit<Goal, 'id' | 'icon'> & { icon: string }) => {
    handleAddGoal(goalData);
    setAddGoalModalOpen(false);
  }

  const onFundGoalAction = (goal: Goal) => {
      setGoalToFund(goal);
      setFundGoalModalOpen(true);
  }

  const handleFundSubmit = (goalId: string, amount: number, walletName: string) => {
      handleFundGoal(goalId, amount, walletName);
      setFundGoalModalOpen(false);
  }

  const onEditWallet = (wallet: Wallet) => {
    setWalletToEdit(wallet);
    setEditWalletModalOpen(true);
    setOpenWalletMenu(null);
  }

  const onDeleteWallet = (walletId: string) => {
    if (wallets.length <= 1) {
        alert("⚠️ Không thể xóa ví này! Bạn cần giữ lại ít nhất một ví để sử dụng.");
        return; 
    }
    if(window.confirm(t('editWallet.deleteConfirmation'))) {
        handleDeleteWallet(walletId);
    }
    setOpenWalletMenu(null);
  }

  const openAddBudget = () => { setBudgetToEdit(null); setBudgetModalOpen(true); }
  const openEditBudget = (budget: Budget) => { setBudgetToEdit(budget); setBudgetModalOpen(true); }

  const openAddGoal = () => { setGoalToEdit(null); setAddGoalModalOpen(true); }
  const openEditGoal = (goal: Goal) => { setGoalToEdit(goal); setAddGoalModalOpen(true); }

  return (
    <div className="pb-40 animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent min-h-screen"> 
      {/* 1. FINANCIAL OVERVIEW */}
      <div className="mb-8">
        <FinancialOverviewCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. LEFT COLUMN (Giao dịch & Ví) */}
        <div className="lg:col-span-2 space-y-8">
            <Card title={t('dashboard.recentTransactions')} className="overflow-hidden">
                <div className="px-1">
                  {transactions.length > 0 ? (
                    <ul className="divide-y divide-gray-100 dark:divide-white/5">
                      {transactions.slice(0, 5).map(t => <TransactionItem key={t.id} transaction={t} />)}
                    </ul>
                  ) : (
                    <div className="text-center py-12 opacity-60">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.noTransactions')}</p>
                    </div>
                  )}
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-text tracking-tight">{t('dashboard.myWallets')}</h3>
                        <p className="text-sm text-muted mt-1">Quản lý tài khoản và ví tiền của bạn</p>
                    </div>
                    <button 
                      onClick={() => setWalletModalOpen(true)} 
                      className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-primary text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                </div>
                <div className="space-y-4">
                  {wallets.map(w => {
                      let WalletIcon = <RescueIcon className="h-6 w-6 text-white" />;
                      if (React.isValidElement(w.icon)) WalletIcon = React.cloneElement(w.icon as React.ReactElement<any>, { className: 'h-6 w-6 text-white' });
                      
                      const walletColor = w.color || 'bg-gradient-to-br from-primary to-primary';
                      
                      return (
                      <div key={w.id} className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl transition-all duration-300 border border-gray-200/70 dark:border-white/10 hover:border-primary/30 hover:shadow-lg hover:scale-[1.002]">
                        <div className="flex items-center">
                            <div className={`p-3.5 rounded-xl ${walletColor} shadow-md`}>
                                {WalletIcon}
                            </div>
                            <div className="ml-4">
                                <p className="font-bold text-text text-sm tracking-tight">{w.name}</p>
                                <p className="text-xs text-muted mt-0.5 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full inline-block">
                                  {w.type}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center relative">
                          <div className="text-right mr-3">
                            <p className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                              {formatCurrency(w.balance, true, w.currency)}
                            </p>
                            <p className="text-xs text-muted mt-0.5">{w.currency}</p>
                          </div>
                          <button 
                            onClick={() => setOpenWalletMenu(openWalletMenu === w.id ? null : w.id)} 
                            className="p-2 text-muted hover:text-text hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                          </button>
                          {openWalletMenu === w.id && (
                                <div ref={menuRef} className="absolute right-0 top-12 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-10 overflow-hidden animate-fade-in-up backdrop-blur-sm">
                                  <button 
                                    onClick={() => onEditWallet(w)} 
                                    className="w-full text-left px-4 py-3 text-sm text-text hover:bg-primary/10 font-medium flex items-center gap-2 transition-colors"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                    {t('common.edit')}
                                  </button>
                                  <button 
                                    onClick={() => onDeleteWallet(w.id)} 
                                    className="w-full text-left px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium flex items-center gap-2 transition-colors"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    {t('common.delete')}
                                  </button>
                                </div>
                            )}
                        </div>
                    </div>
                  )})}
                </div>
            </Card>
        </div>

        {/* 3. RIGHT COLUMN (Ngân sách, Danh hiệu, Mục tiêu) */}
        <div className="space-y-8">
           <Card className="overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text tracking-tight">{t('dashboard.budgets')}</h3>
                    <p className="text-sm text-muted mt-1">Theo dõi chi tiêu của bạn</p>
                </div>
                <button 
                  onClick={openAddBudget} 
                  className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-primary text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                {budgets.length > 0 ? (
                    budgets.map(b => (
                        <BudgetProgress 
                            key={b.id} 
                            budget={b} 
                            onDelete={handleDeleteBudget} 
                            onEdit={openEditBudget}
                        />
                    ))
                ) : (
                  <div className="text-center py-8 opacity-60">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.773-.118m4.5 8.506a4.5 4.5 0 01-4.5 4.5H7.5a4.5 4.5 0 01-4.5-4.5m0 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3.75m-9 0h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('dashboard.noBudgets')}</p>
                  </div>
                )}
            </div>
          </Card>

          <Achievements />

          <Card className="overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text tracking-tight">{t('dashboard.financialGoals')}</h3>
                    <p className="text-sm text-muted mt-1">Đạt được mục tiêu tài chính</p>
                </div>
                 <button 
                   onClick={openAddGoal} 
                   className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-primary text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                 >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
            </div>
            <div className="space-y-3">
                {goals.length > 0 ? (
                    goals.map(g => <GoalItem key={g.id} goal={g} onEdit={openEditGoal} onDelete={handleDeleteGoal} onFund={onFundGoalAction} />)
                ) : (
                  <div className="text-center py-8 opacity-60">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('dashboard.noGoals')}</p>
                  </div>
                )}
            </div>
        </Card>
        </div>
      </div>
      
      {/* 4. FLOATING ACTION BUTTON (Nút thêm giao dịch) */}
      <button 
        onClick={() => setTransactionModalOpen(true)} 
        className="fixed bottom-8 right-6 bg-gradient-to-br from-primary to-primary text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:rotate-90 z-40 group"
      >
        <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
          +
        </div>
      </button>

      {/* 5. MODALS */}
      <AddWalletModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} onAdd={handleAddWallet} />
      {isEditWalletModalOpen && walletToEdit && <EditWalletModal isOpen={isEditWalletModalOpen} onClose={() => setEditWalletModalOpen(false)} onSave={handleEditWallet} walletToEdit={walletToEdit} />}
      <AddTransactionModal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} onAdd={handleAddTransaction} wallets={wallets} />
      
      <AddBudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setBudgetModalOpen(false)} 
        onAdd={handleAddBudget}
        budgetToEdit={budgetToEdit}
        onUpdate={handleEditBudget}
      />
      
      <AddGoalModal 
        isOpen={isAddGoalModalOpen} 
        onClose={() => setAddGoalModalOpen(false)} 
        onAdd={onAddGoal} 
        goalToEdit={goalToEdit} 
        onUpdate={handleEditGoal} 
      />
      
      <FundGoalModal 
        isOpen={isFundGoalModalOpen} 
        onClose={() => setFundGoalModalOpen(false)} 
        onFund={handleFundSubmit} 
        goal={goalToFund} 
        wallets={wallets} 
      />
    </div>
  );
};

export default Dashboard;