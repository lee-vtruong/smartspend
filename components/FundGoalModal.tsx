import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Goal, Wallet } from '../types';

interface FundGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFund: (goalId: string, amount: number, walletName: string) => void;
  goal: Goal | null;
  wallets: Wallet[];
}

const FundGoalModal: React.FC<FundGoalModalProps> = ({ isOpen, onClose, onFund, goal, wallets }) => {
  const [amount, setAmount] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        setAmount(0);
        setError('');
        if (wallets.length > 0) {
            setSelectedWallet(wallets[0].name);
        }
    }
  }, [isOpen, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sourceWallet = wallets.find(w => w.name === selectedWallet);
    if (!goal || !sourceWallet || amount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    if (sourceWallet.balance < amount) {
      setError('Số dư trong ví không đủ.');
      return;
    }

    onFund(goal.id, amount, selectedWallet);
  };
  
  if (!goal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Nạp tiền cho: ${goal.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-danger text-sm bg-danger/10 p-2 rounded-md">{error}</p>}
        <div>
            <p className="text-sm">Đã đạt được: <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(goal.currentAmount)}</span> / {new Intl.NumberFormat('vi-VN').format(goal.targetAmount)} VND</p>
        </div>
        <div>
          <label htmlFor="fund-amount" className="block text-sm font-medium text-muted">Số tiền muốn nạp</label>
          <input
            type="number"
            id="fund-amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="0"
            required
            min="1"
          />
        </div>
        <div>
          <label htmlFor="fund-wallet" className="block text-sm font-medium text-muted">Từ ví</label>
          <select
            id="fund-wallet"
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-card border-card-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            required
          >
            {wallets.map(w => <option key={w.id} value={w.name}>{w.name} ({new Intl.NumberFormat('vi-VN').format(w.balance)} VND)</option>)}
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
          <button type="submit" className="bg-primary text-primary-content px-4 py-2 rounded-md hover:opacity-90">Nạp tiền</button>
        </div>
      </form>
    </Modal>
  );
};

export default FundGoalModal;