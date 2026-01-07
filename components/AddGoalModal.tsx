import React, { useState } from 'react';
import Modal from './Modal';
import { Goal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id' | 'icon'> & { icon: string }) => void;
}

// --- 1. KHAI BÁO ICON NỘI BỘ (Để tránh lỗi import circular/undefined) ---
const LocalLaptopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-1.621A3 3 0 0 1 14.1 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
);

const LocalAirplaneIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

const LocalEmergencyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const LocalDefaultIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
);

// --- 2. DANH SÁCH ICON SỬ DỤNG COMPONENT NỘI BỘ ---
const goalIcons = [
    { 
        name: 'Laptop', 
        iconComponent: LocalLaptopIcon,
        displayName: 'Laptop'
    },
    { 
        name: 'Airplane', 
        iconComponent: LocalAirplaneIcon,
        displayName: 'Máy bay'
    },
    { 
        name: 'Emergency', 
        iconComponent: LocalEmergencyIcon,
        displayName: 'Khẩn cấp'
    },
];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('Laptop');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetAmount <= 0) {
      alert('Vui lòng nhập tên và số tiền mục tiêu hợp lệ.');
      return;
    }
    if (currentAmount > targetAmount) {
        alert('Số tiền ban đầu không thể lớn hơn số tiền mục tiêu.');
        return;
    }
    // Gửi về chuỗi tên icon (ví dụ 'Laptop') để Dashboard tự map
    onAdd({ name, targetAmount, currentAmount, icon: selectedIcon });
    
    // Reset form
    setName('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setSelectedIcon('Laptop');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm mục tiêu mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-name" className="block text-sm font-medium text-muted">Tên mục tiêu</label>
          <input
            type="text"
            id="goal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
            onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="50000000"
            required
            min="1"
          />
        </div>

        <div>
          <label htmlFor="goal-current-amount" className="block text-sm font-medium text-muted">Số tiền ban đầu (tùy chọn)</label>
          <input
            type="number"
            id="goal-current-amount"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="0"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted">Chọn biểu tượng</label>
            <div className="mt-2 flex space-x-2">
              {goalIcons.map(iconInfo => {
                  const IconComponent = iconInfo.iconComponent;
                  return (
                      <button
                          type="button"
                          key={iconInfo.name}
                          onClick={() => setSelectedIcon(iconInfo.name)}
                          className={`p-3 rounded-lg border-2 ${selectedIcon === iconInfo.name ? 'border-primary bg-primary/10' : 'border-card-border bg-background'}`}
                          title={iconInfo.displayName}
                      >
                          <IconComponent className="w-6 h-6" />
                      </button>
                  );
              })}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
          <button type="submit" className="bg-primary text-primary-content px-4 py-2 rounded-md hover:opacity-90">Thêm mục tiêu</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGoalModal;