import React, { useState } from 'react';
import Modal from './Modal';
import { Goal } from '../types';
// IMPORT ICON TỪ FILE ICONS MỚI
import { LaptopIcon, AirplaneIcon, EmergencyFundIcon, DefaultIcon } from './Icons';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id' | 'icon'> & { icon: string }) => void;
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

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [selectedIconName, setSelectedIconName] = useState('Laptop');

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
    
    onAdd({ name, targetAmount, currentAmount, icon: selectedIconName });
    
    setName('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setSelectedIconName('Laptop');
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
            onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
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
            className="mt-1 block w-full px-3 py-2 bg-card border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800"
            placeholder="0"
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
          <button type="button" onClick={onClose} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium">Hủy</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Thêm mục tiêu</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGoalModal;