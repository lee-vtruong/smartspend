import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';
import { CashIcon, BankIcon, EWalletIcon } from './Icons';
import { WALLET_COLORS } from '../constants';

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Wallet) => void;
  walletToEdit: Wallet | null;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ isOpen, onClose, onSave, walletToEdit }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(''); // Dùng string để input dễ nhập liệu
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
    { type: 'Cash', icon: CashIcon, text: 'Tiền mặt' },
    { type: 'Bank', icon: BankIcon, text: 'Ngân hàng' },
    { type: 'E-Wallet', icon: EWalletIcon, text: 'Ví điện tử' },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa ví">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Tên Ví */}
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

        {/* --- PHẦN MỚI THÊM: Input Số Dư (Fix TC020) --- */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Số dư hiện tại</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 font-mono font-bold"
            required
            placeholder="0"
          />
          <p className="text-[11px] text-muted mt-1 italic">* Cập nhật số dư trực tiếp không tạo ra giao dịch điều chỉnh.</p>
        </div>
        {/* ----------------------------------------------- */}

        {/* Chọn Loại Ví */}
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

        {/* Chọn Màu */}
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
        
        {/* Chọn Tiền Tệ */}
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

        {/* Nút Action */}
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Hủy</button>
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700">Lưu thay đổi</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditWalletModal;