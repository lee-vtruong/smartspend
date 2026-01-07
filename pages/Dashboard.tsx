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

// --- 1. KHAI BÁO ICON TRỰC TIẾP TẠI ĐÂY (Để tránh lỗi import undefined) ---

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

// Icon dự phòng cuối cùng
const RescueIcon: React.FC<{className?: string}> = ({ className }) => (
    <div className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-xs ${className}`} style={{ width: '24px', height: '24px' }}>
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
  
  // Logic render an toàn cho Transaction
  let IconDisplay = <RescueIcon className="h-6 w-6" />;
  
  try {
      if (React.isValidElement(transaction.icon)) {
          IconDisplay = React.cloneElement(transaction.icon as React.ReactElement<any>, { className: 'h-6 w-6 text-primary' });
      }
  } catch (e) {
      // Nếu lỗi clone, giữ nguyên RescueIcon
  }

  return (
    <li className="flex items-center justify-between py-3 group hover:bg-gray-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors">
      <div className="flex items-center">
        <div className="p-2 bg-background rounded-full border border-card-border">
          {IconDisplay}
        </div>
        <div className="ml-4">
          <p className="font-medium text-text">{transaction.payee}</p>
          <p className="text-sm text-muted">{t(transaction.category)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted">{new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
      </div>
    </li>
  );
};

const BudgetProgress: React.FC<{ budget: Budget }> = ({ budget }) => {
  const { t, formatCurrency } = useAppContext();
  const percentage = (budget.spent / budget.limit) * 100;
  const isOverBudget = percentage > 100;
  
  const progressColor = isOverBudget ? 'bg-danger' : percentage > 90 ? 'bg-danger' : (percentage > 75 ? 'bg-warning' : 'bg-success');

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="font-bold text-sm text-text">{t(budget.category)}</span>
        <span className="text-xs font-medium text-muted">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {isOverBudget && <p className="text-danger text-xs mt-1 text-right font-bold">{t('dashboard.overBudget')}</p>}
    </div>
  );
};

// --- MAIN DASHBOARD ---
const Dashboard: React.FC = () => {
  const { 
    wallets, transactions, budgets, goals, 
    handleAddWallet, handleEditWallet, handleDeleteWallet,
    handleAddTransaction, handleAddBudget, handleAddGoal, handleFundGoal,
    t, formatCurrency
  } = useAppContext();
  
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [isEditWalletModalOpen, setEditWalletModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
  const [isAddGoalModalOpen, setAddGoalModalOpen] = useState(false);
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
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onAddGoal = (goalData: Omit<Goal, 'id' | 'icon'> & { icon: string }) => {
    handleAddGoal(goalData);
    setAddGoalModalOpen(false);
  }

  const onFundGoal = (goalId: string, amount: number, walletName: string) => {
      handleFundGoal(goalId, amount, walletName);
      setFundGoalModalOpen(false);
  }

  const onEditWallet = (wallet: Wallet) => {
    setWalletToEdit(wallet);
    setEditWalletModalOpen(true);
    setOpenWalletMenu(null);
  }

  const onDeleteWallet = (walletId: string) => {
    if(window.confirm(t('editWallet.deleteConfirmation'))) {
        handleDeleteWallet(walletId);
    }
    setOpenWalletMenu(null);
  }
  
  // --- 3. GOAL ITEM (FIXED) ---
  const GoalItem: React.FC<{ goal: Goal }> = ({ goal }) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const isCompleted = percentage >= 100;
    const progressColor = isCompleted ? 'bg-success' : percentage > 75 ? 'bg-primary' : 'bg-accent';
    
    // Mặc định dùng RescueIcon
    let RenderedIcon = <RescueIcon className={`h-6 w-6 ${isCompleted ? 'text-success' : 'text-primary'}`} />;

    try {
        if (typeof goal.icon === 'string') {
            const MappedIcon = GOAL_ICON_MAP[goal.icon];
            if (MappedIcon) {
                // Render component local (chắc chắn tồn tại)
                RenderedIcon = <MappedIcon className={`h-6 w-6 ${isCompleted ? 'text-success' : 'text-primary'}`} />;
            }
        } else if (React.isValidElement(goal.icon)) {
            RenderedIcon = React.cloneElement(goal.icon as React.ReactElement<any>, { 
                className: `h-6 w-6 ${isCompleted ? 'text-success' : 'text-primary'}` 
            });
        }
    } catch (err) {
        console.error("Icon render error", err);
    }

    return (
      <div className="flex items-center space-x-4 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
        <div className={`p-3 rounded-full ${isCompleted ? 'bg-success/20' : 'bg-primary/10'}`}>
            {RenderedIcon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm text-text">{goal.name || "Mục tiêu"}</span>
            <span className={`text-xs font-bold ${isCompleted ? 'text-success' : 'text-primary'}`}>
                {isCompleted ? 'Hoàn thành' : `${Math.round(percentage || 0)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(percentage || 0, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted mt-1 text-right">{formatCurrency(goal.currentAmount || 0)} / {formatCurrency(goal.targetAmount || 0)}</p>
        </div>
        {!isCompleted &&
            <button 
                onClick={() => { setGoalToFund(goal); setFundGoalModalOpen(true); }} 
                className="p-2 rounded-full text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all" 
                title={t('dashboard.fundGoalTooltip')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
        }
      </div>
    );
  };

  return (
    <div>
      {/* 1. FINANCIAL OVERVIEW */}
      <div className="mb-6">
          <FinancialOverviewCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            <Card title={t('dashboard.recentTransactions')}>
                {transactions.length > 0 ? (
                <ul className="divide-y divide-card-border/50">
                    {transactions.slice(0, 5).map(t => <TransactionItem key={t.id} transaction={t} />)}
                </ul>
                ) : (
                <div className="text-center py-8 opacity-50">
                     <p>{t('dashboard.noTransactions')}</p>
                </div>
                )}
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text">{t('dashboard.myWallets')}</h3>
                    <button onClick={() => setWalletModalOpen(true)} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                </div>
                <div className="space-y-4">
                  {wallets.map(w => {
                     // Render Wallet Icon
                     let WalletIcon = <RescueIcon className="h-6 w-6 text-white" />;
                     if (React.isValidElement(w.icon)) {
                         WalletIcon = React.cloneElement(w.icon as React.ReactElement<any>, { className: 'h-6 w-6 text-white' });
                     }
                     return (
                     <div key={w.id} className="group relative flex items-center justify-between p-4 bg-background border border-card-border rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full ${w.color || 'bg-gray-200'}`}>
                                {WalletIcon}
                            </div>
                            <div className="ml-4">
                                <p className="font-bold text-text">{w.name}</p>
                                <p className="text-xs text-muted uppercase tracking-wider">{w.type}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold text-lg mr-3 text-primary">{formatCurrency(w.balance, true, w.currency)}</p>
                          <button onClick={() => setOpenWalletMenu(openWalletMenu === w.id ? null : w.id)} className="p-1 text-muted hover:text-text">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                              </svg>
                          </button>
                          {openWalletMenu === w.id && (
                                <div ref={menuRef} className="absolute right-2 top-12 w-32 bg-card rounded-lg shadow-xl border border-card-border z-10 overflow-hidden animate-fade-in-up">
                                  <button onClick={() => onEditWallet(w)} className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-primary/10 font-medium">{t('common.edit')}</button>
                                  <button onClick={() => onDeleteWallet(w.id)} className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 font-medium">{t('common.delete')}</button>
                                </div>
                            )}
                        </div>
                    </div>
                  )})}
                </div>
            </Card>
        </div>

        {/* 3. RIGHT COLUMN */}
        <div className="space-y-6">
           <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text">{t('dashboard.budgets')}</h3>
                <button onClick={() => setBudgetModalOpen(true)} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {budgets.length > 0 ? (
                    budgets.map(b => <BudgetProgress key={b.id} budget={b}/>)
                ) : (
                  <p className="text-center text-muted py-4 text-sm">{t('dashboard.noBudgets')}</p>
                )}
            </div>
          </Card>

          <Achievements />

          <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text">{t('dashboard.financialGoals')}</h3>
                 <button onClick={() => setAddGoalModalOpen(true)} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
            </div>
            <div className="space-y-4">
                {goals.length > 0 ? (
                    goals.map(g => <GoalItem key={g.id} goal={g} />)
                ) : (
                    <p className="text-center text-muted py-4 text-sm">{t('dashboard.noGoals')}</p>
                )}
            </div>
        </Card>
        </div>
      </div>
      
      <button 
        onClick={() => setTransactionModalOpen(true)} 
        className="fixed bottom-8 right-6 bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary-focus transition-all transform hover:scale-110 hover:rotate-90 z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <AddWalletModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} onAdd={handleAddWallet} />
      {isEditWalletModalOpen && walletToEdit && (
        <EditWalletModal isOpen={isEditWalletModalOpen} onClose={() => setEditWalletModalOpen(false)} onSave={handleEditWallet} walletToEdit={walletToEdit} />
      )}
      <AddTransactionModal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} onAdd={handleAddTransaction} wallets={wallets} />
      <AddBudgetModal isOpen={isBudgetModalOpen} onClose={() => setBudgetModalOpen(false)} onAdd={handleAddBudget} />
      <AddGoalModal isOpen={isAddGoalModalOpen} onClose={() => setAddGoalModalOpen(false)} onAdd={onAddGoal} />
      <FundGoalModal isOpen={isFundGoalModalOpen} onClose={() => setFundGoalModalOpen(false)} onFund={onFundGoal} goal={goalToFund} wallets={wallets} />
    </div>
  );
};

export default Dashboard;