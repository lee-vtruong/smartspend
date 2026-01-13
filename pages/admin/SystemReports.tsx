import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { apiService } from '../../services/apiService';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import UserGrowthChart from '../../components/charts/UserGrowthChart';

interface BackupFile {
    id: string;
    name: string;
    createdAt: string;
    size: string;
    createdBy: string;
}

const SystemReports: React.FC = () => {
    const { systemUsers, adminStats, t, showToast } = useAppContext();

    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const userStatusData = [
        { name: t('admin.userManagement.statusActive'), value: systemUsers.filter(u => u.status === 'active').length },
        { name: t('admin.userManagement.statusLocked'), value: systemUsers.filter(u => u.status === 'locked').length },
    ];
    const COLORS = ['#10B981', '#EF4444'];

    const fetchBackups = async () => {
        setIsLoadingBackups(true);
        try {
            const data = await apiService.getSystemBackups();
            setBackups(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingBackups(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            await apiService.createSystemBackup();
            showToast("Đã tạo bản sao lưu hệ thống thành công", "success");
            await fetchBackups();
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRestoreClick = (backup: BackupFile) => {
        setSelectedBackup(backup);
        setConfirmModalOpen(true);
    };

    const handleConfirmRestore = async () => {
        if (!selectedBackup) return;
        setIsRestoring(true);
        try {
            await apiService.restoreSystem(selectedBackup.id);
            showToast(`Đã khôi phục hệ thống về phiên bản: ${selectedBackup.name}`, "success");
            setConfirmModalOpen(false);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-2">
                    {t('admin.systemReports.title') || 'Báo cáo hệ thống'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Thống kê toàn diện và quản lý sao lưu hệ thống
                </p>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Server Status Card */}
                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                Trạng thái Server
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Kiểm tra tình trạng hệ thống
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/50 dark:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Connection</span>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Connected</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/50 dark:border-white/10">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sao lưu gần nhất</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-100">
                                        {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/50 dark:border-white/10">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tổng số bản Backup</span>
                                    <span className="text-lg font-bold text-primary dark:text-primary-light">{backups.length}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* User Status Chart */}
                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('admin.systemReports.userStatusReport') || 'Trạng thái người dùng'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Phân bố tài khoản theo trạng thái
                            </p>
                        </div>
                        <div className="p-5">
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie 
                                            data={userStatusData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={80} 
                                            fill="#8884d8" 
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {userStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#ffffff',
                                                borderColor: '#e5e7eb',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }} 
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>

                    <UserGrowthChart />
                </div>

                {/* Right Column - Revenue Chart */}
                <div>
                    <Card className="border border-gray-200 dark:border-white/10 h-full">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('admin.systemReports.premiumRevenueReport') || 'Doanh thu Premium'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Thống kê doanh thu theo tháng
                            </p>
                        </div>
                        <div className="p-5">
                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer>
                                    <BarChart 
                                        data={adminStats?.monthlyRevenue || []} 
                                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                    >
                                        <XAxis 
                                            dataKey="month" 
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                        />
                                        <YAxis 
                                            tick={{ fill: '#6b7280', fontSize: 12 }} 
                                            axisLine={{ stroke: '#e5e7eb' }}
                                            tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)}
                                        />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(209, 213, 219, 0.3)'}} 
                                            contentStyle={{ 
                                                backgroundColor: '#ffffff',
                                                borderColor: '#e5e7eb',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                        />
                                        <Bar 
                                            dataKey="revenue" 
                                            name={t('admin.systemReports.revenue') || 'Doanh thu'} 
                                            fill="#3b82f6" 
                                            barSize={40}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                                {(!adminStats?.monthlyRevenue || adminStats.monthlyRevenue.length === 0) && (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có dữ liệu doanh thu</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Backup Management Section */}
            <Card className="border border-gray-200 dark:border-white/10 mb-8">
                <div className="p-5 border-b border-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                Quản lý Sao lưu & Khôi phục
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Danh sách các bản sao lưu hệ thống trên Cloud
                            </p>
                        </div>
                        <button 
                            onClick={handleCreateBackup}
                            disabled={isCreating}
                            className="group px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary/80 rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isCreating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Sao lưu ngay
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/30 dark:to-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Tên File
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Dung lượng
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {isLoadingBackups ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center animate-pulse">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : backups.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m14-4v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có bản sao lưu nào</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                    Tạo bản sao lưu đầu tiên để bảo vệ dữ liệu
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    backups.map((bk) => (
                                        <tr key={bk.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{bk.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Tạo bởi: {bk.createdBy}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                {new Date(bk.createdAt).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full">
                                                    {bk.size}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button 
                                                    onClick={() => handleRestoreClick(bk)}
                                                    className="px-4 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-950/10 rounded-xl hover:from-amber-200 hover:to-amber-100 dark:hover:from-amber-800 dark:hover:to-amber-900 border border-amber-200 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 shadow-sm hover:shadow-md"
                                                >
                                                    Khôi phục
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </div>

            {/* Restore Confirmation Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => !isRestoring && setConfirmModalOpen(false)}
                title="⚠️ Cảnh báo Rủi ro Dữ liệu"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-br from-rose-50/80 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 rounded-xl border border-rose-200 dark:border-rose-800/30">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-rose-800 dark:text-rose-300 text-lg">Hành động này nguy hiểm!</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                    Bạn đang khôi phục hệ thống về phiên bản: 
                                    <span className="font-bold ml-1">{selectedBackup?.name}</span>
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-1">
                                    <li>Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn</li>
                                    <li>Hệ thống sẽ tạm ngừng hoạt động trong quá trình xử lý</li>
                                    <li>Không thể hoàn tác sau khi khôi phục</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            disabled={isRestoring}
                            onClick={() => setConfirmModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 border border-gray-300 dark:border-white/15 hover:border-gray-400 dark:hover:border-white/25 transition-all duration-300 disabled:opacity-50"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            disabled={isRestoring}
                            onClick={handleConfirmRestore}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isRestoring ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : "Xác nhận Khôi phục"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SystemReports;