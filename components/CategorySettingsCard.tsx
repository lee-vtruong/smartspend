import React, { useState, useMemo } from 'react';
import Card from './Card';
import { useAppContext } from '../contexts/AppContext';
import { TransactionCategory } from '../types';
import { iconMap } from '../constants';
import AddEditCategoryModal from './AddEditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
// IMPORT DEFAULT ICON
import { DefaultIcon } from './Icons';

const CategorySettingsCard: React.FC = () => {
    const { 
        t, 
        transactionCategories,
        handleAddCategory,
        handleEditCategory,
        handleDeleteCategory,
        transactions 
    } = useAppContext();

    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<TransactionCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory | null>(null);

    const incomeCategories = useMemo(() => transactionCategories.filter(c => c.type === 'income'), [transactionCategories]);
    const expenseCategories = useMemo(() => transactionCategories.filter(c => c.type === 'expense'), [transactionCategories]);

    const handleOpenAddModal = () => {
        setCategoryToEdit(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (category: TransactionCategory) => {
        setCategoryToEdit(category);
        setAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (category: TransactionCategory) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const handleSaveCategory = (originalName: string | null, data: { name: string; type: 'income' | 'expense'; iconName: string; }) => {
        if (originalName) {
            handleEditCategory(originalName, data);
        } else {
            handleAddCategory(data);
        }
    }
    
    const CategoryList: React.FC<{ title: string; categories: TransactionCategory[] }> = ({ title, categories }) => (
        <div>
            <h4 className="font-semibold text-lg text-text mt-4 mb-2">{title}</h4>
            <div className="space-y-2">
                {categories.map(cat => {
                    // --- FIX QUAN TRỌNG: Fallback an toàn ---
                    const IconComponent = iconMap[cat.iconName] || DefaultIcon;
                    const displayName = cat.isCustom ? cat.name : t(cat.name);
                    
                    return (
                        <div key={cat.name} className="group flex items-center justify-between p-2 bg-background border border-card-border rounded-lg hover:shadow-sm transition-all">
                            <div className="flex items-center">
                                <IconComponent className="w-6 h-6 text-blue-500" />
                                <span className="ml-3 font-medium text-text">{displayName}</span>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenEditModal(cat)} className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" title={t('common.edit')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                                </button>
                                {cat.isCustom && (
                                    <button onClick={() => handleOpenDeleteModal(cat)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title={t('common.delete')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-text">{t('settings.categories.title')}</h3>
                        <p className="text-sm text-muted">{t('settings.categories.description')}</p>
                    </div>
                    <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        {t('settings.categories.add')}
                    </button>
                </div>
                <div className="mt-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    <CategoryList title={t('settings.categories.expense')} categories={expenseCategories} />
                    <CategoryList title={t('settings.categories.income')} categories={incomeCategories} />
                </div>
            </Card>
            
            <AddEditCategoryModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setAddEditModalOpen(false)}
                onSave={handleSaveCategory}
                categoryToEdit={categoryToEdit}
            />

            <DeleteCategoryModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteCategory}
                categoryToDelete={categoryToDelete}
                transactionsCount={transactions.filter(t => t.category === categoryToDelete?.name).length}
            />
        </>
    );
};

export default CategorySettingsCard;