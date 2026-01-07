import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';

interface TransferWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Cập nhật: Thêm tham số note vào hàm callback
  onTransfer: (fromWallet: string, toWallet: string, amount: number, date: string, note: string) => void;
  wallets: Wallet[];
}

const TransferWalletModal: React.FC<TransferWalletModalProps> = ({ isOpen, onClose, onTransfer, wallets }) => {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(''); // <--- 1. Thêm state cho Ghi chú
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && wallets.length >= 2) {
      // Logic tự động chọn ví khác nhau ban đầu
      setFromWallet(wallets[0].name);
      setToWallet(wallets[1].name); 
      setAmount(0);
      setNote(''); // Reset ghi chú
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

    // <--- 2. Truyền note vào hàm onTransfer
    onTransfer(fromWallet, toWallet, amount, date, note);
    onClose();
  };
  
  // Lọc danh sách ví đích để không trùng ví nguồn (UX tốt hơn)
  const availableToWallets = wallets.filter(w => w.name !== fromWallet);

  // Effect phụ: Khi đổi ví nguồn, nếu ví đích đang trùng thì đổi ví đích
  useEffect(() => {
     if (fromWallet === toWallet && availableToWallets.length > 0) {
         setToWallet(availableToWallets[0].name);
     }
  }, [fromWallet]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chuyển tiền giữa các ví">
      {wallets.length < 2 ? (
        <p className="text-center text-muted">Bạn cần có ít nhất 2 ví để thực hiện chuyển khoản.</p>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4 text-text">
        {error && <p className="text-danger text-sm bg-danger/10 p-2 rounded">{error}</p>}
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from-wallet" className="block text-sm font-medium mb-1">Từ ví</label>
              <select
                id="from-wallet"
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {wallets.map(w => <option key={w.id} value={w.name}>{w.name} ({new Intl.NumberFormat('vi-VN').format(w.balance)})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="to-wallet" className="block text-sm font-medium mb-1">Đến ví</label>
              <select
                id="to-wallet"
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {/* Chỉ hiển thị các ví hợp lệ (không trùng nguồn) */}
                {availableToWallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
        </div>

        <div>
          <label htmlFor="transfer-amount" className="block text-sm font-medium mb-1">Số tiền</label>
          <input
            type="number"
            id="transfer-amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-card border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-bold text-lg"
            placeholder="0"
            required
            min="1"
          />
        </div>

        {/* <--- 3. Thêm ô nhập Ghi chú */}
        <div>
          <label htmlFor="transfer-note" className="block text-sm font-medium mb-1">Ghi chú</label>
          <input
            type="text"
            id="transfer-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-card border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="VD: Rút tiền mặt, Chuyển quỹ..."
          />
        </div>

        <div>
            <label htmlFor="transfer-date" className="block text-sm font-medium mb-1">Ngày</label>
            <input
                type="date"
                id="transfer-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
            />
        </div>

        <div className="flex justify-end pt-4 gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-muted/20 hover:bg-muted/30 transition-colors font-medium">Hủy</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-content hover:bg-primary-focus transition-colors font-bold shadow-lg shadow-primary/30">Chuyển tiền</button>
        </div>
      </form>
      )}
    </Modal>
  );
};

export default TransferWalletModal;