import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const FinancialOverviewCard: React.FC = () => {
    const { wallets, transactions, formatCurrency, t } = useAppContext();
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalFlow = monthlyIncome + monthlyExpense;
    const incomePercentage = totalFlow > 0 ? (monthlyIncome / totalFlow) * 100 : 0;

    return (
        <div className="relative bg-card/40 backdrop-blur-2xl text-text p-6 rounded-2xl shadow-lg flex flex-col justify-between h-full overflow-hidden border border-white/30">
             <div className="absolute inset-0 opacity-5 mix-blend-overlay">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dot-pattern)" />
                </svg>
            </div>
            <div className="relative z-10">
                <h3 className="text-lg font-semibold text-muted">{t('financialOverview.title')}</h3>
                <p className="text-4xl font-bold mt-2 text-primary">{formatCurrency(totalBalance, true)}</p>
                <p className="text-muted text-sm">{t('financialOverview.totalAssets')}</p>
            </div>
            <div className="relative z-10 mt-6">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <p className="text-sm text-muted">{t('financialOverview.monthlyIncome')}</p>
                        <p className="font-semibold text-lg text-success">{formatCurrency(monthlyIncome)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted">{t('financialOverview.monthlyExpense')}</p>
                        <p className="font-semibold text-lg text-danger">{formatCurrency(monthlyExpense)}</p>
                    </div>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-4">
                    <div
                        className="h-4 bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
                        style={{ width: `${incomePercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverviewCard;