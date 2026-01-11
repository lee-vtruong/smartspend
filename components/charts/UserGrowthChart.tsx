import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { apiService } from '../../services/apiService';
import Card from '../Card';

// Đăng ký các thành phần ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserGrowthChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await apiService.getUserGrowthStats();
        
        setChartData({
          labels: stats.labels, // Ví dụ: ["2023-10", "2023-11"...]
          datasets: [
            {
              label: 'Người dùng mới',
              data: stats.data,
              borderColor: 'rgb(59, 130, 246)', // Màu xanh primary
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              tension: 0.4, // Làm mềm đường cong
              fill: true,
              pointBackgroundColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to load growth chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1 // Chỉ hiện số nguyên (người dùng)
            }
        }
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-muted">Đang tải biểu đồ...</div>;
  if (!chartData) return null;

  return (
    <Card className="w-full">
        <h3 className="text-lg font-bold text-text mb-4">📈 Tăng trưởng người dùng</h3>
        <div className="h-[300px] w-full">
            <Line options={options} data={chartData} />
        </div>
    </Card>
  );
};

export default UserGrowthChart;