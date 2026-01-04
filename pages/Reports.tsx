import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import SpendingChart from '../components/charts/SpendingChart';
import { SpendingData, CategorySpending } from '../types';

const SummaryCard: React.FC<{ title: string; amount: number; type: 'income' | 'expense' | 'balance' }> = ({ title, amount, type }) => {
    const { formatCurrency } = useAppContext();
    const colors = {
        income: 'text-success bg-success/10',
        expense: 'text-danger bg-danger/10',
        balance: 'text-primary bg-primary/10'
    };

    return (
        <Card className="flex-1">
            <p className="text-sm font-medium text-muted mb-1">{title}</p>
            <p className={`text-2xl font-bold ${colors[type].split(' ')[0]}`}>{formatCurrency(amount)}</p>
            <div className={`mt-3 h-1 w-full rounded-full ${colors[type].split(' ')[1]}`}>
                <div className={`h-1 rounded-full ${colors[type].split(' ')[0].replace('text-', 'bg-')}`} style={{ width: amount !== 0 ? '70%' : '0%' }}></div>
            </div>
        </Card>
    );
};

const Reports: React.FC = () => {
    const { t, exportData, transactions } = useAppContext();
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

    // Logic lọc và tính toán dữ liệu
    const stats = useMemo(() => {
        // 1. Xác định khoảng thời gian lọc
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Tính đầu tuần (Chủ nhật hoặc Thứ 2 tùy logic, ở đây lấy Chủ nhật làm mốc cho dễ tính JS)
        const dayOfWeek = startOfToday.getDay(); 
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - dayOfWeek); // Về chủ nhật tuần này

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // 2. Lọc giao dịch theo Timeframe
        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            // Reset giờ về 0 để so sánh ngày chính xác
            txDate.setHours(0,0,0,0);

            if (timeframe === 'week') return txDate >= startOfWeek;
            if (timeframe === 'month') return txDate >= startOfMonth;
            if (timeframe === 'year') return txDate >= startOfYear;
            return true;
        });

        // 3. Tính tổng
        const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        
        // 4. Nhóm chi tiêu theo danh mục (Cho biểu đồ tròn)
        const categoryMap = new Map<string, number>();
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
        });

        const categorySpending: CategorySpending[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name: t(name) || name, // Fallback nếu không dịch được
            value
        }));

        // 5. Tính toán dữ liệu biểu đồ Xu hướng (Thay thế Math.random)
        let spendingTrend: SpendingData[] = [];

        if (timeframe === 'week') {
            // Tạo mảng 7 ngày trong tuần (CN -> T7 hoặc T2 -> CN)
            // Ở đây mình làm chuẩn JS: 0=Sun, 1=Mon...
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            spendingTrend = days.map(d => ({ period: d, income: 0, expense: 0 }));

            filteredTransactions.forEach(tx => {
                const date = new Date(tx.date);
                const dayIndex = date.getDay(); // 0-6
                if (tx.type === 'income') spendingTrend[dayIndex].income += tx.amount;
                else spendingTrend[dayIndex].expense += tx.amount;
            });
            
            // Sắp xếp lại nếu muốn T2 đứng đầu (Tuỳ chọn)
            // const sunday = spendingTrend.shift();
            // if (sunday) spendingTrend.push(sunday);

        } else if (timeframe === 'month') {
            // Chia tháng thành 4-5 tuần
            // Cách đơn giản: Tuần 1 (Ngày 1-7), Tuần 2 (8-14)...
            spendingTrend = ['W1', 'W2', 'W3', 'W4', 'W5'].map(w => ({ period: w, income: 0, expense: 0 }));

            filteredTransactions.forEach(tx => {
                const date = new Date(tx.date);
                const day = date.getDate();
                // Tính index tuần: (Ngày - 1) / 7. VD: Ngày 1/7 = 0, Ngày 8/7 = 1
                const weekIndex = Math.min(Math.floor((day - 1) / 7), 4); 
                
                if (tx.type === 'income') spendingTrend[weekIndex].income += tx.amount;
                else spendingTrend[weekIndex].expense += tx.amount;
            });

        } else {
            // Timeframe = Year -> Chia thành 12 tháng
            const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            spendingTrend = months.map(m => ({ period: m, income: 0, expense: 0 }));

            filteredTransactions.forEach(tx => {
                const date = new Date(tx.date);
                const monthIndex = date.getMonth(); // 0-11
                if (tx.type === 'income') spendingTrend[monthIndex].income += tx.amount;
                else spendingTrend[monthIndex].expense += tx.amount;
            });
        }

        return { totalIncome, totalExpense, balance: totalIncome - totalExpense, categorySpending, spendingTrend, filteredTransactions };
    }, [transactions, t, timeframe]);

    return (
        <div className="pb-10">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text">{t('reports.title')}</h2>
                    <p className="text-muted text-sm mt-1">
                        {t('reports.basedOn', { count: stats.filteredTransactions.length }) || `Dựa trên ${stats.filteredTransactions.length} giao dịch`}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Timeframe Selector */}
                    <div className="bg-card/50 p-1 rounded-xl border border-white/20 flex shadow-sm">
                        {(['week', 'month', 'year'] as const).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                    timeframe === tf 
                                    ? 'bg-primary text-primary-content shadow-md' 
                                    : 'text-muted hover:text-text'
                                }`}
                            >
                                {t(`reports.timeframe.${tf}`)}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={exportData}
                        className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-semibold hover:bg-accent/20 flex items-center transition-all border border-accent/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('export') || 'Xuất CSV'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title={t('reports.totalIncome')} amount={stats.totalIncome} type="income" />
                <SummaryCard title={t('reports.totalExpense')} amount={stats.totalExpense} type="expense" />
                <SummaryCard title={t('reports.balance')} amount={stats.balance} type="balance" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Biểu đồ cột Thu/Chi */}
                <IncomeExpenseBarChart data={stats.spendingTrend} />
                
                {/* Biểu đồ tròn Danh mục */}
                <CategoryDonutChart data={stats.categorySpending} />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Biểu đồ đường xu hướng */}
                <SpendingChart data={stats.spendingTrend} />
            </div>
        </div>
    );
};

export default Reports;