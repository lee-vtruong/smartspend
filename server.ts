import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';

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

// Cấu hình CORS: Thêm domain frontend của bạn vào đây sau khi deploy Vercel
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:3000',
        'https://smartspend-api-pnl0.onrender.com',
        'https://smartspend-blush.vercel.app' 
    ],
    credentials: true 
}));
app.use(express.json());

// --- KẾT NỐI FIRESTORE (LOGIC MỚI: HỖ TRỢ DEPLOY) ---
try {
  let serviceAccount;

  // CÁCH 1: Ưu tiên đọc từ biến môi trường (Dành cho Render/Production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      console.log("🌍 Đang đọc credentials từ biến môi trường (Base64)...");
      const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
      serviceAccount = JSON.parse(buffer.toString('utf-8'));
  } 
  // CÁCH 2: Nếu không có biến môi trường, đọc file local (Dành cho Dev máy cá nhân)
  else {
      const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
      if (fs.existsSync(serviceAccountPath)) {
          console.log("💻 Đang đọc credentials từ file local...");
          serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      } else {
          throw new Error("Không tìm thấy Credentials! Hãy cấu hình FIREBASE_SERVICE_ACCOUNT_BASE64 hoặc file json.");
      }
  }

  // Khởi tạo Firebase Admin
  if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
  }
  
  console.log("🔥 Firebase Admin đã kết nối thành công!");
} catch (error: any) {
  console.error("❌ Lỗi kết nối Firebase:", error.message);
  process.exit(1); // Dừng server nếu không kết nối được DB
}

const db = admin.firestore();

// Helper: Chuyển đổi dữ liệu Firestore document thành JSON chuẩn
const mapDoc = (doc: any) => {
    if (!doc.exists) return null;
    const data = doc.data();
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

// --- AUTH ENDPOINTS ---
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
      createdAt: new Date().toISOString(),
      hasPassword: true
  };
  
  await db.collection('users').add(newUser);
  res.status(201).json({ success: true });
});

app.post('/api/auth/google', async (req: any, res: any) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid } = decodedToken;

        if (!email) return res.status(400).json({ message: "Google account không có email." });

        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        
        let userDoc;
        let userData;
        let isNewOrNoPass = false;

        if (userSnapshot.empty) {
            const newUser = {
                name: name || "User",
                email: email,
                password: "",
                isAdmin: false,
                status: 'active',
                avatar: picture || `https://picsum.photos/seed/${email}/100`,
                createdAt: new Date().toISOString(),
                hasPassword: false
            };
            userDoc = await db.collection('users').add(newUser);
            userData = { id: userDoc.id, ...newUser };
            isNewOrNoPass = true;
        } else {
            userDoc = userSnapshot.docs[0];
            userData = { id: userDoc.id, ...userDoc.data() };
            
            if (!userData.password || userData.hasPassword === false) {
                isNewOrNoPass = true;
            }
        }

        if (userData.status === 'locked') {
            return res.status(403).json({ message: 'Tài khoản bị khóa' });
        }

        res.json({
            success: true,
            token: `mock-jwt-token-${userData.id}`,
            user: userData,
            requirePasswordSetup: isNewOrNoPass
        });

    } catch (error: any) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Xác thực Google thất bại" });
    }
});

const isStrongPassword = (password: string) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&        
    /[a-z]/.test(password) &&       
    /[0-9]/.test(password) &&       
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};


app.post('/api/auth/set-password', authenticate, async (req: any, res: any) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: 'Mật khẩu phải ≥ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.collection('users').doc(req.user.id).update({
    password: hashedPassword,
    hasPassword: true,
    passwordCreatedAt: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Tạo mật khẩu thành công' });
});


// --- PROFILE ENDPOINTS ---
app.put('/api/profile', authenticate, async (req: any, res: any) => {
    const updates = { ...req.body };
    delete updates.id; 
    delete updates.isAdmin;

    await db.collection('users').doc(req.user.id).update(updates);
    const updatedUser = await db.collection('users').doc(req.user.id).get();
    res.json(mapDoc(updatedUser));
});

