import React, { useState } from 'react';
import Modal from './Modal'; // Sử dụng lại Modal gốc của bạn

interface LockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    userName: string;
}

const LockUserModal: React.FC<LockUserModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert("Vui lòng nhập lý do khóa!");
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Khóa tài khoản người dùng">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                    ⚠️ Bạn đang thực hiện khóa tài khoản của <strong>{userName}</strong>.
                </div>

                <div>
                    <label className="block text-sm font-bold text-text mb-1">
                        Lý do khóa <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="w-full p-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                        placeholder="VD: Spam, Lừa đảo, Vi phạm chính sách..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl font-bold text-muted hover:bg-gray-100 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-danger text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                    >
                        Xác nhận Khóa
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LockUserModal;