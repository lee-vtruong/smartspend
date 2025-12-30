
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionCategory } from '../types';
import Card from '../components/Card';
import AddTransactionModal from '../components/AddTransactionModal';
import TransferWalletModal from '../components/TransferWalletModal';
import { useAppContext } from '../contexts/AppContext';

const TransactionListItem: React.FC<{ transaction: Transaction; onEdit: () => void; onDelete: () => void; }> = ({ transaction, onEdit, onDelete }) => {
    const { t, formatCurrency } = useAppContext();
    return (
        <li className="group flex items-center justify-between py-4 px-4 hover:bg-primary/5 rounded-xl transition-all duration-200 mb-2 border border-transparent hover:border-primary/10">
            <div className="flex items-center">
                <div className="p-3 bg-background rounded-2xl shadow-sm border border-card-border group-hover:scale-110 transition-transform">
                    {React.cloneElement(transaction.icon, { className: 'h-6 w-6 text-primary' })}
                </div>
                <div className="ml-4">
                    <p className="font-bold text-text group-hover:text-primary transition-colors">{transaction.payee}</p>
                    <p className="text-sm text-muted flex items-center">
                        <span className="bg-primary/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold mr-2">{t(transaction.category)}</span>
                        <span>{transaction.wallet}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                <div className="text-right mr-6">
                    <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted font-medium">{new Date(transaction.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    <button onClick={onEdit} className="p-2 text-muted hover:text-primary rounded-full hover:bg-primary/10 transition-all" title={t('transactions.editTooltip')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                    </button>
                    <button onClick={onDelete} className="p-2 text-muted hover:text-danger rounded-full hover:bg-danger/10 transition-all" title={t('transactions.deleteTooltip')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </li>
    );
};

const TransactionsPage: React.FC = () => {
    const { 
        transactions, 
        wallets, 
        handleUpdateTransaction, 
        handleDeleteTransaction, 
        handleWalletTransfer, 
        handleAddTransaction,
        transactionCategories,
        t,
        formatCurrency 
    } = useAppContext();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterWallet, setFilterWallet] = useState('all');

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setEditModalOpen(true);
    };

    const handleDelete = (transactionId: string) => {
        if (window.confirm(t('transactions.confirmDelete'))) {
            handleDeleteTransaction(transactionId);
        }
    };
    
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.payee.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
            const matchesWallet = filterWallet === 'all' || t.wallet === filterWallet;
            return matchesSearch && matchesCategory && matchesWallet;
        });
    }, [transactions, searchTerm, filterCategory, filterWallet]);

    const allCategories: TransactionCategory[] = transactionCategories;
    const allWallets: string[] = wallets.map(w => w.name);
    const commonInputClass = "w-full px-4 py-2.5 bg-background/50 border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm";
    
  return (
    <div className="min-h-[80vh] flex flex-col">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div>
                <h2 className="text-4xl font-extrabold text-text tracking-tight">{t('transactions.title')}</h2>
                <p className="text-muted mt-1 font-medium">{filteredTransactions.length} giao dịch được tìm thấy</p>
            </div>
            <div className="flex space-x-3">
                 <button onClick={() => setTransferModalOpen(true)} className="group px-5 py-2.5 text-sm font-bold text-accent bg-accent/10 border border-accent/20 rounded-xl hover:bg-accent/20 flex items-center transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                    {t('transactions.transferButton')}
                </button>
                <button onClick={() => setAddModalOpen(true)} className="group px-6 py-2.5 text-sm font-extrabold text-primary-content bg-primary rounded-xl hover:bg-primary-focus flex items-center transition-all shadow-lg hover:shadow-primary/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {t('transactions.addButton')}
                </button>
            </div>
        </div>
        
        {/* Main Content Area */}
        <Card className="!p-0 flex-1 flex flex-col border-white/20 shadow-2xl bg-card/60 overflow-hidden">
            {/* Filter Bar - Sticky */}
            <div className="p-5 border-b border-card-border bg-card/40 backdrop-blur-md sticky top-0 z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder={t('transactions.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${commonInputClass} pl-10`}
                        />
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={commonInputClass}>
                        <option value="all">{t('transactions.allCategories')}</option>
                        {allCategories.map(c => <option key={c.name} value={c.name}>{c.isCustom ? c.name : t(c.name)}</option>)}
                    </select>
                    <select value={filterWallet} onChange={e => setFilterWallet(e.target.value)} className={commonInputClass}>
                        <option value="all">{t('transactions.allWallets')}</option>
                        {allWallets.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
            </div>

            {/* List Section */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {filteredTransactions.length > 0 ? (
                    <ul className="space-y-1">
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
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <p className="text-xl font-bold">{t('transactions.noTransactions')}</p>
                    </div>
                )}
            </div>

            {/* Footer Summary (Optional but looks professional) */}
            <div className="p-4 bg-background/30 border-t border-card-border flex justify-between items-center text-sm font-medium text-muted">
                <span>Trang 1 / 1</span>
                <span>SmartSpend Transaction Management</span>
            </div>
        </Card>

        {isEditModalOpen && (
            <AddTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => { setEditModalOpen(false); setSelectedTransaction(null); }}
                onUpdate={handleUpdateTransaction}
                onAdd={()=>{}} 
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
