
const API_BASE_URL = 'http://localhost:8000/api';

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
  async signup(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
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
  async resetPassword(email: string, pass: string) {
    // Giả lập reset pass
    return { success: true };
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
    // API Groups tạm thời chưa hoàn thiện toàn bộ trong mock, nhưng frontend vẫn có thể gọi
    return { success: true };
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
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
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
}
};
