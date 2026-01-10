import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DebtLoanItem } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AddDebtLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
  itemToEdit?: DebtLoanItem | null;
  onUpdate?: (id: string, data: any) => void;
}

const AddDebtLoanModal: React.FC<AddDebtLoanModalProps> = ({ 
  isOpen, onClose, onAdd, itemToEdit, onUpdate 
}) => {
  const { t, wallets, showToast } = useAppContext();
  
  const [type, setType] = useState<'debt' | 'loan'>('debt');
  const [person, setPerson] = useState('');
  const [initialAmount, setInitialAmount] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [linkWallet, setLinkWallet] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');

  const isAmountLocked = itemToEdit ? (itemToEdit.paidAmount > 0) : false;

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setType(itemToEdit.type);
        setPerson(itemToEdit.person);
        setInitialAmount(itemToEdit.initialAmount);
        setStartDate((itemToEdit as any).startDate ? (itemToEdit as any).startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
        setDueDate(itemToEdit.dueDate ? itemToEdit.dueDate.split('T')[0] : '');
        setDescription(itemToEdit.description || '');
        setLinkWallet(false);
      } else {
        setPerson('');
        setInitialAmount(0);
        setStartDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setDescription('');
        setLinkWallet(false);
        if (wallets.length > 0) setSelectedWallet(wallets[0].name);
      }
    }
  }, [isOpen, itemToEdit, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      type,
      person,
      initialAmount,
      startDate,
      dueDate: dueDate || undefined,
      description,
    };

    if (itemToEdit && onUpdate) {
      onUpdate(itemToEdit.id, payload);
    } else {
      if (linkWallet) {
        if (!selectedWallet) {
          showToast("Vui lòng chọn ví liên kết!", "error");
          return;
        }
        payload.walletName = selectedWallet;
      }
      onAdd(payload);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? "Chỉnh sửa khoản Nợ/Vay" : t(type === 'debt' ? 'debts.addDebtTitle' : 'debts.addLoanTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 bg-background/50 p-1 rounded-xl border border-card-border">
          <button type="button" disabled={!!itemToEdit} onClick={() => setType('debt')} className={`py-2 rounded-lg font-bold transition-all ${type === 'debt' ? 'bg-white shadow text-danger' : 'text-muted'}`}>
            {t('debts.debtType') || "Đi vay"}
          </button>
          <button type="button" disabled={!!itemToEdit} onClick={() => setType('loan')} className={`py-2 rounded-lg font-bold transition-all ${type === 'loan' ? 'bg-white shadow text-success' : 'text-muted'}`}>
            {t('debts.loanType') || "Cho vay"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('debts.personLabel') || "Người liên quan"}</label>
          <input type="text" value={person} onChange={e => setPerson(e.target.value)} className="w-full px-3 py-2 bg-card border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none" required placeholder="VD: Anh Ba, Chị Tư..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('debts.amountLabel') || "Số tiền"} 
            {isAmountLocked && <span className="text-danger text-[10px] ml-2">(Khóa do đã có thanh toán)</span>}
          </label>
          <input 
            type="number" 
            value={initialAmount} 
            onChange={e => setInitialAmount(Number(e.target.value))} 
            readOnly={isAmountLocked}
            className={`w-full px-3 py-2 rounded-xl outline-none text-lg font-bold border ${isAmountLocked ? 'bg-muted/20 border-transparent text-muted cursor-not-allowed' : 'bg-card border-card-border focus:ring-2 focus:ring-primary'}`} 
            required 
          />
        </div>

        {!itemToEdit && (
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
            <div className="flex items-center mb-2">
              <input type="checkbox" id="linkWallet" checked={linkWallet} onChange={e => setLinkWallet(e.target.checked)} className="w-4 h-4 text-primary rounded border-gray-300" />
              <label htmlFor="linkWallet" className="ml-2 text-sm font-bold text-text cursor-pointer select-none">
                {type === 'loan' ? "Trừ tiền từ ví ngay?" : "Cộng tiền vào ví ngay?"}
              </label>
            </div>
            {linkWallet && (
              <select value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)} className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-sm outline-none">
                {wallets.map(w => (
                  <option key={w.id} value={w.name}>{w.name} ({new Intl.NumberFormat('vi-VN').format(w.balance)})</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('debts.startDateLabel') || "Ngày tạo"}</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-card border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('debts.dueDateLabel') || "Hạn trả"}</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-card border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('debts.descriptionLabel') || "Mô tả"}</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-card border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-muted/20 hover:bg-muted/30 font-medium transition-colors">Hủy</button>
          <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-content font-bold shadow-lg hover:shadow-primary/30 transition-all">
            {itemToEdit ? "Lưu thay đổi" : "Lưu"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDebtLoanModal;