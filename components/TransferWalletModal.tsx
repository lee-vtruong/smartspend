import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';

interface TransferWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (fromWallet: string, toWallet: string, amount: number, date: string) => void;
  wallets: Wallet[];
}

const TransferWalletModal: React.FC<TransferWalletModalProps> = ({ isOpen, onClose, onTransfer, wallets }) => {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && wallets.length >= 2) {
      setFromWallet(wallets[0].name);
      setToWallet(wallets[1].name);
      setAmount(0);
      setError('');
    }
  }, [isOpen, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sourceWallet = wallets.find(w => w.name === fromWallet);
    if (!fromWallet || !toWallet || !sourceWallet || amount <= 0) {
      setError('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }
    if (fromWallet === toWallet) {
      setError('Ví nguồn và ví đích không được trùng nhau.');
      return;
    }
    if (sourceWallet.balance < amount) {
      setError('Số dư ví nguồn không đủ.');
      return;
    }

    onTransfer(fromWallet, toWallet, amount, date);
    onClose();
  };
  
  const availableToWallets = wallets.filter(w => w.name !== fromWallet);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chuyển tiền giữa các ví">
      {wallets.length < 2 ? (
        <p className="text-center text-muted">Bạn cần có ít nhất 2 ví để thực hiện chuyển khoản.</p>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4 text-text">
        {error && <p className="text-danger text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from-wallet" className="block text-sm font-medium">Từ ví</label>
              <select
                id="from-wallet"
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-card border-card-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {wallets.map(w => <option key={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="to-wallet" className="block text-sm font-medium">Đến ví</label>
              <select
                id="to-wallet"
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-card border-card-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {availableToWallets.map(w => <option key={w.id}>{w.name}</option>)}
              </select>
            </div>
        </div>

        <div>
          <label htmlFor="transfer-amount" className="block text-sm font-medium">Số tiền</label>
          <input
            type="number"
            id="transfer-amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="0"
            required
            min="1"
          />
        </div>

        <div>
            <label htmlFor="transfer-date" className="block text-sm font-medium">Ngày</label>
            <input
                type="date"
                id="transfer-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-card border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
            />
        </div>

        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
          <button type="submit" className="bg-primary text-primary-content px-4 py-2 rounded-md hover:opacity-90">Chuyển tiền</button>
        </div>
      </form>
      )}
    </Modal>
  );
};

export default TransferWalletModal;
