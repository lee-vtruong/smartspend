import React from 'react';
import { CurrencyCode, TransactionCategory } from './types';

// --- ICONS ---

export const CashIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
);

export const BankIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0l-3.75 3.75M12 3l3.75 3.75M3 21h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21V3m0 0L0 6.75M3.75 3L7.5 6.75M20.25 3v18m0 0l3.75-3.75m-3.75 3.75L16.5 17.25M3.75 6.75h16.5" />
  </svg>
);

export const EWalletIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

export const FoodIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.75a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0ZM8.25 8.25h.01M12 8.25h.01M15.75 8.25h.01M8.25 12h.01M12 12h.01M15.75 12h.01M8.25 15.75h.01M12 15.75h.01M15.75 15.75h.01Z" />
    </svg>
);

export const TransportIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

export const ShoppingIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
    </svg>
);

export const SalaryIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const BillIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
    </svg>
);

export const EntertainmentIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
    </svg>
);

export const TransferIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);

export const CoffeeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3.25a2.75 2.75 0 00-2.75-2.75h-1.5A2.75 2.75 0 006 3.25V10m7 0v8.25a2.75 2.75 0 01-2.75 2.75h-1.5A2.75 2.75 0 016 18.25V10m7 0h3.25a2.75 2.75 0 012.75 2.75v3.5A2.75 2.75 0 0116.25 19H13" />
    </svg>
);

export const LaptopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-1.621A3 3 0 0 1 14.1 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
);

export const AirplaneIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

export const EmergencyFundIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const PiggyBankIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75m-16.5 0c.264 0 .524.02.782.058 1.92.223 3.86.344 5.822.344s3.902-.121 5.822-.344c.258-.038.518-.058.782-.058m-16.5 0h16.5m-16.5 0V6.75A2.25 2.25 0 0 1 4.5 4.5h15A2.25 2.25 0 0 1 21.75 6.75v12m-16.5 0h16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 10.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5z" />
    </svg>
);

export const HandshakeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25 7.5 12l1.5 3.75m6-7.5L16.5 12l-1.5 3.75m3-7.5-3 1.5m3-1.5-3-1.5m-6 3 3 1.5m-3-1.5-3 1.5m12 6.75-3-1.5m3 1.5-3 1.5M4.5 12l3 1.5m-3-1.5-3 1.5m15 0-3-1.5m3 1.5-3 1.5" />
    </svg>
);

export const MoneyOutIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75m10.5-11.25h.008v.008h-.008V3.75Zm-3 0h.008v.008h-.008V3.75Zm-3 0h.008v.008h-.008V3.75Zm-3 0h.008v.008h-.008V3.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5v15m-3-12-3 3m6 0-3-3" />
    </svg>
);
export const MoneyInIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75m10.5-11.25h.008v.008h-.008V3.75Zm-3 0h.008v.008h-.008V3.75Zm-3 0h.008v.008h-.008V3.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5v15m-3 0 3 3m0 0 3-3m-3 3V1.5" />
    </svg>
);


// Gamification Icons
export const TrophyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.012 9.012 0 0 1 0-13.5h9a9.012 9.012 0 0 1 0 13.5ZM10.5 4.5V3m3 1.5V3m-3 18v-1.5m3 1.5v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const FirstTransactionIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
    </svg>
);

export const BudgetIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m7.5-3h3.75M2.25 12h19.5" />
    </svg>
);

export const GoalIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.506 0 1.023-.042 1.531-.126M12 21a9.004 9.004 0 0 1-8.716-6.747M12 3c.506 0 1.023.042 1.531.126M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3v18M12 3a9.004 9.004 0 0 0 8.716 6.747m0-6.747-8.716 6.747" />
    </svg>
);

export const DefaultIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
);

export const iconMap: { [key: string]: React.FC<{className?: string}> } = {
    CashIcon,
    BankIcon,
    EWalletIcon,
    FoodIcon,
    CoffeeIcon,
    ShoppingIcon,
    TransportIcon,
    BillIcon,
    EntertainmentIcon,
    PiggyBankIcon,
    TransferIcon,
    MoneyOutIcon,
    MoneyInIcon,
    SalaryIcon,
    LaptopIcon,
    AirplaneIcon,
    EmergencyFundIcon,
    HandshakeIcon,
    TrophyIcon,
    FirstTransactionIcon,
    BudgetIcon,
    GoalIcon,
    DefaultIcon,
};
export const ALL_ICONS = Object.keys(iconMap);

// --- CONFIG CONSTANTS ---

export const INITIAL_TRANSACTION_CATEGORIES: TransactionCategory[] = [
    { name: 'category.food', iconName: 'FoodIcon', type: 'expense' },
    { name: 'category.beverage', iconName: 'CoffeeIcon', type: 'expense' },
    { name: 'category.shopping', iconName: 'ShoppingIcon', type: 'expense' },
    { name: 'category.transport', iconName: 'TransportIcon', type: 'expense' },
    { name: 'category.bills', iconName: 'BillIcon', type: 'expense' },
    { name: 'category.entertainment', iconName: 'EntertainmentIcon', type: 'expense' },
    { name: 'category.goalSaving', iconName: 'PiggyBankIcon', type: 'expense' },
    { name: 'category.transferOut', iconName: 'TransferIcon', type: 'expense' },
    { name: 'category.lending', iconName: 'MoneyOutIcon', type: 'expense' },
    { name: 'category.debtRepayment', iconName: 'MoneyOutIcon', type: 'expense' },
    { name: 'category.salary', iconName: 'SalaryIcon', type: 'income' },
    { name: 'category.bonus', iconName: 'SalaryIcon', type: 'income' },
    { name: 'category.otherIncome', iconName: 'SalaryIcon', type: 'income' },
    { name: 'category.transferIn', iconName: 'TransferIcon', type: 'income' },
    { name: 'category.borrowing', iconName: 'MoneyInIcon', type: 'income' },
    { name: 'category.debtCollection', iconName: 'MoneyInIcon', type: 'income' },
];

export const WALLET_COLORS = ['bg-rainbow-red', 'bg-rainbow-orange', 'bg-rainbow-yellow', 'bg-rainbow-green', 'bg-rainbow-blue', 'bg-rainbow-violet'];

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'JPY', 'KRW'];

export const CURRENCY_RATES: Record<CurrencyCode, number> = {
    VND: 1,
    USD: 25450,
    EUR: 27250,
    JPY: 162,
    KRW: 18.5
};