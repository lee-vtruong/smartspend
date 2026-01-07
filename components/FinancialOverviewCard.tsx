import React from 'react';
import { useAppContext } from '../contexts/AppContext';
// IMPORT ICON TRỰC TIẾP
import { CashIcon, MoneyInIcon, MoneyOutIcon } from './Icons';

const FinancialOverviewCard: React.FC = () => {
    const { wallets, transactions, formatCurrency, t } = useAppContext();
    
    // Tính toán an toàn
    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const monthlyExpense = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalFlow = monthlyIncome + monthlyExpense;
    const incomePercentage = totalFlow > 0 ? (monthlyIncome / totalFlow) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Tổng tài sản */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">{t('financialOverview.totalAssets') || 'Tổng tài sản'}</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CashIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-blue-100 bg-blue-700/30 inline-block px-3 py-1 rounded-full">
                        {wallets.length} ví đang hoạt động
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Thu nhập tháng này */}
            <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                        <MoneyInIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-muted text-sm font-medium">{t('financialOverview.monthlyIncome') || 'Thu nhập tháng này'}</p>
                        <h3 className="text-2xl font-bold text-success">{formatCurrency(monthlyIncome)}</h3>
                    </div>
                </div>
                 <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${Math.min(incomePercentage, 100)}%` }}></div>
                </div>
            </div>

            {/* Chi tiêu tháng này */}
            <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <MoneyOutIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-muted text-sm font-medium">{t('financialOverview.monthlyExpense') || 'Chi tiêu tháng này'}</p>
                        <h3 className="text-2xl font-bold text-danger">{formatCurrency(monthlyExpense)}</h3>
                    </div>
                </div>
                 <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="h-1.5 bg-red-500 rounded-full" style={{ width: `${Math.min(100 - incomePercentage, 100)}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverviewCard;