import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';
import { apiService } from '../../services/apiService'; 
import LockUserModal from '../../components/LockUserModal'; 

const UserManagement: React.FC = () => {
    const { systemUsers, t, fetchSystemUsers, showToast } = useAppContext(); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isLockModalOpen, setLockModalOpen] = useState(false);
    const [userToLock, setUserToLock] = useState<{id: string, name: string} | null>(null);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return systemUsers;
        return systemUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [systemUsers, searchTerm]);

    const handleLockClick = (user: any) => {
        setUserToLock(user);
        setLockModalOpen(true);
    };

    const handleConfirmLock = async (reason: string) => {
        if (!userToLock) return;
        try {
            await apiService.lockUser(userToLock.id, reason);
            showToast(`Đã khóa tài khoản ${userToLock.name}`, "success");
            setLockModalOpen(false);
            if (fetchSystemUsers) fetchSystemUsers();
        } catch (error: any) {
            showToast("Lỗi khóa tài khoản", "error");
        }
    };

    const handleUnlockClick = async (user: any) => {
        if (window.confirm(`Mở khóa cho tài khoản ${user.name}?`)) {
            try {
                await apiService.unlockUser(user.id);
                showToast(`Đã mở khóa ${user.name}`, "success");
                if (fetchSystemUsers) fetchSystemUsers();
            } catch (error: any) {
                showToast("Lỗi mở khóa", "error");
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-2">
                    {t('admin.userManagement.title') || 'Quản lý người dùng'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Quản lý tất cả người dùng trong hệ thống
                </p>
            </div>

            {/* Search and Table Card */}
            <Card className="border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            Danh sách người dùng ({filteredUsers.length})
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('admin.userManagement.searchPlaceholder') || 'Tìm kiếm theo tên hoặc email...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 px-4 py-2.5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-white/15 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/30 dark:to-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.userManagement.table.user') || 'Người dùng'}
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.userManagement.table.status') || 'Trạng thái'}
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.userManagement.table.actions') || 'Hành động'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 relative">
                                                    <img 
                                                        className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800" 
                                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=primary&color=fff`} 
                                                        alt={user.name}
                                                    />
                                                    {user.status === 'active' ? (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800"></div>
                                                    ) : (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-gray-800"></div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                user.status === 'active' 
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
                                                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400'
                                            }`}>
                                                {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleLockClick(user)} 
                                                    className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                >
                                                    Khóa
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnlockClick(user)} 
                                                    className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                >
                                                    Mở khóa
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                                    {t('admin.userManagement.noUsersFound') || 'Không tìm thấy người dùng nào'}
                                                </p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                    Thử tìm kiếm với từ khóa khác
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tổng người dùng</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{systemUsers.length}</p>
                        </div>
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tài khoản hoạt động</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {systemUsers.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tài khoản bị khóa</p>
                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {systemUsers.filter(u => u.status !== 'active').length}
                            </p>
                        </div>
                        <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </div>

            {/* MODAL KHÓA USER */}
            {userToLock && (
                <LockUserModal
                    isOpen={isLockModalOpen}
                    onClose={() => setLockModalOpen(false)}
                    onConfirm={handleConfirmLock}
                    userName={userToLock.name}
                />
            )}
        </div>
    );
};

export default UserManagement;