
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AchievementUnlockedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({ achievement, onClose }) => {
  const { t } = useAppContext();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [achievement]);

  if (!achievement) return null;

  return (
    <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
        <div 
            className={`bg-card rounded-2xl shadow-xl w-full max-w-sm m-4 text-center transform transition-all duration-500 ease-out ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'}`} 
            onClick={e => e.stopPropagation()}
        >
            <div className="p-8">
                <div className="w-24 h-24 mx-auto bg-success/10 rounded-full flex items-center justify-center border-4 border-success/20 animate-pulse">
                    {React.cloneElement(achievement.icon, { className: 'w-12 h-12 text-success' })}
                </div>
                <h3 className="text-2xl font-bold mt-4 text-success">{t('achievementUnlocked.title')}</h3>
                <p className="text-xl font-semibold mt-2 text-text">{t(achievement.titleKey)}</p>
                <p className="text-muted mt-1">{t(achievement.descriptionKey)}</p>
                <button 
                    onClick={onClose} 
                    className="mt-6 w-full px-4 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90 transition-opacity"
                >
                    {t('achievementUnlocked.button')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AchievementUnlockedModal;