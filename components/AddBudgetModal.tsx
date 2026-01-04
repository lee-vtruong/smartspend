import React, { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: any) => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onAdd }) => {
  // 1. LẤY THÊM HÀM t TỪ CONTEXT ĐỂ DỊCH NGÔN NGỮ
  const { transactionCategories, t } = useAppContext();
  
  // State
  const [category, setCategory] = useState(transactionCategories[0]?.name || '');
  const [limit, setLimit] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limit <= 0) {
        alert("Vui lòng nhập hạn mức lớn hơn 0");
        return;
    }
    
    onAdd({
      category,
      limit: Number(limit),
      spent: 0,
    });

    // Reset form
    setLimit(0);
    setCategory(transactionCategories[0]?.name || '');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="THIẾT LẬP NGÂN SÁCH">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Chọn Danh mục */}
        <div>
          <label className="block text-sm font-bold text-text mb-2">Danh mục chi tiêu</label>
          <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-all"
              >
                {transactionCategories
                    .filter(c => c.type === 'expense')
                    .map((cat) => (
                        <option key={cat.name} value={cat.name}>
                            {/* 2. SỬA LỖI: Dùng hàm t() để dịch category.food -> Ăn uống */}
                            {t(cat.name)}
                        </option>
                ))}
              </select>
              {/* Icon mũi tên */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
          </div>
        </div>

        {/* Hạn mức chi tiêu */}
        <div>
            <label className="block text-sm font-bold text-text mb-2">Hạn mức tháng này</label>
            <div className="relative bg-background border border-card-border rounded-2xl p-4 flex items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-sm group hover:border-primary/50">
                <input
                    type="number"
                    value={limit === 0 ? '' : limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-muted/30"
                    placeholder="0"
                    min="0"
                    autoFocus
                />
                <span className="text-sm font-bold text-muted ml-3 uppercase tracking-wider bg-card px-2 py-1 rounded-lg border border-card-border">
                    VND
                </span>
            </div>
            <p className="text-xs text-muted mt-2 ml-1">
                ⚠️ Mony sẽ cảnh báo khi bạn tiêu vượt quá 80% số tiền này.
            </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-muted hover:bg-background transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-primary text-primary-content rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-focus transition-all transform active:scale-95"
          >
            Lưu ngân sách
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBudgetModal;