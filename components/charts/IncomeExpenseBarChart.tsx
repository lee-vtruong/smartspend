
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SpendingData } from '../../types';
import Card from '../Card';
import { useAppContext } from '../../contexts/AppContext';

interface IncomeExpenseBarChartProps {
  data: SpendingData[];
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ data }) => {
  const { theme, t } = useAppContext();
  const incomeColor = theme === 'dark' ? '#00FFA3' : theme === 'special' ? '#38A169' : '#3C6255';
  const expenseColor = theme === 'dark' ? '#e74c3c' : theme === 'special' ? '#E53E3E' : '#c0392b';

  return (
    <Card title={t('reports.incomeVsExpense')}>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
            <XAxis dataKey="period" tick={{ fill: 'var(--color-muted)' }} />
            <YAxis tick={{ fill: 'var(--color-muted)' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)',
              }}
              itemStyle={{ color: 'var(--color-text)' }}
              labelStyle={{ color: 'var(--color-text)', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ color: 'var(--color-text)' }} />
            <Bar dataKey="income" name={t('reports.income')} fill={incomeColor} />
            <Bar dataKey="expense" name={t('reports.expense')} fill={expenseColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default IncomeExpenseBarChart;