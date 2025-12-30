import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { useAppContext } from '../../contexts/AppContext';

const UserManagement: React.FC = () => {
    const { systemUsers, toggleUserLock, t } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return systemUsers;
        return systemUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [systemUsers, searchTerm]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-text mb-6">{t('admin.userManagement.title')}</h2>
            <Card>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder={t('admin.userManagement.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-card-border">
                        <thead className="bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('admin.userManagement.table.user')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('admin.userManagement.table.status')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('admin.userManagement.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-card-border">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text">{user.name}</div>
                                                <div className="text-sm text-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                        }`}>
                                            {t(user.status === 'active' ? 'admin.userManagement.statusActive' : 'admin.userManagement.statusLocked')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => toggleUserLock(user.id)} className={`px-3 py-1 rounded-md text-sm ${
                                            user.status === 'active' ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-success/10 text-success hover:bg-success/20'
                                        }`}>
                                            {t(user.status === 'active' ? 'admin.userManagement.lockAction' : 'admin.userManagement.unlockAction')}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-muted">{t('admin.userManagement.noUsersFound')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default UserManagement;