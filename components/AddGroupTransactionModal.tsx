
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Group, GroupTransaction } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AddGroupTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<GroupTransaction, 'id'>) => void;
  group: Group;
}

const AddGroupTransactionModal: React.FC<AddGroupTransactionModalProps> = ({ isOpen, onClose, onAdd, group }) => {
  const { t } = useAppContext();
  const [type, setType] = useState<'expense' | 'contribution'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payerId, setPayerId] = useState(group.members.length > 0 ? group.members[0].id : '');
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setType('expense');
      setDescription('');
      setAmount(0);
      setDate(new Date().toISOString().split('T')[0]);
      if (group.members.length > 0) {
        setPayerId(group.members[0].id);
        setParticipants(group.members.map(m => m.id)); // Default select all for expense
      }
    }
  }, [isOpen, group.members]);
  
  const handleParticipantChange = (memberId: string) => {
    setParticipants(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  const handleSelectAll = () => {
    if (participants.length === group.members.length) {
      setParticipants([]);
    } else {
      setParticipants(group.members.map(m => m.id));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0 || !payerId) {
      alert(t('addGroupTransaction.validationError'));
      return;
    }
    if (type === 'expense' && participants.length === 0) {
      alert(t('addGroupTransaction.validationError'));
      return;
    }

    const transactionData: Omit<GroupTransaction, 'id'> = {
      type,
      description,
      amount,
      date,
      payerId,
      participants: type === 'contribution' ? [payerId] : participants,
    };
    onAdd(transactionData);
  };

  const commonInputClass = "mt-1 block w-full px-4 py-2.5 bg-background border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addGroupTransaction.title')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/50 p-1 border border-card-border">
          <button type="button" onClick={() => setType('expense')} className={`py-2 text-center font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-card shadow-sm text-danger scale-[1.02]' : 'text-muted hover:text-text'}`}>{t('addGroupTransaction.expense')}</button>
          <button type="button" onClick={() => setType('contribution')} className={`py-2 text-center font-bold rounded-lg transition-all ${type === 'contribution' ? 'bg-card shadow-sm text-success scale-[1.02]' : 'text-muted hover:text-text'}`}>{t('addGroupTransaction.contribution')}</button>
        </div>

        <div>
          <label htmlFor="g-amount" className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addGroupTransaction.amountLabel')}</label>
          <div className="relative">
            <input 
              type="number" 
              id="g-amount" 
              value={amount || ''} 
              onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
              className={`${commonInputClass} !text-3xl !font-black !py-4 ${type === 'expense' ? 'text-danger' : 'text-success'}`} 
              required 
              min="0.01"
              step="any"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted text-lg">{group.currency}</span>
          </div>
        </div>

        <div>
          <label htmlFor="g-desc" className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addGroupTransaction.descriptionLabel')}</label>
          <input type="text" id="g-desc" value={description} onChange={e => setDescription(e.target.value)} className={commonInputClass} placeholder={t(type === 'expense' ? 'addGroupTransaction.descriptionPlaceholderExpense' : 'addGroupTransaction.descriptionPlaceholderContribution')} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="g-date" className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addGroupTransaction.dateLabel')}</label>
            <input type="date" id="g-date" value={date} onChange={e => setDate(e.target.value)} className={commonInputClass} required />
          </div>
          <div>
              <label htmlFor="g-payer" className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1 mb-1">{t('addGroupTransaction.payerLabel')}</label>
              <select id="g-payer" value={payerId} onChange={e => setPayerId(e.target.value)} className={commonInputClass} required>
                  {group.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
          </div>
        </div>

        {type === 'expense' && (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1">{t('addGroupTransaction.participantsLabel')}</label>
                    <button type="button" onClick={handleSelectAll} className="text-xs font-bold text-primary hover:underline">
                        {participants.length === group.members.length ? t('addGroupTransaction.deselectAll') : t('addGroupTransaction.selectAll')}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-background/50 rounded-xl border border-card-border custom-scrollbar">
                    {group.members.map(m => (
                        <label key={m.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer border ${participants.includes(m.id) ? 'bg-primary/10 border-primary/30' : 'bg-card border-transparent hover:bg-primary/5'}`}>
                            <input type="checkbox" checked={participants.includes(m.id)} onChange={() => handleParticipantChange(m.id)} className="form-checkbox h-5 w-5 text-primary rounded-md focus:ring-primary border-card-border bg-background"/>
                            <span className={`text-sm font-bold ${participants.includes(m.id) ? 'text-primary' : 'text-muted'}`}>{m.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted hover:bg-background transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-8 py-2.5 rounded-xl font-extrabold bg-primary text-primary-content shadow-lg hover:shadow-primary/30 transition-all">{t('common.add')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGroupTransactionModal;
