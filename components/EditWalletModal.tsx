import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';
import { CashIcon, BankIcon, EWalletIcon } from './Icons';
import { WALLET_COLORS } from '../constants';
import { useAppContext } from '../contexts/AppContext';

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Wallet) => void;
  walletToEdit: Wallet | null;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ isOpen, onClose, onSave, walletToEdit }) => {
  const { formatCurrency } = useAppContext();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(''); 
  const [type, setType] = useState<'Cash' | 'Bank' | 'E-Wallet'>('Cash');
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');
  const [color, setColor] = useState(WALLET_COLORS[0]);

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setBalance(walletToEdit.balance.toString());
      setType(walletToEdit.type);
      setCurrency(walletToEdit.currency);
      setColor(walletToEdit.color || WALLET_COLORS[0]);
    }
  }, [walletToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !walletToEdit) return;

    // Validate số dư
    if (isNaN(parseFloat(balance))) {
        alert("Vui lòng nhập số dư hợp lệ");
        return;
    }

    // Logic chọn icon an toàn
    let IconComponent = CashIcon;
    if (type === 'Bank') IconComponent = BankIcon;
    if (type === 'E-Wallet') IconComponent = EWalletIcon;

    onSave({
      ...walletToEdit,
      name,
      balance: parseFloat(balance), // Chuyển string sang number
      type,
      currency,
      color,
      icon: <IconComponent className="w-6 h-6" />
    });
    onClose();
  };

  const walletTypeOptions = [
    { type: 'Cash', icon: CashIcon, text: 'Tiền mặt', desc: 'Tiền mặt, két sắt' },
    { type: 'Bank', icon: BankIcon, text: 'Ngân hàng', desc: 'Tài khoản ngân hàng' },
    { type: 'E-Wallet', icon: EWalletIcon, text: 'Ví điện tử', desc: 'MoMo, ZaloPay, VNPay' },
  ] as const;

  // Lấy current balance để hiển thị
  const currentBalance = walletToEdit?.balance || 0;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Chỉnh sửa ví"
      className="max-w-md"
    >
      <div className="space-y-8">
        {/* Wallet Info Header */}
        {walletToEdit && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
            <div className={`p-3.5 rounded-xl ${color}`}>
              {type === 'Cash' && <CashIcon className="w-6 h-6 text-white" />}
              {type === 'Bank' && <BankIcon className="w-6 h-6 text-white" />}
              {type === 'E-Wallet' && <EWalletIcon className="w-6 h-6 text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">
                {walletToEdit.name} • {walletToEdit.type}
              </p>
              <p className="text-xs text-primary/80 dark:text-primary/60 mt-0.5">
                Số dư hiện tại: {formatCurrency(currentBalance, true, walletToEdit.currency)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Tên Ví */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Tên ví <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Input Số Dư */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Số dư hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-800 dark:to-gray-900/95 border-2 border-gray-300 dark:border-white/15 rounded-xl p-4 flex items-center focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300">
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0"
                  required
                  min="0"
                  step="1000"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                  {currency}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
              * Cập nhật số dư trực tiếp không tạo ra giao dịch điều chỉnh.
            </p>
          </div>

          {/* Chọn Loại Ví */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Loại ví
            </label>
            <div className="grid grid-cols-3 gap-3">
              {walletTypeOptions.map(option => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setType(option.type)}
                  className={`
                    relative
                    flex 
                    flex-col 
                    items-center 
                    justify-center 
                    p-4 
                    rounded-xl 
                    border-2 
                    transition-all 
                    duration-300 
                    group
                    ${type === option.type 
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 shadow-md scale-[1.02]' 
                      : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {type === option.type && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    p-3 
                    rounded-xl 
                    mb-2 
                    transition-all 
                    duration-300
                    ${type === option.type 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
                    }
                  `}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Text */}
                  <span className={`
                    font-bold 
                    text-sm 
                    mb-1 
                    tracking-tight
                    ${type === option.type 
                      ? 'text-primary' 
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}>
                    {option.text}
                  </span>
                  
                  {/* Description */}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Màu */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Màu sắc đại diện
            </label>
            <div className="grid grid-cols-6 gap-3 p-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-white/10">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`
                    relative
                    w-10 
                    h-10 
                    rounded-xl 
                    flex-shrink-0 
                    ${c} 
                    transition-all 
                    duration-300 
                    hover:scale-110
                    hover:shadow-lg
                    ${color === c 
                      ? 'ring-3 ring-offset-2 ring-primary scale-110 shadow-lg' 
                      : 'ring-1 ring-gray-300 dark:ring-white/10'
                    }
                  `}
                  title={c.split('-')[1] || 'Màu sắc'}
                >
                  {color === c && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/90" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chọn Tiền Tệ */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Đơn vị tiền tệ
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="relative w-full pl-4 pr-10 py-3.5 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-800 dark:text-gray-100 transition-all duration-300 appearance-none"
              >
                <option value="VND" className="py-2">🇻🇳 VND - Đồng Việt Nam</option>
                <option value="USD" className="py-2">🇺🇸 USD - Đô la Mỹ</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={!name.trim() || !balance || isNaN(parseFloat(balance))}
              className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditWalletModal;