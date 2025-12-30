import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';

// Re-using these components from AuthPage for consistency
const AuthInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode }> = ({ label, icon, ...props }) => (
    <div>
        <label className="text-sm font-medium text-muted">{label}</label>
        <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                {icon}
            </span>
            <input
                {...props}
                className="w-full pl-10 pr-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-1 focus:border-primary"
            />
        </div>
    </div>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ValidationCheck: React.FC<{ isValid: boolean; text: string; }> = ({ isValid, text }) => (
    <li className={`flex items-center text-sm transition-colors duration-300 ${isValid ? 'text-success' : 'text-muted'}`}>
        <CheckCircleIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${isValid ? 'text-success' : 'text-muted'}`} />
        <span>{text}</span>
    </li>
);


interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { handleChangePassword, t } = useAppContext();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false,
    });

    useEffect(() => {
        setValidations({
            length: newPassword.length >= 8,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
            match: newPassword !== '' && newPassword === confirmPassword,
        });
    }, [newPassword, confirmPassword]);

    const isFormValid = Object.values(validations).every(Boolean) && oldPassword.trim() !== '';

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal is closed
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setError(t('auth.validation.formError'));
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await handleChangePassword(oldPassword, newPassword);
            setSuccess(t('changePassword.success'));
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || t('changePassword.error.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('changePassword.title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-center text-danger bg-danger/10 p-2 rounded-lg">{error}</p>}
                {success && <p className="text-sm text-center text-success bg-success/10 p-2 rounded-lg">{success}</p>}

                <AuthInput label={t('changePassword.oldPasswordLabel')} type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                <AuthInput label={t('changePassword.newPasswordLabel')} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                <AuthInput label={t('auth.validation.passwordConfirmLabel')} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />

                <div className="p-3 bg-background/50 rounded-lg">
                    <ul className="space-y-1">
                        <ValidationCheck isValid={validations.length} text={t('auth.validation.length')} />
                        <ValidationCheck isValid={validations.lowercase} text={t('auth.validation.lowercase')} />
                        <ValidationCheck isValid={validations.uppercase} text={t('auth.validation.uppercase')} />
                        <ValidationCheck isValid={validations.number} text={t('auth.validation.number')} />
                        <ValidationCheck isValid={validations.special} text={t('auth.validation.special')} />
                        <ValidationCheck isValid={validations.match} text={t('auth.validation.match')} />
                    </ul>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-text bg-background hover:bg-gray-200 dark:hover:bg-gray-700">{t('common.cancel')}</button>
                    <button type="submit" disabled={isLoading || !isFormValid} className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-content mr-3"></div>}
                        {t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
