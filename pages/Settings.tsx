import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';
import { SUPPORTED_CURRENCIES, CURRENCY_RATES } from '../constants';
import ChangePasswordModal from '../components/ChangePasswordModal';
import CategorySettingsCard from '../components/CategorySettingsCard';

// --- ICON COMPONENTS (Đồng nhất với các trang khác) ---
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onToggle: () => void; description?: string }> = ({ label, enabled, onToggle, description }) => (
    <div className="py-3 px-2 hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-xl transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <span className="font-medium text-gray-800 dark:text-gray-100">{label}</span>
                {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 ${enabled ? 'bg-gradient-to-r from-primary to-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full transition-all duration-300 shadow-lg ${enabled ? 'translate-x-7' : 'translate-x-0.5'}`}
                />
            </button>
        </div>
    </div>
);

const themes = [
    { 
        nameKey: 'settings.themes.light', 
        id: 'light', 
        colors: ['#F8FAFC', '#14B8A6', '#F97316', '#10B981'],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    { 
        nameKey: 'settings.themes.dark', 
        id: 'dark', 
        colors: ['#0F172A', '#1E293B', '#2DD4BF', '#FB923C'],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        )
    },
    { 
        nameKey: 'settings.themes.special', 
        id: 'special', 
        colors: ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6', '#EC4899'],
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
        )
    }
] as const;

const ThemeOption: React.FC<{ name: string; colors: readonly string[]; isActive: boolean; onClick: () => void; icon: React.ReactNode }> = ({ name, colors, isActive, onClick, icon }) => (
    <button 
        onClick={onClick} 
        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 group ${isActive ? 'border-primary bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg scale-[1.02]' : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-md'}`}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {icon}
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{name}</span>
            </div>
            {isActive && <CheckCircleIcon className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex gap-1 mt-3 h-3 overflow-hidden rounded-full">
            {colors.map((color, index) => (
                <div 
                    key={index} 
                    className="flex-1 transition-all duration-300 group-hover:scale-y-110"
                    style={{ backgroundColor: color }}
                ></div>
            ))}
        </div>
    </button>
);

const Settings: React.FC = () => {
    const { 
        theme, 
        changeTheme, 
        language, 
        changeLanguage, 
        travelMode, 
        toggleTravelMode, 
        setTravelCurrency,
        user,
        updateProfile,
        logout,
        notificationSettings,
        updateNotificationSettings,
        t 
    } = useAppContext();

    const [displayName, setDisplayName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(user) {
            setDisplayName(user.name);
            setEmail(user.email);
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await updateProfile(displayName, avatarPreview);
        setIsLoading(false);
    };
    
    const commonInputClass = "mt-2 block w-full px-4 py-2.5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-white/15 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-gray-800 dark:text-gray-100";

    return (
        <div className="min-h-[85vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    {t('sidebar.settings') || 'Cài đặt'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    Quản lý tài khoản và tùy chỉnh ứng dụng
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('settings.profile.title') || 'Hồ sơ cá nhân'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Cập nhật thông tin cá nhân của bạn
                            </p>
                        </div>
                        <div className="p-5">
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="flex items-start gap-6">
                                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                                            {avatarPreview ? (
                                                <img className="h-full w-full object-cover" src={avatarPreview} alt="User avatar" />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-2xl font-bold text-white">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <button 
                                            type="button" 
                                            onClick={handleAvatarClick}
                                            className="px-4 py-2 text-sm font-medium text-primary bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl hover:from-primary/20 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300"
                                        >
                                            {t('settings.profile.changeAvatar') || 'Đổi ảnh đại diện'}
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                                            {t('settings.profile.avatarHint') || 'JPG, PNG dưới 2MB. Ảnh vuông hiển thị tốt nhất.'}
                                        </p>
                                        
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('settings.profile.displayName') || 'Tên hiển thị'}
                                    </label>
                                    <input
                                        type="text"
                                        id="display-name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className={commonInputClass}
                                        placeholder="Nhập tên hiển thị của bạn"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('settings.profile.email') || 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        disabled
                                        className={`${commonInputClass} bg-gray-100/50 dark:bg-gray-800/50 cursor-not-allowed text-gray-500 dark:text-gray-400`}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Email không thể thay đổi. Liên hệ hỗ trợ nếu cần cập nhật.
                                    </p>
                                </div>
                                
                                <div className="text-right pt-4 border-t border-gray-200 dark:border-white/10">
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className={`group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center ml-auto ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {t('settings.profile.saving') || 'Đang lưu...'}
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {t('settings.profile.saveButton') || 'Lưu thay đổi'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Card>

                    <CategorySettingsCard />

                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('settings.travelMode.title') || 'Chế độ du lịch'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Quản lý chi tiêu khi đi du lịch
                            </p>
                        </div>
                        <div className="p-5">
                            <ToggleSwitch 
                                label={t('settings.travelMode.enable') || 'Bật chế độ du lịch'}
                                enabled={travelMode.enabled}
                                onToggle={toggleTravelMode}
                                description="Chuyển đổi tiền tệ tự động cho giao dịch"
                            />
                            
                            {travelMode.enabled && (
                                <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 animate-fade-in-up">
                                    <label htmlFor="travel-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.travelMode.currency') || 'Chọn tiền tệ'}
                                    </label>
                                    <select
                                        id="travel-currency"
                                        value={travelMode.currency}
                                        onChange={(e) => setTravelCurrency(e.target.value as any)}
                                        className="mt-1 block w-full px-4 py-2.5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-white/15 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-gray-800 dark:text-gray-100"
                                    >
                                        {SUPPORTED_CURRENCIES.map(c => (
                                            <option key={c} value={c} className="py-2">
                                                {c} (1 {c} ≈ {CURRENCY_RATES[c].toLocaleString('vi-VN')} VND)
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10">
                                        {t('settings.travelMode.description') || 'Tất cả giao dịch sẽ được chuyển đổi sang tiền tệ này và bạn có thể theo dõi chi tiêu dễ dàng hơn.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('settings.notifications.title') || 'Thông báo'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Tùy chỉnh thông báo bạn muốn nhận
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="space-y-1">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    {t('settings.notifications.emailReports') || 'Báo cáo email'}
                                </h4>
                                <ToggleSwitch 
                                    label={t('settings.notifications.weeklySummary') || 'Tóm tắt hàng tuần'}
                                    enabled={notificationSettings.emailWeekly}
                                    onToggle={() => updateNotificationSettings('emailWeekly', !notificationSettings.emailWeekly)}
                                    description="Gửi vào mỗi Chủ Nhật"
                                />
                                <ToggleSwitch 
                                    label={t('settings.notifications.monthlySummary') || 'Tóm tắt hàng tháng'}
                                    enabled={notificationSettings.emailMonthly}
                                    onToggle={() => updateNotificationSettings('emailMonthly', !notificationSettings.emailMonthly)}
                                    description="Gửi vào ngày đầu tháng"
                                />
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-1">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    {t('settings.notifications.pushNotifications') || 'Thông báo đẩy'}
                                </h4>
                                <ToggleSwitch 
                                    label={t('settings.notifications.budgetAlerts') || 'Cảnh báo ngân sách'}
                                    enabled={notificationSettings.pushBudget}
                                    onToggle={() => updateNotificationSettings('pushBudget', !notificationSettings.pushBudget)}
                                    description="Khi vượt ngân sách"
                                />
                                <ToggleSwitch 
                                    label={t('settings.notifications.billReminders') || 'Nhắc hóa đơn'}
                                    enabled={notificationSettings.pushBills}
                                    onToggle={() => updateNotificationSettings('pushBills', !notificationSettings.pushBills)}
                                    description="Trước hạn thanh toán"
                                />
                                <ToggleSwitch 
                                    label={t('settings.notifications.debtReminders') || 'Nhắc khoản vay'}
                                    enabled={notificationSettings.pushDebts}
                                    onToggle={() => updateNotificationSettings('pushDebts', !notificationSettings.pushDebts)}
                                    description="Khi đến hạn trả nợ"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('settings.appearance.title') || 'Giao diện'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Tùy chỉnh giao diện ứng dụng
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 gap-3">
                                {themes.map(tItem => (
                                    <ThemeOption
                                        key={tItem.id}
                                        name={t(tItem.nameKey)}
                                        colors={tItem.colors}
                                        isActive={theme === tItem.id}
                                        onClick={() => changeTheme(tItem.id)}
                                        icon={tItem.icon}
                                    />
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('settings.language.title') || 'Ngôn ngữ'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Chọn ngôn ngữ hiển thị
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="flex bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 p-1.5 rounded-xl border border-gray-300 dark:border-white/15">
                                <button 
                                    onClick={() => changeLanguage('vi')} 
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${language === 'vi' ? 'bg-gradient-to-r from-primary to-primary text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    🇻🇳 Tiếng Việt
                                </button>
                                <button 
                                    onClick={() => changeLanguage('en')} 
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${language === 'en' ? 'bg-gradient-to-r from-primary to-primary text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    🇺🇸 English
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-gray-200 dark:border-white/10">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {t('settings.security.title') || 'Bảo mật'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Quản lý bảo mật tài khoản
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setChangePasswordModalOpen(true)} 
                                    className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:from-gray-100 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-xl border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-all duration-300 flex items-center justify-between group"
                                >
                                    <span className="font-medium text-gray-800 dark:text-gray-100">
                                        {t('settings.security.changePassword') || 'Đổi mật khẩu'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                <ToggleSwitch 
                                    label={t('settings.security.twoFactorAuth') || 'Xác thực 2 bước'}
                                    enabled={is2faEnabled}
                                    onToggle={() => setIs2faEnabled(!is2faEnabled)}
                                    description="Thêm lớp bảo mật cho tài khoản"
                                />
                                
                                <button className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:from-gray-100 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-xl border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-all duration-300 flex items-center justify-between group">
                                    <span className="font-medium text-gray-800 dark:text-gray-100">
                                        {t('settings.security.setPin') || 'Đặt mã PIN'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-2">
                                <button 
                                    onClick={logout} 
                                    className="w-full text-left p-3 bg-gradient-to-r from-rose-50/80 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 hover:from-rose-100 hover:to-rose-50/80 dark:hover:from-rose-800 dark:hover:to-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 flex items-center justify-between group"
                                >
                                    <span className="font-medium text-rose-700 dark:text-rose-400">
                                        {t('settings.security.logout') || 'Đăng xuất'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500 group-hover:text-rose-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                                
                                <button className="w-full text-left p-3 bg-gradient-to-r from-rose-50/50 to-rose-100/30 dark:from-rose-950/10 dark:to-rose-950/5 hover:from-rose-100/50 hover:to-rose-50/30 dark:hover:from-rose-950/20 dark:hover:to-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-950/20 hover:border-rose-200 dark:hover:border-rose-900 transition-all duration-300">
                                    <span className="font-medium text-rose-600 dark:text-rose-500">
                                        {t('settings.security.deleteAccount') || 'Xóa tài khoản'}
                                    </span>
                                    <p className="text-xs text-rose-500/70 dark:text-rose-400/70 mt-1">
                                        Hành động này không thể hoàn tác
                                    </p>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
            />

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phiên bản 1.0.0 • Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </div>
        </div>
    );
};

export default Settings;