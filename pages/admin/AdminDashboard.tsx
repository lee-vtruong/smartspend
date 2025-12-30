import React from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';
import { MOCK_REVENUE_DATA } from '../../contexts/AppContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-muted">{title}</p>
            <p className="text-2xl font-semibold text-text">{value}</p>
        </div>
    </Card>
);

const NavCard: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={onClick}>
        <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
        <p className="text-muted">{description}</p>
        <div className="text-right mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary inline-block">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
        </div>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const { systemUsers, setCurrentPage, t } = useAppContext();
    const totalRevenue = MOCK_REVENUE_DATA.reduce((sum, item) => sum + item.revenue, 0);

    const stats = [
        { title: t('admin.dashboard.totalUsers'), value: systemUsers.length, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { title: t('admin.dashboard.activeAccounts'), value: systemUsers.filter(u => u.status === 'active').length, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { title: t('admin.dashboard.premiumSubscribers'), value: '3', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
        { title: t('admin.dashboard.totalRevenue'), value: `$${totalRevenue.toLocaleString()}`, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0-1v- .01M12 20v-1m0-1V18m0 2.01M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> }
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-text mb-6">{t('admin.dashboard.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

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
        </div>
    );
};

export default AdminDashboard;