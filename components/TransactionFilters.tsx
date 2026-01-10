import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

export interface FilterValues {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

const TransactionFilters: React.FC<FilterProps> = ({ onFilterChange }) => {
  const { t } = useAppContext();
  
  // State lưu giá trị
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // State lưu lỗi
  const [dateError, setDateError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  // 1. Logic Validation DATE (TC050)
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setDateError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
    pushFilters();
  }, [startDate, endDate]);

  // 2. Logic Validation AMOUNT (TC051)
  const handleAmountChange = (val: string, type: 'min' | 'max') => {
    // Chặn ký tự '-' ngay lập tức
    if (val.includes('-')) {
        setAmountError("Vui lòng không nhập số tiền âm.");
        return; 
    }

    const num = parseFloat(val);
    if (val !== '' && num < 0) {
        setAmountError("Số tiền phải lớn hơn hoặc bằng 0.");
    } else {
        setAmountError(null);
        if (type === 'min') setMinAmount(val);
        else setMaxAmount(val);
    }
  };

  // Gửi dữ liệu ra ngoài khi Valid
  useEffect(() => {
      pushFilters();
  }, [minAmount, maxAmount]);

  const pushFilters = () => {
      // Chỉ gửi dữ liệu nếu không có lỗi ngày
      // (Lỗi amount đã chặn set state nên không cần check ở đây)
      if (!dateError && new Date(startDate) <= new Date(endDate || '9999-12-31')) {
          onFilterChange({ startDate, endDate, minAmount, maxAmount });
      } else if (!startDate && !endDate) {
          onFilterChange({ startDate, endDate, minAmount, maxAmount });
      }
  };

  const commonInputClass = "w-full px-3 py-2 bg-background border border-card-border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all";

  return (
    <div className="p-4 bg-background/50 border-b border-card-border grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-down">
        {/* Lọc theo ngày */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-muted uppercase">Khoảng thời gian</label>
            <div className="flex gap-2">
                <input 
                    type="date" 
                    className={`${commonInputClass} ${dateError ? 'border-danger ring-1 ring-danger' : ''}`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="self-center text-muted">-</span>
                <input 
                    type="date" 
                    className={`${commonInputClass} ${dateError ? 'border-danger ring-1 ring-danger' : ''}`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            {dateError && <p className="text-danger text-xs font-bold mt-1">{dateError}</p>}
        </div>

        {/* Lọc theo tiền */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-muted uppercase">Khoảng tiền (VND)</label>
            <div className="flex gap-2">
                <input 
                    type="number" 
                    placeholder="Min"
                    min="0"
                    className={`${commonInputClass} ${amountError ? 'border-danger' : ''}`}
                    value={minAmount}
                    onChange={(e) => handleAmountChange(e.target.value, 'min')}
                />
                <span className="self-center text-muted">-</span>
                <input 
                    type="number" 
                    placeholder="Max"
                    min="0"
                    className={`${commonInputClass} ${amountError ? 'border-danger' : ''}`}
                    value={maxAmount}
                    onChange={(e) => handleAmountChange(e.target.value, 'max')}
                />
            </div>
            {amountError && <p className="text-danger text-xs font-bold mt-1">{amountError}</p>}
        </div>
    </div>
  );
};

export default TransactionFilters;