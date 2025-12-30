import React from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';
import { MOCK_REVENUE_DATA } from '../../contexts/AppContext';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SystemReports: React.FC = () => {
    const { systemUsers, theme, t } = useAppContext();

    const userStatusData = [
        { name: t('admin.userManagement.statusActive'), value: systemUsers.filter(u => u.status === 'active').length },
        { name: t('admin.userManagement.statusLocked'), value: systemUsers.filter(u => u.status === 'locked').length },
    ];

    const COLORS = ['var(--color-success)', 'var(--color-danger)'];
    const revenueColor = 'var(--color-primary)';

    const handleBackup = () => {
        alert(t('admin.systemReports.backupSuccess'));
    }

    const handleRestore = () => {
        if (confirm("Are you sure you want to restore? This may overwrite current data.")) {
            alert(t('admin.systemReports.restoreSuccess'));
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-text mb-6">{t('admin.systemReports.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <Card title={t('admin.systemReports.systemManagement')}>
                        <div className="space-y-4">
                            <button onClick={handleBackup} className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 rounded-md transition-colors font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                                {t('admin.systemReports.backupButton')}
                            </button>
                             <button onClick={handleRestore} className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 rounded-md transition-colors font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                {t('admin.systemReports.restoreButton')}
                            </button>
                        </div>
                    </Card>
                     <Card title={t('admin.systemReports.userStatusReport')}>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={userStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                        {userStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-accent)'}} />
                                    <Legend wrapperStyle={{ color: 'var(--color-text)' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div>
                    <Card title={t('admin.systemReports.premiumRevenueReport')}>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={MOCK_REVENUE_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)' }} />
                                    <YAxis tick={{ fill: 'var(--color-muted)' }} />
                                    <Tooltip
                                        cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-primary)' }}
                                    />
                                    <Bar dataKey="revenue" name={t('admin.systemReports.revenue')} fill={revenueColor} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SystemReports;