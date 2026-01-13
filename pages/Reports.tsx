import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import SpendingChart from '../components/charts/SpendingChart';
import { SpendingData, CategorySpending } from '../types';

// --- COMPONENT: EMPTY STATE (MỚI) ---
const EmptyDataState: React.FC = () => {
    const { t } = useAppContext();
    
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/20 text-center animate-fade-in mt-6 shadow-inner">
            <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full mb-6 shadow-sm border border-gray-200 dark:border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                {t('reports.noData') || 'Chưa có dữ liệu báo cáo'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-8 text-sm leading-relaxed">
                Không có giao dịch nào phát sinh trong khoảng thời gian này. Hãy thử chọn khoảng thời gian khác hoặc thêm giao dịch mới để xem báo cáo chi tiết.
            </p>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary rounded-full mb-8"></div>
        </div>
    );
};

const SummaryCard: React.FC<{ title: string; amount: number; type: 'income' | 'expense' | 'balance' }> = ({ title, amount, type }) => {
    const { formatCurrency } = useAppContext();
    
    const config = {
        income: {
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
            borderColor: 'border-emerald-200 dark:border-emerald-800/30',
            iconColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
        },
        expense: {
            color: 'text-rose-600 dark:text-rose-400',
            bgColor: 'from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10',
            borderColor: 'border-rose-200 dark:border-rose-800/30',
            iconColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
        },
        balance: {
            color: 'text-primary dark:text-primary-light',
            bgColor: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
            borderColor: 'border-blue-200 dark:border-blue-800/30',
            iconColor: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light'
        }
    };

    const currentConfig = config[type];

    return (
        <Card className={`bg-gradient-to-br ${currentConfig.bgColor} border ${currentConfig.borderColor} hover:shadow-lg transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${currentConfig.color} tracking-tight`}>
                        {formatCurrency(amount)}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${currentConfig.iconColor}`}>
                    {type === 'income' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                    {type === 'expense' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                    {type === 'balance' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    )}
                </div>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-2 rounded-full transition-all duration-700 ${
                        type === 'income' 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                            : type === 'expense'
                            ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                            : 'bg-gradient-to-r from-primary to-primary'
                    }`} 
                    style={{ width: amount !== 0 ? `${Math.min(Math.abs(amount) / 1000000 * 100, 100)}%` : '0%' }}
                ></div>
            </div>
        </Card>
    );
};

