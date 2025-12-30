import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';

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

const SocialButton: React.FC<{ provider: string; icon: React.ReactNode; onClick: () => void; }> = ({ provider, icon, onClick }) => (
    <button type="button" onClick={onClick} className="flex-1 flex items-center justify-center py-2 border border-card-border rounded-lg hover:bg-background transition-colors">
        {icon}
        <span className="ml-2 text-sm font-medium text-text">{provider}</span>
    </button>
);

const LoginView: React.FC<{ onSwitchToSignup: () => void; onSwitchToForgot: () => void; }> = ({ onSwitchToSignup, onSwitchToForgot }) => {
    const { login, t } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-text">Welcome Back!</h2>
            {error && <p className="text-sm text-center text-danger bg-danger/10 p-2 rounded-lg">{error}</p>}
             <div className="text-sm text-center text-muted p-3 bg-background rounded-lg">
                <p className="font-semibold">Use an example account to log in:</p>
                <p className="mt-1">
                    <span className="font-bold">Admin:</span> <span className="font-mono">an.nguyen@example.com</span>
                </p>
                 <p>
                    <span className="font-bold">User:</span> <span className="font-mono">binh.tran@example.com</span>
                </p>
                <p className="mt-1">
                    <span className="font-bold">Password:</span> <span className="font-mono">password123</span>
                </p>
             </div>


            <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>} />
            <AuthInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
            
            <div className="text-right">
                <button type="button" onClick={onSwitchToForgot} className="text-sm font-medium text-primary hover:underline">Forgot Password?</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus transition-opacity disabled:opacity-50 flex items-center justify-center">
                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-content mr-3"></div>}
                Sign In
            </button>
            
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-card-border"></div>
                <span className="flex-shrink mx-4 text-xs text-muted">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-card-border"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <SocialButton
                    provider="Google"
                    icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.356-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.686 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>}
                    onClick={() => alert('Google login is not implemented yet.')}
                />
                <SocialButton
                    provider="Facebook"
                    icon={<svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>}
                    onClick={() => alert('Facebook login is not implemented yet.')}
                />
            </div>

            <div className="text-center text-sm text-muted">Don't have an account? <button type="button" onClick={onSwitchToSignup} className="font-semibold text-primary hover:underline">Sign Up</button></div>
        </form>
    );
};

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

const SignupView: React.FC<{ onSwitchView: () => void; onSignupSuccess: () => void; }> = ({ onSwitchView, onSignupSuccess }) => {
    const { signup, t } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
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
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            match: password !== '' && password === passwordConfirm,
        });
    }, [password, passwordConfirm]);

    const isFormValid = Object.values(validations).every(Boolean) && name.trim() !== '' && email.trim() !== '';

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setError(t('auth.validation.formError'));
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signup(name, email, password);
            onSignupSuccess();
        } catch(err: any) {
            setError(err.message || 'Signup failed.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
         <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-text">Create Your Account</h2>
            {error && <p className="text-sm text-center text-danger bg-danger/10 p-2 rounded-lg">{error}</p>}
            
            <AuthInput label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            <AuthInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>} />
            <AuthInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
            <AuthInput label={t('auth.validation.passwordConfirmLabel')} type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />

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

            <button type="submit" disabled={isLoading || !isFormValid} className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-content mr-3"></div>}
                Sign Up
            </button>
            
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-card-border"></div>
                <span className="flex-shrink mx-4 text-xs text-muted">OR SIGN UP WITH</span>
                <div className="flex-grow border-t border-card-border"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <SocialButton
                    provider="Google"
                    icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.356-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.686 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>}
                    onClick={() => alert('Google signup is not implemented yet.')}
                />
                <SocialButton
                    provider="Facebook"
                    icon={<svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>}
                    onClick={() => alert('Facebook signup is not implemented yet.')}
                />
            </div>

            <div className="text-center text-sm text-muted">Already have an account? <button type="button" onClick={onSwitchView} className="font-semibold text-primary hover:underline">Sign In</button></div>
        </form>
    );
};

