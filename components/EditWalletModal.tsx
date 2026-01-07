import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';
// IMPORT CHUẨN TỪ FILE ICONS
import { CashIcon, BankIcon, EWalletIcon } from './Icons';
import { WALLET_COLORS } from '../constants'; // Import màu từ constants

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Wallet) => void;
  walletToEdit: Wallet | null;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ isOpen, onClose, onSave, walletToEdit }) => {
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

    // Logic chọn icon an toàn
    let IconComponent = CashIcon;
    if (type === 'Bank') IconComponent = BankIcon;
    if (type === 'E-Wallet') IconComponent = EWalletIcon;

    onSave({
      ...walletToEdit,
      name,
      balance: parseFloat(balance),
      type,
      currency,
      color,
      icon: <IconComponent className="w-6 h-6" /> // Render icon chuẩn
    });
    onClose();
  };

  const walletTypeOptions = [
    { type: 'Cash', icon: CashIcon, text: 'Tiền mặt' },
    { type: 'Bank', icon: BankIcon, text: 'Ngân hàng' },
    { type: 'E-Wallet', icon: EWalletIcon, text: 'Ví điện tử' },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa ví">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Tên ví</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
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
          <label className="block text-sm font-medium text-muted mb-2">Màu sắc</label>
          <div className="flex space-x-2 overflow-x-auto p-1">
            {WALLET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full flex-shrink-0 ${c} ${
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
              />
            ))}
          </div>
        </div>
        
         <div>
          <label className="block text-sm font-medium text-muted mb-1">Đơn vị tiền tệ</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg dark:bg-gray-800"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Hủy</button>
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700">Lưu thay đổi</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditWalletModal;