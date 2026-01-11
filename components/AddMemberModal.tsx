import React, { useState } from 'react';
import Modal from './Modal';
import { apiService } from '../services/apiService';
import { UserSearchResult } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, groupId, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
        setEmail('');
        setSearchResult(null);
        setError('');
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const result = await apiService.searchUserByEmail(email);
      if (result) {
        setSearchResult(result);
      } else {
        setError('Không tìm thấy người dùng với email này.');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FIX TC100: GỬI LỜI MỜI THAY VÌ ADD THẲNG ---
  const handleInviteMember = async () => {
    if (!searchResult) return;
    setIsAdding(true);
    try {
        await apiService.inviteMember(groupId, searchResult.email);
        alert("✅ Đã gửi lời mời thành công! Thành viên sẽ vào nhóm sau khi chấp nhận.");
        onSuccess();
        onClose();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mời thành viên">
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="relative">
            <label className="block text-sm font-medium text-muted mb-1">Nhập email thành viên</label>
            <div className="flex space-x-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 bg-background border border-card-border text-text rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-4 py-2 bg-primary text-primary-content font-bold rounded-xl hover:bg-primary-focus disabled:opacity-50 transition-all"
                >
                    {isLoading ? '...' : 'Tìm'}
                </button>
            </div>
        </form>

        {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
            </div>
        )}

        {searchResult && (
            <div className="bg-card/50 border border-card-border p-4 rounded-2xl flex items-center justify-between animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <img src={searchResult.avatar || "https://via.placeholder.com/40"} alt={searchResult.name} className="w-12 h-12 rounded-full border border-card-border" />
                    <div>
                        <p className="font-bold text-text">{searchResult.name}</p>
                        <p className="text-sm text-muted">{searchResult.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleInviteMember}
                    disabled={isAdding}
                    className="px-4 py-2 bg-success text-white font-bold rounded-xl hover:bg-success-focus transition-all shadow-lg hover:shadow-success/20 flex items-center"
                >
                    {isAdding ? 'Đang gửi...' : 'Gửi lời mời'}
                </button>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default AddMemberModal;