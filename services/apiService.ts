import { auth, db } from "../firebaseClient";
import { sendPasswordResetEmail } from "firebase/auth";
import { 
  collection, addDoc, getDocs, query, where, orderBy, 
  doc, deleteDoc, updateDoc, 
  getDoc
} from "firebase/firestore";

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartspend_token')}`
});

export const apiService = {
  // AUTH & PROFILE
  async login(credentials: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Sai tài khoản hoặc mật khẩu');
    }
    return res.json();
  },

  async signup(name: string, email: string, password: string) {
    console.log("Check data:", { name, email, password }); 

    const res = await fetch(`${API_BASE_URL}/auth/signup`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }) 
    });

    if (!res.ok) {
        const text = await res.text();
        let errorMessage = "Đăng ký thất bại"; 

        try {
            const data = JSON.parse(text);
            if (data.message) {
                errorMessage = data.message; 
            }
        } catch (e) {
            console.error("Server trả về lỗi không phải JSON:", text);
            errorMessage = "Lỗi kết nối Server hoặc Server gặp sự cố.";
        }

        throw new Error(errorMessage);
    }

    return res.json();
  },

  updateProfile: async (data: { name?: string; avatar?: string }) => {
    const response = await fetch(`${API_BASE_URL}/profile`, { 
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  },

  async uploadAvatar() {
    const res = await fetch(`${API_BASE_URL}/upload-avatar`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async changePassword(data: any) {
    const res = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || "Không thể gửi email reset.");
    }
  },

  // DATA EXPORT
  async exportTransactions() {
    const res = await fetch(`${API_BASE_URL}/export/transactions`, {
      headers: getHeaders()
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SmartSpend_Transactions.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  analyzeTransaction: async (aiInput: string, categoryNames: string[], walletNames: string[]) => {
    const response = await fetch(`${API_BASE_URL}/analyze-transaction`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ aiInput, categoryNames, walletNames }),
    });

    if (!response.ok) throw new Error('AI Server Error');
    return response.json();
  },

  // WALLETS
  async getWallets() {
    const res = await fetch(`${API_BASE_URL}/wallets`, { headers: getHeaders() });
    return res.json();
  },
  
  async addWallet(data: any) {
    const res = await fetch(`${API_BASE_URL}/wallets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async editWallet(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/wallets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateWallet: async (wallet: any) => {
    const response = await fetch(`${API_BASE_URL}/wallets/${wallet.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(wallet), // Gửi body chứa { name, balance, type, ... }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Lỗi khi cập nhật ví');
    }
    return response.json();
  },

  deleteWallet: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/wallets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Đọc message lỗi từ Backend (ví dụ: "Không thể xóa ví duy nhất")
      const err = await response.json();
      throw new Error(err.message || 'Lỗi khi xóa ví');
    }
    return response.json();
  },
  
  async transferMoney(data: { fromWalletName: string, toWalletName: string, amount: number, date: string, note?: string }) {
    const res = await fetch(`${API_BASE_URL}/wallets/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi chuyển tiền');
    }
    return res.json();
  },

  // TRANSACTIONS
  async getTransactions() {
    const res = await fetch(`${API_BASE_URL}/transactions`, { headers: getHeaders() });
    return res.json();
  },
  
  async addTransaction(data: any) {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add transaction');
    }

    return res.json();
  },
  
  async deleteTransaction(id: string) {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  async updateTransaction(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi cập nhật giao dịch');
    }
    return res.json();
  },

  // BUDGETS
  async getBudgets() {
    const res = await fetch(`${API_BASE_URL}/budgets`, { headers: getHeaders() });
    return res.json();
  },
  
  addBudget: async (budget: any) => {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budget),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to add budget');
    }
    return response.json();
  },
  
  async deleteBudget(id: string) {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  updateBudget: async (budget: any) => {
    const response = await fetch(`${API_BASE_URL}/budgets/${budget.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(budget),
    });

    if (!response.ok) {
      throw new Error('Failed to update budget');
    }
    return response.json();
  },

  // GOALS
  async getGoals() {
    const res = await fetch(`${API_BASE_URL}/goals`, { headers: getHeaders() });
    return res.json();
  },
  
  async addGoal(data: any) {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async fundGoal(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/goals/${id}/fund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi nạp tiền');
    }
    return res.json();
  },

  updateGoal: async (goal: any) => {
    const response = await fetch(`${API_BASE_URL}/goals/${goal.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(goal),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },

  deleteGoal: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete goal');
    return response.json();
  },

  // DEBTS & LOANS
  async getDebts() {
    const res = await fetch(`${API_BASE_URL}/debts`, { headers: getHeaders() });
    return res.json();
  },
    
  async addDebt(data: any) {
    const res = await fetch(`${API_BASE_URL}/debts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi thêm khoản nợ');
    }
    return res.json();
  },
  
  async recordDebtPayment(id: string, amount: number, walletName: string) {
    const res = await fetch(`${API_BASE_URL}/debts/${id}/payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, walletName })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi ghi nhận thanh toán');
    }
    return res.json();
  },

  async updateDebtLoan(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/debts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi cập nhật khoản nợ');
    }
    return res.json();
  },

  // MỚI: Xóa khoản nợ
  async deleteDebtLoan(id: string) {
    const res = await fetch(`${API_BASE_URL}/debts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete debt');
    return res.json();
  },

  // GROUPS
  async getGroups() {
    const res = await fetch(`${API_BASE_URL}/groups`, { headers: getHeaders() });
    return res.json();
  },
  
  async deleteGroup(groupId: string) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi xóa nhóm");
    }
    return res.json();
  },

  async leaveGroup(groupId: string) {
      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
          method: 'POST',
          headers: getHeaders()
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Lỗi rời nhóm");
      }
      return res.json();
  },

  async removeMemberFromGroup(groupId: string, memberIdToRemove: string) {
      const res = await fetch(`${API_BASE_URL}/groups/${groupId}/remove-member`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ memberIdToRemove })
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Lỗi xóa thành viên");
      }
      return res.json();
  },
  
  async addGroup(data: any) {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async getGroupTransactions(groupId: string) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions`, {
      headers: getHeaders()
    });
    return res.json();
  },
  
  async addGroupTransaction(groupId: string, data: any) {
    try {
        if (!auth.currentUser) throw new Error("Chưa đăng nhập");

        const subColRef = collection(db, "groups", groupId, "transactions");

        const newTx = {
            ...data,
            createdBy: auth.currentUser.uid,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(subColRef, newTx);
        return { id: docRef.id, ...newTx };
    } catch (error: any) {
        console.error("Lỗi thêm giao dịch nhóm:", error);
        throw error;
    }
  },
  
  async searchUserByEmail(email: string) {
    const res = await fetch(`${API_BASE_URL}/users/search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Lỗi tìm kiếm');
    return res.json();
  },

  async addMemberToGroup(groupId: string, userIdToAdd: string) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/add-member`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userIdToAdd })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi thêm thành viên');
    }
    return res.json();
  },

  // CATEGORIES
  async getCustomCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`, { headers: getHeaders() });
    return res.json();
  },
  
  async addCategory(data: any) {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async editCategory(name: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/categories/${name}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async deleteCategory(name: string, reassignTo: string) {
    const res = await fetch(`${API_BASE_URL}/categories/${name}?reassignTo=${reassignTo}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // NOTIFICATIONS
  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getHeaders() });
    return res.json();
  },
  
  async markNotificationsRead() {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },
  
  async sendNotification(data: any) {
    const res = await fetch(`${API_BASE_URL}/admin/broadcast`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.message || "Gửi thất bại");
    }
    
    return res.json();
  },

  // ADMIN
  async adminGetUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() });
    return res.json();
  },
  
  async adminToggleUserLock(id: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/toggle-lock`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async adminGetStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Lỗi lấy thống kê");
    return res.json();
  },

  async adminBroadcastNotification(title: string, message: string) {
    const res = await fetch(`${API_BASE_URL}/admin/broadcast`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, message })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gửi thất bại");
    }
    
    return res.json();
  },
  
  async restoreSystem(backupId: string) {
      const res = await fetch(`${API_BASE_URL}/admin/backups/${backupId}/restore`, {
          method: 'POST',
          headers: getHeaders()
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Lỗi khôi phục hệ thống");
      }
      return res.json();
  },

  async getSystemBackups() {
      const res = await fetch(`${API_BASE_URL}/admin/backups`, {
          headers: getHeaders()
      });
      return res.json();
  },

  async createSystemBackup() {
      const res = await fetch(`${API_BASE_URL}/admin/backups`, {
          method: 'POST',
          headers: getHeaders()
      });
      if (!res.ok) throw new Error("Không thể tạo sao lưu");
      return res.json();
  },

  // AI
  async chatWithAI(message: string, context: any) {
    console.log("Calling AI chat endpoint with message:", message);
    
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        message, 
        context,
        timestamp: new Date().toISOString() 
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("AI Chat error:", res.status, errorText);
      throw new Error(`AI Chat failed: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log("AI response received:", data);
    return data;
  },

  async getAIAnalysis() {
    const res = await fetch(`${API_BASE_URL}/ai/analysis`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Lỗi phân tích AI");
    return res.json();
  },
  
  async loginWithGoogle(idToken: string) {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi đăng nhập Google");
    }
    return res.json();
  },

  async setPassword(newPassword: string) {
      const res = await fetch(`${API_BASE_URL}/auth/set-password`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ newPassword })
      });

      if (!res.ok) throw new Error("Lỗi đặt mật khẩu");
      return res.json();
  },
};