const TimeframeButton: React.FC<{
    timeframe: 'week' | 'month' | 'year';
    currentTimeframe: string;
    onClick: () => void;
    label: string;
}> = ({ timeframe, currentTimeframe, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            currentTimeframe === timeframe 
            ? 'bg-gradient-to-r from-primary to-primary text-white shadow-md' 
            : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);

const Reports: React.FC = () => {
    const { t, exportData, transactions, formatCurrency } = useAppContext();
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

    // Logic lọc và tính toán dữ liệu
    const stats = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const dayOfWeek = startOfToday.getDay(); 
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - dayOfWeek);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Lọc giao dịch theo Timeframe
        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            txDate.setHours(0,0,0,0);

            if (timeframe === 'week') return txDate >= startOfWeek;
            if (timeframe === 'month') return txDate >= startOfMonth;
            if (timeframe === 'year') return txDate >= startOfYear;
            return true;
        });

        // Tính tổng
        const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        
        // Nhóm chi tiêu theo danh mục
        const categoryMap = new Map<string, number>();
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
        });

        const categorySpending: CategorySpending[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name: t(name) || name,
            value
        }));

        // Tính toán dữ liệu biểu đồ Xu hướng
        let spendingTrend: SpendingData[] = [];

        if (timeframe === 'week') {
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            spendingTrend = days.map(d => ({ period: d, income: 0, expense: 0 }));

            filteredTransactions.forEach(tx => {
                const date = new Date(tx.date);
                const dayIndex = date.getDay();
                if (tx.type === 'income') spendingTrend[dayIndex].income += tx.amount;
                else spendingTrend[dayIndex].expense += tx.amount;
            });

        } else if (timeframe === 'month') {
            spendingTrend = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'].map(w => ({ period: w, income: 0, expense: 0 }));

            filteredTransactions.forEach(tx => {
                const date = new Date(tx.date);
                const day = date.getDate();
                const weekIndex = Math.min(Math.floor((day - 1) / 7), 3); 
                
                if (tx.type === 'income') spendingTrend[weekIndex].income += tx.amount;
                else spendingTrend[weekIndex].expense += tx.amount;
            });

        } else {
            const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            spendingTrend = months.map(m => ({ period: m, income: 0, expense: 0 }));

            filteredTransactions.forEach(tx => {
                const date = new Date(tx.date);
                const monthIndex = date.getMonth();
                if (tx.type === 'income') spendingTrend[monthIndex].income += tx.amount;
                else spendingTrend[monthIndex].expense += tx.amount;
            });
        }

        return { 
            totalIncome, 
            totalExpense, 
            balance: totalIncome - totalExpense, 
            categorySpending, 
            spendingTrend, 
            filteredTransactions 
        };
    }, [transactions, t, timeframe]);

    const totalTransactions = stats.filteredTransactions.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent pb-10">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                            {t('reports.title') || 'Báo cáo & Thống kê'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                            Phân tích chi tiết tài chính của bạn
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Timeframe Selector */}
                        <div className="flex bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 p-1.5 rounded-xl border border-gray-300 dark:border-white/15 shadow-sm">
                            <TimeframeButton
                                timeframe="week"
                                currentTimeframe={timeframe}
                                onClick={() => setTimeframe('week')}
                                label={t('reports.timeframe.week') || 'Tuần'}
                            />
                            <TimeframeButton
                                timeframe="month"
                                currentTimeframe={timeframe}
                                onClick={() => setTimeframe('month')}
                                label={t('reports.timeframe.month') || 'Tháng'}
                            />
                            <TimeframeButton
                                timeframe="year"
                                currentTimeframe={timeframe}
                                onClick={() => setTimeframe('year')}
                                label={t('reports.timeframe.year') || 'Năm'}
                            />
                        </div>

                        <button 
                            onClick={exportData}
                            className="group px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-white/15 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t('export') || 'Xuất CSV'}
                        </button>
                    </div>
                </div>

                {/* Overview Card */}
                <Card className="mb-6 border border-gray-200 dark:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Tổng quan</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                {timeframe === 'week' ? 'Tuần này' : 
                                 timeframe === 'month' ? 'Tháng này' : 
                                 'Năm nay'}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Giao dịch</p>
                                <p className="text-lg font-bold text-primary">{totalTransactions}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Thu nhập</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(stats.totalIncome)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Chi tiêu</p>
                                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                    {formatCurrency(stats.totalExpense)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard 
                    title={t('reports.totalIncome') || 'Tổng thu nhập'} 
                    amount={stats.totalIncome} 
                    type="income" 
                />
                <SummaryCard 
                    title={t('reports.totalExpense') || 'Tổng chi tiêu'} 
                    amount={stats.totalExpense} 
                    type="expense" 
                />
                <SummaryCard 
                    title={t('reports.balance') || 'Số dư ròng'} 
                    amount={stats.balance} 
                    type="balance" 
                />
            </div>

            {/* Conditional Rendering for Charts */}
            {totalTransactions > 0 ? (
                <>
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
                        {/* Biểu đồ cột Thu/Chi */}
                        <Card className="border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    Thu nhập & Chi tiêu
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    So sánh theo {timeframe === 'week' ? 'ngày trong tuần' : 
                                                  timeframe === 'month' ? 'tuần trong tháng' : 
                                                  'tháng trong năm'}
                                </p>
                            </div>
                            <div className="p-4">
                                <IncomeExpenseBarChart data={stats.spendingTrend} />
                            </div>
                        </Card>
                        
                        {/* Biểu đồ tròn Danh mục */}
                        <Card className="border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    Phân bổ chi tiêu
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Theo danh mục {timeframe === 'week' ? 'tuần này' : 
                                                  timeframe === 'month' ? 'tháng này' : 
                                                  'năm nay'}
                                </p>
                            </div>
                            <div className="p-4">
                                <CategoryDonutChart data={stats.categorySpending} />
                            </div>
                        </Card>
                    </div>

                    {/* Trend Chart */}
                    <div className="mb-8 animate-fade-in-up delay-100">
                        <Card className="border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    Xu hướng tài chính
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Biểu đồ thể hiện xu hướng thu chi theo thời gian
                                </p>
                            </div>
                            <div className="p-4">
                                <SpendingChart data={stats.spendingTrend} />
                            </div>
                        </Card>
                    </div>

                    {/* Insights Section */}
                    {stats.categorySpending.length > 0 && (
                        <Card className="mb-8 border border-gray-200 dark:border-white/10">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    Nhận xét & Gợi ý
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                                                Tích cực
                                            </span>
                                        </div>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                            {stats.balance > 0 
                                                ? `Bạn đang có số dư ròng dương (+${formatCurrency(stats.balance)}). Tiếp tục duy trì!`
                                                : 'Thu nhập của bạn đang ổn định. Hãy tiếp tục theo dõi chi tiêu.'}
                                        </p>
                                    </div>
                                    
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-blue-800 dark:text-blue-300">
                                                Cần lưu ý
                                            </span>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-400">
                                            {stats.totalExpense > stats.totalIncome * 0.7
                                                ? 'Chi tiêu của bạn đang ở mức cao (>70% thu nhập). Hãy xem xét cắt giảm.'
                                                : 'Theo dõi các danh mục chi tiêu lớn để tối ưu hóa ngân sách.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </>
            ) : (
                <EmptyDataState />
            )}

            {/* Footer Info */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dữ liệu được cập nhật tự động • Báo cáo được tạo vào {new Date().toLocaleDateString('vi-VN')}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Hệ thống báo cáo đang hoạt động
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Reports;