import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Goal, Wallet } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface FundGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFund: (goalId: string, amount: number, walletName: string) => void;
  goal: Goal | null;
  wallets: Wallet[];
}

const FundGoalModal: React.FC<FundGoalModalProps> = ({ isOpen, onClose, onFund, goal, wallets }) => {
  const { formatCurrency } = useAppContext();
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<number[]>([]);
  
  useEffect(() => {
    if (isOpen && goal && wallets.length > 0) {
        setAmount('');
        setError('');
        setSelectedWallet(wallets[0].name);
        
        // Generate smart suggestions
        const targetAmount = goal.targetAmount;
        const currentAmount = goal.currentAmount;
        const remaining = targetAmount - currentAmount;
        
        // Suggestions: 10%, 25%, 50% of remaining, or quick amounts
        const smartSuggestions = [
          Math.round(remaining * 0.1),
          Math.round(remaining * 0.25),
          Math.round(remaining * 0.5),
          100000,
          500000,
          1000000
        ].filter(s => s > 0 && s <= remaining).slice(0, 4);
        
        setSuggestions(smartSuggestions.length > 0 ? smartSuggestions : [100000, 500000, 1000000]);
    }
  }, [isOpen, goal, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!goal || amount === '' || amount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    const sourceWallet = wallets.find(w => w.name === selectedWallet);
    if (!sourceWallet) {
      setError('Vui lòng chọn ví nguồn.');
      return;
    }
    
    if (sourceWallet.balance < amount) {
      setError(`Số dư trong ví "${sourceWallet.name}" không đủ.\nSố dư hiện tại: ${formatCurrency(sourceWallet.balance)}`);
      return;
    }

    if (goal.currentAmount + amount > goal.targetAmount) {
      setError(`Số tiền nạp vượt quá mục tiêu!\nMục tiêu: ${formatCurrency(goal.targetAmount)}\nĐã có: ${formatCurrency(goal.currentAmount)}`);
      return;
    }

    onFund(goal.id, amount, selectedWallet);
  };

  const handleSuggestionClick = (suggestion: number) => {
    setAmount(suggestion);
    setError('');
  };

  if (!goal) return null;

  const sourceWallet = wallets.find(w => w.name === selectedWallet);
  const walletBalance = sourceWallet?.balance || 0;
  const isOverBalance = amount !== '' && amount > walletBalance;
  const newAmount = goal.currentAmount + (amount || 0);
  const newPercentage = (newAmount / goal.targetAmount) * 100;
  const isOverTarget = newAmount > goal.targetAmount;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nạp tiền vào mục tiêu"
      className="max-w-md"
    >
      <div className="space-y-8">
        {/* Goal Info Header */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{goal.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Đạt được mục tiêu của bạn</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Tiến độ hiện tại</span>
              <span className="font-bold text-primary">
                {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Còn: {formatCurrency(goal.targetAmount - goal.currentAmount)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 rounded-xl border border-rose-200 dark:border-rose-800/30">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Số tiền nạp <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${
                isOverBalance ? 'from-rose-500/10' : 'from-emerald-500/10'
              } to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300`}></div>
              <div className={`relative border-2 rounded-xl p-4 transition-all duration-300 ${
                isOverBalance 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' 
                  : 'border-gray-300 dark:border-white/15 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30'
              }`}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setAmount(value);
                    setError('');
                  }}
                  className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0"
                  required
                  min="1"
                  step="1000"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                  VND
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                      amount === suggestion
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {formatCurrency(suggestion)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Wallet Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Nạp từ ví
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <select
                value={selectedWallet}
                onChange={(e) => {
                  setSelectedWallet(e.target.value);
                  setError('');
                }}
                className="relative w-full pl-4 pr-10 py-3.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-800 dark:text-gray-100 transition-all duration-300 appearance-none"
                required
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.name} className="py-2">
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
            {sourceWallet && (
              <p className={`text-xs ${isOverBalance ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Số dư ví: {formatCurrency(sourceWallet.balance)}
                {isOverBalance && ' • Không đủ số dư!'}
              </p>
            )}
          </div>

          {/* Preview */}
          {amount !== '' && amount > 0 && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30 space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Kết quả sau khi nạp
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Số tiền mới:</span>
                  <span className={`font-bold ${isOverTarget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(newAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Tiến độ mới:</span>
                  <span className="font-bold text-primary">
                    {Math.round(newPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      isOverTarget 
                        ? 'bg-gradient-to-r from-rose-500 to-rose-400' 
                        : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(newPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100 dark:border-white/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-white/10"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={amount === '' || amount <= 0 || isOverBalance || isOverTarget}
              className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none ${
                isOverBalance || isOverTarget
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                  : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
              }`}
            >
              Xác nhận nạp tiền
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FundGoalModal;