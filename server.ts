import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';

// --- FIX LỖI FIREBASE IMPORT ---
// Dùng createRequire để import firebase-admin chuẩn CommonJS
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const admin = require("firebase-admin"); 

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Định nghĩa __dirname cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CẤU HÌNH MÔI TRƯỜNG ---
dotenv.config({ path: '.env' });
const app: any = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true 
}));
app.use(express.json());

// --- KẾT NỐI FIRESTORE ---
try {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  
  // Kiểm tra file tồn tại
  if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Không tìm thấy file key tại: ${serviceAccountPath}`);
  }

  // Đọc file key
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // Khởi tạo Firebase
  if (!admin.apps.length) { // Chỉ khởi tạo nếu chưa có
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
  }
  
  console.log("🔥 Firebase Admin đã kết nối thành công!");
} catch (error: any) {
  console.error("❌ Lỗi kết nối Firebase:", error.message);
  process.exit(1); // Tắt server nếu không kết nối được DB
}

const db = admin.firestore();

// Helper: Chuyển đổi dữ liệu Firestore document thành JSON chuẩn
const mapDoc = (doc: any) => {
    if (!doc.exists) return null;
    const data = doc.data();
    // Chuyển Timestamp thành ISO string cho Frontend dễ dùng
    for (const key in data) {
        if (data[key] && typeof data[key].toDate === 'function') {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return { id: doc.id, ...data };
};

// --- MIDDLEWARE XÁC THỰC ---
const authenticate = async (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer mock-jwt-token-')) {
    const userId = authHeader.replace('Bearer mock-jwt-token-', '');
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData?.status === 'locked') return res.status(403).json({ message: 'Tài khoản bị khóa' });
            
            req.user = { id: userDoc.id, ...userData };
            return next();
        }
    } catch (e) {
        console.error("Auth error:", e);
    }
  }
  res.status(401).json({ message: 'Unauthorized' });
};

app.get('/', (req: any, res: any) => {
    res.send('✅ Real Firestore Backend is running!');
});

app.post('/api/auth/login', async (req: any, res: any) => {
  const { email, password } = req.body;
  
  const snapshot = await db.collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  const isMatch = await bcrypt.compare(password, userData.password);

  if (!isMatch) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }

  if (userData.status === 'locked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' });
  }
  
  const { password: _, ...userWithoutPassword } = userData;

  res.json({ 
      token: `mock-jwt-token-${userDoc.id}`, 
      user: { id: userDoc.id, ...userWithoutPassword } 
  });
});

app.post('/api/auth/signup', async (req: any, res: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
      return res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại Tên, Email và Mật khẩu.' 
      });
  }
  
  const checkEmail = await db.collection('users').where('email', '==', email).get();
  if (!checkEmail.empty) {
      return res.status(400).json({ 
          message: 'Email đã được sử dụng. Vui lòng thử email khác hoặc đăng nhập' 
      });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = { 
      name, 
      email, 
      password: hashedPassword, 
      isAdmin: false, 
      status: 'active', 
      avatar: `https://picsum.photos/seed/${email}/100`,
      createdAt: new Date().toISOString()
  };
  
  await db.collection('users').add(newUser);
  res.status(201).json({ success: true });
});

app.put('/api/profile', authenticate, async (req: any, res: any) => {
    const updates = { ...req.body };
    delete updates.id; 
    delete updates.isAdmin;

    await db.collection('users').doc(req.user.id).update(updates);
    const updatedUser = await db.collection('users').doc(req.user.id).get();
    res.json(mapDoc(updatedUser));
});

// 2. WALLETS
app.get('/api/wallets', authenticate, async (req: any, res: any) => {
  const snapshot = await db.collection('wallets').where('userId', '==', req.user.id).get();
  res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/wallets', authenticate, async (req: any, res: any) => {
  const newWallet = { ...req.body, userId: req.user.id, createdAt: new Date().toISOString() };
  const ref = await db.collection('wallets').add(newWallet);
  res.status(201).json({ id: ref.id, ...newWallet });
});

app.put('/api/wallets/:id', authenticate, async (req: any, res: any) => {
    const walletRef = db.collection('wallets').doc(req.params.id);
    const doc = await walletRef.get();
    
    if (!doc.exists || doc.data()?.userId !== req.user.id) {
        return res.status(404).json({ message: 'Not found' });
    }

    await walletRef.update(req.body);
    const updated = await walletRef.get();
    res.json(mapDoc(updated));
});

app.delete('/api/wallets/:id', authenticate, async (req: any, res: any) => {
    const walletRef = db.collection('wallets').doc(req.params.id);
    const doc = await walletRef.get();
    if (doc.exists && doc.data()?.userId === req.user.id) {
        await walletRef.delete();
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

app.post('/api/wallets/transfer', authenticate, async (req: any, res: any) => {
    const { fromWalletName, toWalletName, amount } = req.body;
    
    try {
        await db.runTransaction(async (t: any) => {
            const fromQuery = await t.get(db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', fromWalletName));
            const toQuery = await t.get(db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', toWalletName));

            if (fromQuery.empty || toQuery.empty) throw new Error("Không tìm thấy ví");

            const fromDoc = fromQuery.docs[0];
            const toDoc = toQuery.docs[0];
            const fromData = fromDoc.data();
            
            if (fromData.balance < amount) throw new Error("Số dư không đủ");

            t.update(fromDoc.ref, { balance: fromData.balance - amount });
            t.update(toDoc.ref, { balance: toDoc.data().balance + amount });
        });

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

// 3. TRANSACTIONS
app.get('/api/transactions', authenticate, async (req: any, res: any) => {
  const snapshot = await db.collection('transactions').where('userId', '==', req.user.id).get();
  let txs = snapshot.docs.map(mapDoc);
  txs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(txs);
});

app.post('/api/transactions', authenticate, async (req: any, res: any) => {
    const { wallet: walletName, type, amount, ...rest } = req.body;
    const numAmount = Number(amount);

    try {
        await db.runTransaction(async (t: any) => {
            const wQuery = await t.get(db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', walletName));
            
            if (!wQuery.empty) {
                const wDoc = wQuery.docs[0];
                const newBalance = type === 'expense' 
                    ? wDoc.data().balance - numAmount 
                    : wDoc.data().balance + numAmount;
                t.update(wDoc.ref, { balance: newBalance });
            }

            const newTxRef = db.collection('transactions').doc();
            t.set(newTxRef, {
                ...rest,
                wallet: walletName,
                type,
                amount: numAmount,
                userId: req.user.id,
                date: req.body.date || new Date().toISOString()
            });
        });
        
        res.status(201).json({ id: "temp-id", ...req.body, userId: req.user.id });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ message: "Lỗi tạo giao dịch" });
    }
});

app.delete('/api/transactions/:id', authenticate, async (req: any, res: any) => {
    const txRef = db.collection('transactions').doc(req.params.id);
    
    try {
        await db.runTransaction(async (t: any) => {
            const txDoc = await t.get(txRef);
            if (!txDoc.exists || txDoc.data().userId !== req.user.id) {
                throw new Error("Transaction not found");
            }
            const txData = txDoc.data();
            
            // Hoàn tiền
            const wQuery = await t.get(db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', txData.wallet));
            if (!wQuery.empty) {
                const wDoc = wQuery.docs[0];
                const reverseAmount = txData.type === 'expense' ? txData.amount : -txData.amount;
                t.update(wDoc.ref, { balance: wDoc.data().balance + reverseAmount });
            }
            t.delete(txRef);
        });

        await checkAndUnlockAchievements(req.user.id);

        res.json({ success: true });
    } catch (e: any) {
        res.status(404).json({ message: e.message });
    }
});

// 4. BUDGETS & GOALS
app.get('/api/budgets', authenticate, async (req: any, res: any) => {
  const snapshot = await db.collection('budgets').where('userId', '==', req.user.id).get();
  res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/budgets', authenticate, async (req: any, res: any) => {
    const newBudget = { ...req.body, userId: req.user.id, spent: 0 };
    const ref = await db.collection('budgets').add(newBudget);
    await checkAndUnlockAchievements(req.user.id);
    res.status(201).json({ id: ref.id, ...newBudget });
});

app.delete('/api/budgets/:id', authenticate, async (req: any, res: any) => {
    await db.collection('budgets').doc(req.params.id).delete();
    res.json({ success: true });
});

app.get('/api/goals', authenticate, async (req: any, res: any) => {
  const snapshot = await db.collection('goals').where('userId', '==', req.user.id).get();
  res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/goals', authenticate, async (req: any, res: any) => {
    const newGoal = { ...req.body, userId: req.user.id, currentAmount: req.body.currentAmount || 0 };
    const ref = await db.collection('goals').add(newGoal);
    await checkAndUnlockAchievements(req.user.id);
    res.status(201).json({ id: ref.id, ...newGoal });
});

app.post('/api/goals/:id/fund', authenticate, async (req: any, res: any) => {
    const { amount, walletName } = req.body;
    const goalRef = db.collection('goals').doc(req.params.id);

    try {
        await db.runTransaction(async (t: any) => {
            const goalDoc = await t.get(goalRef);
            if (!goalDoc.exists) throw new Error("Goal not found");

            const wQuery = await t.get(db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', walletName));
            if (wQuery.empty) throw new Error("Wallet not found");
            
            const wDoc = wQuery.docs[0];
            if (wDoc.data().balance < amount) throw new Error("Số dư ví không đủ");

            t.update(wDoc.ref, { balance: wDoc.data().balance - amount });
            t.update(goalRef, { currentAmount: goalDoc.data().currentAmount + amount });
        });
        
        const updatedGoal = await goalRef.get();
        await checkAndUnlockAchievements(req.user.id);
        res.json(mapDoc(updatedGoal));
    } catch(e: any) {
        res.status(400).json({ message: e.message });
    }
});

// 5. DEBTS, GROUPS, CATEGORIES, NOTIFICATIONS (Tương tự)
// Giữ nguyên logic các route còn lại như phiên bản trước...
app.get('/api/debts', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('debts').where('userId', '==', req.user.id).get();
    res.json(snapshot.docs.map(mapDoc));
});
app.post('/api/debts', authenticate, async (req: any, res: any) => {
    const newDebt = { ...req.body, userId: req.user.id, paidAmount: 0 };
    const ref = await db.collection('debts').add(newDebt);
    res.status(201).json({ id: ref.id, ...newDebt });
});
app.post('/api/debts/:id/payment', authenticate, async (req: any, res: any) => {
    const debtRef = db.collection('debts').doc(req.params.id);
    const doc = await debtRef.get();
    if(doc.exists && doc.data()?.userId === req.user.id) {
        const newPaid = (doc.data().paidAmount || 0) + req.body.amount;
        await debtRef.update({ paidAmount: newPaid });
        res.json({ ...doc.data(), paidAmount: newPaid });
    } else res.status(404).json({ message: 'Not found' });
});

app.get('/api/groups', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('groups').get();
    res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/groups', authenticate, async (req: any, res: any) => {
    const { name, currency, invitedMemberIds } = req.body; 
    // invitedMemberIds là mảng chứa ID của 2 người kia (không tính người tạo)

    // 1. Validation: Phải mời ít nhất 2 người (cộng người tạo là 3)
    if (!invitedMemberIds || !Array.isArray(invitedMemberIds) || invitedMemberIds.length < 2) {
        return res.status(400).json({ message: "Nhóm phải có tối thiểu 3 thành viên (Bạn + 2 người nữa)." });
    }

    try {
        // 2. Lấy thông tin người tạo (Owner)
        const owner = {
            id: req.user.id,
            name: req.user.name,
            avatar: req.user.avatar
        };

        // 3. Lấy thông tin các thành viên được mời từ Database
        const initialMembers = [owner]; // Bắt đầu với Owner

        // Duyệt qua danh sách ID được mời để lấy thông tin chi tiết (Name, Avatar)
        // Lưu ý: Dùng Promise.all để query song song cho nhanh
        const memberPromises = invitedMemberIds.map(async (uid: string) => {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const uData = userDoc.data();
                return {
                    id: userDoc.id,
                    name: uData.name,
                    avatar: uData.avatar
                };
            }
            return null;
        });

        const invitedMembers = await Promise.all(memberPromises);
        
        // Lọc bỏ những user không tìm thấy (null)
        const validInvitedMembers = invitedMembers.filter((m: any) => m !== null);
        
        // Gộp lại
        initialMembers.push(...validInvitedMembers);

        // 4. Tạo nhóm với danh sách thành viên đầy đủ
        const newGroup = { 
            name, 
            currency, 
            members: initialMembers,
            transactions: [],
            createdAt: new Date().toISOString(),
            createdBy: req.user.id
        };

        const ref = await db.collection('groups').add(newGroup);
        res.status(201).json({ id: ref.id, ...newGroup });

    } catch (e: any) {
        console.error("Lỗi tạo nhóm:", e);
        res.status(500).json({ message: "Lỗi server khi tạo nhóm" });
    }
});

app.get('/api/categories', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('categories').where('userId', '==', req.user.id).get();
    res.json(snapshot.docs.map(mapDoc));
});
app.post('/api/categories', authenticate, async (req: any, res: any) => {
    const newCat = { ...req.body, userId: req.user.id, isCustom: true };
    const ref = await db.collection('categories').add(newCat);
    res.status(201).json({ id: ref.id, ...newCat });
});
app.delete('/api/categories/:name', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('categories').where('userId', '==', req.user.id).where('name', '==', req.params.name).get();
    snapshot.forEach(doc => doc.ref.delete());
    res.json({ success: true });
});

app.get('/api/notifications', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('notifications').where('userId', '==', req.user.id).get();
    res.json(snapshot.docs.map(mapDoc));
});
app.post('/api/notifications/mark-read', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('notifications').where('userId', '==', req.user.id).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => batch.update(doc.ref, { read: true }));
    await batch.commit();
    res.json({ success: true });
});

// AI CHATBOT
// app.post("/api/ai/chat", authenticate, async (req: any, res: any) => {
//     try {
//       const { message, context } = req.body;
//       const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
//       if (!apiKey) throw new Error("Thiếu API Key");
  
//       const ai = new GoogleGenAI({ apiKey });
//       const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
//       const response = await model.generateContent({
//         contents: [{
//             role: "user",
//             parts: [{ text: `Bạn là Mony. Dữ liệu: ${JSON.stringify(context)}. Câu hỏi: ${message}` }]
//         }]
//       });
  
//       res.json({
//         success: true,
//         text: response.response.text(),
//         model: "gemini-1.5-flash"
//       });
//     } catch (error: any) {
//       console.error("Chat error:", error.message);
//       res.status(500).json({ text: "Mony đang bận. Vui lòng thử lại sau.", error: error.message });
//     }
//   });


app.post("/api/ai/chat", authenticate, async (req: any, res: any) => {
  try {
    const { message, context } = req.body;

    // LẤY API KEY GIỐNG AddTransactionModal
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    console.log("API Key check:", apiKey ? "Có" : "Không");
    console.log("Key starts with:", apiKey?.substring(0, 10));

    if (!apiKey) {
      throw new Error("Không tìm thấy API Key. Kiểm tra file .env");
    }

    // KHỞI TẠO SDK GIỐNG HỆT
    const ai = new GoogleGenAI({ apiKey });

    // DÙNG MODEL ĐANG HOẠT ĐỘNG TỐT
    const modelsToTry = [
      "gemini-3-flash-preview",
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Thử model: ${modelName}`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Bạn là Mony – trợ lý tài chính cá nhân. Trả lời ngắn gọn, dễ hiểu.\nCâu hỏi: ${message}`,
        });

        console.log(`✅ Thành công với ${modelName}`);

        return res.json({
          success: true,
          text: response.text,
          model: modelName,
          note: "Dùng cùng hệ thống như phân tích giao dịch tự động",
        });
      } catch (modelErr: any) {
        console.log(`❌ ${modelName} failed:`, modelErr.message);
        continue;
      }
    }

    throw new Error("Tất cả models đều thất bại");
  } catch (error: any) {
    console.error("Chat error:", error.message);

    // MOCK THÔNG MINH – UX KHÔNG BỊ CHẾT
    const mockResponses = [
      `Xin chào! Bạn hỏi về "${req.body?.message}". Tôi là Mony – trợ lý tài chính. Tính năng ✨ phân tích giao dịch tự động vẫn đang hoạt động tốt.`,
      `Hiện chat AI đang bảo trì nhẹ, nhưng bạn vẫn dùng được AI phân tích giao dịch (icon tia lửa ✨).`,
      `Bạn có thể thử nhập: "ăn sáng 50k", "lương tháng 15tr" để dùng AI phân tích giao dịch ngay nhé!`,
    ];

    return res.json({
      success: true,
      text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      model: "mock-aware",
      isMock: true,
      tip: "Dùng AI phân tích giao dịch tự động – đang chạy ổn định!",
    });
  }
});

