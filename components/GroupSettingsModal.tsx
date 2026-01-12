import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services/apiService';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSuccess: () => void;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ isOpen, onClose, group, onSuccess }) => {
  const { user, showToast } = useAppContext();
  const isOwner = group?.createdBy === user?.id;

  // State thông tin nhóm
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // State danh sách lời mời (MỚI)
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  // Load data khi mở modal
  useEffect(() => {
      if (isOpen && group) {
          setName(group.name);
          setNote(group.note || '');
          setIsEditing(false);
          loadPendingInvites(); // Gọi hàm load lời mời
      }
  }, [isOpen, group]);

  const loadPendingInvites = async () => {
      if (!group?.id) return;
      setIsLoadingInvites(true);
      try {
          const invites = await apiService.getGroupInvitations(group.id);
          setPendingInvites(invites);
      } catch (error) {
          console.error(error);
      } finally {
          setIsLoadingInvites(false);
      }
  };

  const handleUpdateInfo = async () => {
      try {
          await apiService.updateGroupInfo(group.id, { name, note });
          showToast("Cập nhật thông tin nhóm thành công", "success");
          setIsEditing(false);
          onSuccess();
      } catch (e: any) {
          showToast(e.message, "error");
      }
  };

  const handleCancelInvite = async (invId: string) => {
      if(window.confirm("Bạn muốn hủy lời mời này?")) {
          try {
              await apiService.cancelInvitation(invId);
              setPendingInvites(prev => prev.filter(i => i.id !== invId));
              showToast("Đã hủy lời mời", "success");
          } catch (e: any) {
              showToast(e.message, "error");
          }
      }
  };

  // ... (Các hàm handleTransferOwnership, handleDeleteGroup... giữ nguyên như cũ)
  const handleTransferOwnership = async (memberId: string, memberName: string) => {
    /* Code cũ giữ nguyên */
    if (window.confirm(`Chuyển quyền trưởng nhóm cho ${memberName}?`)) {
        try {
            await apiService.transferGroupOwnership(group.id, memberId);
            showToast("Đã chuyển quyền", "success");
            onSuccess(); onClose();
        } catch(e: any) { showToast(e.message, "error"); }
    }
  };
  const handleDeleteGroup = async () => { 
      if (window.confirm(`CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn quỹ "${group.name}"? Hành động này không thể hoàn tác!`)) {
        try {
            await apiService.deleteGroup(group.id);
            showToast("Đã giải tán nhóm thành công.", "success");
            onSuccess();
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
  const handleKickMember = async (mid: string, mname: string) => { 
      if (window.confirm(`Mời "${mname}" ra khỏi nhóm?`)) {
        try {
            await apiService.removeMemberFromGroup(group.id, mid);
            showToast(`Đã xóa ${mname} khỏi nhóm.`, "success");
            onSuccess();
        } catch (error: any) {
            showToast(error.message, "error");
        }
    }
  };


  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cài đặt Quỹ nhóm">
      <div className="space-y-6">
          {/* PHẦN 1: THÔNG TIN CHUNG (Giữ nguyên) */}
          <div className="p-4 bg-background/50 rounded-xl border border-card-border relative">
              {isEditing ? (
                  <div className="space-y-3">
                      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded border border-card-border bg-card font-bold" />
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 rounded border border-card-border bg-card text-sm" placeholder="Ghi chú..." />
                      <div className="flex gap-2 justify-end">
                          <button onClick={() => setIsEditing(false)} className="text-sm">Hủy</button>
                          <button onClick={handleUpdateInfo} className="text-sm bg-primary text-white px-3 py-1 rounded">Lưu</button>
                      </div>
                  </div>
              ) : (
                  <div className="text-center group">
                      <h3 className="font-bold text-xl text-primary">{group.name}</h3>
                      <p className="text-sm text-muted mt-1 italic">{group.note || "Chưa có ghi chú"}</p>
                      {isOwner && (
                          <button onClick={() => setIsEditing(true)} className="absolute top-0 right-0 p-2 text-muted hover:text-primary">✏️</button>
                      )}
                  </div>
              )}
          </div>

          {/* PHẦN 2: THÀNH VIÊN CHÍNH THỨC */}
          <div>
              <h4 className="font-bold text-xs text-muted uppercase tracking-wider mb-3">
                  Thành viên chính thức ({group.members.length})
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {group.members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-2 bg-card rounded-lg border border-card-border">
                          <div className="flex items-center space-x-3">
                              <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-8 h-8 rounded-full" alt="" />
                              <div>
                                  <p className="font-bold text-sm">{m.name}</p>
                                  {m.id === group.createdBy && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Chủ nhóm</span>}
                              </div>
                          </div>
                          {isOwner && m.id !== user.id && (
                              <div className="flex gap-1">
                                  <button onClick={() => handleTransferOwnership(m.id, m.name)} className="p-1 text-yellow-500 hover:bg-yellow-50 rounded">👑</button>
                                  <button onClick={() => handleKickMember(m.id, m.name)} className="p-1 text-red-500 hover:bg-red-50 rounded">✕</button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* PHẦN 3: LỜI MỜI ĐANG CHỜ (MỚI THÊM) */}
          {pendingInvites.length > 0 && (
              <div className="border-t border-card-border pt-4">
                  <h4 className="font-bold text-xs text-yellow-600 uppercase tracking-wider mb-3 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                      Đang chờ tham gia ({pendingInvites.length})
                  </h4>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                      {isLoadingInvites ? (
                          <p className="text-xs text-muted">Đang tải...</p>
                      ) : (
                          pendingInvites.map((inv: any) => (
                              <div key={inv.id} className="flex items-center justify-between p-2 bg-yellow-50/50 border border-yellow-100 rounded-lg">
                                  <div className="flex items-center space-x-3 opacity-70">
                                      <img src={inv.inviteeAvatar} className="w-8 h-8 rounded-full grayscale" alt="" />
                                      <div>
                                          <p className="font-bold text-sm text-gray-700">{inv.inviteeName}</p>
                                          <p className="text-xs text-muted">{inv.inviteeEmail}</p>
                                      </div>
                                  </div>
                                  {/* Nút hủy lời mời (chỉ hiện cho chủ nhóm hoặc người mời) */}
                                  {(isOwner || inv.inviterId === user.id) && (
                                      <button 
                                          onClick={() => handleCancelInvite(inv.id)}
                                          className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded"
                                      >
                                          Hủy mời
                                      </button>
                                  )}
                              </div>
                          ))
                      )}
                  </div>
              </div>
          )}

          {/* DANGER ZONE (Giữ nguyên) */}
          <div className="pt-4 border-t border-card-border">
              {isOwner ? (
                   <button onClick={handleDeleteGroup} className="w-full py-3 rounded-xl bg-danger/10 text-danger font-bold hover:bg-danger hover:text-white transition-all">Giải tán nhóm</button>
              ) : (
                  <button onClick={handleLeaveGroup} className="w-full py-3 rounded-xl bg-gray-500/10 text-gray-500 font-bold hover:bg-gray-500 hover:text-white transition-all">Rời khỏi nhóm</button>
              )}
          </div>
      </div>
    </Modal>
  );
};

export default GroupSettingsModal;