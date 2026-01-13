import React from 'react';
import Card from './Card';
import { useAppContext } from '../contexts/AppContext';

const Achievements: React.FC = () => {
    const { user, t } = useAppContext();

    // Định nghĩa danh sách danh hiệu (Badge) với gradient colors
    const BADGES = [
        { 
            id: 'beginner', 
            name: 'Người mới bắt đầu', 
            desc: 'Ghi nhận giao dịch đầu tiên', 
            icon: '🌱',
            color: 'from-emerald-400 to-emerald-300',
            bgColor: 'from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/20 dark:to-emerald-950/10'
        },
        { 
            id: 'planner', 
            name: 'Nhà hoạch định', 
            desc: 'Tạo ngân sách đầu tiên', 
            icon: '📅',
            color: 'from-blue-400 to-blue-300',
            bgColor: 'from-blue-50/80 to-blue-100/60 dark:from-blue-900/20 dark:to-blue-950/10'
        },
        { 
            id: 'dreamer', 
            name: 'Người mơ mộng', 
            desc: 'Tạo mục tiêu tài chính', 
            icon: '☁️',
            color: 'from-purple-400 to-purple-300',
            bgColor: 'from-purple-50/80 to-purple-100/60 dark:from-purple-900/20 dark:to-purple-950/10'
        },
        { 
            id: 'saver', 
            name: 'Bậc thầy tiết kiệm', 
            desc: 'Hoàn thành 1 mục tiêu', 
            icon: '💰',
            color: 'from-amber-400 to-amber-300',
            bgColor: 'from-amber-50/80 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-950/10'
        },
        { 
            id: 'investor', 
            name: 'Nhà đầu tư', 
            desc: 'Thực hiện 5 giao dịch', 
            icon: '📈',
            color: 'from-cyan-400 to-cyan-300',
            bgColor: 'from-cyan-50/80 to-cyan-100/60 dark:from-cyan-900/20 dark:to-cyan-950/10'
        },
    ];

    // Tính tổng số danh hiệu đã mở khóa
    const unlockedCount = BADGES.filter(badge => 
        Array.isArray(user?.achievements) && user.achievements.includes(badge.id)
    ).length;

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                        Bộ sưu tập Danh hiệu
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {unlockedCount}/{BADGES.length} danh hiệu đã mở khóa
                    </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg shadow-md">
                    {unlockedCount}
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BADGES.map(badge => {
                    // Kiểm tra xem user có danh hiệu này trong mảng achievements chưa
                    const isUnlocked = Array.isArray(user?.achievements) && user.achievements.includes(badge.id);
                    
                    return (
                        <div 
                            key={badge.id} 
                            className={`
                                relative 
                                flex 
                                flex-col 
                                items-center 
                                p-4 
                                rounded-xl 
                                border 
                                text-center 
                                transition-all 
                                duration-300 
                                hover:scale-[1.03] 
                                hover:shadow-lg
                                ${isUnlocked 
                                    ? `bg-gradient-to-br ${badge.bgColor} border-gray-200/60 dark:border-white/15 hover:border-primary/30` 
                                    : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-white/5 opacity-60 grayscale hover:opacity-80'
                                }
                            `}
                        >
                            {/* Background glow for unlocked badges */}
                            {isUnlocked && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-5 blur-sm rounded-xl`}></div>
                            )}
                            
                            {/* Icon container */}
                            <div className={`
                                relative 
                                flex 
                                items-center 
                                justify-center 
                                w-16 
                                h-16 
                                rounded-2xl 
                                mb-3 
                                text-2xl 
                                transition-all 
                                duration-300
                                ${isUnlocked 
                                    ? `bg-gradient-to-br ${badge.color} shadow-md` 
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }
                            `}>
                                <span className={`${isUnlocked ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {badge.icon}
                                </span>
                                
                                {/* Unlock checkmark */}
                                {isUnlocked && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* Badge name */}
                            <h4 className={`
                                font-bold 
                                text-sm 
                                mb-1 
                                tracking-tight
                                ${isUnlocked 
                                    ? 'text-gray-800 dark:text-gray-100' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }
                            `}>
                                {badge.name}
                            </h4>
                            
                            {/* Badge description */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight min-h-[32px]">
                                {badge.desc}
                            </p>
                            
                            {/* Status indicator */}
                            <div className={`mt-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                isUnlocked 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                                {isUnlocked ? '✓ Đã nhận' : 'Chưa mở khóa'}
                            </div>
                            
                            {/* Hover effect line */}
                            {isUnlocked && (
                                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r ${badge.color} rounded-full transition-all duration-300 group-hover:w-16`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Progress bar */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Tiến độ danh hiệu
                    </span>
                    <span className="text-xs font-bold text-primary">
                        {Math.round((unlockedCount / BADGES.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Hoàn thành tất cả danh hiệu để trở thành Bậc thầy tài chính!
                </p>
            </div>
        </Card>
    );
};

export default Achievements;