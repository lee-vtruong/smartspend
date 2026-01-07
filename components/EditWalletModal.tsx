import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Wallet } from '../types';
import { CashIcon, BankIcon, EWalletIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Wallet) => void;
  walletToEdit: Wallet | null;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ isOpen, onClose, onSave, walletToEdit }) => {
  const { t } = useAppContext();
  const [name, setName] = useState('');
  const [type, setType] = useState<'Cash' | 'Bank' | 'E-Wallet'>('Cash');
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setType(walletToEdit.type);
      setCurrency(walletToEdit.currency);
    }
  }, [walletToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !walletToEdit) {
      alert('Vui lòng nhập tên ví!');
      return;
    }
    onSave({
      ...walletToEdit,
      name,
      type,
      currency,
    });
    onClose();
  };

  const walletTypeOptions = [
    { type: 'Cash', icon: CashIcon, text: t('addWallet.walletType.cash') },
    { type: 'Bank', icon: BankIcon, text: t('addWallet.walletType.bank') },
    { type: 'E-Wallet', icon: EWalletIcon, text: t('addWallet.walletType.e-wallet') },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('editWallet.title')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="edit-wallet-name" className="block text-sm font-medium text-muted mb-1">{t('addWallet.nameLabel')}</label>
          <input
            type="text"
            id="edit-wallet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
            required
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted mb-2">{t('addWallet.typeLabel')}</label>
            <div className="grid grid-cols-3 gap-3">
                {walletTypeOptions.map(option => (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => setType(option.type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors duration-200 ${type === option.type ? 'border-primary bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50'}`}
                    >
                        <option.icon className="w-7 h-7 mb-2" />
                        <span className="text-sm font-semibold">{option.text}</span>
                    </button>
                ))}
            </div>
        </div>
        
         <div>
          <label htmlFor="edit-wallet-currency" className="block text-sm font-medium text-muted mb-1">{t('addWallet.currencyLabel')}</label>
          <select
            id="edit-wallet-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="mt-1 block w-full pl-4 pr-10 py-2 text-base bg-background border-card-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm rounded-lg"
          >
            <option>VND</option>
            <option>USD</option>
          </select>
        </div>

        <p className="text-xs text-muted text-center">{t('editWallet.balanceNote')}</p>

        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-text bg-background hover:bg-gray-200 dark:hover:bg-gray-700">{t('common.cancel')}</button>
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-content hover:opacity-90 transition-opacity">{t('common.saveChanges')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditWalletModal;