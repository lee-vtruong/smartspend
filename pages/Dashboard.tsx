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

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const { t, formatCurrency } = useAppContext();
  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <div className="p-2 bg-background rounded-full">
          {React.cloneElement(transaction.icon, { className: 'h-6 w-6 text-primary' })}
        </div>
        <div className="ml-4">
          <p className="font-medium">{transaction.payee}</p>
          <p className="text-sm text-muted">{t(transaction.category)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        <p className="text-sm text-muted">{new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
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
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-medium text-base">{t(budget.category)}</span>
        <span className="text-sm">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
      </div>
      <div className="w-full bg-background rounded-full h-4">
        <div 
          className={`h-4 rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {isOverBudget && <p className="text-danger text-xs mt-1 text-right">{t('dashboard.overBudget')}</p>}
       {percentage > 90 && !isOverBudget && <div className="bg-warning/10 border border-warning/20 text-warning text-xs rounded p-1 mt-2">{t('dashboard.budgetWarning')}</div>}
    </div>
  );
};


const Dashboard: React.FC = () => {
  const { 
    wallets, 
    transactions, 
    budgets, 
    goals, 
    achievements, 
    handleAddWallet,
    handleEditWallet,
    handleDeleteWallet,
    handleAddTransaction, 
    handleAddBudget, 
    handleAddGoal, 
    handleFundGoal,
    t,
    formatCurrency
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
        try {
            handleDeleteWallet(walletId);
        } catch(e: any) {
            alert(e.message);
        }
    }
    setOpenWalletMenu(null);
  }
  
  const GoalItem: React.FC<{ goal: Goal }> = ({ goal }) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const isCompleted = percentage >= 100;
    
    const progressColor = isCompleted ? 'bg-success' : percentage > 75 ? 'bg-primary' : 'bg-accent';
  
    return (
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${isCompleted ? 'bg-success/20' : 'bg-primary/10'}`}>
            {React.cloneElement(goal.icon, { className: `h-6 w-6 ${isCompleted ? 'text-success' : 'text-primary'}` })}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">{goal.name}</span>
            <span className={`text-sm font-semibold ${isCompleted ? 'text-success' : ''}`}>{isCompleted ? t('dashboard.goalCompleted') : `${Math.round(percentage)}%`}</span>
          </div>
          <div className="w-full bg-background rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted mt-1 text-right">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
        </div>
        {!isCompleted &&
            <button onClick={() => { setGoalToFund(goal); setFundGoalModalOpen(true); }} className="group p-2 rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110" title={t('dashboard.fundGoalTooltip')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
        }
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-3">
            <FinancialOverviewCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card title={t('dashboard.recentTransactions')}>
                {transactions.length > 0 ? (
                <ul className="divide-y divide-card-border/50">
                    {transactions.slice(0, 5).map(t => <TransactionItem key={t.id} transaction={t} />)}
                </ul>
                ) : (
                <p className="text-center text-muted py-4">{t('dashboard.noTransactions')}</p>
                )}
            </Card>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text">{t('dashboard.myWallets')}</h3>
                    <button onClick={() => setWalletModalOpen(true)} title={t('dashboard.addWalletTooltip')} className="group p-1 rounded-full text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-4">
                  {wallets.map(w => (
                     <div key={w.id} className="group flex items-center justify-between p-4 bg-card/80 rounded-lg border border-white/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full transition-transform duration-300 group-hover:scale-110 ${w.color}`}>
                                {React.cloneElement(w.icon, { className: 'h-6 w-6 text-primary-content' })}
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-lg">{w.name}</p>
                                <p className="text-muted text-sm">{w.type}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold text-lg mr-2">{formatCurrency(w.balance, true, w.currency)}</p>
                          <div className="relative">
                            <button onClick={() => setOpenWalletMenu(openWalletMenu === w.id ? null : w.id)} className="p-2 rounded-full text-muted hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                              </svg>
                            </button>
                            {openWalletMenu === w.id && (
                                <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-card/70 backdrop-blur-xl rounded-lg shadow-lg py-1 z-20 border border-white/20 animate-fade-in-down">
                                  <button onClick={() => onEditWallet(w)} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-primary/10">{t('common.edit')}</button>
                                  <button onClick={() => onDeleteWallet(w.id)} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10">{t('common.delete')}</button>
                                </div>
                            )}
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
            </Card>
        </div>
        <div className="space-y-6">
           <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text">{t('dashboard.budgets')}</h3>
                <button onClick={() => setBudgetModalOpen(true)} title={t('dashboard.addBudgetTooltip')} className="group p-1 rounded-full text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {budgets.length > 0 ? (
                    budgets.map(b => <BudgetProgress key={b.id} budget={b}/>)
                ) : (
                  <p className="text-center text-muted py-4">{t('dashboard.noBudgets')}</p>
                )}
            </div>
          </Card>
          <Achievements />
        </div>
      </div>
      
      <div className="mt-6">
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text">{t('dashboard.financialGoals')}</h3>
                 <button onClick={() => setAddGoalModalOpen(true)} title={t('dashboard.addGoalTooltip')} className="group p-1 rounded-full text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            <div className="space-y-5">
                {goals.length > 0 ? (
                    goals.map(g => <GoalItem key={g.id} goal={g} />)
                ) : (
                    <p className="text-center text-muted py-4">{t('dashboard.noGoals')}</p>
                )}
            </div>
        </Card>
      </div>
      
      <button 
        onClick={() => setTransactionModalOpen(true)} 
        className="group fixed bottom-24 right-6 bg-primary text-primary-content p-4 rounded-full shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-40"
        aria-label={t('dashboard.addTransactionTooltip')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <AddWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setWalletModalOpen(false)} 
        onAdd={handleAddWallet} 
      />
      <EditWalletModal
        isOpen={isEditWalletModalOpen}
        onClose={() => setEditWalletModalOpen(false)}
        onSave={handleEditWallet}
        walletToEdit={walletToEdit}
      />
      <AddTransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setTransactionModalOpen(false)} 
        onAdd={handleAddTransaction} 
        wallets={wallets}
      />
      <AddBudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setBudgetModalOpen(false)} 
        onAdd={handleAddBudget} 
        existingCategories={budgets.map(b => b.category)}
      />
      <AddGoalModal 
        isOpen={isAddGoalModalOpen} 
        onClose={() => setAddGoalModalOpen(false)} 
        onAdd={onAddGoal} 
      />
      <FundGoalModal 
        isOpen={isFundGoalModalOpen} 
        onClose={() => setFundGoalModalOpen(false)} 
        onFund={onFundGoal} 
        goal={goalToFund} 
        wallets={wallets}
      />
    </div>
  );
};

export default Dashboard;