const ForgotPasswordView: React.FC<{ onSwitchView: () => void }> = ({ onSwitchView }) => {
    const { t, handleResetPassword } = useAppContext();
    type ForgotPasswordStep = 'enterEmail' | 'enterOtp' | 'resetPassword' | 'success';

    const [step, setStep] = useState<ForgotPasswordStep>('enterEmail');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [validations, setValidations] = useState({
        length: false, uppercase: false, lowercase: false, number: false, special: false, match: false,
    });

    const validEmails = ['an.nguyen@example.com', 'binh.tran@example.com'];
    const correctOtp = '221205';

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

    const isPasswordFormValid = Object.values(validations).every(Boolean);
    
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (validEmails.includes(email.toLowerCase())) {
            setStep('enterOtp');
        } else {
            setError(t('auth.forgotPassword.emailNotFound'));
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp === correctOtp) {
            setStep('resetPassword');
        } else {
            setError(t('auth.forgotPassword.invalidOtp'));
        }
    };

    const handlePasswordResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordFormValid) {
             setError(t('auth.validation.formError'));
             return;
        }
        setError('');
        setIsLoading(true);
        try {
            await handleResetPassword(email, newPassword);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'enterEmail':
                return (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <h2 className="text-2xl font-bold text-center text-text">{t('auth.forgotPassword.title')}</h2>
                        {error && <p className="text-sm text-center text-danger bg-danger/10 p-2 rounded-lg">{error}</p>}
                        <p className="text-sm text-center text-muted">{t('auth.forgotPassword.enterEmailPrompt')}</p>
                        <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>} />
                        <button type="submit" className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus">{t('auth.forgotPassword.sendCodeButton')}</button>
                        <div className="text-center text-sm"><button type="button" onClick={onSwitchView} className="font-semibold text-primary hover:underline">{t('auth.forgotPassword.backToLoginButton')}</button></div>
                    </form>
                );
            case 'enterOtp':
                return (
                     <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <h2 className="text-2xl font-bold text-center text-text">{t('auth.forgotPassword.enterOtpTitle')}</h2>
                        {error && <p className="text-sm text-center text-danger bg-danger/10 p-2 rounded-lg">{error}</p>}
                        <p className="text-sm text-center text-muted">{t('auth.forgotPassword.enterOtpPrompt', {email: email})}</p>
                        <AuthInput label={t('auth.forgotPassword.otpLabel')} type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                        <button type="submit" className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus">{t('auth.forgotPassword.verifyButton')}</button>
                        <div className="text-center text-sm text-muted">{t('auth.forgotPassword.resendOtp')} <button type="button" onClick={() => alert('OTP Resent!')} className="font-semibold text-primary hover:underline">{t('auth.forgotPassword.resendOtpLink')}</button></div>
                    </form>
                );
            case 'resetPassword':
                 return (
                     <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                        <h2 className="text-2xl font-bold text-center text-text">{t('auth.forgotPassword.resetTitle')}</h2>
                        {error && <p className="text-sm text-center text-danger bg-danger/10 p-2 rounded-lg">{error}</p>}
                        <p className="text-sm text-center text-muted">{t('auth.forgotPassword.resetPrompt')}</p>
                        <AuthInput label="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                        <AuthInput label={t('auth.validation.passwordConfirmLabel')} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                        <div className="p-3 bg-background/50 rounded-lg">
                           <ul className="space-y-1">
                                {Object.entries(validations).map(([key, isValid]) => (
                                    <ValidationCheck key={key} isValid={isValid} text={t(`auth.validation.${key}`)} />
                                ))}
                           </ul>
                        </div>
                        <button type="submit" disabled={isLoading || !isPasswordFormValid} className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-content mr-3"></div>}
                            {t('auth.forgotPassword.resetButton')}
                        </button>
                    </form>
                );
            case 'success':
                 return (
                    <div className="text-center space-y-4 animate-fade-in-up">
                        <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center border-4 border-success/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-text">{t('auth.forgotPassword.successTitle')}</h2>
                        <p className="text-muted">{t('auth.forgotPassword.successMessage')}</p>
                        <button onClick={onSwitchView} className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus transition-opacity">{t('auth.forgotPassword.backToLoginButton')}</button>
                    </div>
                 );
        }
    };

    return renderContent();
};

const SignupSuccessView: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
    const { t } = useAppContext();
    return (
        <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center border-4 border-success/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-success">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-text">{t('auth.signupSuccess.title')}</h2>
            <p className="text-muted">
                {t('auth.signupSuccess.message')}
            </p>
            <button
                onClick={onSwitchToLogin}
                className="w-full py-3 bg-primary text-primary-content rounded-lg font-semibold hover:bg-primary-focus transition-opacity"
            >
                {t('auth.signupSuccess.button')}
            </button>
        </div>
    );
};


const AuthPage: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
    const [signupStatus, setSignupStatus] = useState<'form' | 'success'>('form');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useAppContext();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray: Particle[];
        
        const mouse = {
            x: null as number | null,
            y: null as number | null,
            radius: 100
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };
        window.addEventListener('mousemove', handleMouseMove);
        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };
        window.addEventListener('mouseout', handleMouseOut);

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        const particleColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';

        function hexToRgba(hex: string, alpha: number): string {
            if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                return `rgba(20, 184, 166, ${alpha})`; // Fallback color
            }
            let c: any = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${alpha})`;
        }
        
        class Particle {
            x: number; y: number; directionX: number; directionY: number; size: number; color: string;
            constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
                this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                
                // Mouse collision detection
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius + this.size) {
                        // Push particle away from mouse
                        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                            this.x += 2;
                        }
                        if (mouse.x > this.x && this.x > this.size * 10) {
                            this.x -= 2;
                        }
                        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                            this.y += 2;
                        }
                        if (mouse.y > this.y && this.y > this.size * 10) {
                            this.y -= 2;
                        }
                    }
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            const numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 1;
                const x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
                const y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
                const directionX = (Math.random() * .4) - .2;
                const directionY = (Math.random() * .4) - .2;
                particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
            }
        }

        function connect() {
            const connectDistance = (canvas.width / 7);
            const connectDistanceSquared = connectDistance * connectDistance;

            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    const distanceSquared = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    if (distanceSquared < connectDistanceSquared) {
                        const opacityValue = 1 - (distanceSquared / connectDistanceSquared);
                        ctx.strokeStyle = hexToRgba(primaryColor, opacityValue);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        }

        window.addEventListener('resize', handleResize);
        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);


    const renderView = () => {
        switch (view) {
            case 'signup':
                if (signupStatus === 'success') {
                    return <SignupSuccessView onSwitchToLogin={() => {
                        setView('login');
                        setSignupStatus('form');
                    }} />;
                }
                return <SignupView 
                    onSwitchView={() => setView('login')} 
                    onSignupSuccess={() => setSignupStatus('success')}
                />;
            case 'forgot':
                return <ForgotPasswordView onSwitchView={() => setView('login')} />;
            case 'login':
            default:
                return <LoginView onSwitchToSignup={() => setView('signup')} onSwitchToForgot={() => setView('forgot')} />;
        }
    };

    return (
        <>
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />
            <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-gradient-to-br from-gradient-from to-gradient-to rounded-full p-2 shadow-lg">
                        <svg className="w-8 h-8 text-primary-content" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 0-6 0H5.25A2.25 2.25 0 0 0 3 9m18 3h-5.25m-6.75 0H3" />
                        </svg>
                        </div>
                        <h1 className="text-3xl font-bold ml-3 text-text">SmartSpend</h1>
                    </div>

                    <div className="bg-card/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
                    {renderView()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;