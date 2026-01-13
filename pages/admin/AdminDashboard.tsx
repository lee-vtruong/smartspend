import React from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';

// --- ICON COMPONENTS (Đồng nhất với các trang khác) ---
const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TransactionsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const RevenueIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0-1v- .01M12 20v-1m0-1V18m0 2.01M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="p-5 border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
            </div>
        </div>
    </Card>
);

const NavCard: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <Card 
        className="border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group" 
        onClick={onClick}
    >
        <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-primary dark:text-primary-light">{title}</h3>
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                <ArrowRightIcon className="h-5 w-5 text-primary dark:text-primary-light group-hover:translate-x-1 transition-transform duration-300" />
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{description}</p>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-300">
            Xem chi tiết
        </div>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const { adminStats, setCurrentPage, t } = useAppContext();

    const stats = [
        { 
            title: t('admin.dashboard.totalUsers'), 
            value: adminStats?.totalUsers || 0, 
            icon: <UsersIcon className="h-6 w-6 text-primary dark:text-primary-light" />
        },
        { 
            title: t('admin.dashboard.activeAccounts'), 
            value: adminStats?.activeUsers || 0, 
            icon: <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        },
        { 
            title: "Tổng giao dịch",
            value: adminStats?.totalTransactions || 0, 
            icon: <TransactionsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        },
        { 
            title: t('admin.dashboard.totalRevenue'), 
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(adminStats?.revenue || 0), 
            icon: <RevenueIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        }
    ];

    return (
        <div className="min-h-[80vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-2">
                    {t('admin.dashboard.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Quản lý toàn bộ hệ thống và người dùng
                </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NavCard 
                    title={t('admin.dashboard.userManagementCardTitle')}
                    description={t('admin.dashboard.userManagementCardDesc')}
                    onClick={() => setCurrentPage('userManagement')}
                />
                <NavCard 
                    title={t('admin.dashboard.systemReportsCardTitle')}
                    description={t('admin.dashboard.systemReportsCardDesc')}
                    onClick={() => setCurrentPage('systemReports')}
                />
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bảng điều khiển cập nhật: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;