import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { TransactionCategory } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryToDeleteName: string, reassignToCategoryName: string) => void;
  categoryToDelete: TransactionCategory | null;
  transactionsCount: number;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({ isOpen, onClose, onConfirm, categoryToDelete, transactionsCount }) => {
    const { t, transactionCategories } = useAppContext();
    const [reassignTo, setReassignTo] = useState('');

    const availableCategoriesForReassignment = transactionCategories.filter(
        c => c.type === categoryToDelete?.type && c.name !== categoryToDelete?.name
    );

    useEffect(() => {
        if (isOpen && availableCategoriesForReassignment.length > 0) {
            setReassignTo(availableCategoriesForReassignment[0].name);
        }
    }, [isOpen, availableCategoriesForReassignment]);

    if (!categoryToDelete) return null;

    const displayName = categoryToDelete.isCustom ? categoryToDelete.name : t(categoryToDelete.name);

    const handleConfirm = () => {
        if (transactionsCount > 0 && !reassignTo) {
            alert('Please select a category to reassign transactions to.');
            return;
        }
        onConfirm(categoryToDelete.name, reassignTo);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings.deleteCategory.title')}>
            <div className="space-y-4">
                <p className="text-center text-muted">
                    {transactionsCount > 0
                        ? t('settings.deleteCategory.warning', { categoryName: displayName, count: transactionsCount })
                        : t('settings.deleteCategory.warningNoTransactions', { categoryName: displayName })
                    }
                </p>

                {transactionsCount > 0 && (
                    <div>
                        <label htmlFor="reassign-category" className="block text-sm font-medium text-muted">{t('settings.deleteCategory.reassignLabel')}</label>
                        <select
                            id="reassign-category"
                            value={reassignTo}
                            onChange={(e) => setReassignTo(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {availableCategoriesForReassignment.map(c => (
                                <option key={c.name} value={c.name}>
                                    {c.isCustom ? c.name : t(c.name)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-text bg-background hover:bg-gray-200 dark:hover:bg-gray-700">{t('common.cancel')}</button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-6 py-2 rounded-lg font-semibold bg-danger text-white hover:opacity-90 disabled:bg-danger/50 disabled:cursor-not-allowed"
                        disabled={transactionsCount > 0 && availableCategoriesForReassignment.length === 0}
                    >
                        {t('settings.deleteCategory.confirmButton')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteCategoryModal;
