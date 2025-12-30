
import React, { useState } from 'react';
import Card from '../components/Card';
import { DebtLoanItem } from '../types';
import AddDebtLoanModal from '../components/AddDebtLoanModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { useAppContext } from '../contexts/AppContext';


const DebtLoanCard: React.FC<{ item: DebtLoanItem, onRecordPaymentClick: () => void }> = ({ item, onRecordPaymentClick }) => {
    const { t, formatCurrency } = useAppContext();
    const percentage = (item.paidAmount / item.initialAmount) * 100;
    const isCompleted = percentage >= 100;
    const isOverdue = !isCompleted && new Date(item.dueDate) < new Date();
    const progressColor = isCompleted ? 'bg-success' : 'bg-primary';

    return (
        <Card className={`transition-all hover:shadow-xl hover:-translate-y-1 border ${isOverdue ? 'border-danger/30 bg-danger/5' : 'border-white/20'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <p className={`font-black text-xl leading-tight uppercase tracking-tight ${item.type === 'debt' ? 'text-danger' : 'text-success'}`}>{item.person}</p>
                    <p className="text-sm text-muted mt-1 font-medium italic">{item.description || 'Không có mô tả'}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-text">{formatCurrency(item.initialAmount - item.paidAmount)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{t('debts.remaining')}</p>
                </div>
            </div>
            <div className="mt-6">
                <div className="w-full bg-background/50 rounded-full h-3 border border-card-border overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor} shadow-[0_0_10px_rgba(20,184,166,0.3)]`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted mt-2">
                    <span>{t('debts.paid')}: <span className="text-text">{formatCurrency(item.paidAmount)}</span></span>
                    <span>{t('debts.total')}: <span className="text-text">{formatCurrency(item.initialAmount)}</span></span>
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-card-border/50">
                <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isOverdue ? 'bg-danger animate-pulse' : 'bg-muted'}`}></div>
                    <p className={`text-xs font-bold uppercase tracking-tight ${isOverdue ? 'text-danger' : 'text-muted'}`}>
                        {isOverdue ? t('debts.overdue') : `${t('debts.dueDate')}: ${new Date(item.dueDate).toLocaleDateString('vi-VN')}`}
                    </p>
                </div>
                {!isCompleted && (
                    <button onClick={onRecordPaymentClick} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-content bg-primary rounded-xl hover:bg-primary-focus transition-all shadow-md hover:shadow-primary/30 active:scale-95">
                        {t('debts.recordPaymentButton')}
                    </button>
                )}
                {isCompleted && (
                    <span className="flex items-center text-success font-black text-xs uppercase tracking-widest">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Đã xong
                    </span>
                )}
            </div>
        </Card>
    );
};


const DebtsLoansPage: React.FC = () => {
    const { debtsLoans, handleAddDebtLoan, handleRecordPayment, t } = useAppContext();
    const [activeTab, setActiveTab] = useState<'debts' | 'loans'>('debts');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DebtLoanItem | null>(null);

    const debts = debtsLoans.filter(item => item.type === 'debt');
    const loans = debtsLoans.filter(item => item.type === 'loan');
    
    const handleRecordPaymentClick = (item: DebtLoanItem) => {
        setSelectedItem(item);
        setPaymentModalOpen(true);
    };

    return (
        <div className="min-h-[85vh] flex flex-col pb-12">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-text tracking-tight uppercase">{t('debts.title')}</h2>
                    <p className="text-muted mt-1 font-medium italic">Ghi nhớ mọi khoản vay mượn để luôn sòng phẳng</p>
                </div>
                <button 
                    onClick={() => setAddModalOpen(true)} 
                    className="group px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-content bg-primary rounded-2xl hover:bg-primary-focus flex items-center transition-all shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('debts.addNewButton')}
                </button>
            </div>
            
            <div className="mb-8">
                <div className="flex space-x-2 bg-card/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 w-fit shadow-sm">
                    <button 
                        onClick={() => setActiveTab('debts')} 
                        className={`px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'debts' ? 'bg-primary text-primary-content shadow-lg' : 'text-muted hover:text-text hover:bg-white/10'}`}
                    >
                        {t('debts.debtsTab')} <span className="ml-1 opacity-50">({debts.length})</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('loans')} 
                        className={`px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'loans' ? 'bg-primary text-primary-content shadow-lg' : 'text-muted hover:text-text hover:bg-white/10'}`}
                    >
                        {t('debts.loansTab')} <span className="ml-1 opacity-50">({loans.length})</span>
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {(activeTab === 'debts' ? debts : loans).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        { (activeTab === 'debts' ? debts : loans).map(item => (
                            <DebtLoanCard key={item.id} item={item} onRecordPaymentClick={() => handleRecordPaymentClick(item)} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-card/20 backdrop-blur-sm rounded-3xl border border-dashed border-card-border/60 opacity-60">
                        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-xl font-black uppercase tracking-widest text-muted">
                            {activeTab === 'debts' ? t('debts.noDebts') : t('debts.noLoans')}
                        </p>
                        <p className="mt-2 text-sm font-medium text-muted/60">Bấm nút "Thêm khoản mới" để bắt đầu theo dõi.</p>
                    </div>
                )}
            </div>

            <AddDebtLoanModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddDebtLoan} />
            <RecordPaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} onRecord={handleRecordPayment} item={selectedItem} />
        </div>
    );
};

export default DebtsLoansPage;
