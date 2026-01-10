
// FIX: Import React to make the JSX namespace available for types like React.JSX.Element.
import React from 'react';

export type Page = 'dashboard' | 'reports' | 'transactions' | 'groups' | 'premium' | 'settings' | 'debts' | 'adminDashboard' | 'userManagement' | 'systemReports' | 'notificationsManagement' | 'createPassword';
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
  userId: string;
  wallet: string;     // Tên ví
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  
  // Các trường tùy chọn (có thể có hoặc không)
  payee?: string;       // Người thụ hưởng (thường có ở chi tiêu thường)
  note?: string;        // Ghi chú cũ
  
  // --- CẬP NHẬT MỚI ---
  description?: string; // <--- Thêm dòng này (Dùng cho mô tả chuyển khoản)
  isTransfer?: boolean; // <--- Thêm dòng này (Để nhận biết là giao dịch chuyển tiền)
  
  // UI Properties (Được thêm vào ở Frontend)
  icon?: any;           
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
  icon: string | React.ReactNode; 
  userId?: string; 
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
  createdAt?: string;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  members: GroupMember[];
  transactions: GroupTransaction[]; 
  createdBy: string;
  createdAt?: string;
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
// src/types.ts

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model'; 
  content?: string;       
  parts?: { text: string }[];
  timestamp?: Date;
}


// Debt & Loan Management
export interface DebtLoanItem {
  id:string;
  type: 'debt' | 'loan'; // 'debt' = I owe money, 'loan' = someone owes me
  person: string;
  initialAmount: number;
  paidAmount: number;
  description: string;
  startDate?: string;
  dueDate?: string;
  interestRate?: number; 
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
  type?: 'system' | 'personal' | 'general';
}

export interface TransactionCategory {
  name: string; // The key for the category, e.g., 'category.food' or a custom name
  iconName: string; // The key to look up the icon component, e.g., 'FoodIcon'
  type: 'income' | 'expense';
  isCustom?: boolean;
}

// Thêm vào cuối file hoặc chỗ thích hợp
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;       
  achievements?: string[]; 
  status?: 'active' | 'locked';
}