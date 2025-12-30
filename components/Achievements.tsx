
import React from 'react';
import Card from './Card';
import { Achievement } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AchievementItemProps {
    achievement: Achievement;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement }) => {
    const { t } = useAppContext();
    return (
        <div className="flex flex-col items-center text-center group">
            <div className={`relative p-3 rounded-full border-2 transition-all duration-300 ${
                achievement.unlocked 
                ? 'bg-success/10 border-success/30' 
                : 'bg-background border-card-border'
            }`}>
                {React.cloneElement(achievement.icon, { 
                    className: `w-7 h-7 transition-colors duration-300 ${
                        achievement.unlocked ? 'text-success' : 'text-muted/50'
                    }`
                })}
                {!achievement.unlocked && <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-[1px]"><LockIcon /></div>}
            </div>
            <p className={`mt-2 text-xs font-semibold ${achievement.unlocked ? 'text-text' : 'text-muted'}`}>
                {t(achievement.titleKey)}
            </p>
            <div className="absolute bottom-full mb-2 w-48 p-2 text-xs text-primary-content bg-text/80 rounded-md scale-0 group-hover:scale-100 transition-transform origin-bottom z-10">
                {t(achievement.descriptionKey)}
            </div>
        </div>
    );
};

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white/70">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);


const Achievements: React.FC = () => {
    const { achievements, t } = useAppContext();
    return (
        <Card title={t('achievements.title')}>
            <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                {achievements.map(ach => (
                    <AchievementItem key={ach.id} achievement={ach} />
                ))}
            </div>
        </Card>
    );
};

export default Achievements;