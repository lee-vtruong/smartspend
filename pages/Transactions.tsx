import React, { useState, useMemo } from 'react';
import { Transaction, TransactionCategory } from '../types';
import Card from '../components/Card';
import AddTransactionModal from '../components/AddTransactionModal';
import TransferWalletModal from '../components/TransferWalletModal';
import { useAppContext } from '../contexts/AppContext';
import TransactionFilters, { FilterValues } from '../components/TransactionFilters';

const TransactionListItem: React.FC<{ 
    transaction: Transaction; 
    onEdit: () => void; 
    onDelete: () => void; 
}> = ({ transaction, onEdit, onDelete }) => {
    const { t, formatCurrency } = useAppContext();
    const displayTitle = transaction.payee || transaction.description || "Giao dịch không tên";
    
    const date = new Date(transaction.date);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isThisWeek = Math.abs(today.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;

    return (
        <li className="group flex items-center justify-between p-4 hover:bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:hover:from-primary/10 dark:hover:via-primary/5 rounded-xl transition-all duration-300 mb-2 border border-gray-200/50 dark:border-white/10 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-center flex-1 min-w-0">
                <div className="p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/10 group-hover:scale-110 transition-transform duration-300 mr-4">
                    {transaction.icon ? React.cloneElement(transaction.icon, { 
                        className: 'h-6 w-6 text-primary' 
                    }) : (
                        <div className="h-6 w-6 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                {transaction.type === 'income' ? '↑' : '↓'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate group-hover:text-primary transition-colors duration-200">
                            {displayTitle}
                        </p>
                        <p className={`font-bold text-lg ml-2 whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {t(transaction.category || 'general')}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full truncate max-w-[120px]">
                            {transaction.wallet}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {date.toLocaleDateString('vi-VN', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                            })}
                            {(isToday || isThisWeek) && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isToday ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                    {isToday ? 'Hôm nay' : 'Tuần này'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center ml-4">
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button 
                        onClick={onEdit} 
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200" 
                        title={t('transactions.editTooltip')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all duration-200" 
                        title={t('transactions.deleteTooltip')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </li>
    );
};

const TransactionsPage: React.FC = () => {
    const { 
        transactions, wallets, handleUpdateTransaction, handleDeleteTransaction, 
        handleWalletTransfer, handleAddTransaction, transactionCategories, t, formatCurrency 
    } = useAppContext();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    
    // Các state lọc cơ bản
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterWallet, setFilterWallet] = useState('all');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    // Bộ lọc nâng cao
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        startDate: '', endDate: '', minAmount: '', maxAmount: ''
    });

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setEditModalOpen(true);
    };

    const handleDelete = (transactionId: string) => {
        if (window.confirm(t('transactions.confirmDelete'))) {
            handleDeleteTransaction(transactionId);
        }
    };
    
    // Logic lọc transactions - KHẢI BÁO TRƯỚC
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Lọc cơ bản (Search, Category, Wallet, Type)
            const term = searchTerm.toLowerCase();
            const payee = (t.payee || '').toLowerCase();
            const desc = (t.description || '').toLowerCase();
            const cat = (t.category || '').toLowerCase();
            const wal = (t.wallet || '').toLowerCase();

            const matchesSearch = payee.includes(term) || desc.includes(term) || cat.includes(term) || wal.includes(term);
            const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
            const matchesWallet = filterWallet === 'all' || t.wallet === filterWallet;
            const matchesType = filterType === 'all' || t.type === filterType;

            // Lọc nâng cao (Date)
            let matchesDate = true;
            if (advancedFilters.startDate) {
                matchesDate = matchesDate && new Date(t.date) >= new Date(advancedFilters.startDate);
            }
            if (advancedFilters.endDate) {
                matchesDate = matchesDate && new Date(t.date) <= new Date(advancedFilters.endDate);
            }

            // Lọc nâng cao (Amount)
            let matchesAmount = true;
            if (advancedFilters.minAmount) {
                matchesAmount = matchesAmount && t.amount >= parseFloat(advancedFilters.minAmount);
            }
            if (advancedFilters.maxAmount) {
                matchesAmount = matchesAmount && t.amount <= parseFloat(advancedFilters.maxAmount);
            }
            
            return matchesSearch && matchesCategory && matchesWallet && matchesType && matchesDate && matchesAmount;
        });
    }, [transactions, searchTerm, filterCategory, filterWallet, filterType, advancedFilters]);

    // Tính toán tổng thu nhập và chi tiêu - SỬ DỤNG SAU KHI ĐÃ KHAI BÁO
    const summary = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const net = income - expense;
        
        return { income, expense, net };
    }, [filteredTransactions]);

    const allCategories: TransactionCategory[] = transactionCategories;
    const allWallets: string[] = wallets.map(w => w.name);
    const commonInputClass = "w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm";
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                            {t('transactions.title')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                            Quản lý và theo dõi tất cả giao dịch của bạn
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setTransferModalOpen(true)} 
                            className="group px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-white/15 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            {t('transactions.transferButton')}
                        </button>
                        <button 
                            onClick={() => setAddModalOpen(true)} 
                            className="group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 hover:shadow-lg transition-all duration-300 flex items-center transform hover:-translate-y-0.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-90">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('transactions.addButton')}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Tổng thu nhập</p>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                                    {formatCurrency(summary.income)}
                                </p>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 rounded-xl border border-rose-200 dark:border-rose-800/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-rose-800 dark:text-rose-300 font-medium">Tổng chi tiêu</p>
                                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
                                    {formatCurrency(summary.expense)}
                                </p>
                            </div>
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Số dư ròng</p>
                                <p className={`text-2xl font-bold mt-1 ${summary.net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                    {summary.net >= 0 ? '+' : ''}{formatCurrency(summary.net)}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
            {/* Main Content Area */}
            <Card className="overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl">
                {/* Filter Bar */}
                <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder={t('transactions.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${commonInputClass} pl-10`}
                            />
                        </div>
                        <select 
                            value={filterCategory} 
                            onChange={e => setFilterCategory(e.target.value)} 
                            className={commonInputClass}
                        >
                            <option value="all">{t('transactions.allCategories')}</option>
                            {allCategories.map(c => (
                                <option key={c.name} value={c.name}>
                                    {c.isCustom ? c.name : t(c.name)}
                                </option>
                            ))}
                        </select>
                        <select 
                            value={filterWallet} 
                            onChange={e => setFilterWallet(e.target.value)} 
                            className={commonInputClass}
                        >
                            <option value="all">{t('transactions.allWallets')}</option>
                            {allWallets.map(w => (
                                <option key={w} value={w}>{w}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Type Filter & Advanced Filter Toggle */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                                    filterType === 'all' 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setFilterType('income')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                                    filterType === 'income' 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-md' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Thu nhập
                            </button>
                            <button
                                onClick={() => setFilterType('expense')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                                    filterType === 'expense' 
                                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 shadow-md' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Chi tiêu
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${showAdvancedFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {showAdvancedFilter ? "Ẩn bộ lọc nâng cao" : "Bộ lọc nâng cao"}
                        </button>
                    </div>

                    {/* Advanced Filter Component */}
                    {showAdvancedFilter && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <TransactionFilters onFilterChange={setAdvancedFilters} />
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="font-bold text-primary">{filteredTransactions.length}</span> giao dịch được tìm thấy
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cập nhật vừa xong
                        </p>
                    </div>
                </div>

                {/* List Section */}
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {filteredTransactions.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredTransactions.map(t => (
                                <TransactionListItem 
                                    key={t.id} 
                                    transaction={t}
                                    onEdit={() => handleEdit(t)}
                                    onDelete={() => handleDelete(t.id)}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-6 border border-gray-200 dark:border-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                                {t('transactions.noTransactions')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                                Không tìm thấy giao dịch nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc thêm giao dịch mới.
                            </p>
                            <button 
                                onClick={() => setAddModalOpen(true)} 
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Thêm giao dịch đầu tiên
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Hệ thống đang hoạt động
                    </span>
                    <span>SmartSpend Transaction Management</span>
                </div>
            </Card>

            {/* Modals */}
            {isEditModalOpen && (
                <AddTransactionModal
                    isOpen={isEditModalOpen}
                    onClose={() => { 
                        setEditModalOpen(false); 
                        setSelectedTransaction(null); 
                    }}
                    onUpdate={handleUpdateTransaction}
                    onAdd={() => {}} 
                    wallets={wallets}
                    transactionToEdit={selectedTransaction}
                />
            )}
            
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddTransaction}
                wallets={wallets}
            />

            <TransferWalletModal
                isOpen={isTransferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                onTransfer={handleWalletTransfer}
                wallets={wallets}
            />
        </div>
    );
};

export default TransactionsPage;