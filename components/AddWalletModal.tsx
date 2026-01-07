import React, { useState } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';
import { CashIcon, BankIcon, EWalletIcon } from './Icons'; 
import { WALLET_COLORS } from '../constants';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: Omit<Wallet, 'id' | 'icon'>) => void;
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Cash' | 'Bank' | 'E-Wallet'>('Cash');
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Vui lòng nhập tên ví!');
      return;
    }
    const randomColor = WALLET_COLORS[Math.floor(Math.random() * WALLET_COLORS.length)];
    onAdd({ name, type, balance, currency, color: randomColor });
    onClose();
    // Reset form after closing
    setName('');
    setType('Cash');
    setBalance(0);
    setCurrency('VND');
  };

  const walletTypeOptions = [
    { type: 'Cash', icon: CashIcon, text: 'Tiền mặt' },
    { type: 'Bank', icon: BankIcon, text: 'Ngân hàng' },
    { type: 'E-Wallet', icon: EWalletIcon, text: 'Ví điện tử' },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm ví mới">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="wallet-name" className="block text-sm font-medium text-muted mb-1">Tên ví</label>
          <input
            type="text"
            id="wallet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
            placeholder="Ví dụ: Tiền mặt, Techcombank"
            required
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted mb-2">Loại ví</label>
            <div className="grid grid-cols-3 gap-3">
                {walletTypeOptions.map(option => (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => setType(option.type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors duration-200 ${type === option.type ? 'border-primary bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50'}`}
                    >
                        <option.icon className="w-7 h-7 mb-2" />
                        <span className="text-sm font-semibold">{option.text}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-text mb-2">Số dư ban đầu</label>
          <div className="relative bg-background border border-card-border rounded-2xl p-4 flex items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-sm group hover:border-primary/50">
              <input
                  type="number"
                  value={balance || ''} // Hoặc biến state bạn đang dùng (ví dụ: initialBalance)
                  onChange={(e) => setBalance(Number(e.target.value))} // Sửa lại tên hàm set state cho đúng với code của bạn
                  className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-muted/30"
                  placeholder="0"
                  min="0"
              />
              <span className="text-sm font-bold text-muted ml-3 uppercase tracking-wider bg-card px-2 py-1 rounded-lg border border-card-border">
                  {currency || 'VND'}
              </span>
          </div>
      </div>
         <div>
          <label htmlFor="wallet-currency" className="block text-sm font-medium text-muted mb-1">Loại tiền tệ</label>
          <select
            id="wallet-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="mt-1 block w-full pl-4 pr-10 py-2 text-base bg-background border-card-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm rounded-lg"
          >
            <option>VND</option>
            <option>USD</option>
          </select>
        </div>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-text bg-background hover:bg-gray-200 dark:hover:bg-gray-700">Hủy</button>
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90 transition-opacity">Thêm ví</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWalletModal;