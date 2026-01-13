import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Transaction, Wallet } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { 
    FoodIcon, ShoppingIcon, TransportIcon, BillIcon, 
    EntertainmentIcon, SalaryIcon, DefaultIcon 
} from './Icons';
import { iconMap } from '../constants';
import { apiService } from '../services/apiService';

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
  const { t, transactionCategories, formatCurrency } = useAppContext();
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

  // Get selected wallet balance
  const selectedWallet = wallets.find(w => w.name === wallet);
  const walletBalance = selectedWallet?.balance || 0;
  const isOverBudget = type === 'expense' && amount > walletBalance;

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

    if (type === 'expense' && amount > walletBalance) {
        alert(`Cảnh báo: Số dư ví "${wallet}" không đủ để chi khoản này!\nSố dư hiện tại: ${formatCurrency(walletBalance)}`);
        return;
    }

    const catInfo = transactionCategories.find(c => c.name === category);
    const iconName = catInfo?.iconName || 'DefaultIcon';
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
          icon: <IconComponent className="w-6 h-6" /> 
      });
    } else {
      onAdd({ type, amount, category, wallet, date, payee }); 
    }
    onClose();
  };

  const inputClass = "w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t(isEditMode ? 'addTransaction.editTitle' : 'addTransaction.title')}
      className="max-w-md"
    >
      <div className="space-y-8">
        
        {/* AI INPUT SECTION - Only show in add mode */}
        {!isEditMode && (
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 rounded-2xl p-5 border border-gray-200/60 dark:border-white/15 shadow-lg">
                    <div className="flex items-center mb-3">
                        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl mr-3">
                            <SparkleIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                                Nhập tự nhiên với AI
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                Thử: "Chi 50k ăn sáng bằng MoMo"
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                                placeholder="Mô tả giao dịch của bạn..."
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                                disabled={isAiParsing}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                        </div>
                        <button 
                            onClick={handleAiParse}
                            disabled={isAiParsing || aiInput.length < 3}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center min-w-[44px] ${
                                isAiParsing 
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' 
                                    : 'bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            {isAiParsing ? <SpinnerIcon className="w-5 h-5" /> : 'AI'}
                        </button>
                    </div>
                    {isAiParsing && (
                        <div className="flex items-center mt-3">
                            <SpinnerIcon className="w-4 h-4 text-primary mr-2" />
                            <span className="text-xs text-primary font-medium animate-pulse">
                                Đang phân tích giao dịch của bạn...
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
          {isEditMode ? 'Chỉnh sửa giao dịch' : '--- Hoặc nhập thủ công ---'}
        </div>

        {/* MANUAL FORM SECTION */}
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type Toggle */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        type="button" 
                        onClick={() => setType('expense')} 
                        className={`py-3.5 text-center font-bold text-sm rounded-xl transition-all duration-300 ${
                            type === 'expense' 
                                ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('addTransaction.expense')}
                        </div>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setType('income')} 
                        className={`py-3.5 text-center font-bold text-sm rounded-xl transition-all duration-300 ${
                            type === 'income' 
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('addTransaction.income')}
                        </div>
                    </button>
                </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
                    Số tiền
                </label>
                <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                        type === 'expense' ? 'from-rose-500/10' : 'from-emerald-500/10'
                    } to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`relative border-2 rounded-xl p-4 transition-all duration-300 ${
                        isOverBudget 
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' 
                            : 'border-gray-300 dark:border-white/15 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30'
                    }`}>
                        <input
                            type="number"
                            value={amount || ''}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-3xl font-black outline-none placeholder-gray-300 dark:placeholder-gray-600"
                            placeholder="0"
                            required
                            step="any"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                            </span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                VND
                            </span>
                        </div>
                    </div>
                    {isOverBudget && (
                        <div className="flex items-center gap-2 mt-2 text-rose-600 dark:text-rose-400 text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Vượt quá số dư: {formatCurrency(walletBalance)}
                        </div>
                    )}
                </div>
            </div>

            {/* Payee Input */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
                    Ghi chú
                </label>
                <input
                    type="text"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    className={inputClass}
                    placeholder={type === 'expense' ? "Ví dụ: Ăn tối tại nhà hàng, Mua sách..." : "Ví dụ: Lương tháng, Thưởng dự án..."}
                    required
                />
            </div>

            {/* Category and Wallet */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
                        Danh mục
                    </label>
                    <div className="relative group">
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            className={`${inputClass} appearance-none`} 
                            required
                        >
                            <option value="" disabled>Chọn danh mục</option>
                            {availableCategories.map(c => (
                                <option key={c.name} value={c.name}>
                                    {c.isCustom ? c.name : t(c.name)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
                        Ví
                    </label>
                    <div className="relative group">
                        <select 
                            value={wallet} 
                            onChange={e => setWallet(e.target.value)} 
                            className={`${inputClass} appearance-none`} 
                            required
                        >
                            {wallets.map(w => (
                                <option key={w.id} value={w.name}>
                                    {w.name} ({formatCurrency(w.balance)})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Input */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
                    Ngày giao dịch
                </label>
                <div className="relative group">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`${inputClass} appearance-none`}
                        required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100 dark:border-white/10">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-white/10"
                >
                    {t('common.cancel')}
                </button>
                <button 
                    type="submit" 
                    className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                        isOverBudget 
                            ? 'bg-gradient-to-r from-rose-500 to-rose-400 cursor-not-allowed opacity-60' 
                            : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                    }`}
                    disabled={isOverBudget}
                >
                    {t(isEditMode ? 'common.saveChanges' : 'common.save')}
                </button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTransactionModal;