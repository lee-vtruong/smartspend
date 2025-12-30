

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategorySpending } from '../../types';
import Card from '../Card';
import { useAppContext } from '../../contexts/AppContext';

interface CategoryDonutChartProps {
  data: CategorySpending[];
}

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  const { theme, t } = useAppContext();
  const COLORS_LIGHT = ['#5E8B7E', '#8D6E63', '#C0B283', '#c0392b', '#a16207'];
  const COLORS_DARK = ['#1C92D2', '#00FFA3', '#f39c12', '#e74c3c', '#a855f7'];
  const COLORS_SPECIAL = ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5'];

  let COLORS;
  if (theme === 'dark') {
    COLORS = COLORS_DARK;
  } else if (theme === 'special') {
    COLORS = COLORS_SPECIAL;
  } else {
    COLORS = COLORS_LIGHT;
  }


  return (
    <Card title={t('reports.spendingByCategory')}>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: 'var(--color-card)', 
                            borderColor: 'var(--color-accent)',
                            color: 'var(--color-text)'
                        }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--color-text)' }}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    </Card>
  );
};

export default CategoryDonutChart;