// EXPORT
app.get('/api/export/transactions', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('transactions').where('userId', '==', req.user.id).get();
    const txs = snapshot.docs.map(mapDoc);
    let csv = "ID,Date,Type,Amount,Category,Wallet,Note\n";
    txs.forEach((t: any) => csv += `${t.id},${t.date},${t.type},${t.amount},${t.category},${t.wallet},${t.payee}\n`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
});

// Thêm vào server.ts

// API Tìm người dùng theo Email (Để mời vào nhóm)
app.post('/api/users/search', authenticate, async (req: any, res: any) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    try {
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1) // Chỉ lấy 1 người
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "Không tìm thấy người dùng với email này." });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Chỉ trả về thông tin public cần thiết (Không trả password!)
        res.json({
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar
        });
    } catch (e: any) {
        res.status(500).json({ message: "Lỗi tìm kiếm" });
    }
});

// API Thêm thành viên vào nhóm
app.post('/api/groups/:id/add-member', authenticate, async (req: any, res: any) => {
    const { userIdToAdd } = req.body; // ID của người cần thêm
    const groupRef = db.collection('groups').doc(req.params.id);

    try {
        await db.runTransaction(async (t: any) => {
            const groupDoc = await t.get(groupRef);
            if (!groupDoc.exists) throw new Error("Nhóm không tồn tại");

            // Lấy thông tin người cần thêm để lưu vào mảng members (cho tiện hiển thị)
            const userToAddDoc = await t.get(db.collection('users').doc(userIdToAdd));
            if (!userToAddDoc.exists) throw new Error("User không tồn tại");
            
            const userData = userToAddDoc.data();
            const newMember = {
                id: userIdToAdd,
                name: userData.name,
                avatar: userData.avatar
            };

            // Lấy danh sách members hiện tại
            const currentMembers = groupDoc.data().members || [];
            
            // Check xem đã có trong nhóm chưa
            const exists = currentMembers.find((m: any) => m.id === userIdToAdd);
            if (exists) throw new Error("Thành viên này đã ở trong nhóm rồi");

            // Update
            t.update(groupRef, {
                members: [...currentMembers, newMember]
            });
        });

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});
// --- API AI ANALYSIS (Phân tích chi tiêu thật – dùng preview model) ---
app.get('/api/ai/analysis', authenticate, async (req: any, res: any) => {
  try {
    // 1. Lấy dữ liệu thật từ Firestore
    const snapshot = await db
      .collection('transactions')
      .where('userId', '==', req.user.id)
      .where('type', '==', 'expense')
      .get();

    if (snapshot.empty) {
      return res.json({
        forecasts: [],
        suggestions: [
          {
            title: "Chưa có dữ liệu",
            description: "Hãy thêm giao dịch để AI có thể phân tích.",
            priority: "low",
          },
        ],
        summary: "Bạn chưa có giao dịch nào.",
      });
    }

    const txs = snapshot.docs.map((doc: any) => doc.data());

    // 2. Tổng hợp chi tiêu theo danh mục
    const categoryTotals: any = {};
    txs.forEach((t: any) => {
      const cat = t.category || "Khác";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    });

    const analysisData = Object.entries(categoryTotals)
      .map(([cat, total]) => `${cat}: ${total} VND`)
      .join(", ");

    // 3. LẤY API KEY – giống hệt chat
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Không tìm thấy API Key");

    const ai = new GoogleGenAI({ apiKey });

    // 4. DÙNG PREVIEW MODEL ĐÃ TEST OK
    const modelName = "gemini-3-flash-preview";

    const prompt = `
Bạn là Mony – trợ lý tài chính cá nhân.
Dữ liệu chi tiêu của người dùng: [${analysisData}].

Hãy:
1. Dự báo chi tiêu tháng tới (tăng/giảm) cho 3 danh mục tốn kém nhất.
2. Đưa ra 2 lời khuyên tiết kiệm cụ thể, ngắn gọn.

Trả về JSON thuần (không markdown, không giải thích):
{
  "forecasts": [
    {
      "category": "Tên danh mục",
      "predictedSpend": số,
      "confidenceInterval": [min, max]
    }
  ],
  "suggestions": [
    {
      "title": "Tiêu đề ngắn",
      "description": "Nội dung khuyên",
      "priority": "high | medium"
    }
  ],
  "summary": "Nhận xét tổng quan 1 câu."
}
`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    // 5. Parse JSON an toàn
    const rawText = response.text;
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(cleanJson);

    return res.json(aiData);
  } catch (error: any) {
    console.error("AI Analysis Error:", error.message);

    // 6. FALLBACK THÔNG MINH – UX KHÔNG CHẾT
    return res.json({
      forecasts: [],
      suggestions: [
        {
          title: "AI đang bận",
          description:
            "Tính năng phân tích chi tiêu đang quá tải. Bạn vẫn có thể dùng AI phân tích giao dịch ✨.",
          priority: "low",
        },
      ],
      summary: "Hệ thống đang bảo trì nhẹ.",
      isMock: true,
    });
  }
});


// --- ADMIN APIs (REAL FIRESTORE DATA) ---

// 1. Lấy số liệu thống kê cho Dashboard
app.get('/api/admin/stats', authenticate, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    try {
        const usersSnap = await db.collection('users').get();
        const activeUsers = usersSnap.docs.filter((d: any) => d.data().status === 'active').length;

        const txSnap = await db.collection('transactions').get();
        const totalTransactions = txSnap.size;

        // --- LOGIC MỚI: TẠO KHUNG 6 THÁNG ---
        const today = new Date();
        const monthlyData = [];

        // 1. Tạo sẵn mảng 6 tháng gần nhất (với doanh thu = 0)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthlyData.push({
                monthLabel: `T${d.getMonth() + 1}`, // Nhãn: T1, T2...
                monthIndex: d.getMonth(),          // Để so sánh
                year: d.getFullYear(),             // Để so sánh năm
                revenue: 0
            });
        }

        // 2. Đổ dữ liệu thật vào khung
        txSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const date = new Date(data.date); // Chuyển chuỗi ISO thành Date

            // Tìm xem giao dịch này thuộc tháng nào trong 6 tháng kia
            const foundMonth = monthlyData.find(m => 
                m.monthIndex === date.getMonth() && 
                m.year === date.getFullYear()
            );

            if (foundMonth) {
                foundMonth.revenue += Number(data.amount);
            }
        });

        // 3. Format lại data để trả về Frontend
        const finalChartData = monthlyData.map(item => ({
            month: item.monthLabel,
            revenue: item.revenue
        }));

        res.json({
            totalUsers: usersSnap.size,
            activeUsers: activeUsers,
            lockedUsers: usersSnap.size - activeUsers,
            totalTransactions: totalTransactions,
            revenue: totalTransactions * 1, 
            monthlyRevenue: finalChartData // Dữ liệu đã lấp đầy 6 tháng
        });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ message: "Lỗi lấy thống kê" });
    }
});

// 2. Lấy danh sách toàn bộ User (Cho trang UserManagement)
app.get('/api/admin/users', authenticate, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    
    const snapshot = await db.collection('users').get();
    // Ẩn mật khẩu trước khi trả về
    const users = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        const { password, ...safeData } = data; 
        return { id: doc.id, ...safeData };
    });
    res.json(users);
});

// 3. Khóa / Mở khóa User
app.post('/api/admin/users/:id/toggle-lock', authenticate, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
        const newStatus = userDoc.data()?.status === 'active' ? 'locked' : 'active';
        await userRef.update({ status: newStatus });
        res.json({ success: true, status: newStatus });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

// 4. Gửi thông báo Broadcast (Gửi cho tất cả mọi người)
app.post('/api/admin/broadcast', authenticate, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    
    const { title, message } = req.body;
    
    try {
        const usersSnap = await db.collection('users').get();
        const batch = db.batch();
        
        usersSnap.docs.forEach((userDoc: any) => {
            const notifRef = db.collection('notifications').doc();
            batch.set(notifRef, {
                userId: userDoc.id,
                title,
                message,
                date: new Date().toISOString(),
                read: false,
                type: 'system'
            });
        });
        
        await batch.commit();
        res.json({ success: true, count: usersSnap.size });
    } catch (e: any) {
        res.status(500).json({ message: "Lỗi gửi thông báo" });
    }
});

// --- HELPER: HỆ THỐNG THÀNH TỰU (ACHIEVEMENTS) ---
const checkAndUnlockAchievements = async (userId: string) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    // Lấy danh sách achievement hiện có (hoặc mảng rỗng nếu chưa có)
    let currentAchievements = userData.achievements || []; 
    const newUnlocked: string[] = [];

    // 1. CHECK: NGƯỜI MỚI BẮT ĐẦU (Có ít nhất 1 giao dịch)
    if (!currentAchievements.includes('beginner')) {
        const txSnap = await db.collection('transactions').where('userId', '==', userId).limit(1).get();
        if (!txSnap.empty) {
            newUnlocked.push('beginner');
        }
    }

    // 2. CHECK: NHÀ HOẠCH ĐỊNH (Có ít nhất 1 ngân sách)
    if (!currentAchievements.includes('planner')) {
        const budgetSnap = await db.collection('budgets').where('userId', '==', userId).limit(1).get();
        if (!budgetSnap.empty) {
            newUnlocked.push('planner');
        }
    }

    // 3. CHECK: NGƯỜI MƠ MỘNG (Có ít nhất 1 mục tiêu)
    if (!currentAchievements.includes('dreamer')) {
        const goalSnap = await db.collection('goals').where('userId', '==', userId).limit(1).get();
        if (!goalSnap.empty) {
            newUnlocked.push('dreamer');
        }
    }

    // 4. CHECK: BẬC THẦY TIẾT KIỆM (Hoàn thành 1 mục tiêu 100%)
    if (!currentAchievements.includes('saver')) {
        const goalSnap = await db.collection('goals').where('userId', '==', userId).get();
        const hasCompletedGoal = goalSnap.docs.some((doc: any) => {
            const g = doc.data();
            return g.currentAmount >= g.targetAmount;
        });
        if (hasCompletedGoal) {
            newUnlocked.push('saver');
        }
    }

    // 5. CHECK: NHÀ ĐẦU TƯ (Nạp tiền 5 lần - Logic: Check transaction type 'fund' hoặc đếm số lần gọi API)
    // Để đơn giản, ta kiểm tra nếu có trên 5 giao dịch tổng quát (hoặc bạn có thể tạo field riêng đếm số lần nạp)
    if (!currentAchievements.includes('investor')) {
         const txSnap = await db.collection('transactions').where('userId', '==', userId).count().get();
         if (txSnap.data().count >= 5) {
             newUnlocked.push('investor');
         }
    }

    if (newUnlocked.length > 0) {
        const updatedList = [...currentAchievements, ...newUnlocked];
        await userRef.update({ achievements: updatedList });
        console.log(`🏆 User ${userId} đã mở khóa: ${newUnlocked.join(', ')}`);
        return newUnlocked; // Trả về để frontend biết mà thông báo
    }
    return [];
};

// --- 1. API ĐĂNG NHẬP GOOGLE ---
app.post('/api/auth/google', async (req: any, res: any) => {
    const { idToken } = req.body;

    try {
        // Xác thực token từ Google gửi về
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid } = decodedToken;

        if (!email) return res.status(400).json({ message: "Google account không có email." });

        // Kiểm tra xem user đã tồn tại trong DB của mình chưa
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        
        let userDoc;
        let userData;
        let isNewOrNoPass = false;

        if (userSnapshot.empty) {
            // A. User mới toanh -> Tạo user mới
            const newUser = {
                name: name || "User",
                email: email,
                password: "", // Để trống vì chưa có pass
                isAdmin: false,
                status: 'active',
                avatar: picture || `https://picsum.photos/seed/${email}/100`,
                createdAt: new Date().toISOString(),
                hasPassword: false // Cờ đánh dấu chưa có pass
            };
            userDoc = await db.collection('users').add(newUser);
            userData = { id: userDoc.id, ...newUser };
            isNewOrNoPass = true; // User mới chắc chắn phải tạo pass
        } else {
            // B. User cũ -> Kiểm tra đã có pass chưa
            userDoc = userSnapshot.docs[0];
            userData = { id: userDoc.id, ...userDoc.data() };
            
            // Nếu password rỗng hoặc field hasPassword = false -> Bắt tạo lại
            if (!userData.password || userData.hasPassword === false) {
                isNewOrNoPass = true;
            }
        }

        if (userData.status === 'locked') {
            return res.status(403).json({ message: 'Tài khoản bị khóa' });
        }

        // Trả về Token và cờ requirePasswordSetup
        res.json({
            success: true,
            token: `mock-jwt-token-${userData.id}`,
            user: userData,
            requirePasswordSetup: isNewOrNoPass // <--- Cờ quan trọng để Frontend biết đường redirect
        });

    } catch (error: any) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Xác thực Google thất bại" });
    }
});

// --- 2. API TẠO MẬT KHẨU MỚI (Dành cho user Google) ---
app.post('/api/auth/set-password', authenticate, async (req: any, res: any) => {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Mật khẩu phải từ 6 ký tự trở lên" });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật vào DB
    await db.collection('users').doc(req.user.id).update({
        password: hashedPassword,
        hasPassword: true // Đánh dấu là đã có pass
    });

    res.json({ success: true, message: "Tạo mật khẩu thành công" });
});

app.listen(PORT, () => console.log(`🚀 Real Firestore Backend running at http://localhost:${PORT}`));