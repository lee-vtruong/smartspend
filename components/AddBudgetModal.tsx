import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext'; // Import Context
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
  // Lấy danh sách budgets hiện có để check trùng
  const { transactionCategories, t, budgets, formatCurrency } = useAppContext(); 
  
  const expenseCategories = transactionCategories.filter(c => c.type === 'expense');
  
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState<string>(''); 
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setCategory(budgetToEdit.category);
        setLimit(String(budgetToEdit.limit)); 
        // Tìm icon của category đang chỉnh sửa
        const catInfo = expenseCategories.find(c => c.name === budgetToEdit.category);
        setSelectedIcon(catInfo?.iconName || 'DefaultIcon');
      } else {
        // Mặc định chọn category đầu tiên chưa có ngân sách
        const firstUnbudgetedCat = expenseCategories.find(cat => 
          !budgets.some(b => b.category === cat.name)
        );
        const defaultCat = firstUnbudgetedCat || expenseCategories[0];
        
        setCategory(defaultCat?.name || '');
        setSelectedIcon(defaultCat?.iconName || 'DefaultIcon');
        setLimit('');
      }
    }
  }, [isOpen, budgetToEdit]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNumber = parseFloat(limit);

    if (!limit || limitNumber <= 0) {
        alert("Vui lòng nhập hạn mức lớn hơn 0");
        return;
    }

    // --- VALIDATE TRÙNG TẠI FRONTEND ---
    const isDuplicate = budgets.some(b => 
        b.category === category &&          
        b.id !== budgetToEdit?.id           
    );

    if (isDuplicate) {
        alert(`Ngân sách cho danh mục "${t(category)}" đã tồn tại! Vui lòng chọn danh mục khác hoặc chỉnh sửa ngân sách cũ.`);
        return;
    }
    // ---------------------------------------------

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

  // Tìm category info hiện tại
  const currentCategory = expenseCategories.find(c => c.name === category);
  const IconComponent = currentCategory ? iconMap[currentCategory.iconName || 'DefaultIcon'] || DefaultIcon : DefaultIcon;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={budgetToEdit ? "Chỉnh sửa ngân sách" : "Thiết lập ngân sách"}
      className="max-w-lg"
    >
      <div className="space-y-8">
        {/* Header với icon và description */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl border border-blue-200 dark:border-blue-800/30">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl">
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
              {budgetToEdit ? 'Điều chỉnh ngân sách hiện tại' : 'Thiết lập giới hạn chi tiêu mới'}
            </p>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
              Quản lý chi tiêu của bạn hiệu quả hơn
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Chọn Danh mục */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
                Danh mục chi tiêu <span className="text-red-500">*</span>
              </label>
              
              {/* Selected Category Preview */}
              {category && (
                <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-white/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/20 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                        {currentCategory ? t(currentCategory.name) : category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Đã chọn
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                {expenseCategories.map((cat) => {
                  const CatIcon = iconMap[cat.iconName || 'DefaultIcon'] || DefaultIcon;
                  const hasBudget = budgets.some(b => b.category === cat.name && b.id !== budgetToEdit?.id);
                  const isSelected = category === cat.name;

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setCategory(cat.name);
                        setSelectedIcon(cat.iconName || 'DefaultIcon');
                      }}
                      disabled={hasBudget && !isSelected}
                      className={`
                        relative
                        flex 
                        flex-col 
                        items-center 
                        justify-center 
                        p-3 
                        rounded-xl 
                        border-2 
                        transition-all 
                        duration-300 
                        hover:scale-[1.03]
                        ${isSelected 
                          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 shadow-md' 
                          : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }
                        ${hasBudget && !isSelected ? 'opacity-40 grayscale cursor-not-allowed' : ''}
                      `}
                      title={hasBudget && !isSelected ? "Đã có ngân sách" : t(cat.name)}
                    >
                      {/* Budget indicator */}
                      {hasBudget && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      <div className={`
                        p-2.5 
                        rounded-lg 
                        mb-2 
                        transition-all 
                        duration-300
                        ${isSelected 
                          ? 'bg-gradient-to-br from-primary to-primary/80 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }
                      `}>
                        <CatIcon className="w-6 h-6" />
                      </div>
                      
                      <span className={`
                        text-xs 
                        font-medium 
                        text-center 
                        truncate 
                        w-full 
                        ${isSelected 
                          ? 'text-primary font-semibold' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}>
                        {t(cat.name)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hạn mức chi tiêu */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
              Hạn mức tháng này <span className="text-red-500">*</span>
            </label>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-800 dark:to-gray-900/95 border-2 border-gray-300 dark:border-white/15 rounded-xl p-5 flex items-center focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300 shadow-sm">
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0"
                  min="0"
                  required
                  autoFocus={!category}
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                  VND
                </span>
              </div>
              
              {/* Budget suggestion */}
              {!budgetToEdit && !limit && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLimit('500000')}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {formatCurrency(500000)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLimit('1000000')}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {formatCurrency(1000000)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLimit('2000000')}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {formatCurrency(2000000)}
                  </button>
                </div>
              )}
            </div>
            
            {limit && parseFloat(limit) > 0 && (
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  Ngân sách hàng tháng: {formatCurrency(parseFloat(limit))}
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  Tương đương {formatCurrency(parseFloat(limit) / 30)} mỗi ngày
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!category || !limit || parseFloat(limit) <= 0}
              className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {budgetToEdit ? "Lưu thay đổi" : "Lưu ngân sách"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddBudgetModal;