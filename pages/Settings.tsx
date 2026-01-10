import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';
import { SUPPORTED_CURRENCIES, CURRENCY_RATES } from '../constants';
import ChangePasswordModal from '../components/ChangePasswordModal';
import CategorySettingsCard from '../components/CategorySettingsCard';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-text">{label}</span>
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

const themes = [
    { nameKey: 'settings.themes.light', id: 'light', colors: ['#F8FAFC', '#14B8A6', '#F97316', '#10B981'] },
    { nameKey: 'settings.themes.dark', id: 'dark', colors: ['#0F172A', '#1E293B', '#2DD4BF', '#FB923C'] },
    { nameKey: 'settings.themes.special', id: 'special', colors: ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6', '#EC4899'] }
] as const;

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ThemeOption: React.FC<{ name: string; colors: readonly string[]; isActive: boolean; onClick: () => void; }> = ({ name, colors, isActive, onClick }) => (
    <button onClick={onClick} className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isActive ? 'border-primary shadow-md scale-105' : 'border-card-border hover:border-primary/50'}`}>
        <div className="flex items-center justify-between">
            <span className="font-semibold text-text">{name}</span>
            {isActive && <CheckCircleIcon className="w-6 h-6 text-primary" />}
        </div>
        <div className="flex space-x-1 mt-3 h-5 overflow-hidden rounded">
            {colors.map((color, index) => (
                <div key={index} className="flex-1" style={{ backgroundColor: color }}></div>
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
        updateProfile, // This is the updated function from context
        logout,
        notificationSettings,
        updateNotificationSettings,
        t 
    } = useAppContext();

    const [displayName, setDisplayName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || ''); // State for avatar preview
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(user) {
            setDisplayName(user.name);
            setEmail(user.email);
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);

    // Handle file selection
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

    // Trigger file input click
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Call updateProfile with both name and avatar (base64)
        await updateProfile(displayName, avatarPreview);
        setIsLoading(false);
    };
    
    const commonInputClass = "mt-1 block w-full px-3 py-2 bg-background border border-card-border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm";

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-text">{t('sidebar.settings')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title={t('settings.profile.title')}>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                    {/* Avatar Display */}
                                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-card-border">
                                        {avatarPreview ? (
                                            <img className="h-full w-full object-cover" src={avatarPreview} alt="User avatar" />
                                        ) : (
                                            <div className="h-full w-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <button 
                                        type="button" 
                                        onClick={handleAvatarClick}
                                        className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                                    >
                                        {t('settings.profile.changeAvatar')}
                                    </button>
                                    <p className="text-xs text-muted mt-2">{t('settings.profile.avatarHint')}</p>
                                    
                                    {/* Hidden File Input */}
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
                                <label htmlFor="display-name" className="block text-sm font-medium text-muted">{t('settings.profile.displayName')}</label>
                                <input
                                    type="text"
                                    id="display-name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className={commonInputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-muted">{t('settings.profile.email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    disabled // Make email read-only
                                    className={`${commonInputClass} bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-muted`}
                                />
                            </div>
                            <div className="text-right">
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`bg-primary text-primary-content px-6 py-2 rounded-md hover:bg-primary-focus transition-all flex items-center ml-auto ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isLoading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {t('settings.profile.saveButton')}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <CategorySettingsCard />

                    <Card title={t('settings.travelMode.title')}>
                        <ToggleSwitch 
                            label={t('settings.travelMode.enable')}
                            enabled={travelMode.enabled}
                            onToggle={toggleTravelMode}
                        />
                         {travelMode.enabled && (
                            <div className="mt-4 pt-4 border-t border-card-border">
                                <label htmlFor="travel-currency" className="block text-sm font-medium text-muted">{t('settings.travelMode.currency')}</label>
                                <select
                                    id="travel-currency"
                                    value={travelMode.currency}
                                    onChange={(e) => setTravelCurrency(e.target.value as any)}
                                    className={`${commonInputClass} pl-3 pr-10 py-2 text-base`}
                                >
                                    {SUPPORTED_CURRENCIES.map(c => (
                                        <option key={c} value={c}>{c} (1 {c} ≈ {CURRENCY_RATES[c].toLocaleString('vi-VN')} VND)</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted mt-2">{t('settings.travelMode.description')}</p>
                            </div>
                         )}
                    </Card>
                    
                    <Card title={t('settings.notifications.title')}>
                         <div className="divide-y divide-card-border">
                            <div className="py-2">
                                <h4 className="font-semibold text-text mb-1">{t('settings.notifications.emailReports')}</h4>
                                <ToggleSwitch 
                                    label={t('settings.notifications.weeklySummary')}
                                    enabled={notificationSettings.emailWeekly}
                                    onToggle={() => updateNotificationSettings('emailWeekly', !notificationSettings.emailWeekly)}
                                />
                                <ToggleSwitch 
                                    label={t('settings.notifications.monthlySummary')}
                                    enabled={notificationSettings.emailMonthly}
                                    onToggle={() => updateNotificationSettings('emailMonthly', !notificationSettings.emailMonthly)}
                                />
                            </div>
                            <div className="py-2">
                                <h4 className="font-semibold text-text mt-2 mb-1">{t('settings.notifications.pushNotifications')}</h4>
                                <ToggleSwitch 
                                    label={t('settings.notifications.budgetAlerts')}
                                    enabled={notificationSettings.pushBudget}
                                    onToggle={() => updateNotificationSettings('pushBudget', !notificationSettings.pushBudget)}
                                />
                                <ToggleSwitch 
                                    label={t('settings.notifications.billReminders')}
                                    enabled={notificationSettings.pushBills}
                                    onToggle={() => updateNotificationSettings('pushBills', !notificationSettings.pushBills)}
                                />
                                <ToggleSwitch 
                                    label={t('settings.notifications.debtReminders')}
                                    enabled={notificationSettings.pushDebts}
                                    onToggle={() => updateNotificationSettings('pushDebts', !notificationSettings.pushDebts)}
                                />
                            </div>
                         </div>
                    </Card>

                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <Card title={t('settings.appearance.title')}>
                        <p className="text-muted text-sm mb-3">{t('settings.appearance.description')}</p>
                        <div className="grid grid-cols-1 gap-4">
                            {themes.map(tItem => (
                                <ThemeOption
                                    key={tItem.id}
                                    name={t(tItem.nameKey)}
                                    colors={tItem.colors}
                                    isActive={theme === tItem.id}
                                    onClick={() => changeTheme(tItem.id)}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card title={t('settings.language.title')}>
                        <div className="flex space-x-2">
                           <button onClick={() => changeLanguage('vi')} className={`flex-1 py-2 rounded-md font-semibold ${language === 'vi' ? 'bg-primary text-primary-content' : 'bg-background hover:bg-primary/10'}`}>Tiếng Việt</button>
                           <button onClick={() => changeLanguage('en')} className={`flex-1 py-2 rounded-md font-semibold ${language === 'en' ? 'bg-primary text-primary-content' : 'bg-background hover:bg-primary/10'}`}>English</button>
                        </div>
                    </Card>

                    <Card title={t('settings.security.title')}>
                        <div className="space-y-4">
                            <button onClick={() => setChangePasswordModalOpen(true)} className="w-full text-left px-4 py-3 bg-background hover:bg-primary/10 rounded-md transition-colors">
                                {t('settings.security.changePassword')}
                            </button>
                            <ToggleSwitch 
                                label={t('settings.security.twoFactorAuth')}
                                enabled={is2faEnabled}
                                onToggle={() => setIs2faEnabled(!is2faEnabled)}
                            />
                             <button className="w-full text-left px-4 py-3 bg-background hover:bg-primary/10 rounded-md transition-colors">
                                {t('settings.security.setPin')}
                            </button>
                            <div className="border-t border-card-border pt-4">
                                <button onClick={logout} className="w-full text-left px-4 py-3 bg-danger/10 text-danger hover:bg-danger/20 rounded-md transition-colors font-medium">
                                    {t('settings.security.logout')}
                                </button>
                            </div>
                             <div className="border-t border-card-border pt-4">
                                <button className="w-full text-left px-4 py-3 bg-danger/10 text-danger hover:bg-danger/20 rounded-md transition-colors font-medium">
                                    {t('settings.security.deleteAccount')}
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
        </div>
    );
};

export default Settings;