import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { user, logout, t, notifications, unreadNotificationCount, markNotificationsAsRead } = useAppContext();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
            setUserDropdownOpen(false);
        }
        if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
            setNotifDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotifOpen = () => {
      setNotifDropdownOpen(!notifDropdownOpen);
      if (!notifDropdownOpen) { // if we are opening it
          markNotificationsAsRead();
      }
  }

  return (
    <header className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-2xl border-b border-white/30 sticky top-0 z-30">
      <div className="flex items-center">
        <h2 className="text-2xl font-semibold text-text">{t('header.welcome')}</h2>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative" ref={notifDropdownRef}>
          <button onClick={handleNotifOpen} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 relative hover:animate-jiggle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-danger text-white text-xs items-center justify-center">{unreadNotificationCount}</span>
                </span>
            )}
          </button>
          {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-2xl shadow-lg z-50 border border-white/20 animate-fade-in-down">
                <div className="p-3 border-b border-card-border">
                    <h4 className="font-semibold text-text">Notifications</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif.id} className="p-3 border-b border-card-border/50 hover:bg-primary/5">
                                <p className="font-semibold text-sm text-text">{notif.title}</p>
                                <p className="text-sm text-muted">{notif.message}</p>
                                <p className="text-xs text-muted mt-1 text-right">{new Date(notif.date).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted p-4">No new notifications.</p>
                    )}
                </div>
              </div>
          )}
        </div>
        <div className="relative" ref={userDropdownRef}>
          <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 cursor-pointer group">
            <img className="h-10 w-10 rounded-full object-cover" src={user?.avatar} alt="User avatar" />
            <span className="hidden md:block font-medium">{user?.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-muted transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card/70 backdrop-blur-xl rounded-2xl shadow-lg py-1 z-50 border border-white/20 animate-fade-in-down">
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  {t('settings.security.logout')}
                </a>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;