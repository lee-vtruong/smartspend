import React, { useState } from 'react';
import Modal from './Modal';
import { apiService } from '../services/apiService';
import { UserSearchResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (group: any) => Promise<void>;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { user } = useAppContext(); // Lấy thông tin người tạo
  
  // State cho Form nhóm
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('VND');
  
  // State cho việc tìm kiếm & mời
  const [emailQuery, setEmailQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  
  // Danh sách những người đã được chọn (Chưa bao gồm người tạo)
  const [invitedUsers, setInvitedUsers] = useState<UserSearchResult[]>([]);

  // State xử lý submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset khi đóng modal
  React.useEffect(() => {
    if (!isOpen) {
        setName('');
        setCurrency('VND');
        setInvitedUsers([]);
        setSearchResult(null);
        setEmailQuery('');
        setSubmitError('');
    }
  }, [isOpen]);

  // Hàm tìm kiếm user
  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!emailQuery.trim()) return;
      
      // Không cho tìm chính mình
      if (emailQuery === user?.email) {
          setSearchError("Bạn đã là chủ nhóm rồi!");
          return;
      }
      // Không cho tìm người đã add rồi
      if (invitedUsers.find(u => u.email === emailQuery)) {
          setSearchError("Người này đã có trong danh sách mời.");
          return;
      }

      setIsSearching(true);
      setSearchError('');
      setSearchResult(null);
      
      try {
          const result = await apiService.searchUserByEmail(emailQuery);
          if (result) {
              setSearchResult(result);
          } else {
              setSearchError('Không tìm thấy user này.');
          }
      } catch (err) {
          setSearchError('Lỗi kết nối.');
      } finally {
          setIsSearching(false);
      }
  };

  // Hàm thêm user vào danh sách mời
  const handleAddToInviteList = () => {
      if (searchResult) {
          setInvitedUsers([...invitedUsers, searchResult]);
          // Reset search box để tìm người tiếp theo
          setSearchResult(null);
          setEmailQuery('');
      }
  };

  // Hàm xóa user khỏi danh sách mời (lỡ tay add nhầm)
  const handleRemoveUser = (id: string) => {
      setInvitedUsers(invitedUsers.filter(u => u.id !== id));
  };

  // Hàm Submit cuối cùng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // VALIDATION CLIENT: Phải đủ 2 người mời
    if (invitedUsers.length < 2) {
        setSubmitError(`Cần mời thêm ${2 - invitedUsers.length} thành viên nữa.`);
        return;
    }

    setIsSubmitting(true);
    try {
      // Gửi lên server: tên, tiền tệ, và danh sách ID của những người được mời
      await onAdd({
        name,
        currency,
        invitedMemberIds: invitedUsers.map(u => u.id)
      });
      onClose();
    } catch (error: any) {
        setSubmitError(error.message || 'Lỗi tạo nhóm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Nhóm Mới">
      <div className="space-y-6">
        
        {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-text mb-1">Tên nhóm</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50"
                    placeholder="VD: Du lịch Đà Lạt, Ăn trưa..."
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-text mb-1">Đơn vị tiền tệ</label>
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-xl px-4 py-2"
                >
                    <option value="VND">VND (Việt Nam Đồng)</option>
                    <option value="USD">USD (US Dollar)</option>
                </select>
            </div>
        </div>

        <hr className="border-card-border" />

        {/* PHẦN 2: THÊM THÀNH VIÊN */}
        <div>
            <label className="block text-sm font-bold text-text mb-2">
                Thành viên ({invitedUsers.length + 1}/3 tối thiểu)
            </label>
            
            {/* List thành viên đã add */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Chủ nhóm (Luôn hiển thị) */}
                <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                    <span className="mr-1">👑</span> Bạn
                </div>

                {/* Các thành viên được mời */}
                {invitedUsers.map(u => (
                    <div key={u.id} className="flex items-center bg-card border border-card-border px-3 py-1 rounded-full text-sm text-text animate-fade-in-up">
                        <img src={u.avatar} className="w-4 h-4 rounded-full mr-2" alt=""/>
                        {u.name}
                        <button 
                            onClick={() => handleRemoveUser(u.id)}
                            className="ml-2 text-muted hover:text-danger"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Form tìm kiếm user */}
            <div className="bg-background/50 p-3 rounded-xl border border-card-border">
                <p className="text-xs text-muted mb-2 font-semibold">Mời thêm thành viên:</p>
                <div className="flex gap-2 mb-2">
                    <input
                        type="email"
                        value={emailQuery}
                        onChange={(e) => setEmailQuery(e.target.value)}
                        placeholder="Nhập email bạn bè..."
                        className="flex-1 bg-white dark:bg-black/20 text-sm px-3 py-2 rounded-lg border border-card-border"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={isSearching || !emailQuery}
                        className="px-3 py-2 bg-muted/20 hover:bg-muted/40 rounded-lg text-sm font-bold transition-all"
                    >
                        {isSearching ? '...' : 'Tìm'}
                    </button>
                </div>

                {searchError && <p className="text-xs text-danger ml-1">{searchError}</p>}

                {/* Kết quả tìm kiếm & Nút Add */}
                {searchResult && (
                    <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg mt-2 border border-primary/10">
                        <div className="flex items-center">
                            <img src={searchResult.avatar} className="w-8 h-8 rounded-full mr-2" alt=""/>
                            <div>
                                <p className="text-sm font-bold text-text">{searchResult.name}</p>
                                <p className="text-xs text-muted">{searchResult.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAddToInviteList}
                            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-focus"
                        >
                            + Thêm
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Lỗi submit chung */}
        {submitError && (
            <div className="p-3 bg-danger/10 text-danger text-sm rounded-xl font-medium">
                ⚠️ {submitError}
            </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-muted hover:bg-background transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name || invitedUsers.length < 2}
            className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center ${
                invitedUsers.length < 2 || !name 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-primary hover:bg-primary-focus hover:shadow-primary/30'
            }`}
          >
            {isSubmitting ? 'Đang tạo...' : `Tạo nhóm (${invitedUsers.length + 1}/3)`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddGroupModal;