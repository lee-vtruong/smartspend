import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Transaction, Wallet } from '../types';
// Đã xóa import GoogleGenAI ở đây
import { useAppContext } from '../contexts/AppContext';
import { 
    FoodIcon, ShoppingIcon, TransportIcon, BillIcon, 
    EntertainmentIcon, SalaryIcon, DefaultIcon 
} from './Icons';
import { iconMap } from '../constants';
import { apiService } from '../services/apiService'; // Thêm import này

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'icon' | 'userId'>) => void; 
  onUpdate?: (transaction: Transaction) => void;
  wallets: Wallet[];
  transactionToEdit?: Transaction | null;
}

const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const SpinnerIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, onUpdate, wallets, transactionToEdit }) => {
  const { t, transactionCategories } = useAppContext();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [wallet, setWallet] = useState(wallets.length > 0 ? wallets[0].name : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState('');
  
  const [aiInput, setAiInput] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  
  const isEditMode = !!transactionToEdit;
  const availableCategories = transactionCategories.filter(c => c.type === type);

  const resetForm = () => {
      setType('expense');
      setAmount(0);
      setPayee('');
      setDate(new Date().toISOString().split('T')[0]);
      if (wallets.length > 0) setWallet(wallets[0].name);
      const initialCategories = transactionCategories.filter(c => c.type === 'expense');
      if (initialCategories.length > 0) setCategory(initialCategories[0].name);
      setAiInput('');
      setIsAiParsing(false);
  }

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount);
      setPayee(transactionToEdit.payee);
      setCategory(transactionToEdit.category);
      setWallet(transactionToEdit.wallet);
      setDate(transactionToEdit.date);
    } else {
        resetForm();
    }
  }, [transactionToEdit, isOpen, transactionCategories, wallets]);

  const handleAiParse = async () => {
    if (aiInput.trim().length < 3) {
        alert("AI không thể nhận dạng. Vui lòng nhập thủ công.");
        return;
    }
    
    setIsAiParsing(true);
    try {
        const categoryNames = transactionCategories.map(c => c.name);
        const walletNames = wallets.map(w => w.name);
        
        const data = await apiService.analyzeTransaction(aiInput, categoryNames, walletNames);
        // -------------------------------------

        if (!data || !data.amount || data.amount <= 0) {
            alert("AI không thể nhận dạng. Vui lòng nhập thủ công.");
            setIsAiParsing(false);
            return;
        }

        if (data.type) setType(data.type);
        if (data.amount) setAmount(data.amount);
        if (data.payee) setPayee(data.payee);
        if (data.category && categoryNames.includes(data.category)) setCategory(data.category);
        if (data.wallet && walletNames.includes(data.wallet)) setWallet(data.wallet);
        
        setAiInput(''); 
    } catch (error) {
        console.error("AI Parsing error:", error);
        alert("AI không thể nhận dạng. Vui lòng nhập thủ công.");
    } finally {
        setIsAiParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !payee || !category || !wallet) {
      alert(t('addTransaction.validationError'));
      return;
    }

    if (type === 'expense') {
        // Tìm ví đang được chọn trong danh sách wallets (được truyền vào qua props)
        const selectedWallet = wallets.find(w => w.name === wallet);
        
        if (selectedWallet) {
            // Kiểm tra: Nếu số tiền chi > số dư hiện tại của ví
            if (amount > selectedWallet.balance) {
                const formattedBalance = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedWallet.balance);
                alert(`Cảnh báo: Số dư ví "${wallet}" không đủ để chi khoản này!\nSố dư hiện tại: ${formattedBalance}`);
                return; // Dừng lại, không cho submit form
            }
        }
    }

    const catInfo = transactionCategories.find(c => c.name === category);
    const iconName = catInfo?.iconName || 'DefaultIcon'; // Fallback an toàn

    // Lấy Component từ map, nếu không có thì dùng DefaultIcon
    const IconComponent = iconMap[iconName] || DefaultIcon;

    if (isEditMode && onUpdate && transactionToEdit) {
      onUpdate({ 
          ...transactionToEdit, 
          type, 
          amount, 
          category, 
          wallet, 
          date, 
          payee, 
          // Render Component bằng JSX thay vì React.createElement để an toàn hơn
          icon: <IconComponent className="w-6 h-6" /> 
      });
    } else {
      onAdd({ type, amount, category, wallet, date, payee }); 
    }
    onClose();
  };

  const inputClass = "mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(isEditMode ? 'addTransaction.editTitle' : 'addTransaction.title')}>
      <div className="space-y-6">
        
        {/* AI INPUT SECTION */}
        {!isEditMode && (
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-card rounded-2xl p-4 border border-white/20 shadow-sm">
                    <div className="flex items-center mb-2">
                        <SparkleIcon className="w-5 h-5 text-accent mr-2 animate-pulse" />
                        <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {t('addTransaction.aiPrompt')}
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                            placeholder={t('addTransaction.aiPlaceholder')}
                            className="flex-1 px-4 py-2 bg-background/50 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            disabled={isAiParsing}
                        />
                        <button 
                            onClick={handleAiParse}
                            disabled={isAiParsing || aiInput.length < 3}
                            className="bg-primary text-white p-2 rounded-xl hover:bg-primary-focus disabled:opacity-50 transition-all flex items-center justify-center min-w-[44px]"
                        >
                            {isAiParsing ? <SpinnerIcon className="w-5 h-5" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>}
                        </button>
                    </div>
                    {isAiParsing && <p className="text-[10px] text-primary mt-2 animate-pulse italic">Mony đang phân tích giao dịch của bạn...</p>}
                </div>
            </div>
        )}

        {/* MANUAL FORM SECTION */}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/50 p-1 border border-card-border">
                <button type="button" onClick={() => setType('expense')} className={`py-2 text-center font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-card shadow-sm text-danger scale-[1.02]' : 'text-muted hover:text-text'}`}>{t('addTransaction.expense')}</button>
                <button type="button" onClick={() => setType('income')} className={`py-2 text-center font-bold rounded-lg transition-all ${type === 'income' ? 'bg-card shadow-sm text-success scale-[1.02]' : 'text-muted hover:text-text'}`}>{t('addTransaction.income')}</button>
            </div>

            <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addTransaction.amountLabel')}</label>
                <div className="relative">
                    <input
                        type="number"
                        value={amount || ''}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className={`${inputClass} text-3xl !py-4 font-black ${type === 'expense' ? 'text-danger' : 'text-success'}`}
                        required
                        step="any"
                        placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted text-lg">VND</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addTransaction.noteLabel')}</label>
                <input
                    type="text"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    className={inputClass}
                    placeholder={t(type === 'expense' ? 'addTransaction.notePlaceholderExpense' : 'addTransaction.notePlaceholderIncome')}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addTransaction.categoryLabel')}</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required>
                        <option value="" disabled>-- Chọn --</option>
                        {availableCategories.map(c => <option key={c.name} value={c.name}>{c.isCustom ? c.name : t(c.name)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addTransaction.walletLabel')}</label>
                    <select value={wallet} onChange={e => setWallet(e.target.value)} className={inputClass} required>
                        {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addTransaction.dateLabel')}</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                    required
                />
            </div>

            <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-muted hover:bg-background transition-colors">{t('common.cancel')}</button>
                <button type="submit" className="px-8 py-2 rounded-xl font-bold bg-primary text-primary-content shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">{t(isEditMode ? 'common.saveChanges' : 'common.save')}</button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTransactionModal;