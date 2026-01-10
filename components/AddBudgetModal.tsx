import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { DefaultIcon } from './Icons';
import { iconMap } from '../constants';
import { Budget } from '../types';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: any) => void;
  budgetToEdit?: Budget | null;
  onUpdate?: (budget: Budget) => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  budgetToEdit, 
  onUpdate 
}) => {
  const { transactionCategories, t } = useAppContext();
  
  const expenseCategories = transactionCategories.filter(c => c.type === 'expense');
  
  // State: Dùng string cho limit để tránh lỗi nhập số 0 hoặc xóa trống bị nhảy
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState<string>(''); 

  // --- FIX LỖI NHẢY SỐ TẠI ĐÂY ---
  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        // Chế độ Sửa
        setCategory(budgetToEdit.category);
        setLimit(String(budgetToEdit.limit)); // Chuyển sang string để hiển thị
      } else {
        // Chế độ Thêm: Reset
        setCategory(expenseCategories[0]?.name || '');
        setLimit('');
      }
    }
    // QUAN TRỌNG: Bỏ 'expenseCategories' khỏi dependency để tránh reset khi app re-render
  }, [isOpen, budgetToEdit]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNumber = parseFloat(limit);

    if (!limit || limitNumber <= 0) {
        alert("Vui lòng nhập hạn mức lớn hơn 0");
        return;
    }

    if (budgetToEdit && onUpdate) {
      onUpdate({
        ...budgetToEdit,
        category,
        limit: limitNumber,
      });
    } else {
      onAdd({
        category,
        limit: limitNumber,
        spent: 0,
      });
    }
    
    setLimit('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={budgetToEdit ? "Chỉnh sửa ngân sách" : "Thiết lập ngân sách"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Chọn Danh mục */}
        <div>
          <label className="block text-sm font-bold text-muted mb-2">Danh mục chi tiêu</label>
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
             {expenseCategories.map((cat) => {
                 const IconComponent = iconMap[cat.iconName || 'DefaultIcon'] || DefaultIcon;
                 return (
                    <div 
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className={`cursor-pointer border rounded-xl p-2 flex flex-col items-center justify-center transition-all ${
                            category === cat.name
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                    >
                        <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        <span className="text-xs mt-1 text-center truncate w-full font-medium">{t(cat.name)}</span>
                    </div>
                 );
             })}
          </div>
        </div>

        {/* Hạn mức chi tiêu */}
        <div>
            <label className="block text-sm font-bold text-muted mb-2">Hạn mức tháng này</label>
            <div className="relative bg-background border border-card-border rounded-2xl p-4 flex items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-sm">
                <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-gray-300"
                    placeholder="0"
                    min="0"
                />
                <span className="text-sm font-bold text-muted ml-3 uppercase tracking-wider bg-card px-2 py-1 rounded-lg border border-card-border">
                    VND
                </span>
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            {budgetToEdit ? "Lưu thay đổi" : "Lưu ngân sách"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBudgetModal;