import { GoogleGenAI } from "@google/genai"; 
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";

// TẢI .env TRƯỚC KHI DÙNG
dotenv.config({ path: '.env' });

// DEBUG: Kiểm tra biến môi trường
console.log("=== ENVIRONMENT VARIABLES ===");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "ĐÃ CÓ (ẩn vì bảo mật)" : "KHÔNG CÓ");
console.log("PORT:", process.env.PORT);
console.log("Tất cả biến env:", Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('KEY')));

const app: any = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// --- DATABASE GIẢ LẬP (Dữ liệu sẽ mất khi restart server) ---
let db: any = {
  users: [
    { id: 'u1', name: 'An Nguyen', email: 'an.nguyen@example.com', password: 'password123', isAdmin: true, status: 'active', avatar: 'https://picsum.photos/seed/u1/100' },
    { id: 'u2', name: 'Binh Tran', email: 'binh.tran@example.com', password: 'password123', isAdmin: false, status: 'active', avatar: 'https://picsum.photos/seed/u2/100' }
  ],
  wallets: [
    { id: 'w1', userId: 'u1', name: 'Tiền mặt', type: 'Cash', balance: 2500000, currency: 'VND', color: 'bg-success' },
    { id: 'w2', userId: 'u1', name: 'Techcombank', type: 'Bank', balance: 15750000, currency: 'VND', color: 'bg-primary' }
  ],
  transactions: [
    { id: 't1', userId: 'u1', type: 'expense', amount: 50000, category: 'category.food', date: new Date().toISOString(), wallet: 'Tiền mặt', payee: 'Ăn sáng cơm tấm' }
  ],
  customCategories: [
    { userId: 'u1', name: 'Tiền học cho con', iconName: 'BillIcon', type: 'expense', isCustom: true }
  ],
  budgets: [
    { id: 'b1', userId: 'u1', category: 'category.food', limit: 5000000, spent: 50000 }
  ],
  goals: [
    { id: 'g1', userId: 'u1', name: 'Mua Laptop', targetAmount: 20000000, currentAmount: 1000000, iconName: 'LaptopIcon' }
  ],
  debts: [
    { id: 'd1', userId: 'u1', type: 'debt', person: 'Anh Minh', initialAmount: 1000000, paidAmount: 0, description: 'Vay tiền trà đá', dueDate: '2025-12-31' }
  ],
  groups: [
    { 
      id: 'group1', 
      name: 'Team Building', 
      currency: 'VND', 
      members: [
        { id: 'u1', name: 'An Nguyen', avatar: 'https://picsum.photos/seed/u1/100' },
        { id: 'm2', name: 'Thanh', avatar: 'https://picsum.photos/seed/m2/100' }
      ], 
      transactions: [] 
    }
  ],
  notifications: [
    { id: 'n1', userId: 'u1', title: 'Chào mừng!', message: 'Bắt đầu quản lý tài chính ngay.', date: new Date().toISOString(), read: false }
  ]
};

// --- MIDDLEWARE XÁC THỰC GIẢ LẬP ---
const authenticate = (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer mock-jwt-token-')) {
    const userId = authHeader.replace('Bearer mock-jwt-token-', '');
    const user = db.users.find((u: any) => u.id === userId);
    if (user) {
      if (user.status === 'locked') return res.status(403).json({ message: 'Tài khoản bị khóa' });
      req.user = user;
      return next();
    }
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// --- ROUTES ---

// 1. AUTH & PROFILE
app.post('/api/auth/login', (req: any, res: any) => {
  const { email, password } = req.body;
  const user = db.users.find((u: any) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  res.json({ token: `mock-jwt-token-${user.id}`, user });
});

app.post('/api/auth/signup', (req: any, res: any) => {
  const { name, email, password } = req.body;
  const newUser = { id: `u${Date.now()}`, name, email, password, isAdmin: false, status: 'active', avatar: `https://picsum.photos/seed/${email}/100` };
  db.users.push(newUser);
  res.status(201).json({ success: true });
});

app.put('/api/profile', authenticate, (req: any, res: any) => {
    const user = db.users.find((u: any) => u.id === req.user.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
    }
    res.json(user);
});

// 2. WALLETS (CRUD)
app.get('/api/wallets', authenticate, (req: any, res: any) => {
  res.json(db.wallets.filter((w: any) => w.userId === req.user.id));
});

app.post('/api/wallets', authenticate, (req: any, res: any) => {
  const newWallet = { ...req.body, id: `w${Date.now()}`, userId: req.user.id };
  db.wallets.push(newWallet);
  res.status(201).json(newWallet);
});

app.put('/api/wallets/:id', authenticate, (req: any, res: any) => {
    const idx = db.wallets.findIndex((w:any) => w.id === req.params.id && w.userId === req.user.id);
    if (idx !== -1) {
        db.wallets[idx] = { ...db.wallets[idx], ...req.body };
        res.json(db.wallets[idx]);
    } else res.status(404).json({ message: 'Not found' });
});

app.delete('/api/wallets/:id', authenticate, (req: any, res: any) => {
    db.wallets = db.wallets.filter((w: any) => !(w.id === req.params.id && w.userId === req.user.id));
    res.json({ success: true });
});

app.post('/api/wallets/transfer', authenticate, (req: any, res: any) => {
    const { fromWalletName, toWalletName, amount } = req.body;
    const from = db.wallets.find((w:any) => w.name === fromWalletName && w.userId === req.user.id);
    const to = db.wallets.find((w:any) => w.name === toWalletName && w.userId === req.user.id);
    if (from && to && from.balance >= amount) {
        from.balance -= amount;
        to.balance += amount;
        res.json({ success: true });
    } else res.status(400).json({ message: 'Số dư không đủ' });
});

// 3. TRANSACTIONS
app.get('/api/transactions', authenticate, (req: any, res: any) => {
  const txs = db.transactions.filter((t: any) => t.userId === req.user.id);
  res.json(txs.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

app.post('/api/transactions', authenticate, (req: any, res: any) => {
  const newTx = { ...req.body, id: `t${Date.now()}`, userId: req.user.id };
  db.transactions.push(newTx);
  // Cập nhật số dư ví
  const wallet = db.wallets.find((w: any) => w.name === newTx.wallet && w.userId === req.user.id);
  if (wallet) {
      if (newTx.type === 'expense') wallet.balance -= newTx.amount;
      else wallet.balance += newTx.amount;
  }
  res.status(201).json(newTx);
});

app.delete('/api/transactions/:id', authenticate, (req: any, res: any) => {
    const tx = db.transactions.find((t:any) => t.id === req.params.id && t.userId === req.user.id);
    if (tx) {
        // Hoàn lại tiền vào ví
        const wallet = db.wallets.find((w: any) => w.name === tx.wallet && w.userId === req.user.id);
        if (wallet) {
            if (tx.type === 'expense') wallet.balance += tx.amount;
            else wallet.balance -= tx.amount;
        }
        db.transactions = db.transactions.filter((t: any) => t.id !== req.params.id);
        res.json({ success: true });
    } else res.status(404).json({ message: 'Not found' });
});

// 4. BUDGETS & GOALS
app.get('/api/budgets', authenticate, (req: any, res: any) => {
  res.json(db.budgets.filter((b: any) => b.userId === req.user.id));
});

app.post('/api/budgets', authenticate, (req: any, res: any) => {
    const newBudget = { ...req.body, id: `b${Date.now()}`, userId: req.user.id, spent: 0 };
    db.budgets.push(newBudget);
    res.status(201).json(newBudget);
});

app.delete('/api/budgets/:id', authenticate, (req: any, res: any) => {
    db.budgets = db.budgets.filter((b:any) => !(b.id === req.params.id && b.userId === req.user.id));
    res.json({ success: true });
});

app.get('/api/goals', authenticate, (req: any, res: any) => {
  res.json(db.goals.filter((g: any) => g.userId === req.user.id));
});

app.post('/api/goals', authenticate, (req: any, res: any) => {
    const newGoal = { ...req.body, id: `g${Date.now()}`, userId: req.user.id, currentAmount: req.body.currentAmount || 0 };
    db.goals.push(newGoal);
    res.status(201).json(newGoal);
});

app.post('/api/goals/:id/fund', authenticate, (req: any, res: any) => {
    const goal = db.goals.find((g:any) => g.id === req.params.id && g.userId === req.user.id);
    const { amount, walletName } = req.body;
    const wallet = db.wallets.find((w:any) => w.name === walletName && w.userId === req.user.id);
    if (goal && wallet && wallet.balance >= amount) {
        goal.currentAmount += amount;
        wallet.balance -= amount;
        res.json(goal);
    } else res.status(400).json({ message: 'Lỗi nạp tiền' });
});

// 5. DEBTS & GROUPS
app.get('/api/debts', authenticate, (req: any, res: any) => {
  res.json(db.debts.filter((d: any) => d.userId === req.user.id));
});

app.post('/api/debts', authenticate, (req: any, res: any) => {
    const newDebt = { ...req.body, id: `d${Date.now()}`, userId: req.user.id, paidAmount: 0 };
    db.debts.push(newDebt);
    res.status(201).json(newDebt);
});

app.post('/api/debts/:id/payment', authenticate, (req: any, res: any) => {
    const debt = db.debts.find((d:any) => d.id === req.params.id && d.userId === req.user.id);
    if (debt) {
        debt.paidAmount += req.body.amount;
        res.json(debt);
    } else res.status(404).json({ message: 'Not found' });
});

app.get('/api/groups', authenticate, (req: any, res: any) => {
  res.json(db.groups);
});

app.post('/api/groups', authenticate, (req: any, res: any) => {
    const newGroup = { ...req.body, id: `group${Date.now()}`, transactions: [] };
    db.groups.push(newGroup);
    res.status(201).json(newGroup);
});

app.post('/api/groups/:id/transactions', authenticate, (req: any, res: any) => {
    const group = db.groups.find((g: any) => g.id === req.params.id);
    if (group) {
        const newTransaction = { ...req.body, id: `gt${Date.now()}` };
        group.transactions.push(newTransaction);
        res.status(201).json(newTransaction);
    } else {
        res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }
});

// 6. CATEGORIES (Custom)
app.get('/api/categories', authenticate, (req: any, res: any) => {
    res.json(db.customCategories.filter((c:any) => c.userId === req.user.id));
});

app.post('/api/categories', authenticate, (req: any, res: any) => {
    const newCat = { ...req.body, userId: req.user.id, isCustom: true };
    db.customCategories.push(newCat);
    res.status(201).json(newCat);
});

app.delete('/api/categories/:name', authenticate, (req: any, res: any) => {
    db.customCategories = db.customCategories.filter((c:any) => !(c.name === req.params.name && c.userId === req.user.id));
    res.json({ success: true });
});

// 7. NOTIFICATIONS & ADMIN
app.get('/api/notifications', authenticate, (req: any, res: any) => {
  res.json(db.notifications.filter((n: any) => n.userId === req.user.id));
});

app.post('/api/notifications/mark-read', authenticate, (req: any, res: any) => {
    db.notifications.forEach((n: any) => { if(n.userId === req.user.id) n.read = true; });
    res.json({ success: true });
});

app.post('/api/notifications', authenticate, (req: any, res: any) => {
    const newNotif = { ...req.body, id: `n${Date.now()}`, userId: req.user.id, date: new Date().toISOString(), read: false };
    db.notifications.push(newNotif);
    res.status(201).json(newNotif);
});

app.get('/api/admin/users', authenticate, (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    res.json(db.users);
});

app.post('/api/admin/users/:id/toggle-lock', authenticate, (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const user = db.users.find((u: any) => u.id === req.params.id);
    if (user) user.status = user.status === 'active' ? 'locked' : 'active';
    res.json(user);
});

// AI & EXPORT
// app.post("/api/ai/chat", authenticate, async (req, res) => {
//   try {
//     const { message, context } = req.body;

//     // Khởi tạo với Class đúng: GoogleGenerativeAI
//     const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
//     console.log(genAI);

//     // Lấy model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Gọi Gemini
//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: `
//                 Bạn là Mony – trợ lý tài chính cá nhân.
//                 Dữ liệu người dùng: ${JSON.stringify(context)}
//                 Câu hỏi: ${message}
//                 Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
//               `,
//             },
//           ],
//         },
//       ],
//     });

//     // Lấy text response
//     const response = result.response;
//     const text = response.text();

//     // Trả về đúng format cho AppContext
//     res.json({ text: text });

//   } catch (err: any) {
//     console.error("Gemini error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

app.post("/api/ai/chat", authenticate, async (req: any, res: any) => {
  try {
    const { message, context } = req.body;
    
    // LẤY API KEY TỪ CÙNG NGUỒN NHƯ AddTransactionModal
    // Trong vite.config.ts, cả API_KEY và GEMINI_API_KEY đều từ cùng biến env
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    console.log("API Key check:", apiKey ? "Có" : "Không");
    console.log("Key starts with:", apiKey?.substring(0, 10));
    
    if (!apiKey) {
      throw new Error("Không tìm thấy API Key. Kiểm tra file .env");
    }

    // GIỐNG HỆT AddTransactionModal
    const ai = new GoogleGenAI({ apiKey });
    
    // THỬ CÁC MODEL GIỐNG AddTransactionModal
    const modelsToTry = [
      'gemini-3-flash-preview',  // Model chính AddTransactionModal dùng
      'gemini-2.0-flash-exp',    // Model mới
      'gemini-1.5-flash',        // Model cũ hơn
      'gemini-1.5-pro'           // Pro version
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Thử model: ${modelName}`);
        
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Bạn là Mony. Trả lời ngắn gọn: ${message}`
        });

        const text = response.text;
        
        console.log(`✅ Thành công với ${modelName}`);
        
        return res.json({
          success: true,
          text: text,
          model: modelName,
          note: "Dùng cùng hệ thống như phân tích giao dịch tự động"
        });
        
      } catch (modelErr: any) {
        console.log(`❌ ${modelName} failed:`, modelErr.message);
        continue;
      }
    }

    throw new Error("Tất cả models đều thất bại");

  } catch (error: any) {
    console.error("Chat error:", error.message);
    
    // Mock response thông minh
    const mockResponses = [
      `Xin chào! Bạn hỏi về "${req.body?.message}". Tôi là Mony - trợ lý tài chính. Tính năng phân tích giao dịch tự động (icon ✨) đang hoạt động tốt!`,
      `Tôi có thể giúp bạn phân tích chi tiêu, đặt ngân sách, và tư vấn tiết kiệm. Hiện chat AI đang bảo trì, nhưng bạn vẫn dùng được tính năng AI phân tích giao dịch!`,
      `Chào bạn! Tính năng AI phân tích giao dịch tự động (trong modal thêm giao dịch) đang chạy ổn. Bạn có thể thử nó bằng cách nhập "ăn sáng 50k" hoặc "lương tháng 15tr".`
    ];
    
    res.json({
      success: true,
      text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      model: "mock-aware",
      isMock: true,
      tip: "Dùng tính năng phân tích giao dịch tự động (icon tia lửa) - nó đang hoạt động!"
    });
  }
});

app.get('/api/export/transactions', authenticate, (req: any, res: any) => {
    const txs = db.transactions.filter((t: any) => t.userId === req.user.id);
    let csv = "ID,Date,Type,Amount,Category,Wallet,Note\n";
    txs.forEach((t: any) => csv += `${t.id},${t.date},${t.type},${t.amount},${t.category},${t.wallet},${t.payee}\n`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
});

app.listen(PORT, () => console.log(`🚀 Mock Backend running at http://localhost:${PORT}`));
