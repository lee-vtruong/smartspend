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

  // State chỉnh sửa thông tin (TC098)
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
      if (isOpen && group) {
          setName(group.name);
          setNote(group.note || '');
          setIsEditing(false);
      }
  }, [isOpen, group]);

  // Cập nhật thông tin nhóm
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

  // Chuyển quyền trưởng nhóm (TC102)
  const handleTransferOwnership = async (memberId: string, memberName: string) => {
      if (window.confirm(`⚠️ QUAN TRỌNG: Bạn có chắc muốn chuyển quyền Trưởng nhóm cho "${memberName}"? Bạn sẽ mất quyền quản trị cao nhất.`)) {
          try {
              await apiService.transferGroupOwnership(group.id, memberId);
              showToast("Đã chuyển quyền thành công", "success");
              onSuccess();
              onClose();
          } catch (e: any) {
              showToast(e.message, "error");
          }
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

  const handleKickMember = async (memberId: string, memberName: string) => {
      if (window.confirm(`Mời "${memberName}" ra khỏi nhóm?`)) {
          try {
              await apiService.removeMemberFromGroup(group.id, memberId);
              showToast(`Đã xóa ${memberName} khỏi nhóm.`, "success");
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
          {/* PHẦN 1: THÔNG TIN CHUNG (TC098) */}
          <div className="p-4 bg-background/50 rounded-xl border border-card-border relative">
              {isEditing ? (
                  <div className="space-y-3 animate-fade-in">
                      <div>
                          <label className="text-xs font-bold text-muted uppercase">Tên nhóm</label>
                          <input 
                              value={name} 
                              onChange={(e) => setName(e.target.value)} 
                              className="w-full p-2 mt-1 rounded-lg border border-card-border bg-card font-bold focus:ring-2 focus:ring-primary" 
                              autoFocus
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-muted uppercase">Ghi chú / Nội quy</label>
                          <textarea 
                              value={note} 
                              onChange={(e) => setNote(e.target.value)} 
                              className="w-full p-2 mt-1 rounded-lg border border-card-border bg-card text-sm h-20 resize-none focus:ring-2 focus:ring-primary" 
                              placeholder="Nhập ghi chú cho nhóm..."
                          />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                          <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm font-bold text-muted hover:bg-gray-100 rounded-lg">Hủy</button>
                          <button onClick={handleUpdateInfo} className="px-4 py-1 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-focus">Lưu thay đổi</button>
                      </div>
                  </div>
              ) : (
                  <div className="text-center group">
                      <h3 className="font-extrabold text-2xl text-primary">{group.name}</h3>
                      <p className="text-sm text-muted mt-2 italic px-4">{group.note || "Chưa có ghi chú nào."}</p>
                      <p className="text-xs text-muted mt-3 font-mono opacity-50">ID: {group.id}</p>
                      
                      {isOwner && (
                          <button 
                              onClick={() => setIsEditing(true)} 
                              className="absolute top-2 right-2 p-2 text-muted hover:text-primary bg-transparent hover:bg-primary/10 rounded-full transition-all"
                              title="Chỉnh sửa thông tin"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                          </button>
                      )}
                  </div>
              )}
          </div>

          {/* PHẦN 2: THÀNH VIÊN (TC102) */}
          <div>
              <h4 className="font-bold text-xs text-muted uppercase tracking-wider mb-3">Thành viên ({group.members.length})</h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                  {group.members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-card-border hover:border-primary/30 transition-colors">
                          <div className="flex items-center space-x-3">
                              <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-10 h-10 rounded-full bg-gray-200" alt={m.name} />
                              <div>
                                  <p className="font-bold text-sm text-text">{m.name} {m.id === user.id && <span className="text-muted font-normal">(Bạn)</span>}</p>
                                  {m.id === group.createdBy ? (
                                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold border border-yellow-200">👑 Chủ nhóm</span>
                                  ) : (
                                      <span className="text-[10px] text-muted">Thành viên</span>
                                  )}
                              </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                              {/* Nút Chuyển quyền (Chỉ hiện cho Owner) */}
                              {isOwner && m.id !== user.id && (
                                  <button 
                                    onClick={() => handleTransferOwnership(m.id, m.name)}
                                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors" 
                                    title="Chuyển quyền Trưởng nhóm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 00-.556.834c-.083 1.03-.232 1.681-.486 2.149-.6.46-2.182.531-3.291.536-1.11 0-2.693-.075-3.291-.535-.254-.469-.403-1.12-.486-2.15a1 1 0 00-.556-.835A3.989 3.989 0 011 15a3.989 3.989 0 011.666-3.332L4.405 6.25l-1.233-.616a1 1 0 01.894-1.79l1.599.8L9.617 3.076V2a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                  </button>
                              )}

                              {/* Nút Xóa thành viên */}
                              {isOwner && m.id !== user.id && (
                                  <button 
                                    onClick={() => handleKickMember(m.id, m.name)}
                                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors" 
                                    title="Mời ra khỏi nhóm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                  </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* DANGER ZONE */}
          <div className="pt-4 border-t border-card-border space-y-3">
              {isOwner ? (
                   <button 
                      onClick={handleDeleteGroup}
                      className="w-full py-3 rounded-xl bg-danger/10 text-danger font-bold hover:bg-danger hover:text-white transition-all border border-danger/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      Giải tán nhóm
                   </button>
              ) : (
                  <button 
                      onClick={handleLeaveGroup}
                      className="w-full py-3 rounded-xl bg-gray-500/10 text-gray-500 font-bold hover:bg-gray-500 hover:text-white transition-all border border-gray-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                      Rời khỏi nhóm
                  </button>
              )}
          </div>
      </div>
    </Modal>
  );
};

export default GroupSettingsModal;