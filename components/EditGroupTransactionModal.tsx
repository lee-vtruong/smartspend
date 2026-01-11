import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Group, GroupTransaction } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface EditGroupTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txId: string, data: Partial<GroupTransaction>) => void;
  group: Group;
  transaction: GroupTransaction | null;
}

const EditGroupTransactionModal: React.FC<EditGroupTransactionModalProps> = ({ isOpen, onClose, onSave, group, transaction }) => {
  const { t } = useAppContext();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState('');
  const [payerId, setPayerId] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount);
      setDate(new Date(transaction.date || transaction.createdAt).toISOString().split('T')[0]);
      setPayerId(transaction.payerId);
      setParticipants(transaction.participants || []);
    }
  }, [isOpen, transaction]);
  
  const handleParticipantChange = (memberId: string) => {
    setParticipants(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
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
    if (!transaction) return;

    if (!description.trim() || amount <= 0 || !payerId || participants.length === 0) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const updateData = {
      description,
      amount,
      date,
      payerId,
      participants
    };
    onSave(transaction.id, updateData);
  };

  const commonInputClass = "mt-1 block w-full px-4 py-2.5 bg-background border border-card-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa giao dịch">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase ml-1 mb-1">{t('addGroupTransaction.amountLabel')}</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
              className={`${commonInputClass} !text-3xl !font-black !py-4 text-primary`} 
              required min="0.01" step="any"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted text-lg">{group.currency}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase ml-1 mb-1">{t('addGroupTransaction.descriptionLabel')}</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={commonInputClass} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase ml-1 mb-1">{t('addGroupTransaction.dateLabel')}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={commonInputClass} required />
          </div>
          <div>
              <label className="block text-xs font-semibold text-muted uppercase ml-1 mb-1">{t('addGroupTransaction.payerLabel')}</label>
              <select value={payerId} onChange={e => setPayerId(e.target.value)} className={commonInputClass} required>
                  {group.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
          </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-muted uppercase ml-1">{t('addGroupTransaction.participantsLabel')}</label>
                <button type="button" onClick={handleSelectAll} className="text-xs font-bold text-primary hover:underline">
                    {participants.length === group.members.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-background/50 rounded-xl border border-card-border custom-scrollbar">
                {group.members.map(m => (
                    <label key={m.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer border ${participants.includes(m.id) ? 'bg-primary/10 border-primary/30' : 'bg-card border-transparent hover:bg-primary/5'}`}>
                        <input type="checkbox" checked={participants.includes(m.id)} onChange={() => handleParticipantChange(m.id)} className="form-checkbox h-5 w-5 text-primary rounded-md"/>
                        <span className={`text-sm font-bold ${participants.includes(m.id) ? 'text-primary' : 'text-muted'}`}>{m.name}</span>
                    </label>
                ))}
            </div>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted hover:bg-background">Hủy</button>
          <button type="submit" className="px-8 py-2.5 rounded-xl font-extrabold bg-primary text-white shadow-lg">Lưu thay đổi</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGroupTransactionModal;