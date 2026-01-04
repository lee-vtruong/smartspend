import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const CreatePassword = () => {
    const [password, setPasswordInput] = useState('');
    
    // ✅ SỬA Ở ĐÂY: Lấy hàm setPassword từ Context
    const { setPassword } = useAppContext(); 
    
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            // ✅ SỬA Ở ĐÂY: Gọi hàm trực tiếp
            await setPassword(password);
            
            alert("Tạo mật khẩu thành công! Bạn có thể sử dụng đầy đủ tính năng.");
            navigate('/'); 
        } catch (err: any) {
            alert("Lỗi: " + (err.message || err));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-card-border">
                <h2 className="text-2xl font-bold mb-4 text-center text-text">Tạo mật khẩu mới</h2>
                <p className="text-muted text-sm mb-6 text-center">
                    Vì bạn đăng nhập bằng Google lần đầu, vui lòng tạo mật khẩu riêng cho tài khoản SmartSpend để tăng cường bảo mật.
                </p>
                
                <div className="mb-6">
                    <label className="block text-sm font-bold text-text mb-2">Mật khẩu mới</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPasswordInput(e.target.value)}
                        placeholder="Nhập ít nhất 6 ký tự..."
                        className="w-full p-3 rounded-lg bg-background border border-card-border focus:ring-2 focus:ring-primary/50 outline-none"
                        required
                        minLength={6}
                    />
                </div>

                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-focus transition-all">
                    Lưu mật khẩu & Tiếp tục
                </button>
            </form>
        </div>
    );
};

export default CreatePassword;