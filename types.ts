
// FIX: Import React to make the JSX namespace available for types like React.JSX.Element.
import React from 'react';

export type Page = 'dashboard' | 'reports' | 'transactions' | 'groups' | 'premium' | 'settings' | 'debts' | 'adminDashboard' | 'userManagement' | 'systemReports' | 'notificationsManagement';
export type Language = 'vi' | 'en';
export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'JPY' | 'KRW';

export type TravelMode = {
  enabled: boolean;
  currency: CurrencyCode;
}

// FIX: Added NotificationSettings interface
export interface NotificationSettings {
  emailWeekly: boolean;
  emailMonthly: boolean;
  pushBudget: boolean;
  pushBills: boolean;
  pushDebts: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'E-Wallet';
  balance: number;
  currency: 'VND' | 'USD';
  color: string;
  // FIX: Using React.JSX.Element to explicitly reference the element type from React.
  icon: React.JSX.Element;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string; // This will now be a translation key, e.g., 'category.food'
  date: string;
  wallet: string;
  payee: string;
  // FIX: Using React.JSX.Element to explicitly reference the element type from React.
  icon: React.JSX.Element;
}

export interface Budget {
    id: string;
    category: string; // Translation key
    limit: number;
    spent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: React.JSX.Element;
}

export interface SpendingData {
    period: string;
    expense: number;
    income: number;
}

export interface CategorySpending {
    name: string; // Translated category name
    value: number;
}

export interface AIForecast {
    category: string;
    predictedSpend: number;
    confidenceInterval: [number, number];
}

export interface AISuggestion {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

export interface AIResponse {
    forecasts: AIForecast[];
    suggestions: AISuggestion[];
    summary: string;
}

// Types for Group/Travel fund feature
export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
}

export interface GroupTransaction {
  id: string;
  type: 'contribution' | 'expense';
  description: string;
  amount: number;
  date: string;
  payerId: string; // Member who paid
  participants: string[]; // Members who share the expense
}

export interface Group {
  id: string;
  name: string;
  currency: 'VND' | 'USD';
  members: GroupMember[];
  transactions: GroupTransaction[];
}

export interface Settlement {
    from: string; // Member name
    to: string; // Member name
    amount: number;
}

// Gamification Types
export interface Achievement {
  id: string;
  titleKey: string; // translation key for title
  descriptionKey: string; // translation key for description
  icon: React.JSX.Element;
  unlocked: boolean;
  unlockedDate: string | null;
}


// AI Chatbot Types
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}


// Debt & Loan Management
export interface DebtLoanItem {
  id:string;
  type: 'debt' | 'loan'; // 'debt' = I owe money, 'loan' = someone owes me
  person: string;
  initialAmount: number;
  paidAmount: number;
  description: string;
  dueDate: string;
  interestRate?: number; // Optional interest rate
}

// Admin Types
export interface SystemUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: 'active' | 'locked';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface TransactionCategory {
  name: string; // The key for the category, e.g., 'category.food' or a custom name
  iconName: string; // The key to look up the icon component, e.g., 'FoodIcon'
  type: 'income' | 'expense';
  isCustom?: boolean;
}
