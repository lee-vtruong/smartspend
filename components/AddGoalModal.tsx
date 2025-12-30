import React, { useState } from 'react';
import Modal from './Modal';
import { Goal } from '../types';
import { LaptopIcon, AirplaneIcon, EmergencyFundIcon } from '../constants';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id' | 'icon'> & { icon: string }) => void;
}

const goalIcons = [
    { name: 'Laptop', icon: <LaptopIcon className="w-6 h-6" /> },
    { name: 'Airplane', icon: <AirplaneIcon className="w-6 h-6" /> },
    { name: 'Emergency', icon: <EmergencyFundIcon className="w-6 h-6" /> },
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
                {goalIcons.map(iconInfo => (
                    <button
                        type="button"
                        key={iconInfo.name}
                        onClick={() => setSelectedIcon(iconInfo.name)}
                        className={`p-3 rounded-lg border-2 ${selectedIcon === iconInfo.name ? 'border-primary bg-primary/10' : 'border-card-border bg-background'}`}
                    >
                        {iconInfo.icon}
                    </button>
                ))}
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