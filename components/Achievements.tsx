import React from 'react';
import Card from './Card';
import { useAppContext } from '../contexts/AppContext';

const Achievements: React.FC = () => {
    const { user, t } = useAppContext();

    // Định nghĩa danh sách danh hiệu (Badge)
    const BADGES = [
        { id: 'beginner', name: 'Người mới bắt đầu', desc: 'Ghi nhận giao dịch đầu tiên', icon: '🌱' },
        { id: 'planner', name: 'Nhà hoạch định', desc: 'Tạo ngân sách đầu tiên', icon: '📅' },
        { id: 'dreamer', name: 'Người mơ mộng', desc: 'Tạo mục tiêu tài chính', icon: '☁️' },
        { id: 'saver', name: 'Bậc thầy tiết kiệm', desc: 'Hoàn thành 1 mục tiêu', icon: '💰' },
        { id: 'investor', name: 'Nhà đầu tư', desc: 'Thực hiện 5 giao dịch', icon: '📈' },
    ];

    return (
        <Card>
            <h3 className="text-xl font-semibold text-text mb-4">Bộ sưu tập Danh hiệu</h3>
            <div className="grid grid-cols-2 gap-3">
                {BADGES.map(badge => {
                    // Kiểm tra xem user có danh hiệu này trong mảng achievements chưa
                    const isUnlocked = Array.isArray(user?.achievements) && user.achievements.includes(badge.id);
                    
                    return (
                        <div 
                            key={badge.id} 
                            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                                isUnlocked 
                                ? 'bg-primary/5 border-primary shadow-sm scale-105' 
                                : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                            }`}
                        >
                            <div className="text-3xl mb-1">{badge.icon}</div>
                            <h4 className={`font-bold text-sm ${isUnlocked ? 'text-primary' : 'text-muted'}`}>
                                {badge.name}
                            </h4>
                            <p className="text-[10px] text-muted mt-1 leading-tight hidden sm:block">
                                {badge.desc}
                            </p>
                            {isUnlocked && (
                                <span className="text-[10px] font-bold text-success mt-1 bg-success/10 px-2 py-0.5 rounded-full">
                                    ✓ Đã nhận
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default Achievements;