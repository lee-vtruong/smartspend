import React from 'react';
import { Wallet, Budget, SpendingData, CategorySpending, Goal, Achievement, DebtLoanItem, CurrencyCode, TransactionCategory } from './types';

// IMPORTANT: IMPORT ICONS FROM SEPARATE COMPONENT FILE
import { 
    CashIcon, BankIcon, EWalletIcon, FoodIcon, CoffeeIcon, ShoppingIcon, TransportIcon, 
    BillIcon, EntertainmentIcon, PiggyBankIcon, TransferIcon, MoneyOutIcon, MoneyInIcon, 
    SalaryIcon, LaptopIcon, AirplaneIcon, EmergencyFundIcon, HandshakeIcon, TrophyIcon, 
    FirstTransactionIcon, BudgetIcon, GoalIcon, DefaultIcon 
} from './components/Icons'; 

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
    DefaultIcon
};

export const ALL_ICONS = Object.keys(iconMap);

// --- CONFIG CONSTANTS (Categories, Colors, Currency) ---

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


// --- MOCK DATA ---

export const MOCK_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Tiền mặt', type: 'Cash', balance: 2500000, currency: 'VND', color: 'bg-success', icon: <CashIcon className="w-8 h-8"/> },
  { id: 'w2', name: 'Techcombank', type: 'Bank', balance: 15750000, currency: 'VND', color: 'bg-primary', icon: <BankIcon className="w-8 h-8"/> },
  { id: 'w3', name: 'Momo', type: 'E-Wallet', balance: 1230000, currency: 'VND', color: 'bg-accent', icon: <EWalletIcon className="w-8 h-8"/> },
];

export const MOCK_BUDGETS: Budget[] = [
    { id: 'b1', category: 'category.food', limit: 5000000, spent: 3750000 },
    { id: 'b2', category: 'category.shopping', limit: 3000000, spent: 2850000 },
    { id: 'b3', category: 'category.transport', limit: 1000000, spent: 450000 },
]

export const MOCK_GOALS: Goal[] = [
    { id: 'goal1', name: 'Mua MacBook Pro', targetAmount: 50000000, currentAmount: 15000000, icon: <LaptopIcon className="w-8 h-8" /> },
    { id: 'goal2', name: 'Du lịch Nhật Bản', targetAmount: 70000000, currentAmount: 25000000, icon: <AirplaneIcon className="w-8 h-8" /> },
    { id: 'goal3', name: 'Quỹ khẩn cấp', targetAmount: 30000000, currentAmount: 29500000, icon: <EmergencyFundIcon className="w-8 h-8" /> },
];

export const MOCK_SPENDING_DATA: SpendingData[] = [
    { period: 'Feb', expense: 12000, income: 15000 },
    { period: 'Mar', expense: 14000, income: 16000 },
    { period: 'Apr', expense: 13500, income: 15500 },
    { period: 'May', expense: 15000, income: 18000 },
    { period: 'Jun', expense: 16000, income: 17000 },
    { period: 'Jul', expense: 14500, income: 17500 },
];

export const MOCK_CATEGORY_SPENDING: CategorySpending[] = [
    { name: 'Ăn uống', value: 450 },
    { name: 'Mua sắm', value: 300 },
    { name: 'Di chuyển', value: 150 },
    { name: 'Giải trí', value: 100 },
    { name: 'Khác', value: 50 },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
    { id: 'ach1', titleKey: 'achievement.firstTransaction.title', descriptionKey: 'achievement.firstTransaction.description', icon: <FirstTransactionIcon />, unlocked: false, unlockedDate: null },
    { id: 'ach2', titleKey: 'achievement.firstBudget.title', descriptionKey: 'achievement.firstBudget.description', icon: <BudgetIcon />, unlocked: false, unlockedDate: null },
    { id: 'ach3', titleKey: 'achievement.firstGoal.title', descriptionKey: 'achievement.firstGoal.description', icon: <GoalIcon />, unlocked: false, unlockedDate: null },
    { id: 'ach4', titleKey: 'achievement.goalMaster.title', descriptionKey: 'achievement.goalMaster.description', icon: <TrophyIcon />, unlocked: false, unlockedDate: null },
    { id: 'ach5', titleKey: 'achievement.investor.title', descriptionKey: 'achievement.investor.description', icon: <PiggyBankIcon />, unlocked: false, unlockedDate: null },
    { id: 'ach6', titleKey: 'achievement.socializer.title', descriptionKey: 'achievement.socializer.description', icon: <HandshakeIcon />, unlocked: false, unlockedDate: null },
];

export const MOCK_DEBTS_LOANS: DebtLoanItem[] = [
  { id: 'dl1', type: 'debt', person: 'Minh Anh', initialAmount: 5000000, paidAmount: 1000000, description: 'Vay tiền mua điện thoại', dueDate: '2024-12-31' },
  { id: 'dl2', type: 'loan', person: 'Bảo', initialAmount: 2000000, paidAmount: 500000, description: 'Cho vay tiền đóng học phí', dueDate: '2024-09-30' },
  { id: 'dl3', type: 'debt', person: 'Ngân hàng VCB', initialAmount: 20000000, paidAmount: 15000000, description: 'Trả góp xe máy', dueDate: '2025-06-30' },
];