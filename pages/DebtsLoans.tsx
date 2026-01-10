import React, { useState } from 'react';
import Card from '../components/Card';
import { DebtLoanItem } from '../types';
import AddDebtLoanModal from '../components/AddDebtLoanModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { useAppContext } from '../contexts/AppContext';

// --- ICON COMPONENTS ---
const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
    const progressColor = isCompleted ? 'bg-success' : 'bg-primary';

    return (
        <Card className={`transition-all hover:shadow-xl border ${isOverdue ? 'border-danger/30 bg-danger/5' : 'border-white/20'} group relative overflow-hidden`}>
            {/* Quick Actions overlay on hover */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEditClick} className="p-1.5 bg-white/80 dark:bg-card/80 rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={onDeleteClick} className="p-1.5 bg-white/80 dark:bg-card/80 rounded-lg text-danger hover:bg-danger hover:text-white transition-all shadow-sm">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>

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
                    <div className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
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
                        {isOverdue ? t('debts.overdue') : item.dueDate ? `${t('debts.dueDate')}: ${new Date(item.dueDate).toLocaleDateString('vi-VN')}` : 'Không có hạn'}
                    </p>
                </div>
                {!isCompleted && (
                    <button onClick={onRecordPaymentClick} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-content bg-primary rounded-xl hover:bg-primary-focus transition-all shadow-md active:scale-95">
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
    const { 
        debtsLoans, 
        handleAddDebtLoan, 
        handleEditDebtLoan, 
        handleDeleteDebtLoan, 
        handleRecordPayment, 
        t 
    } = useAppContext();

    const [activeTab, setActiveTab] = useState<'debts' | 'loans'>('debts');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState<DebtLoanItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<DebtLoanItem | null>(null);

    const debts = debtsLoans.filter(item => item.type === 'debt');
    const loans = debtsLoans.filter(item => item.type === 'loan');
    
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
        <div className="min-h-[85vh] flex flex-col pb-12">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-text tracking-tight uppercase">{t('debts.title')}</h2>
                    <p className="text-muted mt-1 font-medium italic">Ghi nhớ mọi khoản vay mượn để luôn sòng phẳng</p>
                </div>
                <button onClick={handleOpenAdd} className="group px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-content bg-primary rounded-2xl hover:bg-primary-focus flex items-center transition-all shadow-xl hover:-translate-y-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('debts.addNewButton')}
                </button>
            </div>
            
            <div className="mb-8">
                <div className="flex space-x-2 bg-card/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 w-fit shadow-sm">
                    <button onClick={() => setActiveTab('debts')} className={`px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'debts' ? 'bg-primary text-primary-content shadow-lg' : 'text-muted hover:text-text hover:bg-white/10'}`}>
                        {t('debts.debtsTab')} <span className="ml-1 opacity-50">({debts.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('loans')} className={`px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'loans' ? 'bg-primary text-primary-content shadow-lg' : 'text-muted hover:text-text hover:bg-white/10'}`}>
                        {t('debts.loansTab')} <span className="ml-1 opacity-50">({loans.length})</span>
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {(activeTab === 'debts' ? debts : loans).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
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
                    <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-3xl border border-dashed border-card-border/60 opacity-60">
                        <p className="text-xl font-black uppercase tracking-widest text-muted">{activeTab === 'debts' ? t('debts.noDebts') : t('debts.noLoans')}</p>
                        <p className="mt-2 text-sm font-medium text-muted/60">Bấm nút "Thêm khoản mới" để bắt đầu theo dõi.</p>
                    </div>
                )}
            </div>

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