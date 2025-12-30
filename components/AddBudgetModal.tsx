import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Budget } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  existingCategories: string[];
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onAdd, existingCategories }) => {
  const { t, transactionCategories } = useAppContext();
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(0);

  const availableCategories = transactionCategories
    .filter(c => c.type === 'expense' && !existingCategories.includes(c.name));

  useEffect(() => {
    if (isOpen) {
      if (availableCategories.length > 0) {
        setCategory(availableCategories[0].name);
      } else {
        setCategory('');
      }
      setLimit(0);
    }
  }, [isOpen, transactionCategories]); // Rerun when transactionCategories changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || limit <= 0) {
      alert(t('addBudget.validationError'));
      return;
    }
    onAdd({ category, limit });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addBudget.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="budget-category" className="block text-sm font-medium text-muted">{t('addBudget.categoryLabel')}</label>
          {availableCategories.length > 0 ? (
            <select
              id="budget-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-card border-card-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              {availableCategories.map(c => <option key={c.name} value={c.name}>{c.isCustom ? c.name : t(c.name)}</option>)}
            </select>
          ) : (
            <p className="mt-1 text-sm text-muted p-2 bg-background rounded-md">{t('addBudget.allCategoriesAssigned')}</p>
          )}
        </div>
        <div>
          <label htmlFor="budget-limit" className="block text-sm font-medium text-muted">{t('addBudget.limitLabel')}</label>
          <input
            type="number"
            id="budget-limit"
            value={limit}
            onChange={(e) => setLimit(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-card border-card-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder={t('addBudget.limitPlaceholder')}
            required
            min="1"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">{t('common.cancel')}</button>
          <button 
            type="submit" 
            className="bg-primary text-primary-content px-4 py-2 rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed" 
            disabled={availableCategories.length === 0 || limit <= 0}
          >
            {t('addBudget.addButton')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBudgetModal;