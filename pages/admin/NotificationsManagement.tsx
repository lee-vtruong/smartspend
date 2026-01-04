import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';

const NotificationsManagement: React.FC = () => {
    // sendNotification giờ đã gọi API Broadcast trong AppContext
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
    
    // ... (Giữ nguyên phần UI hiển thị form và danh sách)
    const commonInputClass = "mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm";

    return (
        <div>
            <h2 className="text-3xl font-bold text-text mb-6">{t('admin.notifications.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title={t('admin.notifications.composeTitle')}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="notif-title" className="block text-sm font-medium text-muted">{t('admin.notifications.form.titleLabel')}</label>
                            <input id="notif-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} required />
                        </div>
                        <div>
                            <label htmlFor="notif-message" className="block text-sm font-medium text-muted">{t('admin.notifications.form.messageLabel')}</label>
                            <textarea id="notif-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className={commonInputClass} required />
                        </div>
                        <div className="flex justify-end items-center">
                            {isSent && <p className="text-sm text-success mr-4">{t('admin.notifications.form.sendSuccess')}</p>}
                            <button
                                type="submit"
                                disabled={isSending}
                                className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSending ? 'Đang gửi...' : t('admin.notifications.form.sendButton')}
                            </button>
                        </div>
                    </form>
                </Card>
                <Card title={t('admin.notifications.historyTitle')}>
                    {notifications.filter(n => n.type === 'system').length > 0 ? (
                        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {notifications.filter(n => n.type === 'system').slice(0, 20).map(notif => (
                                <li key={notif.id} className="p-3 bg-background rounded-lg border border-card-border">
                                    <p className="font-semibold text-text">{notif.title}</p>
                                    <p className="text-sm text-muted mt-1">{notif.message}</p>
                                    <p className="text-xs text-muted mt-2 text-right">{new Date(notif.date).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted py-8">{t('admin.notifications.historyEmpty')}</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default NotificationsManagement;