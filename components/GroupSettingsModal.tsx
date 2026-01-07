import React from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services/apiService';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSuccess: () => void; // Callback để reload dữ liệu
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ isOpen, onClose, group, onSuccess }) => {
  const { user, showToast } = useAppContext();
  const isOwner = group?.createdBy === user?.id;

  const handleDeleteGroup = async () => {
      if (window.confirm(`CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn quỹ "${group.name}"? Hành động này không thể hoàn tác và sẽ xóa mọi giao dịch liên quan!`)) {
          try {
              await apiService.deleteGroup(group.id);
              showToast("Đã giải tán nhóm thành công.", "success");
              onSuccess(); // Reload và đóng modal
              onClose();
          } catch (error: any) {
              showToast(error.message, "error");
          }
      }
  };

  const handleLeaveGroup = async () => {
      if (window.confirm("Bạn có chắc muốn rời khỏi nhóm này?")) {
          try {
              await apiService.leaveGroup(group.id);
              showToast("Đã rời nhóm.", "success");
              onSuccess();
              onClose();
          } catch (error: any) {
              showToast(error.message, "error");
          }
      }
  };

  const handleKickMember = async (memberId: string, memberName: string) => {
      if (window.confirm(`Mời "${memberName}" ra khỏi nhóm?`)) {
          try {
              await apiService.removeMemberFromGroup(group.id, memberId);
              showToast(`Đã xóa ${memberName} khỏi nhóm.`, "success");
              onSuccess(); // Reload để cập nhật danh sách
          } catch (error: any) {
              showToast(error.message, "error");
          }
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cài đặt Quỹ nhóm">
      <div className="space-y-6">
          {/* Thông tin chung */}
          <div className="p-4 bg-background/50 rounded-xl border border-card-border text-center">
              <h3 className="font-bold text-xl text-primary">{group.name}</h3>
              <p className="text-sm text-muted">Mã nhóm: {group.id}</p>
          </div>

          {/* Danh sách thành viên */}
          <div>
              <h4 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Thành viên ({group.members.length})</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {group.members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-2 bg-card rounded-lg border border-card-border">
                          <div className="flex items-center space-x-3">
                              <img src={m.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full" alt="ava" />
                              <div>
                                  <p className="font-bold text-sm">{m.name} {m.id === user.id && "(Bạn)"}</p>
                                  {m.id === group.createdBy && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold">Chủ nhóm</span>}
                              </div>
                          </div>
                          
                          {/* Nút xóa thành viên (Chỉ hiện nếu mình là chủ và không xóa chính mình) */}
                          {isOwner && m.id !== user.id && (
                              <button 
                                onClick={() => handleKickMember(m.id, m.name)}
                                className="text-danger hover:bg-danger/10 p-1.5 rounded-full transition-colors" title="Xóa khỏi nhóm">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Hành động nguy hiểm */}
          <div className="pt-4 border-t border-card-border space-y-3">
              {isOwner ? (
                   <button 
                      onClick={handleDeleteGroup}
                      className="w-full py-3 rounded-xl bg-danger/10 text-danger font-bold hover:bg-danger hover:text-white transition-all border border-danger/20">
                      Xóa vĩnh viễn Quỹ này
                   </button>
              ) : (
                  <button 
                      onClick={handleLeaveGroup}
                      className="w-full py-3 rounded-xl bg-gray-500/10 text-gray-500 font-bold hover:bg-gray-500 hover:text-white transition-all border border-gray-500/20">
                      Rời khỏi nhóm
                  </button>
              )}
          </div>
      </div>
    </Modal>
  );
};

export default GroupSettingsModal;