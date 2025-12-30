
import React, { useState } from 'react';
import Modal from './Modal';
import { DebtLoanItem } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AddDebtLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<DebtLoanItem, 'id' | 'paidAmount'>) => void;
}

const AddDebtLoanModal: React.FC<AddDebtLoanModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { t } = useAppContext();
  const [type, setType] = useState<'debt' | 'loan'>('debt');
  const [person, setPerson] = useState('');
  const [initialAmount, setInitialAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || initialAmount <= 0) {
      alert(t('addDebtLoan.validationError'));
      return;
    }
    onAdd({ type, person, initialAmount, description, dueDate });
    onClose();
    // Reset form
    setPerson('');
    setInitialAmount(0);
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-background border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addDebtLoan.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-background p-1 border border-card-border">
          <button type="button" onClick={() => setType('debt')} className={`py-2 text-center font-bold rounded-lg transition-all ${type === 'debt' ? 'bg-card shadow text-danger' : 'text-muted'}`}>{t('addDebtLoan.iOwe')}</button>
          <button type="button" onClick={() => setType('loan')} className={`py-2 text-center font-bold rounded-lg transition-all ${type === 'loan' ? 'bg-card shadow text-success' : 'text-muted'}`}>{t('addDebtLoan.iLend')}</button>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addDebtLoan.amountLabel')}</label>
          <div className="relative">
            <input 
                type="number" 
                value={initialAmount || ''} 
                onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)} 
                className={`${inputClass} !text-3xl !py-4 font-black ${type === 'debt' ? 'text-danger' : 'text-success'}`} 
                required 
                min="0.01" 
                step="any"
                placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted text-lg">VND</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addDebtLoan.personLabel')}</label>
          <input type="text" value={person} onChange={(e) => setPerson(e.target.value)} placeholder={t(type === 'debt' ? 'addDebtLoan.personPlaceholderOwe' : 'addDebtLoan.personPlaceholderLend')} className={inputClass} required />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addDebtLoan.descriptionLabel')}</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('addDebtLoan.descriptionPlaceholder')} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addDebtLoan.dueDateLabel')}</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} required />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-muted hover:bg-background transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-8 py-2 rounded-xl font-bold bg-primary text-primary-content shadow-lg hover:shadow-primary/30 transition-all">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDebtLoanModal;