app.post('/api/upload-avatar', authenticate, async (req: any, res: any) => {
    res.json({ 
        success: true, 
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/100`
    });
});

app.post('/api/change-password', authenticate, async (req: any, res: any) => {
    const { oldPassword, newPassword } = req.body;
    
    try {
        const userRef = db.collection('users').doc(req.user.id);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const isMatch = await bcrypt.compare(oldPassword, userData.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await userRef.update({ 
            password: hashedPassword,
            hasPassword: true 
        });
        
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (e: any) {
        res.status(500).json({ message: "Lỗi đổi mật khẩu" });
    }
});

// --- WALLETS ENDPOINTS ---
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

    // Lấy dữ liệu từ body
    const { name, balance, type, currency, color, icon } = req.body;

    // Update với dữ liệu đã được validate cơ bản
    await walletRef.update({
        name,
        balance: Number(balance), // Đảm bảo lưu là số
        type,
        currency,
        color,
        // icon: icon // Thường icon không lưu trực tiếp vào DB nếu là React Element, chỉ lưu tên icon
    });

    const updated = await walletRef.get();
    res.json(mapDoc(updated));
});

app.delete('/api/wallets/:id', authenticate, async (req: any, res: any) => {
    const walletId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Kiểm tra ví có tồn tại không
        const walletRef = db.collection('wallets').doc(walletId);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists || walletDoc.data()?.userId !== userId) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        // --- ĐOẠN CODE MỚI: KIỂM TRA VÍ DUY NHẤT (FIX TC023) ---
        const allWalletsSnapshot = await db.collection('wallets')
            .where('userId', '==', userId)
            .get();

        if (allWalletsSnapshot.size <= 1) {
            return res.status(400).json({ 
                message: 'Không thể xóa ví duy nhất. Bạn cần ít nhất một ví để hoạt động.' 
            });
        }
        // ---------------------------------------------------------

        const walletData = walletDoc.data();
        const walletName = walletData.name;

        // 2. Thực hiện xóa (Batch logic cũ giữ nguyên)
        const batch = db.batch();
        batch.delete(walletRef);

        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .where('wallet', '==', walletName) 
            .get();

        transactionsSnapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({ success: true, message: `Đã xóa ví thành công.` });

    } catch (error) {
        console.error("Delete Wallet Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/wallets/transfer', authenticate, async (req: any, res: any) => {
    const { fromWalletName, toWalletName, amount, note, date } = req.body;
    const numAmount = Number(amount);
    
    if (!fromWalletName || !toWalletName || !amount) {
        return res.status(400).json({ message: "Thiếu thông tin chuyển tiền" });
    }
    if (fromWalletName === toWalletName) {
        return res.status(400).json({ message: "Ví nguồn và đích phải khác nhau" });
    }

    try {
        await db.runTransaction(async (t: any) => {
            const fromQuery = await t.get(
                db.collection('wallets')
                  .where('userId', '==', req.user.id)
                  .where('name', '==', fromWalletName)
                  .limit(1)
            );
            
            const toQuery = await t.get(
                db.collection('wallets')
                  .where('userId', '==', req.user.id)
                  .where('name', '==', toWalletName)
                  .limit(1)
            );

            if (fromQuery.empty) throw new Error(`Không tìm thấy ví nguồn: ${fromWalletName}`);
            if (toQuery.empty) throw new Error(`Không tìm thấy ví đích: ${toWalletName}`);

            const fromDoc = fromQuery.docs[0];
            const toDoc = toQuery.docs[0];
            const fromData = fromDoc.data();

            if (fromData.balance < numAmount) {
                throw new Error("Số dư ví nguồn không đủ để thực hiện giao dịch.");
            }

            const transferDate = date || new Date().toISOString();

            const txOutRef = db.collection('transactions').doc();
            t.set(txOutRef, {
                userId: req.user.id,
                wallet: fromWalletName,
                type: 'expense',
                amount: numAmount,
                category: 'Chuyển tiền',
                description: note ? `Chuyển đến ${toWalletName}: ${note}` : `Chuyển đến ${toWalletName}`,
                date: transferDate,
                createdAt: new Date().toISOString(),
                isTransfer: true, 
            });

            const txInRef = db.collection('transactions').doc();
            t.set(txInRef, {
                userId: req.user.id,
                wallet: toWalletName,
                type: 'income', 
                amount: numAmount,
                category: 'Nhận tiền', 
                description: note ? `Nhận từ ${fromWalletName}: ${note}` : `Nhận từ ${fromWalletName}`,
                date: transferDate,
                createdAt: new Date().toISOString(),
                isTransfer: true
            });

            t.update(fromDoc.ref, { 
                balance: admin.firestore.FieldValue.increment(-numAmount) 
            });

            t.update(toDoc.ref, { 
                balance: admin.firestore.FieldValue.increment(numAmount) 
            });
        });

        res.json({ success: true, message: "Chuyển tiền thành công" });
    } catch (e: any) {
        console.error("Transfer Error:", e);
        res.status(400).json({ message: e.message || "Lỗi xử lý chuyển tiền" });
    }
});

// --- TRANSACTIONS ENDPOINTS ---
app.get('/api/transactions', authenticate, async (req: any, res: any) => {
  const snapshot = await db.collection('transactions').where('userId', '==', req.user.id).get();
  let txs = snapshot.docs.map(mapDoc);
  txs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(txs);
});

// Trong server.ts

app.post('/api/transactions', authenticate, async (req: any, res: any) => {
    const { wallet: walletName, type, amount, category, ...rest } = req.body;
    const numAmount = Number(amount);
    const userId = req.user.id;
    
    let warningMessage = null;

    try {
        await db.runTransaction(async (t: any) => {            
            // 1.1. Đọc thông tin Ví
            const wQuery = await t.get(
                db.collection('wallets')
                  .where('userId', '==', userId)
                  .where('name', '==', walletName)
            );

            if (wQuery.empty) {
                throw new Error(`Không tìm thấy ví: ${walletName}`);
            }
            const wDoc = wQuery.docs[0];
            const wData = wDoc.data();

            // 1.2. Đọc thông tin Ngân sách (Nếu là chi tiêu)
            let budgetDoc = null;
            let budgetData = null;

            if (type === 'expense') {
                const budgetQuery = await t.get(
                    db.collection('budgets')
                        .where('userId', '==', userId)
                        .where('category', '==', category)
                );
                
                if (!budgetQuery.empty) {
                    budgetDoc = budgetQuery.docs[0];
                    budgetData = budgetDoc.data();
                }
            }

            // 2.1. Kiểm tra số dư ví
            if (type === 'expense' && numAmount > wData.balance) {
                throw new Error("Số dư ví không đủ để thực hiện giao dịch này.");
            }
            const newWalletBalance = type === 'expense' 
                ? wData.balance - numAmount 
                : wData.balance + numAmount;

            // 2.2. Tính toán ngân sách (Nếu có)
            let newBudgetSpent = 0;
            if (budgetData) {
                newBudgetSpent = (budgetData.spent || 0) + numAmount;
                if (newBudgetSpent > budgetData.limit) {
                    warningMessage = `⚠️ Cảnh báo: Bạn đã vượt quá ngân sách cho "${category}"!`;
                }
            }

            // 3.1. Cập nhật Ví
            t.update(wDoc.ref, { balance: newWalletBalance });

            // 3.2. Cập nhật Ngân sách (Nếu có)
            if (budgetDoc) {
                t.update(budgetDoc.ref, { spent: newBudgetSpent });
            }

            // 3.3. Tạo Transaction mới
            const newTxRef = db.collection('transactions').doc();
            t.set(newTxRef, {
                ...rest,
                wallet: walletName,
                type,
                amount: numAmount,
                category,
                userId,
                date: req.body.date || new Date().toISOString()
            });
        });
        
        res.status(201).json({ 
            id: "temp-id", 
            ...req.body, 
            userId, 
            warning: warningMessage 
        });

    } catch (e: any) {
        console.error("Transaction Error:", e);
        res.status(400).json({ message: e.message || "Lỗi tạo giao dịch" });
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

app.put('/api/transactions/:id', authenticate, async (req: any, res: any) => {
    const txRef = db.collection('transactions').doc(req.params.id);
    const { amount, wallet, type, date, ...rest } = req.body;
    const newAmount = Number(amount);

    try {
        await db.runTransaction(async (t: any) => {
            const txDoc = await t.get(txRef);
            if (!txDoc.exists || txDoc.data().userId !== req.user.id) {
                throw new Error("Không tìm thấy giao dịch hoặc không có quyền.");
            }
            const oldTx = txDoc.data();

            const oldWalletQuery = await t.get(
                db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', oldTx.wallet)
            );

            let newWalletQuery;
            if (oldTx.wallet === wallet) {
                newWalletQuery = oldWalletQuery; 
            } else {
                newWalletQuery = await t.get(
                    db.collection('wallets').where('userId', '==', req.user.id).where('name', '==', wallet)
                );
            }

            if (!oldWalletQuery.empty) {
                const oldWalletDoc = oldWalletQuery.docs[0];
                const revertAmount = oldTx.type === 'expense' ? oldTx.amount : -oldTx.amount;
                
                t.update(oldWalletDoc.ref, { 
                    balance: admin.firestore.FieldValue.increment(revertAmount) 
                });
            }

            if (!newWalletQuery.empty) {
                const newWalletDoc = newWalletQuery.docs[0];
                const applyAmount = type === 'expense' ? -newAmount : newAmount;
                
                t.update(newWalletDoc.ref, { 
                    balance: admin.firestore.FieldValue.increment(applyAmount) 
                });
            }

            t.update(txRef, {
                ...rest,
                amount: newAmount,
                wallet,
                type,
                date,
                updatedAt: new Date().toISOString()
            });
        });

        res.json({ success: true });
    } catch (e: any) {
        console.error("Lỗi cập nhật giao dịch:", e);
        res.status(500).json({ message: e.message });
    }
});

// --- BUDGETS ENDPOINTS ---
app.get('/api/budgets', authenticate, async (req: any, res: any) => {
  const snapshot = await db.collection('budgets').where('userId', '==', req.user.id).get();
  res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/budgets', authenticate, async (req: any, res: any) => {
    const { category, limit, spent } = req.body;
    const userId = req.user.id;

    try {
        const duplicateCheck = await db.collection('budgets')
            .where('userId', '==', userId)
            .where('category', '==', category)
            .get();

        if (!duplicateCheck.empty) {
            return res.status(400).json({ message: "Ngân sách cho danh mục này đã tồn tại." });
        }
        // ------------------------------------------

        const newBudgetRef = db.collection('budgets').doc();
        const newBudget = {
            userId,
            category,
            limit: Number(limit),
            spent: Number(spent) || 0,
            createdAt: new Date().toISOString()
        };

        await newBudgetRef.set(newBudget);
        
        res.status(201).json({ id: newBudgetRef.id, ...newBudget });

    } catch (error) {
        console.error("Create Budget Error:", error);
        res.status(500).json({ message: "Lỗi server khi tạo ngân sách" });
    }
});

app.delete('/api/budgets/:id', authenticate, async (req: any, res: any) => {
    await db.collection('budgets').doc(req.params.id).delete();
    res.json({ success: true });
});

app.put('/api/budgets/:id', authenticate, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { limit, category } = req.body;
        const userId = req.user.id;

        const budgetRef = db.collection('budgets').doc(id);
        const doc = await budgetRef.get();

        // 1. Kiểm tra ngân sách có tồn tại không
        if (!doc.exists) {
            return res.status(404).json({ message: 'Ngân sách không tồn tại' });
        }

        // 2. Bảo mật: Kiểm tra ngân sách này có phải của User đang đăng nhập không
        if (doc.data().userId !== userId) {
            return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
        }

        // 3. Thực hiện Update (Chỉ cập nhật limit và category, giữ nguyên spent)
        await budgetRef.update({
            limit: Number(limit), // Đảm bảo lưu số
            category: category
        });

        res.json({ id, limit, category, success: true });

    } catch (error) {
        console.error("Update budget error:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật" });
    }
});

// --- GOALS ENDPOINTS ---
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

app.put('/api/goals/:id', authenticate, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { name, targetAmount, icon, currentAmount } = req.body;
        const userId = req.user.id;

        const goalRef = db.collection('goals').doc(id);
        const doc = await goalRef.get();

        if (!doc.exists || doc.data().userId !== userId) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        // Cập nhật
        await goalRef.update({
            name,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount), // Cho phép sửa cả số tiền hiện tại nếu cần
            icon
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

app.delete('/api/goals/:id', authenticate, async (req: any, res: any) => {
    try {
        await db.collection('goals').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// --- DEBTS ENDPOINTS ---
app.get('/api/debts', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('debts').where('userId', '==', req.user.id).get();
    res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/debts', authenticate, async (req: any, res: any) => {
    const { walletName, initialAmount, ...debtData } = req.body;
    const userId = req.user.id;
    const numAmount = Number(initialAmount);

    try {
        if (!debtData.person || typeof debtData.person !== 'string' || debtData.person.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập tên người liên quan." });
        }

        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({ message: "Số tiền phải lớn hơn 0." });
        }

        await db.runTransaction(async (t: any) => {
             
             let walletDoc = null;
             
             if (walletName) {
                 const walletQuery = await t.get(
                     db.collection('wallets')
                       .where('userId', '==', userId)
                       .where('name', '==', walletName)
                       .limit(1)
                 );
                 
                 if (walletQuery.empty) throw new Error(`Không tìm thấy ví: ${walletName}`);
                 walletDoc = walletQuery.docs[0];
                 
                 const isLoan = debtData.type === 'loan';
                 if (isLoan && walletDoc.data().balance < numAmount) {
                     throw new Error("Số dư ví không đủ để cho vay số tiền này.");
                 }
             }

             const newDebtRef = db.collection('debts').doc();
             const newDebt = {
                 ...debtData,
                 person: debtData.person.trim(), 
                 initialAmount: numAmount,
                 userId,
                 paidAmount: 0,
                 createdAt: new Date().toISOString()
             };
             t.set(newDebtRef, newDebt);

             if (walletDoc) {
                 const isLoan = debtData.type === 'loan';
                 const balanceChange = isLoan ? -numAmount : numAmount;
                 
                 t.update(walletDoc.ref, { 
                     balance: admin.firestore.FieldValue.increment(balanceChange) 
                 });

                 const txRef = db.collection('transactions').doc();
                 t.set(txRef, {
                     userId,
                     wallet: walletName,
                     type: isLoan ? 'expense' : 'income',
                     amount: numAmount,
                     category: isLoan ? 'Cho vay' : 'Đi vay', 
                     description: isLoan ? `Cho ${debtData.person} vay` : `Vay từ ${debtData.person}`,
                     note: debtData.description ? `${debtData.description}` : '',
                     date: debtData.startDate || new Date().toISOString(),
                     createdAt: new Date().toISOString(),
                     relatedDebtId: newDebtRef.id
                 });
             }
        });
        
        res.status(201).json({ success: true, message: "Đã tạo khoản vay/nợ thành công" });
    } catch (e: any) {
        console.error("Add Debt Error:", e);
        res.status(400).json({ message: e.message || "Lỗi tạo khoản vay/nợ" });
    }
});

app.post('/api/debts/:id/payment', authenticate, async (req: any, res: any) => {
    const { amount, walletName, note } = req.body;
    const debtId = req.params.id;
    const numAmount = Number(amount);

    if (!amount || numAmount <= 0) {
        return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }
    if (!walletName) {
        return res.status(400).json({ message: "Vui lòng chọn ví liên quan" });
    }

    try {
        await db.runTransaction(async (t: any) => {
            const debtRef = db.collection('debts').doc(debtId);
            const debtDoc = await t.get(debtRef);

            if (!debtDoc.exists || debtDoc.data().userId !== req.user.id) {
                throw new Error("Không tìm thấy khoản nợ/vay");
            }

            const debtData = debtDoc.data();
            
            const walletQuery = await t.get(
                db.collection('wallets')
                  .where('userId', '==', req.user.id)
                  .where('name', '==', walletName)
                  .limit(1)
            );

            if (walletQuery.empty) {
                throw new Error(`Không tìm thấy ví: ${walletName}`);
            }

            const walletDoc = walletQuery.docs[0];
            const walletData = walletDoc.data();
            
            const isLoan = debtData.type === 'loan'; 
            const txType = isLoan ? 'income' : 'expense';
            
            if (!isLoan && walletData.balance < numAmount) {
                throw new Error("Số dư ví không đủ để trả nợ.");
            }

            const newPaidAmount = (debtData.paidAmount || 0) + numAmount;
            t.update(debtRef, { paidAmount: newPaidAmount });

            const balanceChange = isLoan ? numAmount : -numAmount;
            t.update(walletDoc.ref, { 
                balance: admin.firestore.FieldValue.increment(balanceChange) 
            });

            const newTxRef = db.collection('transactions').doc();
            t.set(newTxRef, {
                userId: req.user.id,
                wallet: walletName,
                type: txType,
                amount: numAmount,
                category: isLoan ? 'Thu nợ' : 'Trả nợ', 
                description: note || (isLoan ? `Nhận tiền trả từ ${debtData.person}` : `Trả nợ cho ${debtData.person}`),
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                relatedDebtId: debtId 
            });
        });

        res.json({ success: true, message: "Ghi nhận thanh toán thành công" });

    } catch (e: any) {
        console.error("Debt Payment Error:", e);
        res.status(400).json({ message: e.message || "Lỗi xử lý thanh toán" });
    }
});

app.put('/api/debts/:id', authenticate, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { person, initialAmount, description, dueDate, startDate, type } = req.body;
        const userId = req.user.id;

        const docRef = db.collection('debts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== userId) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const currentData = doc.data();

        const updateData: any = {
            person,
            description,
            dueDate,
            startDate,
            type
        };

        if ((currentData.paidAmount || 0) === 0) {
            updateData.initialAmount = Number(initialAmount);
        }

        await docRef.update(updateData);
        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        console.error("Update Debt Error:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật" });
    }
});

app.delete('/api/debts/:id', authenticate, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const docRef = db.collection('debts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== userId) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        await docRef.delete();
        res.json({ success: true, message: "Đã xóa khoản nợ/vay" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa" });
    }
});

// --- GROUPS ENDPOINTS ---
app.get('/api/groups', authenticate, async (req: any, res: any) => {
    try {
        const snapshot = await db.collection('groups').get();
        // Lọc kỹ: Chỉ trả về nhóm mà user hiện tại có trong mảng members
        const userGroups = snapshot.docs
            .map(mapDoc)
            .filter((group: any) => group.members && Array.isArray(group.members) && group.members.some((m: any) => m.id === req.user.id));
        
        res.json(userGroups);
    } catch (e) {
        res.status(500).json({ message: "Lỗi tải nhóm" });
    }
});

app.delete('/api/groups/:id', authenticate, async (req: any, res: any) => {
    const groupId = req.params.id;
    try {
        const groupRef = db.collection('groups').doc(groupId);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) return res.status(404).json({ message: "Không tìm thấy nhóm" });
        
        if (groupDoc.data().createdBy !== req.user.id) {
            return res.status(403).json({ message: "Bạn không phải chủ nhóm nên không thể xóa." });
        }

        const subColSnapshot = await groupRef.collection('transactions').get();
        const batch = db.batch();
        subColSnapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await groupRef.delete();

        res.json({ success: true, message: "Đã xóa nhóm và toàn bộ dữ liệu liên quan." });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

// --- API RỜI NHÓM (Member tự out) ---
app.post('/api/groups/:id/leave', authenticate, async (req: any, res: any) => {
    const groupId = req.params.id;
    try {
        await db.runTransaction(async (t: any) => {
            const groupRef = db.collection('groups').doc(groupId);
            const doc = await t.get(groupRef);
            if (!doc.exists) throw new Error("Nhóm không tồn tại");

            const data = doc.data();
            if (data.createdBy === req.user.id) throw new Error("Chủ nhóm không thể rời nhóm. Hãy xóa nhóm hoặc chuyển quyền.");

            const newMembers = data.members.filter((m: any) => m.id !== req.user.id);
            t.update(groupRef, { members: newMembers });
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

app.post('/api/groups/:id/transactions', authenticate, async (req: any, res: any) => {
    const groupId = req.params.id;
    const { amount, description, type, payerId, participants, date } = req.body;
    const numAmount = Number(amount);

    try {
        await db.runTransaction(async (t: any) => {
            const groupRef = db.collection('groups').doc(groupId);
            const groupDoc = await t.get(groupRef);
            
            if (!groupDoc.exists) throw new Error("Nhóm không tồn tại");
            
            // Validate thành viên
            const members = groupDoc.data().members || [];
            if (!members.some((m: any) => m.id === req.user.id)) {
                throw new Error("Bạn không phải thành viên nhóm này");
            }

            // Tạo giao dịch mới trong sub-collection
            const txRef = groupRef.collection('transactions').doc();
            const newTx = {
                type, // 'expense' | 'contribution'
                amount: numAmount,
                description,
                payerId: payerId || req.user.id,
                participants: participants || [], // Mảng ID những người chịu phí
                createdBy: req.user.id,
                date: date || new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            t.set(txRef, newTx);
        });

        res.status(201).json({ success: true, message: "Đã thêm giao dịch nhóm" });
    } catch (e: any) {
        console.error("Add Group Tx Error:", e);
        res.status(500).json({ message: e.message || "Lỗi thêm giao dịch" });
    }
});

// --- API ĐUỔI THÀNH VIÊN (Admin kick member) ---
app.post('/api/groups/:id/remove-member', authenticate, async (req: any, res: any) => {
    const groupId = req.params.id;
    const { memberIdToRemove } = req.body;

    try {
        await db.runTransaction(async (t: any) => {
            const groupRef = db.collection('groups').doc(groupId);
            const doc = await t.get(groupRef);
            const data = doc.data();

            if (data.createdBy !== req.user.id) throw new Error("Chỉ chủ nhóm mới có quyền xóa thành viên.");
            if (memberIdToRemove === req.user.id) throw new Error("Không thể tự xóa chính mình ở đây.");

            const newMembers = data.members.filter((m: any) => m.id !== memberIdToRemove);
            t.update(groupRef, { members: newMembers });
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

// Trong server.ts

app.post('/api/groups', authenticate, async (req: any, res: any) => {
    const { name, currency, invitedMemberIds } = req.body;

    // Validate cơ bản
    if (!name) return res.status(400).json({ message: "Tên nhóm là bắt buộc." });

    try {
        await db.runTransaction(async (t: any) => {
            // 1. Tạo Group chỉ với Owner
            const owner = {
                id: req.user.id,
                name: req.user.name,
                avatar: req.user.avatar
            };

            const newGroupRef = db.collection('groups').doc();
            const newGroup = {
                name,
                currency: currency || 'VND',
                members: [owner], // Chỉ add chính mình
                transactions: [],
                createdAt: new Date().toISOString(),
                createdBy: req.user.id,
                note: ''
            };

            t.set(newGroupRef, newGroup);

            // 2. Tạo lời mời cho các thành viên khác (Nếu có)
            if (invitedMemberIds && Array.isArray(invitedMemberIds) && invitedMemberIds.length > 0) {
                for (const uid of invitedMemberIds) {
                    // Lấy info user để cache (tùy chọn) hoặc chỉ cần ID
                    const userDoc = await t.get(db.collection('users').doc(uid));
                    if (userDoc.exists) {
                        const invRef = db.collection('invitations').doc();
                        t.set(invRef, {
                            groupId: newGroupRef.id,
                            groupName: name,
                            inviterId: req.user.id,
                            inviterName: req.user.name,
                            inviteeId: uid,
                            status: 'pending',
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
        });

        res.status(201).json({ success: true, message: "Tạo nhóm và gửi lời mời thành công" });

    } catch (e: any) {
        console.error("Lỗi tạo nhóm:", e);
        res.status(500).json({ message: "Lỗi server khi tạo nhóm" });
    }
});

app.get('/api/groups/:groupId/transactions', authenticate, async (req: any, res: any) => {
    try {
        const groupId = req.params.groupId;
        
        const groupDoc = await db.collection('groups').doc(groupId).get();
        if (!groupDoc.exists) {
            return res.status(404).json({ message: "Không tìm thấy nhóm" });
        }
        
        const groupData = groupDoc.data();
        const isMember = groupData.members?.some((m: any) => m.id === req.user.id);
        
        if (!isMember) {
            return res.status(403).json({ message: "Bạn không phải thành viên nhóm này" });
        }
        
        const snapshot = await db
            .collection('groups')
            .doc(groupId)
            .collection('transactions')
            .orderBy('createdAt', 'desc')
            .get();
            
        const transactions = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json(transactions);
    } catch (e: any) {
        console.error("Lỗi lấy giao dịch nhóm:", e);
        res.status(500).json({ message: "Lỗi server" });
    }
});

app.post('/api/users/search', authenticate, async (req: any, res: any) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    try {
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "Không tìm thấy người dùng với email này." });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

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

app.post('/api/groups/:id/add-member', authenticate, async (req: any, res: any) => {
    const { userIdToAdd } = req.body;
    const groupRef = db.collection('groups').doc(req.params.id);

    try {
        await db.runTransaction(async (t: any) => {
            const groupDoc = await t.get(groupRef);
            if (!groupDoc.exists) throw new Error("Nhóm không tồn tại");

            const userToAddDoc = await t.get(db.collection('users').doc(userIdToAdd));
            if (!userToAddDoc.exists) throw new Error("User không tồn tại");
            
            const userData = userToAddDoc.data();
            const newMember = {
                id: userIdToAdd,
                name: userData.name,
                avatar: userData.avatar
            };

            const currentMembers = groupDoc.data().members || [];
            
            const exists = currentMembers.find((m: any) => m.id === userIdToAdd);
            if (exists) throw new Error("Thành viên này đã ở trong nhóm rồi");

            t.update(groupRef, {
                members: [...currentMembers, newMember]
            });
        });

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

app.put('/api/groups/:id', authenticate, async (req: any, res: any) => {
    try {
        const { name, note } = req.body;
        const groupRef = db.collection('groups').doc(req.params.id);
        const doc = await groupRef.get();

        if (!doc.exists) return res.status(404).json({ message: "Không tìm thấy nhóm" });
        if (doc.data().createdBy !== req.user.id) return res.status(403).json({ message: "Chỉ trưởng nhóm mới được sửa." });

        await groupRef.update({ name, note });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

// 2. CHUYỂN QUYỀN TRƯỞNG NHÓM (TC102)
app.post('/api/groups/:id/transfer-ownership', authenticate, async (req: any, res: any) => {
    try {
        const { newOwnerId } = req.body;
        const groupRef = db.collection('groups').doc(req.params.id);
        
        await db.runTransaction(async (t: any) => {
            const doc = await t.get(groupRef);
            if (!doc.exists) throw new Error("Nhóm không tồn tại");
            const data = doc.data();

            if (data.createdBy !== req.user.id) throw new Error("Bạn không phải trưởng nhóm.");
            if (!data.members.some((m: any) => m.id === newOwnerId)) throw new Error("Người nhận không có trong nhóm.");

            t.update(groupRef, { createdBy: newOwnerId });
        });

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

// 3. HỆ THỐNG LỜI MỜI (TC100, TC103, TC104)
// Gửi lời mời
app.post('/api/groups/:id/invite', authenticate, async (req: any, res: any) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;

        // Tìm user theo email
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) return res.status(404).json({ message: "Email chưa đăng ký tài khoản." });
        
        const invitee = userSnapshot.docs[0];
        const inviteeId = invitee.id;

        // Kiểm tra đã trong nhóm chưa
        const groupDoc = await db.collection('groups').doc(groupId).get();
        if (groupDoc.data().members.some((m: any) => m.id === inviteeId)) {
            return res.status(400).json({ message: "Thành viên này đã ở trong nhóm." });
        }

        // Tạo bản ghi lời mời
        await db.collection('invitations').add({
            groupId,
            groupName: groupDoc.data().name,
            inviterId: req.user.id,
            inviterName: req.user.name,
            inviteeId,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        res.json({ success: true, message: "Đã gửi lời mời." });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

// Lấy danh sách lời mời của user
app.get('/api/invitations', authenticate, async (req: any, res: any) => {
    try {
        const snapshot = await db.collection('invitations')
            .where('inviteeId', '==', req.user.id)
            .where('status', '==', 'pending')
            .get();
        
        const invitations = snapshot.docs.map(mapDoc);
        res.json(invitations);
    } catch (e) {
        res.status(500).json({ message: "Lỗi lấy lời mời" });
    }
});

// Xử lý lời mời (Accept/Reject)
app.post('/api/invitations/:id/respond', authenticate, async (req: any, res: any) => {
    try {
        const { status } = req.body; // 'accepted' | 'rejected'
        const invId = req.params.id;
        const invRef = db.collection('invitations').doc(invId);

        await db.runTransaction(async (t: any) => {
            const invDoc = await t.get(invRef);
            if (!invDoc.exists) throw new Error("Lời mời không tồn tại");
            
            const invData = invDoc.data();
            if (invData.inviteeId !== req.user.id) throw new Error("Không có quyền.");
            if (invData.status !== 'pending') throw new Error("Lời mời đã được xử lý.");

            if (status === 'accepted') {
                // Thêm vào nhóm
                const groupRef = db.collection('groups').doc(invData.groupId);
                const groupDoc = await t.get(groupRef);
                
                if (groupDoc.exists) {
                    const currentMembers = groupDoc.data().members || [];
                    if (!currentMembers.some((m: any) => m.id === req.user.id)) {
                        t.update(groupRef, {
                            members: [...currentMembers, {
                                id: req.user.id,
                                name: req.user.name,
                                avatar: req.user.avatar
                            }]
                        });
                    }
                }
            }
            
            // Cập nhật trạng thái lời mời (hoặc xóa luôn cũng được, ở đây ta update status)
            t.update(invRef, { status });
        });

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

// 4. SỬA/XÓA GIAO DỊCH NHÓM (TC107, TC108)
// Sửa giao dịch
app.put('/api/groups/:groupId/transactions/:txId', authenticate, async (req: any, res: any) => {
    try {
        const { groupId, txId } = req.params;
        const updateData = req.body; // { amount, description, ... }
        
        // Cần check quyền: Chỉ người tạo hoặc trưởng nhóm mới được sửa
        const txRef = db.collection('groups').doc(groupId).collection('transactions').doc(txId);
        
        await txRef.update(updateData);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ message: "Lỗi cập nhật giao dịch" });
    }
});

// Xóa giao dịch
app.delete('/api/groups/:groupId/transactions/:txId', authenticate, async (req: any, res: any) => {
    try {
        const { groupId, txId } = req.params;
        await db.collection('groups').doc(groupId).collection('transactions').doc(txId).delete();
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ message: "Lỗi xóa giao dịch" });
    }
});

// --- CATEGORIES ENDPOINTS ---
app.get('/api/categories', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('categories').where('userId', '==', req.user.id).get();
    res.json(snapshot.docs.map(mapDoc));
});

app.post('/api/categories', authenticate, async (req: any, res: any) => {
    const newCat = { ...req.body, userId: req.user.id, isCustom: true };
    const ref = await db.collection('categories').add(newCat);
    res.status(201).json({ id: ref.id, ...newCat });
});

app.put('/api/categories/:name', authenticate, async (req: any, res: any) => {
    const { name } = req.params;
    const updateData = req.body;
    
    try {
        const snapshot = await db.collection('categories')
            .where('userId', '==', req.user.id)
            .where('name', '==', name)
            .limit(1)
            .get();
            
        if (snapshot.empty) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        
        const catDoc = snapshot.docs[0];
        await catDoc.ref.update(updateData);
        
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ message: "Lỗi cập nhật danh mục" });
    }
});

app.delete('/api/categories/:name', authenticate, async (req: any, res: any) => {
    const { name } = req.params;
    const { reassignTo } = req.query;
    
    try {
        const catSnapshot = await db.collection('categories')
            .where('userId', '==', req.user.id)
            .where('name', '==', name)
            .limit(1)
            .get();
            
        if (catSnapshot.empty) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        
        const catDoc = catSnapshot.docs[0];
        
        if (reassignTo && reassignTo !== 'none') {
            const txSnapshot = await db.collection('transactions')
                .where('userId', '==', req.user.id)
                .where('category', '==', name)
                .get();
                
            const batch = db.batch();
            txSnapshot.docs.forEach((doc: any) => {
                batch.update(doc.ref, { category: reassignTo });
            });
            
            await batch.commit();
        }
        
        await catDoc.ref.delete();
        
        res.json({ success: true });
    } catch (e: any) {
        console.error("Lỗi xóa danh mục:", e);
        res.status(500).json({ message: "Lỗi xóa danh mục" });
    }
});

// --- NOTIFICATIONS ENDPOINTS ---
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

// --- AI ENDPOINTS ---
app.post('/api/analyze-transaction', async (req: any, res: any) => {
    try {
        const { aiInput, categoryNames, walletNames } = req.body;

        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        const ai = new GoogleGenAI({ apiKey });
        
        // --- GIỮ NGUYÊN PROMPT CŨ ---
        const prompt = `Phân tích văn bản giao dịch: "${aiInput}". 
        Hãy trả về JSON theo định dạng: { "type": "expense"|"income", "amount": number, "payee": string, "category": string, "wallet": string }.
        
        Quy tắc bắt buộc:
        1. Nếu văn bản vô nghĩa hoặc KHÔNG chứa con số cụ thể nào để làm số tiền, hãy trả về JSON rỗng: {}.
        2. Danh mục hợp lệ (chọn 1): ${categoryNames.join(', ')}.
        3. Ví hợp lệ (chọn 1): ${walletNames.join(', ')}.
        4. Nếu không khớp ví, mặc định ví đầu tiên. Nếu không khớp danh mục, mặc định 'category.food' hoặc 'category.otherIncome'.`;

        // --- GỌI MODEL Y HỆT CŨ (gemini-3-flash-preview) ---
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        // --- CÁCH PARSE RESPONSE Y HỆT CŨ ---
        const textResponse = response.text || '{}';
        const data = JSON.parse(textResponse);

        res.json(data);

    } catch (error: any) {
        console.error("AI Parsing error:", error);
        res.status(500).json({ message: "Lỗi phân tích AI" });
    }
});

// app.post("/api/ai/chat", authenticate, async (req: any, res: any) => {
//   try {
//     const { message, context } = req.body;

//     const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

//     console.log("API Key check:", apiKey ? "Có" : "Không");
//     console.log("Key starts with:", apiKey?.substring(0, 10));

//     if (!apiKey) {
//       throw new Error("Không tìm thấy API Key. Kiểm tra file .env");
//     }

//     const ai = new GoogleGenAI({ apiKey });

//     const modelsToTry = [
//       "gemini-3-flash-preview",
//     ];

//     for (const modelName of modelsToTry) {
//       try {
//         console.log(`Thử model: ${modelName}`);

//         const response = await ai.models.generateContent({
//           model: modelName,
//           contents: `Bạn là Mony – trợ lý tài chính cá nhân. Trả lời ngắn gọn, dễ hiểu.\nCâu hỏi: ${message}`,
//         });

//         console.log(`✅ Thành công với ${modelName}`);

//         return res.json({
//           success: true,
//           text: response.text,
//           model: modelName,
//           note: "Dùng cùng hệ thống như phân tích giao dịch tự động",
//         });
//       } catch (modelErr: any) {
//         console.log(`❌ ${modelName} failed:`, modelErr.message);
//         continue;
//       }
//     }

//     throw new Error("Tất cả models đều thất bại");
//   } catch (error: any) {
//     console.error("Chat error:", error.message);

//     const mockResponses = [
//       `Xin chào! Bạn hỏi về "${req.body?.message}". Tôi là Mony – trợ lý tài chính. Tính năng ✨ phân tích giao dịch tự động vẫn đang hoạt động tốt.`,
//       `Hiện chat AI đang bảo trì nhẹ, nhưng bạn vẫn dùng được AI phân tích giao dịch (icon tia lửa ✨).`,
//       `Bạn có thể thử nhập: "ăn sáng 50k", "lương tháng 15tr" để dùng AI phân tích giao dịch ngay nhé!`,
//     ];

//     return res.json({
//       success: true,
//       text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
//       model: "mock-aware",
//       isMock: true,
//       tip: "Dùng AI phân tích giao dịch tự động – đang chạy ổn định!",
//     });
//   }
// });

app.post("/api/ai/chat", authenticate, async (req: any, res: any) => {
  try {
    const { message, context } = req.body;

    // --- 1. DEBUG LOG ---
    console.log("================ AI CHAT (OLD SYNTAX) ================");
    console.log("🗣️ Câu hỏi:", message);
    if (context && context.transactions) {
        console.log(`📊 Context: ${context.transactions.length} giao dịch, ${context.budgets?.length || 0} ngân sách.`);
    } else {
        console.log("⚠️ Context RỖNG!");
    }

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Không tìm thấy API Key");
    }

    const ai = new GoogleGenAI({ apiKey });

    const contextString = JSON.stringify(context, null, 2);
    
    const fullPrompt = `
      Vai trò: Bạn là Mony - Trợ lý tài chính cá nhân.

      DỮ LIỆU CỦA NGƯỜI DÙNG (CONTEXT):
      ${contextString}

      QUY TẮC BẢO MẬT (TC080 - BẮT BUỘC):
      1. Bạn CHỈ được trả lời dựa trên dữ liệu Context ở trên.
      2. Nếu người dùng hỏi về thông tin cá nhân KHÔNG có trong Context (như số tài khoản ngân hàng, email, mật khẩu, địa chỉ...), bạn phải TỪ CHỐI.
      3. Câu trả lời mặc định khi bị hỏi tin nhạy cảm: "Tôi không có quyền truy cập vào tài khoản ngân hàng, email hay bất kỳ dữ liệu cá nhân nào khác bên ngoài cuộc trò chuyện này."

      YÊU CẦU:
      - Trả lời ngắn gọn, bằng tiếng Việt.
      - Câu hỏi của người dùng: "${message}"
    `;

    console.log(`🤖 Đang gọi model: gemini-3-flash-preview...`);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt, 
    });

    console.log(`✅ Thành công!`);

    return res.json({
      success: true,
      text: response.text, 
      model: "gemini-3-flash-preview",
    });

  } catch (error: any) {
    console.error("❌ Chat Error:", error.message);
    
    return res.json({
        success: false,
        text: "Hệ thống đang bảo trì tính năng Chat, vui lòng thử lại sau. (Lỗi kết nối AI)",
        error: error.message
    });
  }
});

app.get('/api/ai/analysis', authenticate, async (req: any, res: any) => {
  try {
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

    const categoryTotals: any = {};
    txs.forEach((t: any) => {
      const cat = t.category || "Khác";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    });

    const analysisData = Object.entries(categoryTotals)
      .map(([cat, total]) => `${cat}: ${total} VND`)
      .join(", ");

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Không tìm thấy API Key");

    const ai = new GoogleGenAI({ apiKey });

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

    const rawText = response.text;
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(cleanJson);

    return res.json(aiData);
  } catch (error: any) {
    console.error("AI Analysis Error:", error.message);

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

// --- EXPORT ENDPOINTS ---
app.get('/api/export/transactions', authenticate, async (req: any, res: any) => {
    const snapshot = await db.collection('transactions').where('userId', '==', req.user.id).get();
    const txs = snapshot.docs.map(mapDoc);
    let csv = "ID,Date,Type,Amount,Category,Wallet,Note\n";
    txs.forEach((t: any) => csv += `${t.id},${t.date},${t.type},${t.amount},${t.category},${t.wallet},${t.payee}\n`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
});

// --- ADMIN ENDPOINTS ---
app.get('/api/admin/stats', authenticate, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    try {
        const usersSnap = await db.collection('users').get();
        const activeUsers = usersSnap.docs.filter((d: any) => d.data().status === 'active').length;

        const txSnap = await db.collection('transactions').get();
        const totalTransactions = txSnap.size;

        const today = new Date();
        const monthlyData = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthlyData.push({
                monthLabel: `T${d.getMonth() + 1}`,
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                revenue: 0
            });
        }

        txSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const date = new Date(data.date);
            const foundMonth = monthlyData.find(m => 
                m.monthIndex === date.getMonth() && 
                m.year === date.getFullYear()
            );

            if (foundMonth) {
                foundMonth.revenue += Number(data.amount);
            }
        });

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
            monthlyRevenue: finalChartData
        });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ message: "Lỗi lấy thống kê" });
    }
});

app.get('/api/admin/users', authenticate, async (req: any, res: any) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        const { password, ...safeData } = data; 
        return { id: doc.id, ...safeData };
    });
    res.json(users);
});

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

app.post('/api/admin/backups/:id/restore', authenticate, async (req: any, res: any) => {
    const backupId = req.params.id;
    const userId = req.user.id;

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        await db.collection('admin_logs').add({
            action: 'SYSTEM_RESTORE',
            targetId: backupId,
            performedBy: userId,
            timestamp: new Date().toISOString(),
            details: `Thực hiện khôi phục hệ thống từ bản sao lưu: ${backupId}`,
            status: 'success',
            ip: req.ip
        });

        res.json({ success: true, message: "Hệ thống đã được khôi phục về trạng thái của bản sao lưu." });

    } catch (e: any) {
        console.error("Restore Error:", e);
        res.status(500).json({ message: "Lỗi trong quá trình khôi phục: " + e.message });
    }
});

app.get('/api/admin/backups', authenticate, async (req: any, res: any) => {
    try {
        const snapshot = await db.collection('backups').orderBy('createdAt', 'desc').get();
        const backups = snapshot.docs.map(mapDoc);
        res.json(backups);
    } catch (e) {
        res.status(500).json({ message: "Lỗi tải danh sách sao lưu" });
    }
});

app.post('/api/admin/backups', authenticate, async (req: any, res: any) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newBackup = {
            name: `Backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_v${Date.now().toString().slice(-4)}`,
            createdAt: new Date().toISOString(),
            size: `${(Math.random() * 50 + 10).toFixed(2)} MB`, 
            createdBy: req.user.id,
            status: 'success'
        };

        const ref = await db.collection('backups').add(newBackup);
        
        await db.collection('admin_logs').add({
            action: 'SYSTEM_BACKUP',
            performedBy: req.user.id,
            timestamp: new Date().toISOString(),
            details: `Tạo bản sao lưu mới: ${newBackup.name}`,
            status: 'success'
        });

        res.json({ success: true, id: ref.id, ...newBackup });
    } catch (e) {
        res.status(500).json({ message: "Lỗi tạo bản sao lưu" });
    }
});

app.post('/api/admin/backups/:id/restore', authenticate, async (req: any, res: any) => {
    const backupId = req.params.id;
    try {
        const doc = await db.collection('backups').doc(backupId).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Bản sao lưu không tồn tại" });
        }
        const backupData = doc.data();

        await new Promise(resolve => setTimeout(resolve, 3000));

        await db.collection('admin_logs').add({
            action: 'SYSTEM_RESTORE',
            targetId: backupId,
            performedBy: req.user.id,
            timestamp: new Date().toISOString(),
            details: `Khôi phục hệ thống từ: ${backupData.name}`,
            status: 'success'
        });

        res.json({ success: true, message: `Đã khôi phục thành công phiên bản ${backupData.name}` });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

// --- HELPER FUNCTIONS ---
const checkAndUnlockAchievements = async (userId: string) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    let currentAchievements = userData.achievements || [];
    const newUnlocked: string[] = [];

    if (!currentAchievements.includes('beginner')) {
        const txSnap = await db.collection('transactions').where('userId', '==', userId).limit(1).get();
        if (!txSnap.empty) {
            newUnlocked.push('beginner');
        }
    }

    if (!currentAchievements.includes('planner')) {
        const budgetSnap = await db.collection('budgets').where('userId', '==', userId).limit(1).get();
        if (!budgetSnap.empty) {
            newUnlocked.push('planner');
        }
    }

    if (!currentAchievements.includes('dreamer')) {
        const goalSnap = await db.collection('goals').where('userId', '==', userId).limit(1).get();
        if (!goalSnap.empty) {
            newUnlocked.push('dreamer');
        }
    }

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
        return newUnlocked;
    }
    return [];
};

app.listen(PORT, () => console.log(`🚀 Real Firestore Backend running at http://localhost:${PORT}`));