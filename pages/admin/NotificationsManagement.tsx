import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';

const NotificationsManagement: React.FC = () => {
    const { sendNotification, notifications, t } = useAppContext();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            alert(t('admin.notifications.validationError'));
            return;
        }
        
        setIsSending(true);
        try {
            await sendNotification(title, message);
            setTitle('');
            setMessage('');
            setIsSent(true);
            setTimeout(() => setIsSent(false), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };
    
    const commonInputClass = "mt-2 block w-full px-4 py-2.5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-white/15 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400";

    return (
        <div className="min-h-[80vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-2">
                    {t('admin.notifications.title') || 'Quản lý Thông báo'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Gửi thông báo hệ thống đến tất cả người dùng
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compose Notification Card */}
                <Card className="border border-gray-200 dark:border-white/10">
                    <div className="p-5 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    {t('admin.notifications.composeTitle') || 'Tạo thông báo mới'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Thông báo sẽ được gửi đến tất cả người dùng
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="notif-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.notifications.form.titleLabel') || 'Tiêu đề'}
                                </label>
                                <input 
                                    id="notif-title" 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    className={commonInputClass}
                                    placeholder="Nhập tiêu đề thông báo"
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="notif-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.notifications.form.messageLabel') || 'Nội dung'}
                                </label>
                                <textarea 
                                    id="notif-message" 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    rows={4} 
                                    className={commonInputClass}
                                    placeholder="Nhập nội dung thông báo chi tiết"
                                    required 
                                />
                            </div>
                            <div className="flex justify-end items-center pt-4 border-t border-gray-200 dark:border-white/10">
                                {isSent && (
                                    <div className="mr-4 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t('admin.notifications.form.sendSuccess') || 'Đã gửi thành công!'}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSending ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            {t('admin.notifications.form.sendButton') || 'Gửi thông báo'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Notification History Card */}
                <Card className="border border-gray-200 dark:border-white/10">
                    <div className="p-5 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    {t('admin.notifications.historyTitle') || 'Lịch sử thông báo'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {notifications.filter(n => n.type === 'system').length} thông báo đã gửi
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        {notifications.filter(n => n.type === 'system').length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {notifications.filter(n => n.type === 'system').slice(0, 20).map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/50 dark:border-white/10 hover:border-primary/30 transition-all duration-300 group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                                                {notif.title}
                                            </h4>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
                                                {new Date(notif.date).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(notif.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                Hệ thống
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m14-4v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    {t('admin.notifications.historyEmpty') || 'Chưa có thông báo nào'}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Thông báo đầu tiên sẽ xuất hiện ở đây
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tổng thông báo</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {notifications.filter(n => n.type === 'system').length}
                            </p>
                        </div>
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Thông báo hôm nay</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {notifications.filter(n => n.type === 'system' && 
                                    new Date(n.date).toDateString() === new Date().toDateString()).length}
                            </p>
                        </div>
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Trạng thái</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {notifications.length > 0 ? 'Hoạt động' : 'Sẵn sàng'}
                            </p>
                        </div>
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        </div>
    );
};

export default NotificationsManagement;