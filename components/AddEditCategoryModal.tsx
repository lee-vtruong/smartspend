import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { TransactionCategory } from '../types';
import { iconMap, ALL_ICONS } from '../constants';
import { useAppContext } from '../contexts/AppContext';

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalName: string | null, data: { name: string; type: 'income' | 'expense'; iconName: string; }) => void;
  categoryToEdit: TransactionCategory | null;
}

const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
    const { t, transactionCategories } = useAppContext();
    const isEditMode = !!categoryToEdit;

    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [iconName, setIconName] = useState('FoodIcon');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && categoryToEdit) {
                setName(categoryToEdit.isCustom ? categoryToEdit.name : t(categoryToEdit.name));
                setType(categoryToEdit.type);
                setIconName(categoryToEdit.iconName);
            } else {
                // Reset for new category
                setName('');
                setType('expense');
                setIconName('FoodIcon');
            }
            setError('');
        }
    }, [isOpen, categoryToEdit, isEditMode, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError(t('settings.addCategory.nameRequired'));
            return;
        }

        const nameExists = transactionCategories.some(
            cat => (cat.isCustom ? cat.name.toLowerCase() === name.trim().toLowerCase() : t(cat.name).toLowerCase() === name.trim().toLowerCase()) && cat.name !== categoryToEdit?.name
        );

        if (nameExists) {
            setError(t('settings.addCategory.nameExists'));
            return;
        }
        
        onSave(isEditMode ? categoryToEdit.name : null, { name: name.trim(), type, iconName });
        onClose();
    };
    
    const commonInputClass = "mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t(isEditMode ? 'settings.addCategory.editTitle' : 'settings.addCategory.title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-danger text-sm text-center bg-danger/10 p-2 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="cat-name" className="block text-sm font-medium text-muted">{t('settings.addCategory.nameLabel')}</label>
                    <input
                        id="cat-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={commonInputClass}
                        placeholder={t('settings.addCategory.namePlaceholder')}
                        required
                        disabled={isEditMode && !categoryToEdit?.isCustom}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted">{t('settings.addCategory.typeLabel')}</label>
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-background p-1 mt-1">
                        <button type="button" onClick={() => setType('expense')} disabled={isEditMode} className={`py-2 text-center font-semibold rounded-md transition-all ${type === 'expense' ? 'bg-card shadow text-danger' : 'text-muted'} ${isEditMode ? 'cursor-not-allowed opacity-50' : 'hover:bg-card/50'}`}>{t('addTransaction.expense')}</button>
                        <button type="button" onClick={() => setType('income')} disabled={isEditMode} className={`py-2 text-center font-semibold rounded-md transition-all ${type === 'income' ? 'bg-card shadow text-success' : 'text-muted'} ${isEditMode ? 'cursor-not-allowed opacity-50' : 'hover:bg-card/50'}`}>{t('addTransaction.income')}</button>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-muted">{t('settings.addCategory.iconLabel')}</label>
                    <div className="mt-2 grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-background rounded-lg">
                        {ALL_ICONS.map(key => {
                            const IconComponent = iconMap[key];
                            return (
                                <button
                                    type="button"
                                    key={key}
                                    onClick={() => setIconName(key)}
                                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${iconName === key ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-primary/5'}`}
                                >
                                    <IconComponent className="w-6 h-6 text-text" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-text bg-background hover:bg-gray-200 dark:hover:bg-gray-700">{t('common.cancel')}</button>
                    <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90">{t(isEditMode ? 'common.saveChanges' : 'common.add')}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEditCategoryModal;
