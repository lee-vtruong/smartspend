import React, { useState } from 'react';
import Card from '../components/Card';
import { DebtLoanItem } from '../types';
import AddDebtLoanModal from '../components/AddDebtLoanModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { useAppContext } from '../contexts/AppContext';

// --- ICON COMPONENTS (Đồng nhất với các trang khác) ---
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

const DebtLoanCard: React.FC<{ 
    item: DebtLoanItem, 
    onRecordPaymentClick: () => void,
    onEditClick: () => void,
    onDeleteClick: () => void
}> = ({ item, onRecordPaymentClick, onEditClick, onDeleteClick }) => {
    const { t, formatCurrency } = useAppContext();
    const percentage = (item.paidAmount / item.initialAmount) * 100;
    const isCompleted = percentage >= 100;
    const isOverdue = !isCompleted && item.dueDate && new Date(item.dueDate) < new Date();
    
    const progressColor = isCompleted 
        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
        : percentage > 90 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
            : percentage > 75 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : item.type === 'debt'
                    ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-500';

    const cardBorderColor = isOverdue 
        ? 'border-rose-200 dark:border-rose-800/30' 
        : isCompleted
            ? 'border-emerald-200 dark:border-emerald-800/30'
            : 'border-gray-200 dark:border-white/10';

    const cardBgColor = isOverdue
        ? 'bg-gradient-to-br from-rose-50/50 to-rose-100/30 dark:from-rose-900/10 dark:to-rose-950/5'
        : isCompleted
            ? 'bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-emerald-950/5'
            : 'bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30';

    return (
        <div className={`p-4 rounded-2xl border ${cardBorderColor} ${cardBgColor} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden`}>
            {/* Quick Actions overlay on hover */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <button 
                    onClick={onEditClick} 
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 shadow-sm"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={onDeleteClick} 
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-600 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 backdrop-blur-sm transition-all duration-200 shadow-sm"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.type === 'debt' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                            {item.type === 'debt' ? t('debts.debt') : t('debts.loan')}
                        </span>
                        {isCompleted && (
                            <span className="px-2 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Hoàn tất
                            </span>
                        )}
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-lg tracking-tight">{item.person}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{item.description || 'Không có mô tả'}</p>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-bold tracking-tight ${item.type === 'debt' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(item.initialAmount - item.paidAmount)}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
                        {t('debts.remaining')}
                    </p>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    <span>{t('debts.progress')}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-700 ease-out ${progressColor} shadow-sm`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>{formatCurrency(item.paidAmount)}</span>
                    <span>{formatCurrency(item.initialAmount)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-white/10">
                <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isOverdue ? 'bg-rose-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    <p className={`text-xs font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {isOverdue ? (
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {t('debts.overdue')}
                            </span>
                        ) : item.dueDate ? (
                            `${t('debts.dueDate')}: ${new Date(item.dueDate).toLocaleDateString('vi-VN')}`
                        ) : 'Không có hạn'}
                    </p>
                </div>
                {!isCompleted && (
                    <button 
                        onClick={onRecordPaymentClick} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                    >
                        {t('debts.recordPaymentButton')}
                    </button>
                )}
            </div>
        </div>
    );
};


const DebtsLoansPage: React.FC = () => {
    const { 
        debtsLoans, 
        handleAddDebtLoan, 
        handleEditDebtLoan, 
        handleDeleteDebtLoan, 
        handleRecordPayment, 
        t,
        formatCurrency
    } = useAppContext();

    const [activeTab, setActiveTab] = useState<'debts' | 'loans'>('debts');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState<DebtLoanItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<DebtLoanItem | null>(null);

    const debts = debtsLoans.filter(item => item.type === 'debt');
    const loans = debtsLoans.filter(item => item.type === 'loan');
    
    const totalDebts = debts.reduce((sum, item) => sum + (item.initialAmount - item.paidAmount), 0);
    const totalLoans = loans.reduce((sum, item) => sum + (item.initialAmount - item.paidAmount), 0);
    
    const handleRecordPaymentClick = (item: DebtLoanItem) => {
        setSelectedItem(item);
        setPaymentModalOpen(true);
    };

    const handleEditClick = (item: DebtLoanItem) => {
        setItemToEdit(item);
        setAddModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này? Thao tác này không thể hoàn tác.")) {
            handleDeleteDebtLoan(id);
        }
    };

    const handleOpenAdd = () => {
        setItemToEdit(null);
        setAddModalOpen(true);
    }

    return (
        <div className="min-h-[85vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                            {t('debts.title') || 'Khoản vay & Cho vay'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                            Theo dõi các khoản vay mượn để luôn sòng phẳng
                        </p>
                    </div>
                    <button 
                        onClick={handleOpenAdd} 
                        className="group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 flex items-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('debts.addNewButton') || 'Thêm khoản mới'}
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/30">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('debts.totalDebts') || 'Tổng nợ'}</p>
                                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                                    {formatCurrency(totalDebts)}
                                </p>
                            </div>
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            {debts.length} khoản nợ • {debts.filter(d => d.dueDate && new Date(d.dueDate) < new Date()).length} khoản quá hạn
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('debts.totalLoans') || 'Tổng cho vay'}</p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(totalLoans)}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            {loans.length} khoản cho vay • {loans.filter(l => l.dueDate && new Date(l.dueDate) < new Date()).length} khoản quá hạn
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="flex bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 p-1.5 rounded-xl border border-gray-300 dark:border-white/15 shadow-sm w-fit">
                    <button 
                        onClick={() => setActiveTab('debts')} 
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'debts' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {t('debts.debtsTab') || 'Tôi nợ'} 
                        <span className="ml-2 bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {debts.length}
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('loans')} 
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'loans' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {t('debts.loansTab') || 'Cho vay'} 
                        <span className="ml-2 bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {loans.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1">
                {(activeTab === 'debts' ? debts : loans).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {(activeTab === 'debts' ? debts : loans).map(item => (
                            <DebtLoanCard 
                                key={item.id} 
                                item={item} 
                                onRecordPaymentClick={() => handleRecordPaymentClick(item)} 
                                onEditClick={() => handleEditClick(item)}
                                onDeleteClick={() => handleDeleteClick(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/20 text-center animate-fade-in mt-6 shadow-inner">
                        <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full mb-6 shadow-sm border border-gray-200 dark:border-white/10">
                            {activeTab === 'debts' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-400 dark:text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-400 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                            {activeTab === 'debts' 
                                ? t('debts.noDebts') || 'Không có khoản nợ nào'
                                : t('debts.noLoans') || 'Không có khoản cho vay nào'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 max-w-md mb-8 text-sm leading-relaxed">
                            {activeTab === 'debts' 
                                ? 'Bạn chưa có khoản nợ nào. Hãy thêm khoản nợ mới để theo dõi.'
                                : 'Bạn chưa có khoản cho vay nào. Hãy thêm khoản cho vay mới để theo dõi.'}
                        </p>
                        <button 
                            onClick={handleOpenAdd}
                            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Thêm khoản mới
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            {(debts.length > 0 || loans.length > 0) && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <span>Nợ: {debts.length} khoản</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span>Cho vay: {loans.length} khoản</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-800 dark:text-gray-300">
                                Tổng chênh lệch: 
                                <span className={`ml-2 ${totalLoans - totalDebts >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {formatCurrency(totalLoans - totalDebts)}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddDebtLoanModal 
                isOpen={isAddModalOpen} 
                onClose={() => setAddModalOpen(false)} 
                onAdd={handleAddDebtLoan}
                itemToEdit={itemToEdit}
                onUpdate={handleEditDebtLoan}
            />
            <RecordPaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setPaymentModalOpen(false)} 
                onRecord={handleRecordPayment} 
                item={selectedItem} 
            />
        </div>
    );
};

export default DebtsLoansPage;