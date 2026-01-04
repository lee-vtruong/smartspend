import { auth } from "../firebaseClient";
import { sendPasswordResetEmail } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query,     
  where,    
  orderBy,  
  doc
} from "firebase/firestore";
import { db } from "../firebaseClient";
const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartspend_token')}`
});

export const apiService = {
  // AUTH & PROFILEa
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

  // Trong apiService.ts

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
  async updateProfile(data: any) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async uploadAvatar() {
    // Giả lập upload avatar
    return { avatarUrl: `https://picsum.photos/seed/${Math.random()}/100` };
  },
  async changePassword(data: any) {
    const res = await fetch(`${API_BASE_URL}/profile/change-password`, {
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
  async deleteWallet(id: string) {
    const res = await fetch(`${API_BASE_URL}/wallets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
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
  async transferMoney(data: any) {
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
    return res.json();
  },
  async deleteTransaction(id: string) {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // BUDGETS
  async getBudgets() {
    const res = await fetch(`${API_BASE_URL}/budgets`, { headers: getHeaders() });
    return res.json();
  },
  async addBudget(data: any) {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteBudget(id: string) {
    return fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
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
    return res.json();
  },
  async recordDebtPayment(id: string, amount: number) {
    const res = await fetch(`${API_BASE_URL}/debts/${id}/payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    return res.json();
  },

  // GROUPS
  async getGroups() {
    const res = await fetch(`${API_BASE_URL}/groups`, { headers: getHeaders() });
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
  async addGroupTransaction(groupId: string, data: any) {
    try {
        if (!auth.currentUser) throw new Error("Chưa đăng nhập");

        // Firebase hỗ trợ Sub-collection (Collection lồng trong Document)
        // Đường dẫn sẽ là: groups -> [ID Nhóm] -> transactions -> [ID Giao dịch]
        const subColRef = collection(db, "groups", groupId, "transactions");

        const newTx = {
            ...data,
            createdBy: auth.currentUser.uid, // Người chi tiền (hoặc người nhập)
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(subColRef, newTx);
        return { id: docRef.id, ...newTx };
    } catch (error: any) {
        console.error("Lỗi thêm giao dịch nhóm:", error);
        throw error;
    }
  },

  // 4. Hàm lấy giao dịch của 1 nhóm cụ thể (Để hiển thị chi tiết)
  // Lấy danh sách giao dịch trong sub-collection của 1 nhóm
  async getGroupTransactions(groupId: string) {
      // Trỏ vào: groups -> [ID] -> transactions
      const subColRef = collection(db, "groups", groupId, "transactions");
      // Sắp xếp theo ngày tạo mới nhất
      const q = query(subColRef, orderBy("createdAt", "desc"));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async searchUserByEmail(email: string) {
    const res = await fetch(`${API_BASE_URL}/users/search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
    });
    if (res.status === 404) return null; // Không tìm thấy
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
    return { success: true }; // Giả lập
  },
  async deleteCategory(name: string, reassignTo: string) {
    return fetch(`${API_BASE_URL}/categories/${name}?reassignTo=${reassignTo}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // NOTIFICATIONS
  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getHeaders() });
    return res.json();
  },
  async markNotificationsRead() {
    return fetch(`${API_BASE_URL}/notifications/mark-read`, {
      method: 'POST',
      headers: getHeaders()
    });
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

  // AI
  // async chatWithAI(message: string, context: any) {
  //   const res = await fetch(`${API_BASE_URL}/ai/chat`, {
  //     method: 'POST',
  //     headers: getHeaders(),
  //     body: JSON.stringify({ message, context })
  //   });
  //   return res.json();
  // }

  // AI Chat
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

  // AI premium
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
          headers: getHeaders(), // Cần token để biết đang đổi pass cho ai
          body: JSON.stringify({ newPassword })
      });

      if (!res.ok) throw new Error("Lỗi đặt mật khẩu");
      return res.json();
  }
};

