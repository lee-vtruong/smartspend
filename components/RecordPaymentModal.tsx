
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DebtLoanItem } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (id: string, amount: number) => void;
  item: DebtLoanItem | null;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onRecord, item }) => {
  const { t, formatCurrency } = useAppContext();
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setError('');
    }
  }, [isOpen]);

  if (!item) return null;

  const remainingAmount = item.initialAmount - item.paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (amount <= 0) {
      setError(t('recordPayment.errorAmountPositive'));
      return;
    }
    if (amount > remainingAmount) {
      setError(t('recordPayment.errorAmountExceeds', { amount: formatCurrency(remainingAmount) }));
      return;
    }
    onRecord(item.id, amount);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(item.type === 'debt' ? 'recordPayment.titleDebt' : 'recordPayment.titleLoan')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-background rounded-lg">
            <p className="text-sm text-muted">{t('recordPayment.recordingFor')}: <span className="font-semibold text-text">{item.description}</span></p>
            <p className="text-sm text-muted">{t('recordPayment.person')}: <span className="font-semibold text-text">{item.person}</span></p>
            <p className="text-sm text-muted">{t('recordPayment.remaining')}: <span className="font-semibold text-text">{formatCurrency(remainingAmount)}</span></p>
        </div>

        {error && <p className="text-danger text-sm bg-danger/10 p-2 rounded-md text-center">{error}</p>}

        <div>
          <label htmlFor="payment-amount" className="block text-sm font-medium text-muted">{t('recordPayment.paymentAmount')}</label>
          <input
            type="number"
            id="payment-amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="0"
            required
            min="1"
          />
        </div>

        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-background hover:bg-gray-200">{t('common.cancel')}</button>
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content">{t('common.savePayment')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;