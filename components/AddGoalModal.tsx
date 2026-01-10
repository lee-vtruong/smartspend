import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Goal } from '../types';
// IMPORT ICON TỪ FILE ICONS MỚI (Đảm bảo đường dẫn đúng)
import { LaptopIcon, AirplaneIcon, EmergencyFundIcon, DefaultIcon } from './Icons';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: any) => void;
  // --- PROPS MỚI CHO TÍNH NĂNG SỬA ---
  goalToEdit?: Goal | null;
  onUpdate?: (goal: Goal) => void;
}

// Cấu hình Icon cho Goal
const GOAL_ICONS_CONFIG = [
    { 
        name: 'Laptop', 
        iconComponent: LaptopIcon,
        displayName: 'Laptop'
    },
    { 
        name: 'Airplane', 
        iconComponent: AirplaneIcon,
        displayName: 'Máy bay'
    },
    { 
        name: 'Emergency', 
        iconComponent: EmergencyFundIcon,
        displayName: 'Khẩn cấp'
    },
    { 
        name: 'Default', 
        iconComponent: DefaultIcon,
        displayName: 'Khác'
    },
];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ 
    isOpen, onClose, onAdd, goalToEdit, onUpdate 
}) => {
  const [name, setName] = useState('');
  // Dùng chuỗi để quản lý input số tốt hơn
  const [targetAmount, setTargetAmount] = useState<string>(''); 
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [selectedIconName, setSelectedIconName] = useState('Laptop');

  // --- EFFECT: ĐIỀN DỮ LIỆU KHI MỞ MODAL ---
  useEffect(() => {
    if (isOpen) {
        if (goalToEdit) {
            // Chế độ Sửa: Fill data cũ
            setName(goalToEdit.name);
            setTargetAmount(String(goalToEdit.targetAmount));
            setCurrentAmount(String(goalToEdit.currentAmount));
            // Kiểm tra icon có phải string không
            setSelectedIconName(typeof goalToEdit.icon === 'string' ? goalToEdit.icon : 'Laptop');
        } else {
            // Chế độ Thêm: Reset form
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

    // TC072: Validate số tiền không hợp lệ
    if (!name.trim() || targetVal <= 0) {
      alert('Vui lòng nhập tên và số tiền mục tiêu lớn hơn 0.');
      return;
    }
    
    if (!isNaN(currentVal) && currentVal > targetVal) {
        alert('Số tiền hiện có không thể lớn hơn mục tiêu.');
        return;
    }
    
    if (goalToEdit && onUpdate) {
        // --- LOGIC CẬP NHẬT (TC070) ---
        onUpdate({
            ...goalToEdit, // Giữ nguyên ID, userId...
            name,
            targetAmount: targetVal,
            currentAmount: isNaN(currentVal) ? goalToEdit.currentAmount : currentVal, // Giữ nguyên nếu không nhập
            icon: selectedIconName
        });
    } else {
        // --- LOGIC THÊM MỚI ---
        onAdd({ 
            name, 
            targetAmount: targetVal, 
            currentAmount: isNaN(currentVal) ? 0 : currentVal, 
            icon: selectedIconName 
        });
    }
    
    // Reset và đóng modal
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    onClose();
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        // Đổi tiêu đề tùy ngữ cảnh
        title={goalToEdit ? "Chỉnh sửa mục tiêu" : "Thêm mục tiêu mới"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-name" className="block text-sm font-medium text-muted">Tên mục tiêu</label>
          <input
            type="text"
            id="goal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
            placeholder="Ví dụ: Mua MacBook Pro M4"
            required
          />
        </div>
        
        <div>
          <label htmlFor="goal-target-amount" className="block text-sm font-medium text-muted">Số tiền mục tiêu</label>
          <input
            type="number"
            id="goal-target-amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
            placeholder="50000000"
            required
            min="1"
          />
        </div>

        {/* Chỉ cho nhập số tiền ban đầu khi thêm mới (hoặc tùy logic của bạn) */}
        {/* Ở đây tôi cho phép sửa cả số tiền hiện tại để linh hoạt */}
        <div>
          <label htmlFor="goal-current-amount" className="block text-sm font-medium text-muted">
              {goalToEdit ? "Số tiền hiện tại (Cập nhật thủ công)" : "Số tiền ban đầu (tùy chọn)"}
          </label>
          <input
            type="number"
            id="goal-current-amount"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
            placeholder={goalToEdit ? String(goalToEdit.currentAmount) : "0"}
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted">Chọn biểu tượng</label>
            <div className="mt-2 flex space-x-2">
              {GOAL_ICONS_CONFIG.map(iconInfo => {
                  const IconComponent = iconInfo.iconComponent;
                  return (
                      <button
                          type="button"
                          key={iconInfo.name}
                          onClick={() => setSelectedIconName(iconInfo.name)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                              selectedIconName === iconInfo.name 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                              : 'border-card-border bg-background hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          title={iconInfo.displayName}
                      >
                          <IconComponent className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      </button>
                  );
              })}
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {/* Đổi text nút bấm */}
            {goalToEdit ? "Lưu thay đổi" : "Thêm mục tiêu"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGoalModal;