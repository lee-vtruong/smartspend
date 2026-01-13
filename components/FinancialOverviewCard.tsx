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
    const expensePercentage = totalFlow > 0 ? (monthlyExpense / totalFlow) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tổng tài sản - Card chính */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0yMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
                
                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-blue-100 text-sm font-semibold tracking-wide uppercase">
                                {t('financialOverview.totalAssets') || 'Tổng tài sản'}
                            </p>
                            <h3 className="text-3xl font-bold mt-2 tracking-tight">
                                {formatCurrency(totalBalance)}
                            </h3>
                        </div>
                        <div className="p-3.5 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                            <CashIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-blue-100 text-sm bg-blue-700/40 px-4 py-2 rounded-full backdrop-blur-sm">
                            {wallets.length} ví đang hoạt động
                        </div>
                        <div className="text-xs text-blue-100/80 font-medium">
                            Cập nhật vừa xong
                        </div>
                    </div>
                </div>
                
                {/* Animated circles */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-lg"></div>
            </div>

            {/* Thu nhập tháng này */}
            <div className="relative bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-800 dark:to-gray-900/95 border border-gray-200/60 dark:border-white/15 p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                {/* Accent border top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-300"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center space-x-5 mb-5">
                        <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                            <MoneyInIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold tracking-tight">
                                {t('financialOverview.monthlyIncome') || 'Thu nhập tháng này'}
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-1">
                                {formatCurrency(monthlyIncome)}
                            </h3>
                        </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {Math.round(incomePercentage)}% tổng dòng tiền
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                {monthlyIncome > 0 ? '↑ Tăng trưởng' : 'Chưa có'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm" 
                                style={{ width: `${Math.min(incomePercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                {/* Background decoration */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-lg"></div>
            </div>

            {/* Chi tiêu tháng này */}
            <div className="relative bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-800 dark:to-gray-900/95 border border-gray-200/60 dark:border-white/15 p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                {/* Accent border top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-rose-300"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center space-x-5 mb-5">
                        <div className="p-4 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-950/20 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform duration-300">
                            <MoneyOutIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold tracking-tight">
                                {t('financialOverview.monthlyExpense') || 'Chi tiêu tháng này'}
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-1">
                                {formatCurrency(monthlyExpense)}
                            </h3>
                        </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-rose-600 dark:text-rose-400">
                                {Math.round(expensePercentage)}% tổng dòng tiền
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                {monthlyExpense > 0 ? '↓ Chi tiêu' : 'Chưa có'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-2 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-700 ease-out shadow-sm" 
                                style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                {/* Background decoration */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-100/40 dark:bg-rose-900/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-100/40 dark:bg-rose-900/20 rounded-full blur-lg"></div>
            </div>
        </div>
    );
};

export default FinancialOverviewCard;