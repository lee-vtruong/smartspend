import React, { useState } from 'react';
import Modal from './Modal';
import { Group, GroupMember } from '../types';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (group: Omit<Group, 'id' | 'transactions' | 'members'> & { members: Omit<GroupMember, 'id' | 'avatar'>[] }) => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');
  const [members, setMembers] = useState<{ name: string }[]>([]);
  const [currentMemberName, setCurrentMemberName] = useState('');

  const handleAddMember = () => {
    if (currentMemberName.trim() && !members.some(m => m.name === currentMemberName.trim())) {
      setMembers([...members, { name: currentMemberName.trim() }]);
      setCurrentMemberName('');
    }
  };

  const handleRemoveMember = (memberName: string) => {
    setMembers(members.filter(m => m.name !== memberName));
  };

  const resetForm = () => {
    setName('');
    setCurrency('VND');
    setMembers([]);
    setCurrentMemberName('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || members.length < 2) {
      alert('Tên nhóm không được để trống và phải có ít nhất 2 thành viên.');
      return;
    }
    onAdd({ name, currency, members });
    resetForm();
    onClose();
  };
  
  const commonInputClass = "mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm";


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo nhóm mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="group-name" className="block text-sm font-medium text-muted mb-1">Tên nhóm</label>
          <input
            type="text"
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={commonInputClass}
            placeholder="Ví dụ: Chuyến đi Vũng Tàu"
            required
          />
        </div>
        <div>
          <label htmlFor="group-currency" className="block text-sm font-medium text-muted mb-1">Loại tiền tệ</label>
          <select
            id="group-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className={commonInputClass}
          >
            <option>VND</option>
            <option>USD</option>
          </select>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-muted mb-1">Thành viên</label>
            <div className="flex mt-1">
                <input
                    type="text"
                    value={currentMemberName}
                    onChange={(e) => setCurrentMemberName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                    className="flex-grow px-4 py-2 bg-background border border-card-border rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="Tên thành viên"
                />
                <button type="button" onClick={handleAddMember} className="px-4 py-2 bg-primary text-primary-content rounded-r-lg hover:opacity-90 font-semibold">Thêm</button>
            </div>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1">
                {members.map(member => (
                    <div key={member.name} className="flex justify-between items-center bg-background p-2 rounded-lg text-sm">
                        <span className="font-medium">{member.name}</span>
                        <button type="button" onClick={() => handleRemoveMember(member.name)} className="text-muted hover:text-danger p-1 rounded-full" title={`Xóa ${member.name}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-text bg-background hover:bg-gray-200 dark:hover:bg-gray-700">Hủy</button>
           <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!name.trim() || members.length < 2}>Tạo nhóm</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGroupModal;