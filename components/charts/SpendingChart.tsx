

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SpendingData } from '../../types';
import Card from '../Card';
import { useAppContext } from '../../contexts/AppContext';

interface SpendingChartProps {
  data: SpendingData[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const { theme, t } = useAppContext();
  const incomeColor = theme === 'dark' ? '#00FFA3' : theme === 'special' ? '#38A169' : '#3C6255';
  const expenseColor = theme === 'dark' ? '#e74c3c' : theme === 'special' ? '#E53E3E' : '#c0392b';

  return (
    <Card title={t('reports.spendingTrend')}>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
            <XAxis dataKey="period" tick={{ fill: 'var(--color-muted)' }} />
            <YAxis tick={{ fill: 'var(--color-muted)' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)'
              }}
              itemStyle={{ color: 'var(--color-text)' }}
              labelStyle={{ color: 'var(--color-text)', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ color: 'var(--color-text)' }} />
            <Line type="monotone" dataKey="income" name={t('reports.income')} stroke={incomeColor} strokeWidth={2} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="expense" name={t('reports.expense')} stroke={expenseColor} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SpendingChart;