import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from 'antd';

// Need to register these for Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ salesData = [] }) => {
  // Default data if none provided
  const defaultData = [
    { date: '2024-01-01', sales: 0 },
    { date: '2024-01-02', sales: 0 },
    { date: '2024-01-03', sales: 0 },
    { date: '2024-01-04', sales: 0 },
    { date: '2024-01-05', sales: 0 },
    { date: '2024-01-06', sales: 0 },
    { date: '2024-01-07', sales: 0 },
  ];
  
  const data = salesData.length > 0 ? salesData : defaultData;
  
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Doanh số',
        data: data.map(item => item.sales),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }
    ]
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ doanh số 7 ngày qua'
      }
    }
  };
  
  return (
    <Card title="Doanh số theo ngày">
      <Line data={chartData} options={options} />
    </Card>
  );
};

export default SalesChart;