import React, { useState, useMemo, useEffect } from 'react';
import { Group, GroupMember, Settlement, GroupTransaction } from '../types';
import Card from '../components/Card';
import AddGroupModal from '../components/AddGroupModal';
import AddGroupTransactionModal from '../components/AddGroupTransactionModal';
import EditGroupTransactionModal from '../components/EditGroupTransactionModal';
import AddMemberModal from '../components/AddMemberModal';
import GroupSettingsModal from '../components/GroupSettingsModal';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services/apiService';

// --- ICON COMPONENTS (Đồng nhất với Dashboard) ---
const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// --- SUB-COMPONENT: GROUP DETAILS ---
const GroupDetails: React.FC<{ group: Group }> = ({ group }) => {
    const { t, language, handleAddGroupTransaction, fetchInitialData, user, showToast } = useAppContext();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [isEditTxModalOpen, setEditTxModalOpen] = useState(false);
    const [txToEdit, setTxToEdit] = useState<GroupTransaction | null>(null);
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [transactions, setTransactions] = useState<GroupTransaction[]>([]);
    const [isLoadingTx, setIsLoadingTx] = useState(false);

    const isOwner = group.createdBy === user?.id;

    const formatGroupCurrency = (amount: number, currency: string) => {
        const locale = language === 'vi' ? 'vi-VN' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
    };

    const loadGroupTransactions = async () => {
        if (!group?.id) return;
        setIsLoadingTx(true);
        try {
            const data = await apiService.getGroupTransactions(group.id);
            setTransactions(data as GroupTransaction[]);
        } catch (error) {
            console.error("Lỗi tải giao dịch nhóm:", error);
        } finally {
            setIsLoadingTx(false);
        }
    };

    useEffect(() => {
        setActiveTab('overview');
        loadGroupTransactions();
    }, [group.id]);

    const onAddTransaction = async (transactionData: Omit<GroupTransaction, 'id'>) => {
        try {
            await handleAddGroupTransaction(group.id, transactionData);
            await loadGroupTransactions();
            setTransactionModalOpen(false);
            showToast("Thêm giao dịch thành công", "success");
        } catch (e: any) {
            showToast(e.message, "error");
        }
    };

    const handleEditTransaction = async (txId: string, data: Partial<GroupTransaction>) => {
        try {
            await apiService.updateGroupTransaction(group.id, txId, data);
            showToast("Cập nhật giao dịch thành công", "success");
            setEditTxModalOpen(false);
            setTxToEdit(null);
            loadGroupTransactions();
        } catch (e: any) {
            showToast(e.message, "error");
        }
    }

    const openEditModal = (tx: GroupTransaction) => {
        setTxToEdit(tx);
        setEditTxModalOpen(true);
    }

    const handleDeleteTransaction = async (txId: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
            try {
                await apiService.deleteGroupTransaction(group.id, txId);
                showToast("Đã xóa giao dịch", "success");
                loadGroupTransactions();
            } catch (e: any) {
                showToast(e.message, "error");
            }
        }
    };

    const groupData = useMemo(() => {
        if (!group) return null;

        const balanceMap = new Map<string, number>();
        group.members.forEach(m => balanceMap.set(m.id, 0));

        let totalContributions = 0;
        let totalExpenses = 0;

        transactions.forEach(tx => {
            const amount = Number(tx.amount);
            
            if (tx.type === 'contribution') {
                const currentPayerBalance = balanceMap.get(tx.payerId) || 0;
                balanceMap.set(tx.payerId, currentPayerBalance + amount);
                totalContributions += amount;
            } 
            else if (tx.type === 'expense') {
                totalExpenses += amount;
                
                const currentPayerBalance = balanceMap.get(tx.payerId) || 0;
                balanceMap.set(tx.payerId, currentPayerBalance + amount);

                if (tx.participants && tx.participants.length > 0) {
                    const splitAmount = amount / tx.participants.length;
                    
                    tx.participants.forEach(participantId => {
                        const currentPartBalance = balanceMap.get(participantId) || 0;
                        balanceMap.set(participantId, currentPartBalance - splitAmount);
                    });
                }
            }
        });

        const memberBalances = Array.from(balanceMap.entries()).map(([id, balance]) => {
            const memberInfo = group.members.find(m => m.id === id) || { 
                id, name: "Unknown", avatar: "https://ui-avatars.com/api/?name=?" 
            };
            return {
                member: memberInfo,
                balance: balance
            };
        }).sort((a,b) => b.balance - a.balance);

        const settlements: Settlement[] = [];
        const debtors = memberBalances.filter(mb => mb.balance < -0.01).map(mb => ({...mb, balance: Math.abs(mb.balance)}));
        const creditors = memberBalances.filter(mb => mb.balance > 0.01);
        
        let i = 0;
        let j = 0;

        while(i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const amount = Math.min(debtor.balance, creditor.balance);

            if (amount > 0) {
                settlements.push({
                    from: debtor.member.name,
                    to: creditor.member.name,
                    amount: amount
                });
            }

            debtor.balance -= amount;
            creditor.balance -= amount;

            if (debtor.balance < 0.01) i++;
            if (creditor.balance < 0.01) j++;
        }

        return { 
            totalBalance: totalContributions - totalExpenses, 
            totalExpenses, 
            memberBalances, 
            settlements 
        };
    }, [group, transactions]);

    if (!groupData) return (
        <Card className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải...</p>
            </div>
        </Card>
    );
    
    const { totalBalance, totalExpenses, memberBalances, settlements } = groupData;

    return (
        <div className="flex flex-col flex-1 gap-8 animate-fade-in">
            <Card className="overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg">
                <div className="p-6">
                    {/* Header Section - Cải thiện với gradient */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{group.name}</h3>
                                {group.note && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md p-3 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/30 dark:to-transparent rounded-xl border-l-4 border-primary/50">
                                        {group.note}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                                        {group.members.length} thành viên
                                    </span>
                                    <span className="text-xs font-bold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full">
                                        {group.currency}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3 w-full lg:w-auto">
                            <button 
                                onClick={() => setAddMemberModalOpen(true)} 
                                className="flex-1 lg:flex-none px-5 py-2.5 text-sm font-semibold text-primary bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                </svg> 
                                Mời
                            </button>
                            <button 
                                onClick={() => setTransactionModalOpen(true)} 
                                className="flex-1 lg:flex-none group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg> 
                                {t('groups.addTransactionButton')}
                            </button>
                            <button 
                                onClick={() => setSettingsOpen(true)} 
                                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 rounded-xl transition-all duration-300 border border-gray-200 dark:border-white/10 hover:border-primary/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid - Cải thiện với card gradient */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider mb-2">{t('groups.totalFund')}</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatGroupCurrency(totalBalance, group.currency)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/30">
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider mb-2">{t('groups.spent')}</p>
                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatGroupCurrency(totalExpenses, group.currency)}</p>
                        </div>
                        <div 
                            className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/30 flex flex-col justify-center cursor-pointer hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-50/50 dark:hover:from-blue-800/30 dark:hover:to-blue-900/20 transition-all duration-300" 
                            onClick={() => setSettingsOpen(true)}
                        >
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider mb-3">{t('groups.members')}</p>
                            <div className="flex -space-x-2">
                                {group.members.slice(0, 5).map(m => (
                                    <img 
                                        key={m.id} 
                                        src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} 
                                        alt={m.name} 
                                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 ring-2 ring-gray-100 dark:ring-gray-800 shadow-sm"
                                    />
                                ))}
                                {group.members.length > 5 && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-800 ring-2 ring-gray-100 dark:ring-gray-800">
                                        +{group.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-900/10 p-5 rounded-2xl border border-gray-200 dark:border-white/10 flex flex-col justify-center items-center">
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider mb-2">{t('groups.currency')}</p>
                            <span className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary dark:text-primary-light text-sm font-bold rounded-lg border border-primary/20">
                                {group.currency}
                            </span>
                        </div>
                    </div>

                    {/* Tab Navigation - Cải thiện với hiệu ứng gradient */}
                    <div className="border-b border-gray-200 dark:border-white/10 mb-6">
                        <nav className="flex space-x-8">
                            {[
                                { id: 'overview', label: t('groups.overviewTab') }, 
                                { id: 'transactions', label: t('groups.transactionsTab') }, 
                                { id: 'settle', label: t('groups.settleTab') }
                            ].map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`pb-4 px-1 font-semibold text-sm transition-all duration-300 relative ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary rounded-t-full shadow-[0_-4px_12px_rgba(59,130,246,0.3)]"></div>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6 flex-1 min-h-[300px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-4 animate-fade-in-up">
                                {memberBalances.map(({ member, balance }) => (
                                    <div 
                                        key={member.id} 
                                        className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30 hover:from-gray-100/50 hover:to-white/50 dark:hover:from-gray-800/50 dark:hover:to-gray-900/50 rounded-xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 hover:shadow-sm"
                                    >
                                        <div className="flex items-center">
                                            <div className="relative">
                                                <img 
                                                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} 
                                                    alt={member.name} 
                                                    className="w-12 h-12 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-800"
                                                />
                                                {member.id === group.createdBy && (
                                                    <div 
                                                        className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" 
                                                        title="Trưởng nhóm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 00-.556.834c-.083 1.03-.232 1.681-.486 2.149-.6.46-2.182.531-3.291.536-1.11 0-2.693-.075-3.291-.535-.254-.469-.403-1.12-.486-2.15a1 1 0 00-.556-.835A3.989 3.989 0 011 15a3.989 3.989 0 011.666-3.332L4.405 6.25l-1.233-.616a1 1 0 01.894-1.79l1.599.8L9.617 3.076V2a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <span className="font-bold text-gray-800 dark:text-gray-100 text-lg block">
                                                    {member.name} {member.id === user?.id && <span className="text-primary text-sm font-medium">(Bạn)</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold text-2xl ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {balance > 0 ? '+' : ''}{formatGroupCurrency(balance, group.currency)}
                                            </span>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full inline-block">
                                                {balance >= 0 ? t('groups.owedByGroup') : t('groups.owedToGroup')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <ul className="divide-y divide-gray-100 dark:divide-white/5">
                                {isLoadingTx ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center animate-pulse">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải giao dịch...</p>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    transactions.slice().sort((a,b) => new Date(b.date || b.createdAt || new Date()).getTime() - new Date(a.date || a.createdAt || new Date()).getTime()).map(transaction => (
                                    <li 
                                        key={transaction.id} 
                                        className="py-4 px-2 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent dark:hover:from-primary/10 dark:hover:via-primary/5 transition-all duration-300 rounded-xl mb-2 group/item"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{transaction.description}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                    <span className="font-medium text-primary dark:text-primary-light">
                                                        {group.members.find(m => m.id === transaction.payerId)?.name || "Thành viên"}
                                                    </span> {t('groups.paidSuffix')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${transaction.type === 'contribution' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                                        {transaction.type === 'contribution' ? '+' : ''}{formatGroupCurrency(transaction.amount, group.currency)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {new Date(transaction.date || transaction.createdAt || new Date()).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                                
                                                {/* Edit & Delete Buttons */}
                                                {(isOwner || transaction.createdBy === user?.id) && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                                                        <button 
                                                            onClick={() => openEditModal(transaction)}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                            title="Sửa"
                                                        >
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                                            title="Xóa"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 opacity-60">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.773-.118m4.5 8.506a4.5 4.5 0 01-4.5 4.5H7.5a4.5 4.5 0 01-4.5-4.5m0 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3.75m-9 0h.008v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">{t('groups.noTransactions')}</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Hãy thêm giao dịch đầu tiên để bắt đầu</p>
                                    </div>
                                )}
                            </ul>
                        )}

                        {activeTab === 'settle' && (
                            <div className="animate-fade-in-up">
                                <h4 className="font-bold mb-6 text-lg text-gray-800 dark:text-gray-100 px-2">{t('groups.settleTitle')}</h4>
                                {settlements.length > 0 ? (
                                    <div className="space-y-4">
                                        {settlements.map((s, i) => (
                                            <div 
                                                key={i} 
                                                className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.005]"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-3 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-950/20 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-bold text-gray-800 dark:text-gray-100">{s.from}</span>
                                                </div>
                                                <div className="flex-1 flex items-center justify-center px-6">
                                                    <div className="h-[2px] bg-gradient-to-r from-rose-400/30 via-primary/30 to-emerald-400/30 w-full relative">
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-primary shadow-lg">
                                                            {formatGroupCurrency(s.amount, group.currency)}
                                                        </div>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-gray-800 dark:text-gray-100">{s.to}</span>
                                                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 opacity-60 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">{t('groups.allSettled')}</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Tất cả thành viên đã thanh toán đầy đủ</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
            
            {/* Modals */}
            <AddGroupTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setTransactionModalOpen(false)}
                onAdd={onAddTransaction}
                group={group}
            />
            
            <EditGroupTransactionModal
                isOpen={isEditTxModalOpen}
                onClose={() => setEditTxModalOpen(false)}
                onSave={handleEditTransaction}
                group={group}
                transaction={txToEdit}
            />

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setAddMemberModalOpen(false)}
                groupId={group.id}
                onSuccess={() => { if (fetchInitialData) fetchInitialData(); }}
            />

            <GroupSettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
                group={group}
                onSuccess={() => {
                    fetchInitialData(); 
                }}
            />
        </div>
    );
};

// --- MAIN PAGE: GROUPS LIST ---
const GroupsPage: React.FC = () => {
    const { groups, handleAddGroup, t, fetchInitialData } = useAppContext();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [invitations, setInvitations] = useState<any[]>([]);

    useEffect(() => {
        if ((!selectedGroupId || !groups.find(g => g.id === selectedGroupId)) && groups.length > 0) {
            setSelectedGroupId(groups[0].id);
        } else if (groups.length === 0) {
            setSelectedGroupId(null);
        }
    }, [groups, selectedGroupId]);

    useEffect(() => {
        apiService.getMyInvitations()
            .then(setInvitations)
            .catch(err => console.error("Lỗi tải lời mời:", err));
    }, []);

    const handleRespondInvitation = async (invId: string, status: 'accepted' | 'rejected') => {
        try {
            await apiService.respondToInvitation(invId, status);
            setInvitations(prev => prev.filter(inv => inv.id !== invId));
            if (status === 'accepted') {
                fetchInitialData();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const selectedGroup = useMemo(() => {
        return groups.find(g => g.id === selectedGroupId) || null;
    }, [groups, selectedGroupId]);
    
    if (groups.length === 0 && invitations.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
                <div className="text-center p-12 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl max-w-lg">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-4">{t('groups.noGroups.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 font-medium px-4 leading-relaxed mb-8">{t('groups.noGroups.description')}</p>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="group px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 flex items-center mx-auto transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('groups.noGroups.button')}
                    </button>
                </div>
                <AddGroupModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddGroup} />
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{t('groups.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">Theo dõi và chia sẻ chi tiêu cùng đồng đội</p>
                </div>
                <button 
                    onClick={() => setAddModalOpen(true)}
                    className="group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 flex items-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('groups.createButton')}
                </button>
            </div>

            {/* Lời mời tham gia nhóm */}
            {invitations.length > 0 && (
                <div className="mb-8 animate-fade-in-up">
                    <Card className="border border-yellow-200 dark:border-yellow-800/30 bg-gradient-to-br from-yellow-50/80 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-800/30 dark:to-yellow-900/20 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-300 text-lg">Lời mời tham gia nhóm ({invitations.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {invitations.map(inv => (
                                <div 
                                    key={inv.id} 
                                    className="bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                            <strong className="text-primary">{inv.inviterName}</strong> mời bạn vào nhóm <strong className="text-emerald-600 dark:text-emerald-400">{inv.groupName}</strong>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(inv.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleRespondInvitation(inv.id, 'accepted')}
                                            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all duration-300"
                                        >
                                            Chấp nhận
                                        </button>
                                        <button 
                                            onClick={() => handleRespondInvitation(inv.id, 'rejected')}
                                            className="px-4 py-1.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 items-stretch">
                <div className="lg:col-span-1 h-full">
                    <Card className="h-full flex flex-col overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg">
                        <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">{t('groups.myGroups')}</h3>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {groups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${selectedGroupId === group.id ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary border border-primary/20' : 'hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                >
                                    {selectedGroupId === group.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                                    )}
                                    <div className={`p-2.5 rounded-xl mr-3 transition-colors ${selectedGroupId === group.id ? 'bg-gradient-to-br from-primary to-primary text-white' : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 group-hover:from-primary/10 group-hover:to-primary/5'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold truncate">{group.name}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>
                
                <div className="lg:col-span-3 flex flex-col h-full">
                    {selectedGroup ? <GroupDetails group={selectedGroup} /> : 
                    <Card className="flex-1 flex flex-col items-center justify-center text-center py-16 opacity-50 border border-gray-200 dark:border-white/10">
                        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">{t('groups.selectPrompt')}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Chọn một nhóm để xem chi tiết</p>
                    </Card>}
                </div>
            </div>
            
            <AddGroupModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddGroup} />
        </div>
    );
};

export default GroupsPage;