import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Goal } from '../types';
import { LaptopIcon, AirplaneIcon, EmergencyFundIcon, DefaultIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: any) => void;
  goalToEdit?: Goal | null;
  onUpdate?: (goal: Goal) => void;
}

// Cấu hình Icon cho Goal với gradient colors
const GOAL_ICONS_CONFIG = [
    { 
        name: 'Laptop', 
        iconComponent: LaptopIcon,
        displayName: 'Laptop',
        color: 'from-blue-500 to-blue-400',
        bgColor: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/20'
    },
    { 
        name: 'Airplane', 
        iconComponent: AirplaneIcon,
        displayName: 'Du lịch',
        color: 'from-emerald-500 to-emerald-400',
        bgColor: 'from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20'
    },
    { 
        name: 'Emergency', 
        iconComponent: EmergencyFundIcon,
        displayName: 'Khẩn cấp',
        color: 'from-amber-500 to-amber-400',
        bgColor: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20'
    },
    { 
        name: 'Default', 
        iconComponent: DefaultIcon,
        displayName: 'Khác',
        color: 'from-purple-500 to-purple-400',
        bgColor: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/20'
    },
];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ 
    isOpen, onClose, onAdd, goalToEdit, onUpdate 
}) => {
  const { formatCurrency } = useAppContext();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>(''); 
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [selectedIconName, setSelectedIconName] = useState('Laptop');

  // Tính toán progress
  const targetVal = parseFloat(targetAmount) || 0;
  const currentVal = parseFloat(currentAmount) || 0;
  const progress = targetVal > 0 ? Math.min((currentVal / targetVal) * 100, 100) : 0;
  const isComplete = progress >= 100;
  const remainingAmount = targetVal - currentVal;

  // Tính ngày hoàn thành dự kiến (giả sử tiết kiệm 1 triệu mỗi tháng)
  const monthsToComplete = remainingAmount > 0 ? Math.ceil(remainingAmount / 1000000) : 0;

  useEffect(() => {
    if (isOpen) {
        if (goalToEdit) {
            setName(goalToEdit.name);
            setTargetAmount(String(goalToEdit.targetAmount));
            setCurrentAmount(String(goalToEdit.currentAmount));
            setSelectedIconName(typeof goalToEdit.icon === 'string' ? goalToEdit.icon : 'Laptop');
        } else {
            setName('');
            setTargetAmount('');
            setCurrentAmount('');
            setSelectedIconName('Laptop');
        }
    }
  }, [isOpen, goalToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetVal = parseFloat(targetAmount);
    const currentVal = parseFloat(currentAmount);

    if (!name.trim() || targetVal <= 0) {
      alert('Vui lòng nhập tên và số tiền mục tiêu lớn hơn 0.');
      return;
    }
    
    if (!isNaN(currentVal) && currentVal > targetVal) {
        alert('Số tiền hiện có không thể lớn hơn mục tiêu.');
        return;
    }
    
    if (goalToEdit && onUpdate) {
        onUpdate({
            ...goalToEdit,
            name,
            targetAmount: targetVal,
            currentAmount: isNaN(currentVal) ? goalToEdit.currentAmount : currentVal,
            icon: selectedIconName
        });
    } else {
        onAdd({ 
            name, 
            targetAmount: targetVal, 
            currentAmount: isNaN(currentVal) ? 0 : currentVal, 
            icon: selectedIconName 
        });
    }
    
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    onClose();
  };

  // Tìm selected icon config
  const selectedIconConfig = GOAL_ICONS_CONFIG.find(icon => icon.name === selectedIconName);
  const SelectedIcon = selectedIconConfig?.iconComponent || LaptopIcon;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={goalToEdit ? "Chỉnh sửa mục tiêu" : "Thiết lập mục tiêu mới"}
        className="max-w-lg"
    >
      <div className="space-y-8">
        {/* Header với selected icon */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
          <div className={`p-3.5 rounded-xl bg-gradient-to-br ${selectedIconConfig?.color || 'from-blue-500 to-blue-400'}`}>
            <SelectedIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-primary font-semibold">
              {goalToEdit ? 'Cập nhật mục tiêu của bạn' : 'Bắt đầu hành trình mới'}
            </p>
            <p className="text-xs text-primary/80 dark:text-primary/60 mt-0.5">
              Mục tiêu rõ ràng, thành công đến nhanh hơn
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên mục tiêu */}
          <div className="space-y-3">
            <label htmlFor="goal-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Tên mục tiêu <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <input
                type="text"
                id="goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
                placeholder="Ví dụ: Mua MacBook Pro M4, Đi du lịch Châu Âu..."
                required
                autoFocus
              />
              {name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Chọn biểu tượng */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Biểu tượng
            </label>
            <div className="grid grid-cols-4 gap-3">
              {GOAL_ICONS_CONFIG.map(iconInfo => {
                  const IconComponent = iconInfo.iconComponent;
                  const isSelected = selectedIconName === iconInfo.name;
                  
                  return (
                      <button
                          type="button"
                          key={iconInfo.name}
                          onClick={() => setSelectedIconName(iconInfo.name)}
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
                            hover:scale-[1.05]
                            ${isSelected 
                              ? `border-primary bg-gradient-to-br ${iconInfo.bgColor} shadow-md` 
                              : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }
                          `}
                          title={iconInfo.displayName}
                      >
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
                            ? `bg-gradient-to-br ${iconInfo.color} text-white` 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }
                        `}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        
                        <span className={`
                          text-xs 
                          font-medium 
                          text-center 
                          ${isSelected 
                            ? 'text-primary font-semibold' 
                            : 'text-gray-700 dark:text-gray-300'
                          }
                        `}>
                          {iconInfo.displayName}
                        </span>
                      </button>
                  );
              })}
            </div>
          </div>

          {/* Số tiền mục tiêu */}
          <div className="space-y-3">
            <label htmlFor="goal-target-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              Số tiền mục tiêu <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-800 dark:to-gray-900/95 border-2 border-gray-300 dark:border-white/15 rounded-xl p-4 flex items-center focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300">
                <input
                  type="number"
                  id="goal-target-amount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-primary outline-none placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0"
                  required
                  min="1"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                  VND
                </span>
              </div>
            </div>
          </div>

          {/* Số tiền hiện tại */}
          <div className="space-y-3">
            <label htmlFor="goal-current-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
              {goalToEdit ? "Số tiền hiện có" : "Số tiền ban đầu (tùy chọn)"}
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-800 dark:to-gray-900/95 border-2 border-gray-300 dark:border-white/15 rounded-xl p-4 flex items-center focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300">
                <input
                  type="number"
                  id="goal-current-amount"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-blue-600 dark:text-blue-400 outline-none placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder={goalToEdit ? String(goalToEdit.currentAmount || 0) : "0"}
                  min="0"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
                  VND
                </span>
              </div>
            </div>
          </div>

          {/* Progress Preview */}
          {(targetVal > 0 || currentVal > 0) && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-white/15 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tiến độ dự kiến
                </span>
                <span className={`text-sm font-bold ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    isComplete 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                      : 'bg-gradient-to-r from-primary to-primary/80'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">Hiện có</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(currentVal)}</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">Cần thêm</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(remainingAmount)}</p>
                </div>
              </div>
              
              {monthsToComplete > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Dự kiến hoàn thành trong {monthsToComplete} tháng
                </p>
              )}
            </div>
          )}

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
              disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
              className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {goalToEdit ? "Lưu thay đổi" : "Tạo mục tiêu"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddGoalModal;