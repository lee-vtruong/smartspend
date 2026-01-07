import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DebtLoanItem } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 1. SỬA TYPE: Thêm tham số walletName
  onRecord: (id: string, amount: number, walletName: string) => void;
  item: DebtLoanItem | null;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onRecord, item }) => {
  // 2. LẤY WALLETS TỪ CONTEXT
  const { t, formatCurrency, wallets } = useAppContext();
  
  const [amount, setAmount] = useState(0);
  const [walletName, setWalletName] = useState(''); // 3. STATE CHO VÍ
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setError('');
      // 4. MẶC ĐỊNH CHỌN VÍ ĐẦU TIÊN
      if (wallets.length > 0) {
          setWalletName(wallets[0].name);
      }
    }
  }, [isOpen, wallets]);

  if (!item) return null;

  const remainingAmount = item.initialAmount - item.paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate
    if (amount <= 0) {
      setError(t('recordPayment.errorAmountPositive'));
      return;
    }
    if (amount > remainingAmount) {
      setError(t('recordPayment.errorAmountExceeds', { amount: formatCurrency(remainingAmount) }));
      return;
    }
    if (!walletName) {
        setError("Vui lòng chọn ví để thực hiện giao dịch.");
        return;
    }

    // 5. GỌI HÀM VỚI 3 THAM SỐ
    onRecord(item.id, amount, walletName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(item.type === 'debt' ? 'recordPayment.titleDebt' : 'recordPayment.titleLoan')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-background rounded-lg border border-card-border">
            <p className="text-sm text-muted">{t('recordPayment.recordingFor')}: <span className="font-semibold text-text">{item.description || 'Khoản nợ'}</span></p>
            <p className="text-sm text-muted">{t('recordPayment.person')}: <span className="font-semibold text-text">{item.person}</span></p>
            <p className="text-sm text-muted">{t('recordPayment.remaining')}: <span className="font-semibold text-text">{formatCurrency(remainingAmount)}</span></p>
        </div>

        {error && <p className="text-danger text-sm bg-danger/10 p-2 rounded-md text-center">{error}</p>}

        {/* INPUT SỐ TIỀN */}
        <div>
          <label htmlFor="payment-amount" className="block text-sm font-medium text-muted mb-1">{t('recordPayment.paymentAmount')}</label>
          <input
            type="number"
            id="payment-amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-card border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-bold text-lg"
            placeholder="0"
            required
            min="1"
          />
        </div>

        {/* 6. UI CHỌN VÍ */}
        <div>
            <label htmlFor="payment-wallet" className="block text-sm font-medium text-muted mb-1">
                {item.type === 'loan' ? "Nhận tiền vào Ví" : "Lấy tiền từ Ví"}
            </label>
            <select
                id="payment-wallet"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                required
            >
                {wallets.map(w => (
                    <option key={w.id} value={w.name}>
                        {w.name} (Số dư: {formatCurrency(w.balance)})
                    </option>
                ))}
            </select>
        </div>

        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-semibold bg-background hover:bg-muted/20 transition-colors border border-card-border">{t('common.cancel')}</button>
          <button type="submit" className="px-6 py-2 rounded-xl font-semibold bg-primary text-primary-content hover:bg-primary-focus transition-colors shadow-lg shadow-primary/30">{t('common.savePayment')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;