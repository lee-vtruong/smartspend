import React from 'react';
import { Page } from '../types';
import { HandshakeIcon } from '../constants';
import { useAppContext } from '../contexts/AppContext';

const SidebarIcon: React.FC<{ icon: React.JSX.Element; text: string; active: boolean; onClick: () => void }> = ({ icon, text, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center p-3 my-1 rounded-lg transition-all duration-200 group relative ${
      active 
      ? 'bg-primary/10 text-primary font-bold' 
      : 'hover:bg-primary/5 text-muted'
    }`}
  >
    <div className={`absolute left-0 top-0 h-full w-1 rounded-r-full bg-primary transition-transform duration-300 ease-in-out ${active ? 'scale-y-100' : 'scale-y-0'}`}></div>
    {React.cloneElement(icon, { className: `w-6 h-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 ${active ? 'text-primary' : 'text-muted group-hover:text-text'}` })}
    <span className="ml-4 font-medium hidden md:block">{text}</span>
  </button>
);


const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, t, user } = useAppContext();
  const navItems: { page: Page; text: string; icon: React.JSX.Element }[] = [
    { page: 'dashboard', text: t('sidebar.dashboard'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg> },
    { page: 'transactions', text: t('sidebar.transactions'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
    { page: 'reports', text: t('sidebar.reports'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg> },
    { page: 'groups', text: t('sidebar.groups'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 9 10.5V9A4.5 4.5 0 0 1 13.5 4.5v.75m-6 5.25a3.75 3.75 0 0 1-7.5 0v-1.5a3.75 3.75 0 0 1 7.5 0v1.5m-6 0h.008v.008H7.5v-.008Zm1.5 0h.008v.008H9v-.008Zm1.5 0h.008v.008H10.5v-.008Zm1.5 0h.008v.008H12v-.008Zm1.5 0h.008v.008H13.5v-.008Zm1.5 0h.008v.008H15v-.008Zm-12-3a3.75 3.75 0 0 0 0 7.5A3.75 3.75 0 0 0 3 10.5Zm1.5 0h.008v.008H4.5v-.008Zm1.5 0h.008v.008H6v-.008Zm1.5 0h.008v.008H7.5v-.008Zm1.5 0h.008v.008H9v-.008Zm8.25-7.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm-1.5 0h.008v.008H15v-.008Zm1.5 0h.008v.008H16.5v-.008Z" /></svg> },
    { page: 'debts', text: t('sidebar.debts'), icon: <HandshakeIcon /> },
    { page: 'premium', text: t('sidebar.premium'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg> },
  ];
  const adminNavItems: { page: Page; text: string; icon: React.JSX.Element }[] = [
    { page: 'adminDashboard', text: t('admin.sidebar.dashboard'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg> },
    { page: 'userManagement', text: t('admin.sidebar.userManagement'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.253 9.5 9.5 0 0 0-2.12-3.242 9.337 9.337 0 0 0-4.121-2.253 9.38 9.38 0 0 0-2.625.372M15 19.128v-3.872M15 19.128c-1.56 0-3.138-.3-4.5-.85-1.362-.55-2.558-1.272-3.464-2.176a9.338 9.338 0 0 1-2.254-4.121 9.338 9.338 0 0 1 2.254-4.121 9.5 9.5 0 0 1 3.242-2.121c.642-.31 1.302-.555 1.987-.745 1.015-.221 2.054-.333 3.112-.333 1.058 0 2.097.112 3.112.333.685.19 1.345.435 1.987.745 1.243.602 2.37 1.368 3.242 2.121a9.338 9.338 0 0 1 2.254 4.121 9.338 9.338 0 0 1-2.254 4.121 9.5 9.5 0 0 1-3.242 2.121c-.642.31-1.302-.555-1.987-.745-1.015-.221-2.054-.333-3.112-.333-1.058 0-2.097.112-3.112.333Z" /></svg> },
    { page: 'systemReports', text: t('admin.sidebar.systemReports'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-1.621A3 3 0 0 1 14.1 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg> },
    { page: 'notificationsManagement', text: t('admin.sidebar.notifications'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg> },
  ];

  return (
    <aside className="w-20 md:w-64 bg-card/40 backdrop-blur-2xl p-4 flex flex-col border-r border-white/30">
      <div className="flex items-center mb-8 shrink-0 px-1">
        <div className="bg-gradient-to-br from-gradient-from to-gradient-to rounded-full p-2.5 shadow-lg">
          <svg className="w-8 h-8 text-primary-content" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 0-6 0H5.25A2.25 2.25 0 0 0 3 9m18 3h-5.25m-6.75 0H3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold ml-3 hidden md:block text-text">SmartSpend</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {navItems.map(item => (
          <SidebarIcon 
            key={item.page} 
            icon={item.icon} 
            text={item.text} 
            active={currentPage === item.page} 
            onClick={() => setCurrentPage(item.page)} 
          />
        ))}
        {user?.isAdmin && (
            <>
                <div className="mt-4 pt-4 border-t border-card-border">
                    <h3 className="px-3 text-xs font-semibold uppercase text-muted tracking-wider hidden md:block">
                        {t('admin.sidebar.title')}
                    </h3>
                </div>
                {adminNavItems.map(item => (
                    <SidebarIcon 
                        key={item.page}
                        icon={item.icon}
                        text={item.text}
                        active={currentPage === item.page}
                        onClick={() => setCurrentPage(item.page)}
                    />
                ))}
            </>
        )}
      </nav>
      <div className="mt-auto shrink-0">
        <SidebarIcon 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.905c-.008.379.137.752.43.992l1.004.827a1.125 1.125 0 0 1 .26 1.431l-1.296-2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.512 6.512 0 0 1-.22.128c-.333.183-.582.495-.645.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.905c.008-.379-.137-.752-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}
          text={t('sidebar.settings')} 
          active={currentPage === 'settings'}
          onClick={() => setCurrentPage('settings')}
        />
      </div>
    </aside>
  );
};

export default Sidebar;