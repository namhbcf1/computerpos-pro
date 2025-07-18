#!/bin/bash

echo "==================================================="
echo "COMPUTERPOS PRO - Frontend Deployment Fix Script"
echo "==================================================="
echo

# Check if we have wrangler installed
echo "Checking for wrangler..."
if ! command -v wrangler &> /dev/null && ! npx wrangler --version &> /dev/null
then
    echo "Installing wrangler globally..."
    npm install -g wrangler
fi

echo
echo "Creating .env.production file..."
cd client
cat > .env.production << EOL
REACT_APP_API_URL=https://pos-backend.bangachieu2.workers.dev/api
REACT_APP_SITE_URL=https://pos-frontend-e1q-4i9.pages.dev
EOL

echo
echo "Creating missing components directory if it doesn't exist..."
mkdir -p src/components

echo
echo "Creating missing dashboard components..."
cd src/components

echo "Creating DashboardStats.js..."
cat > DashboardStats.js << 'EOL'
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, DatabaseOutlined } from '@ant-design/icons';

const DashboardStats = ({ stats = {} }) => {
  // Default values if no stats provided
  const {
    totalSales = 0,
    customers = 0,
    revenue = 0,
    products = 0
  } = stats;
  
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng đơn hàng"
            value={totalSales}
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Khách hàng"
            value={customers}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Doanh thu"
            value={revenue}
            precision={0}
            prefix={<DollarOutlined />}
            suffix="₫"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Sản phẩm"
            value={products}
            prefix={<DatabaseOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;
EOL

echo "Creating RecentOrders.js..."
cat > RecentOrders.js << 'EOL'
import React from 'react';
import { Table, Tag } from 'antd';
import moment from 'moment';

const RecentOrders = ({ orders = [] }) => {
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: id => `#${id}`
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: customer => customer?.name || 'Khách lẻ'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'blue';
        if (status === 'completed') color = 'green';
        if (status === 'cancelled') color = 'red';
        
        const statusText = {
          'pending': 'Đang xử lý',
          'processing': 'Đang xử lý',
          'completed': 'Hoàn thành',
          'cancelled': 'Đã hủy'
        };
        
        return <Tag color={color}>{statusText[status] || status}</Tag>;
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: total => `${new Intl.NumberFormat('vi-VN').format(total)}₫`
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    }
  ];
  
  return (
    <Table 
      columns={columns} 
      dataSource={orders} 
      rowKey="id" 
      pagination={false} 
    />
  );
};

export default RecentOrders;
EOL

echo "Creating SalesChart.js..."
cat > SalesChart.js << 'EOL'
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
EOL

echo "Creating TopProducts.js..."
cat > TopProducts.js << 'EOL'
import React from 'react';
import { Card, Table, Progress } from 'antd';

const TopProducts = ({ products = [] }) => {
  // Default data if none provided
  const defaultProducts = [
    { id: 1, name: 'Intel Core i5-13400F', quantity: 0, percentage: 0 },
    { id: 2, name: 'RAM DDR4 16GB 3200MHz', quantity: 0, percentage: 0 },
    { id: 3, name: 'RTX 4060 8GB', quantity: 0, percentage: 0 },
    { id: 4, name: 'SSD NVMe 500GB', quantity: 0, percentage: 0 },
    { id: 5, name: 'Mainboard B760M', quantity: 0, percentage: 0 }
  ];
  
  const data = products.length > 0 ? products : defaultProducts;
  
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SL đã bán',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: percentage => <Progress percent={percentage} size="small" />
    }
  ];
  
  return (
    <Card title="Sản phẩm bán chạy">
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={false} 
      />
    </Card>
  );
};

export default TopProducts;
EOL

cd ../..

echo
echo "Installing required dependencies..."
npm install --save chart.js react-chartjs-2 moment

echo
echo "Building the project..."
npm run build

echo
echo "=== DEPLOYMENT OPTIONS ==="
echo "1. Deploy to Cloudflare Pages now"
echo "2. Exit without deploying"
echo

read -p "Enter your choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  echo
  echo "Deploying to Cloudflare Pages..."
  npx wrangler pages deploy build --project-name=pos-frontend
  
  echo
  echo "Deployment complete! Visit your site at:"
  echo "https://pos-frontend-e1q-4i9.pages.dev/"
else
  echo
  echo "Build completed successfully. You can deploy manually later with:"
  echo "npx wrangler pages deploy build --project-name=pos-frontend"
fi

cd ../

echo
echo "Script completed."
echo 