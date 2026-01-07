import React, { useState } from 'react';
import Modal from './Modal';
import { DebtLoanItem } from '../types';
import { useAppContext } from '../contexts/AppContext'; // Import Context

interface AddDebtLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
}

const AddDebtLoanModal: React.FC<AddDebtLoanModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { t, wallets } = useAppContext(); // Lấy danh sách ví
  const [type, setType] = useState<'debt' | 'loan'>('debt');
  const [person, setPerson] = useState('');
  const [initialAmount, setInitialAmount] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  
  // STATE MỚI CHO VIỆC CHỌN VÍ
  const [linkWallet, setLinkWallet] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(wallets.length > 0 ? wallets[0].name : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chuẩn bị dữ liệu gửi đi
    const payload: any = {
      type,
      person,
      initialAmount,
      startDate,
      dueDate: dueDate || undefined, // Nếu rỗng thì gửi undefined
      description,
    };

    // Nếu người dùng muốn trừ tiền ví ngay
    if (linkWallet) {
        if (!selectedWallet) {
            alert("Vui lòng chọn ví liên kết!");
            return;
        }
        payload.walletName = selectedWallet; // Gửi kèm tên ví
    }

    onAdd(payload);
    onClose();
    // Reset form...
    setPerson('');
    setInitialAmount(0);
    setDescription('');
    setLinkWallet(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(type === 'debt' ? 'debts.addDebtTitle' : 'debts.addLoanTitle') || "Thêm khoản mới"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Loại: Đi vay / Cho vay */}
        <div className="grid grid-cols-2 gap-2 bg-background/50 p-1 rounded-xl border border-card-border">
            <button type="button" onClick={() => setType('debt')} className={`py-2 rounded-lg font-bold transition-all ${type === 'debt' ? 'bg-white shadow text-danger' : 'text-muted'}`}>
                {t('debts.debtType') || "Đi vay"}
            </button>
            <button type="button" onClick={() => setType('loan')} className={`py-2 rounded-lg font-bold transition-all ${type === 'loan' ? 'bg-white shadow text-success' : 'text-muted'}`}>
                {t('debts.loanType') || "Cho vay"}
            </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('debts.personLabel') || "Người liên quan"}</label>
          <input type="text" value={person} onChange={e => setPerson(e.target.value)} className="w-full px-3 py-2 bg-card border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none" required placeholder="VD: Anh Ba, Chị Tư..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('debts.amountLabel') || "Số tiền"}</label>
          <input type="number" value={initialAmount} onChange={e => setInitialAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-card border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-lg font-bold" required />
        </div>

        {/* --- PHẦN MỚI: LIÊN KẾT VÍ --- */}
        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
            <div className="flex items-center mb-2">
                <input 
                    type="checkbox" 
                    id="linkWallet" 
                    checked={linkWallet} 
                    onChange={e => setLinkWallet(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="linkWallet" className="ml-2 text-sm font-bold text-text cursor-pointer select-none">
                    {type === 'loan' ? "Trừ tiền từ ví ngay?" : "Cộng tiền vào ví ngay?"}
                </label>
            </div>
            
            {linkWallet && (
                <div className="mt-2 animate-fade-in">
                    <select 
                        value={selectedWallet} 
                        onChange={e => setSelectedWallet(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-sm focus:ring-primary outline-none"
                    >
                        {wallets.map(w => (
                            <option key={w.id} value={w.name}>
                                {w.name} (Số dư: {new Intl.NumberFormat('vi-VN').format(w.balance)})
                            </option>
                        ))}
                    </select>
                    <p className="text-[11px] text-muted mt-1 italic">
                        * Hệ thống sẽ tự động tạo một giao dịch {type === 'loan' ? 'Chi tiêu' : 'Thu nhập'} tương ứng.
                    </p>
                </div>
            )}
        </div>
        {/* ----------------------------- */}

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
            <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-primary-content font-bold shadow-lg hover:shadow-primary/30 transition-all">Lưu</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDebtLoanModal;