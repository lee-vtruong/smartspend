import React from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext'; 
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SystemReports: React.FC = () => {
    const { systemUsers, adminStats, t } = useAppContext();

    // Dữ liệu thật: Đếm số lượng active và locked từ danh sách user tải về
    const userStatusData = [
        { name: t('admin.userManagement.statusActive'), value: systemUsers.filter(u => u.status === 'active').length },
        { name: t('admin.userManagement.statusLocked'), value: systemUsers.filter(u => u.status === 'locked').length },
    ];

    const COLORS = ['var(--color-success)', 'var(--color-danger)'];
    const revenueColor = 'var(--color-primary)';

    const handleBackup = () => alert(t('admin.systemReports.backupSuccess'));
    const handleRestore = () => {
        if (confirm("Are you sure?")) alert(t('admin.systemReports.restoreSuccess'));
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-text mb-6">{t('admin.systemReports.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card title={t('admin.systemReports.systemManagement')}>
                        <div className="space-y-4">
                            <button onClick={handleBackup} className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 rounded-md font-medium flex items-center">
                                {/* SVG Icon */} 📥 {t('admin.systemReports.backupButton')}
                            </button>
                             <button onClick={handleRestore} className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 rounded-md font-medium flex items-center">
                                {/* SVG Icon */} 📤 {t('admin.systemReports.restoreButton')}
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

                <div>
                    <Card title={t('admin.systemReports.premiumRevenueReport')}>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart 
                                    data={adminStats?.monthlyRevenue || []} 
                                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                >
                                    <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)' }} />
                                    <YAxis 
                                        tick={{ fill: 'var(--color-muted)' }} 
                                        tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} 
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-primary)' }}
                                        formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                    />
                                    <Bar 
                                        dataKey="revenue" 
                                        name={t('admin.systemReports.revenue')} 
                                        fill="var(--color-primary)" 
                                        barSize={40}  // <--- Thêm dòng này: Cố định độ rộng cột là 40px cho đẹp
                                        radius={[4, 4, 0, 0]} // (Tùy chọn) Bo tròn đầu cột cho mềm mại
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            
                            {(!adminStats?.monthlyRevenue || adminStats.monthlyRevenue.length === 0) && (
                                <p className="text-center text-muted mt-4">Chưa có dữ liệu giao dịch nào.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SystemReports;