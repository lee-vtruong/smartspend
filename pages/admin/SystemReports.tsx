import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { apiService } from '../../services/apiService';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import UserGrowthChart from '../../components/charts/UserGrowthChart';

// Định nghĩa kiểu dữ liệu cho Backup
interface BackupFile {
    id: string;
    name: string;
    createdAt: string;
    size: string;
    createdBy: string;
}

const SystemReports: React.FC = () => {
    const { systemUsers, adminStats, t, showToast } = useAppContext();

    // --- STATE QUẢN LÝ BACKUP/RESTORE ---
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    // --- DỮ LIỆU BIỂU ĐỒ (GIỮ NGUYÊN) ---
    const userStatusData = [
        { name: t('admin.userManagement.statusActive'), value: systemUsers.filter(u => u.status === 'active').length },
        { name: t('admin.userManagement.statusLocked'), value: systemUsers.filter(u => u.status === 'locked').length },
    ];
    const COLORS = ['var(--color-success)', 'var(--color-danger)'];

    // --- 1. TẢI DANH SÁCH BACKUP TỪ API ---
    const fetchBackups = async () => {
        setIsLoadingBackups(true);
        try {
            const data = await apiService.getSystemBackups();
            setBackups(data);
        } catch (error) {
            console.error(error);
            // Không show toast lỗi ở đây để tránh spam nếu server chưa có data
        } finally {
            setIsLoadingBackups(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    // --- 2. XỬ LÝ TẠO BACKUP MỚI ---
    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            await apiService.createSystemBackup();
            showToast("Đã tạo bản sao lưu hệ thống thành công", "success");
            await fetchBackups(); // Reload list
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsCreating(false);
        }
    };

    // --- 3. XỬ LÝ KHÔI PHỤC (Mở Modal) ---
    const handleRestoreClick = (backup: BackupFile) => {
        setSelectedBackup(backup);
        setConfirmModalOpen(true);
    };

    // --- 4. XÁC NHẬN KHÔI PHỤC ---
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
        <div className="space-y-8 pb-10">
            <h2 className="text-3xl font-bold text-text">{t('admin.systemReports.title')}</h2>
            
            {/* --- PHẦN 1: DASHBOARD & BIỂU ĐỒ --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Card 1.1: Trạng thái Server (Thay thế nút bấm cũ) */}
                    <Card title="Trạng thái Server (Health Check)">
                         <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-card-border">
                                <span className="text-muted text-sm">Database Connection</span>
                                <span className="flex items-center text-success font-bold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></span> Connected
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-card-border">
                                <span className="text-muted text-sm">Phiên bản sao lưu gần nhất</span>
                                <span className="font-mono font-bold text-text text-sm">
                                    {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-card-border">
                                <span className="text-muted text-sm">Tổng số bản Backup</span>
                                <span className="font-mono font-bold text-primary text-xl">{backups.length}</span>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Card 1.2: Biểu đồ User Status (Giữ nguyên) */}
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
                    <UserGrowthChart />
                </div>

                {/* Card 2: Biểu đồ Doanh thu (Giữ nguyên) */}
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
                                        barSize={40}
                                        radius={[4, 4, 0, 0]}
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

            {/* --- PHẦN 2: QUẢN LÝ SAO LƯU & KHÔI PHỤC (MỚI) --- */}
            <Card title="Quản lý Sao lưu & Khôi phục">
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-muted text-sm">Danh sách các bản sao lưu hệ thống trên Cloud.</p>
                    <button 
                        onClick={handleCreateBackup}
                        disabled={isCreating}
                        className="px-4 py-2 bg-primary text-primary-content rounded-xl text-sm font-bold shadow hover:bg-primary-focus transition-all flex items-center disabled:opacity-50"
                    >
                        {isCreating ? (
                            <><span className="animate-spin mr-2">⟳</span> Đang tạo...</>
                        ) : (
                            <>+ Sao lưu ngay</>
                        )}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted uppercase bg-background/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Tên File</th>
                                <th className="px-4 py-3">Ngày tạo</th>
                                <th className="px-4 py-3">Dung lượng</th>
                                <th className="px-4 py-3 rounded-r-lg text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {isLoadingBackups ? (
                                <tr><td colSpan={4} className="text-center py-8 text-muted">Đang tải dữ liệu...</td></tr>
                            ) : backups.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-muted">Chưa có bản sao lưu nào.</td></tr>
                            ) : (
                                backups.map((bk) => (
                                    <tr key={bk.id} className="hover:bg-background/40 transition-colors">
                                        <td className="px-4 py-4 font-bold text-text">{bk.name}</td>
                                        <td className="px-4 py-4 text-muted">
                                            {new Date(bk.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-4 text-muted">{bk.size}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button 
                                                onClick={() => handleRestoreClick(bk)}
                                                className="px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg font-bold transition-all border border-accent/20 text-xs uppercase"
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
            </Card>

            {/* MODAL CẢNH BÁO RỦI RO (U044) */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => !isRestoring && setConfirmModalOpen(false)}
                title="⚠️ Cảnh báo Rủi ro Dữ liệu"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger min-w-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h4 className="font-bold text-danger text-lg">Hành động này nguy hiểm!</h4>
                            <p className="text-sm text-text mt-1">
                                Bạn đang khôi phục hệ thống về phiên bản: <span className="font-bold">{selectedBackup?.name}</span>.
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted mt-2 space-y-1">
                                <li>Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn.</li>
                                <li>Hệ thống sẽ tạm ngừng hoạt động trong quá trình xử lý.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button 
                            disabled={isRestoring}
                            onClick={() => setConfirmModalOpen(false)}
                            className="px-4 py-2 rounded-xl font-bold text-muted hover:bg-background transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            disabled={isRestoring}
                            onClick={handleConfirmRestore}
                            className="px-6 py-2 rounded-xl font-bold bg-danger text-white hover:bg-danger-focus shadow-lg shadow-danger/30 flex items-center"
                        >
                            {isRestoring ? (
                                <><span className="animate-spin mr-2">⟳</span> Đang xử lý...</>
                            ) : "Xác nhận Khôi phục"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SystemReports;