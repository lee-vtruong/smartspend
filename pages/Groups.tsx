import React, { useState, useMemo, useEffect } from 'react';
import { Group, GroupMember, Settlement, GroupTransaction } from '../types';
import Card from '../components/Card';
import AddGroupModal from '../components/AddGroupModal';
import AddGroupTransactionModal from '../components/AddGroupTransactionModal';
import EditGroupTransactionModal from '../components/EditGroupTransactionModal'; // <--- IMPORT MỚI
import AddMemberModal from '../components/AddMemberModal';
import GroupSettingsModal from '../components/GroupSettingsModal';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services/apiService';

// --- SUB-COMPONENT: GROUP DETAILS ---
const GroupDetails: React.FC<{ group: Group }> = ({ group }) => {
    const { t, language, handleAddGroupTransaction, fetchInitialData, user, showToast } = useAppContext();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    
    // State cho việc Edit Transaction
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

    // --- FIX EDIT TRANSACTION ---
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

    // --- FIX TÍNH TOÁN SỐ DƯ (+0) ---
    const groupData = useMemo(() => {
        if (!group) return null;

        // 1. Tạo Map để lưu số dư của từng member, init = 0
        const balanceMap = new Map<string, number>();
        group.members.forEach(m => balanceMap.set(m.id, 0));

        let totalContributions = 0;
        let totalExpenses = 0;

        // 2. Duyệt qua từng giao dịch để cộng trừ
        transactions.forEach(tx => {
            const amount = Number(tx.amount);
            
            // Xử lý loại: Đóng quỹ (Contribution)
            if (tx.type === 'contribution') {
                const currentPayerBalance = balanceMap.get(tx.payerId) || 0;
                balanceMap.set(tx.payerId, currentPayerBalance + amount);
                totalContributions += amount;
            } 
            // Xử lý loại: Chi tiêu (Expense)
            else if (tx.type === 'expense') {
                totalExpenses += amount;
                
                // Bước A: Người trả tiền (Payer) được CỘNG (+) số tiền đã trả
                const currentPayerBalance = balanceMap.get(tx.payerId) || 0;
                balanceMap.set(tx.payerId, currentPayerBalance + amount);

                // Bước B: Những người tham gia (Participants) bị TRỪ (-) phần chia
                if (tx.participants && tx.participants.length > 0) {
                    const splitAmount = amount / tx.participants.length;
                    
                    tx.participants.forEach(participantId => {
                        // Lưu ý: Nếu Payer cũng nằm trong Participants, họ sẽ được +Total rồi lại bị -Split
                        // Kết quả là họ dương phần họ trả hộ người khác. Logic này đúng.
                        const currentPartBalance = balanceMap.get(participantId) || 0;
                        balanceMap.set(participantId, currentPartBalance - splitAmount);
                    });
                }
            }
        });

        // 3. Format dữ liệu trả về
        const memberBalances = Array.from(balanceMap.entries()).map(([id, balance]) => {
            const memberInfo = group.members.find(m => m.id === id) || { 
                id, name: "Unknown", avatar: "https://ui-avatars.com/api/?name=?" 
            };
            return {
                member: memberInfo,
                balance: balance
            };
        }).sort((a,b) => b.balance - a.balance);

        // 4. Tính toán Settlements (Ai trả ai)
        const settlements: Settlement[] = [];
        // Lọc ra người âm (Nợ) và người dương (Chủ nợ)
        // Dùng sai số nhỏ 0.01 để tránh lỗi làm tròn số thực
        const debtors = memberBalances.filter(mb => mb.balance < -0.01).map(mb => ({...mb, balance: Math.abs(mb.balance)}));
        const creditors = memberBalances.filter(mb => mb.balance > 0.01);
        
        let i = 0; // index debtors
        let j = 0; // index creditors

        while(i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            // Số tiền trả là min giữa số nợ và số được nhận
            const amount = Math.min(debtor.balance, creditor.balance);

            if (amount > 0) {
                settlements.push({
                    from: debtor.member.name,
                    to: creditor.member.name,
                    amount: amount
                });
            }

            // Trừ đi số đã "thanh toán" trong tính toán
            debtor.balance -= amount;
            creditor.balance -= amount;

            // Nếu trả hết nợ thì chuyển sang người nợ tiếp theo
            if (debtor.balance < 0.01) i++;
            // Nếu nhận đủ tiền thì chuyển sang chủ nợ tiếp theo
            if (creditor.balance < 0.01) j++;
        }

        return { 
            totalBalance: totalContributions - totalExpenses, 
            totalExpenses, 
            memberBalances, 
            settlements 
        };
    }, [group, transactions]);

    if (!groupData) return <Card className="flex-1 flex items-center justify-center"><p>Đang tải...</p></Card>;
    const { totalBalance, totalExpenses, memberBalances, settlements } = groupData;

    return (
        <div className="flex flex-col flex-1 gap-6">
            <Card className="flex flex-col">
                 <div className="p-2">
                    {/* Header giữ nguyên */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <h3 className="text-3xl font-extrabold text-text tracking-tight uppercase">{group.name}</h3>
                                {group.note && <p className="text-xs text-muted mt-1 italic max-w-md">{group.note}</p>}
                                <p className="text-muted mt-1 font-medium">{group.members.length} thành viên • {group.currency}</p>
                            </div>
                            <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full bg-background hover:bg-muted/20 text-muted hover:text-primary transition-all border border-card-border shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>
                        <div className="flex space-x-3 w-full md:w-auto">
                            <button onClick={() => setAddMemberModalOpen(true)} className="flex-1 md:flex-none px-4 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 flex items-center justify-center transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg> Mời
                            </button>
                            <button onClick={() => setTransactionModalOpen(true)} className="flex-1 md:flex-none group px-5 py-2.5 text-sm font-extrabold text-primary-content bg-primary rounded-xl hover:bg-primary-focus flex items-center justify-center transition-all shadow-lg hover:shadow-primary/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> {t('groups.addTransactionButton')}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid giữ nguyên */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-background/50 p-4 rounded-2xl border border-card-border">
                            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">{t('groups.totalFund')}</p>
                            <p className="text-xl font-bold text-success">{formatGroupCurrency(totalBalance, group.currency)}</p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-2xl border border-card-border">
                            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">{t('groups.spent')}</p>
                            <p className="text-xl font-bold text-danger">{formatGroupCurrency(totalExpenses, group.currency)}</p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-2xl border border-card-border flex flex-col justify-center cursor-pointer hover:bg-background/80 transition-all" onClick={() => setSettingsOpen(true)}>
                            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">{t('groups.members')}</p>
                            <div className="flex -space-x-2 mt-1 items-center">
                                {group.members.slice(0, 5).map(m => (
                                    <img key={m.id} src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} alt={m.name} className="w-8 h-8 rounded-full border-2 border-card ring-2 ring-background shadow-sm"/>
                                ))}
                            </div>
                        </div>
                        <div className="bg-background/50 p-4 rounded-2xl border border-card-border flex flex-col justify-center items-center">
                             <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">{t('groups.currency')}</p>
                             <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-black rounded-lg border border-primary/20">{group.currency}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-b border-card-border">
                    <nav className="flex space-x-8 px-2">
                        {[{ id: 'overview', label: t('groups.overviewTab') }, { id: 'transactions', label: t('groups.transactionsTab') }, { id: 'settle', label: t('groups.settleTab') }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 px-1 font-bold text-sm transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-text'}`}>
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(20,184,166,0.4)]"></div>}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-6 flex-1 min-h-[300px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-3 animate-fade-in-up">
                            {memberBalances.map(({ member, balance }) => (
                                <div key={member.id} className="flex justify-between items-center p-4 bg-background/40 hover:bg-background/60 rounded-2xl border border-card-border/50 transition-all">
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} alt={member.name} className="w-12 h-12 rounded-full shadow-sm ring-2 ring-white/10"/>
                                            {member.id === group.createdBy && (
                                                <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-1 rounded-full border-2 border-card shadow-sm" title="Trưởng nhóm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 00-.556.834c-.083 1.03-.232 1.681-.486 2.149-.6.46-2.182.531-3.291.536-1.11 0-2.693-.075-3.291-.535-.254-.469-.403-1.12-.486-2.15a1 1 0 00-.556-.835A3.989 3.989 0 011 15a3.989 3.989 0 011.666-3.332L4.405 6.25l-1.233-.616a1 1 0 01.894-1.79l1.599.8L9.617 3.076V2a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <span className="font-bold text-text text-lg block">{member.name} {member.id === user?.id && "(Bạn)"}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-black text-xl ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {balance > 0 ? '+' : ''}{formatGroupCurrency(balance, group.currency)}
                                        </span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-0.5">{balance >= 0 ? t('groups.owedByGroup') : t('groups.owedToGroup')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <ul className="divide-y divide-card-border/50">
                            {isLoadingTx ? (
                                <p className="text-center py-4">Đang tải...</p>
                            ) : transactions.length > 0 ? (
                                transactions.slice().sort((a,b) => new Date(b.date || b.createdAt || new Date()).getTime() - new Date(a.date || a.createdAt || new Date()).getTime()).map(transaction => (
                                <li key={transaction.id} className="py-4 px-2 hover:bg-primary/5 transition-colors rounded-xl mb-1 group/item">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-text text-lg">{transaction.description}</p>
                                            <p className="text-sm text-muted">
                                                <span className="font-semibold text-primary">{group.members.find(m => m.id === transaction.payerId)?.name || "Thành viên"}</span> {t('groups.paidSuffix')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`font-black text-lg ${transaction.type === 'contribution' ? 'text-success' : 'text-text'}`}>
                                                    {transaction.type === 'contribution' ? '+' : ''}{formatGroupCurrency(transaction.amount, group.currency)}
                                                </p>
                                                <p className="text-xs text-muted font-medium">{new Date(transaction.date || transaction.createdAt || new Date()).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            
                                            {/* NÚT SỬA & XÓA GIAO DỊCH */}
                                            {(isOwner || transaction.createdBy === user?.id) && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => openEditModal(transaction)}
                                                        className="p-2 text-muted hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                                        title="Sửa"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                                        className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg"
                                                        title="Xóa"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0-1v- .01M12 20v-1m0-1V18m0 2.01M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                    <p className="text-xl font-bold">{t('groups.noTransactions')}</p>
                                </div>
                            )}
                        </ul>
                    )}

                    {activeTab === 'settle' && (
                        <div>
                             <h4 className="font-bold mb-5 text-lg text-text px-2">{t('groups.settleTitle')}</h4>
                            {settlements.length > 0 ? (
                                <div className="space-y-4">
                                    {settlements.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-card/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm transition-transform hover:scale-[1.01]">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-danger/10 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                                <span className="font-black text-text">{s.from}</span>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center px-4">
                                                <div className="h-[2px] bg-gradient-to-r from-danger/30 via-primary/50 to-success/30 w-full relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 py-1 border border-card-border rounded-full text-sm font-black text-primary shadow-sm">
                                                        {formatGroupCurrency(s.amount, group.currency)}
                                                    </div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-success translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="font-black text-text">{s.to}</span>
                                                <div className="p-2 bg-success/10 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-xl font-bold">{t('groups.allSettled')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            
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

// --- MAIN PAGE: GROUPS LIST (Phần này giữ nguyên logic như đã đưa ở câu trả lời trước, chỉ cần đảm bảo import đúng) ---
const GroupsPage: React.FC = () => {
   // ... Copy lại phần GroupsPage từ câu trả lời trước, không thay đổi logic gì ở đây
   // (Đã có phần hiển thị Lời mời)
   const { groups, handleAddGroup, t, fetchInitialData } = useAppContext();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    // State cho lời mời (TC103, TC104)
    const [invitations, setInvitations] = useState<any[]>([]);

    useEffect(() => {
        if ((!selectedGroupId || !groups.find(g => g.id === selectedGroupId)) && groups.length > 0) {
            setSelectedGroupId(groups[0].id);
        } else if (groups.length === 0) {
            setSelectedGroupId(null);
        }
    }, [groups, selectedGroupId]);

    // Load Lời mời
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
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                 <div className="text-center p-12 bg-card/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-lg">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-text tracking-tight">{t('groups.noGroups.title')}</h2>
                    <p className="mt-4 text-muted font-medium px-4 leading-relaxed">{t('groups.noGroups.description')}</p>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="mt-8 px-8 py-3 text-sm font-extrabold text-primary-content bg-primary rounded-2xl hover:bg-primary-focus flex items-center mx-auto transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        {t('groups.noGroups.button')}
                    </button>
                </div>
                <AddGroupModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddGroup} />
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-text tracking-tight">{t('groups.title')}</h2>
                    <p className="text-muted mt-1 font-medium">Theo dõi và chia sẻ chi tiêu cùng đồng đội</p>
                </div>
                <button 
                    onClick={() => setAddModalOpen(true)}
                    className="group px-6 py-2.5 text-sm font-extrabold text-primary-content bg-primary rounded-xl hover:bg-primary-focus flex items-center transition-all shadow-lg hover:shadow-primary/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {t('groups.createButton')}
                </button>
            </div>

            {/* HIỂN THỊ LỜI MỜI */}
            {invitations.length > 0 && (
                <div className="mb-8 animate-fade-in-up">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
                            <span className="bg-yellow-200 text-yellow-800 p-1 rounded mr-2">📩</span> 
                            Lời mời tham gia nhóm ({invitations.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {invitations.map(inv => (
                                <div key={inv.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-sm text-gray-800">
                                            <strong>{inv.inviterName}</strong> mời bạn vào nhóm <strong className="text-primary">{inv.groupName}</strong>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleRespondInvitation(inv.id, 'accepted')}
                                            className="px-3 py-1.5 bg-success text-white text-xs font-bold rounded-lg hover:bg-success-focus shadow-md shadow-success/20">
                                            Chấp nhận
                                        </button>
                                        <button 
                                            onClick={() => handleRespondInvitation(inv.id, 'rejected')}
                                            className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300">
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 items-stretch">
                <div className="lg:col-span-1 h-full">
                    <Card className="h-full flex flex-col !p-0 overflow-hidden bg-card/60">
                        <div className="p-5 border-b border-card-border bg-card/40">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted">{t('groups.myGroups')}</h3>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {groups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center group relative overflow-hidden ${selectedGroupId === group.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'hover:bg-primary/5 text-muted hover:text-text'}`}
                                >
                                    {selectedGroupId === group.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>}
                                    <div className={`p-2 rounded-lg mr-3 transition-colors ${selectedGroupId === group.id ? 'bg-primary text-white' : 'bg-background group-hover:bg-white/20'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <span className="font-extrabold truncate">{group.name}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>
                
                <div className="lg:col-span-3 flex flex-col h-full">
                    {selectedGroup ? <GroupDetails group={selectedGroup} /> : 
                    <Card className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-card/60 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p className="text-2xl font-black">{t('groups.selectPrompt')}</p>
                    </Card>}
                </div>
            </div>
            
            <AddGroupModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddGroup} />
        </div>
    );
};

export default GroupsPage;