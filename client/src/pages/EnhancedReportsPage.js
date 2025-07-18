import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Table,
  Space,
  Button,
  Tabs,
  Progress,
  List,
  Tag,
  Tooltip,
  Alert,
  Typography,
  Divider,
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { reportsAPI, ordersAPI } from '../services/api';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const EnhancedReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment(),
  ]);
  const [reportType, setReportType] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchSalesData(),
        fetchBestSellingProducts(),
        fetchCategoryStats(),
        fetchProfitData(),
        fetchCustomerStats(),
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await reportsAPI.getDashboardStats();
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await reportsAPI.getSalesReport({
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
      });
      if (response.data.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      // Mock data for demo
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        date: moment().subtract(29 - i, 'days').format('DD/MM'),
        revenue: Math.floor(Math.random() * 50000000) + 10000000,
        orders: Math.floor(Math.random() * 100) + 20,
        profit: Math.floor(Math.random() * 15000000) + 3000000,
      }));
      setSalesData(mockData);
    }
  };

  const fetchBestSellingProducts = async () => {
    try {
      const response = await reportsAPI.getBestSelling({ limit: 10 });
      if (response.data.success) {
        setBestSellingProducts(response.data.data);
      }
    } catch (error) {
      // Mock data for computer products
      const mockProducts = [
        { name: 'CPU Intel Core i7-12700K', total_sold: 45, revenue: 450000000, category: 'CPU' },
        { name: 'GPU RTX 4070 Ti', total_sold: 35, revenue: 875000000, category: 'GPU' },
        { name: 'RAM DDR4 16GB Corsair', total_sold: 120, revenue: 240000000, category: 'RAM' },
        { name: 'SSD Samsung 970 EVO 1TB', total_sold: 80, revenue: 320000000, category: 'SSD/HDD' },
        { name: 'Mainboard ASUS ROG Z690', total_sold: 25, revenue: 375000000, category: 'Mainboard' },
        { name: 'PSU Corsair 750W Gold', total_sold: 60, revenue: 180000000, category: 'PSU' },
        { name: 'Gaming Monitor 27" 144Hz', total_sold: 40, revenue: 320000000, category: 'Monitor' },
        { name: 'Mechanical Keyboard RGB', total_sold: 90, revenue: 135000000, category: 'Keyboard' },
        { name: 'Gaming Mouse Logitech', total_sold: 110, revenue: 110000000, category: 'Mouse' },
        { name: 'Gaming Laptop ROG', total_sold: 15, revenue: 450000000, category: 'Laptop' },
      ];
      setBestSellingProducts(mockProducts);
    }
  };

  const fetchCategoryStats = async () => {
    // Mock category data for computer store
    const mockCategories = [
      { category: 'GPU', revenue: 875000000, percentage: 25 },
      { category: 'CPU', revenue: 680000000, percentage: 19 },
      { category: 'Laptop', revenue: 650000000, percentage: 18 },
      { category: 'Monitor', revenue: 420000000, percentage: 12 },
      { category: 'RAM', revenue: 350000000, percentage: 10 },
      { category: 'SSD/HDD', revenue: 320000000, percentage: 9 },
      { category: 'Others', revenue: 245000000, percentage: 7 },
    ];
    setCategoryStats(mockCategories);
  };

  const fetchProfitData = async () => {
    // Mock profit data
    const mockProfit = Array.from({ length: 12 }, (_, i) => ({
      month: moment().subtract(11 - i, 'months').format('MM/YYYY'),
      revenue: Math.floor(Math.random() * 200000000) + 100000000,
      cost: Math.floor(Math.random() * 140000000) + 70000000,
      profit: 0,
    }));
    
    mockProfit.forEach(item => {
      item.profit = item.revenue - item.cost;
    });
    
    setProfitData(mockProfit);
  };

  const fetchCustomerStats = async () => {
    // Mock customer data
    const mockCustomers = [
      { type: 'Khách lẻ', count: 850, revenue: 1200000000 },
      { type: 'Khách VIP', count: 120, revenue: 800000000 },
      { type: 'Khách sỉ', count: 45, revenue: 1500000000 },
    ];
    setCustomerStats(mockCustomers);
  };

  const renderOverviewTab = () => (
    <div>
      {/* Key Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={dashboardStats.today_revenue || 12500000}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={dashboardStats.today_orders || 24}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={15}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ lợi nhuận"
              value={28.5}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Trend Chart */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="Biểu đồ doanh thu 30 ngày qua" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip 
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Phân bố theo danh mục" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Best Selling Products */}
      <Card title="Sản phẩm bán chạy nhất" loading={loading}>
        <Table
          dataSource={bestSellingProducts}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Sản phẩm',
              dataIndex: 'name',
              key: 'name',
              render: (name, record) => (
                <div>
                  <div>{name}</div>
                  <Tag color="blue" size="small">{record.category}</Tag>
                </div>
              ),
            },
            {
              title: 'Đã bán',
              dataIndex: 'total_sold',
              key: 'total_sold',
              width: 100,
              sorter: (a, b) => a.total_sold - b.total_sold,
            },
            {
              title: 'Doanh thu',
              dataIndex: 'revenue',
              key: 'revenue',
              width: 150,
              render: (revenue) => `${revenue.toLocaleString('vi-VN')} ₫`,
              sorter: (a, b) => a.revenue - b.revenue,
            },
            {
              title: 'Tỷ lệ',
              key: 'progress',
              width: 100,
              render: (_, record) => {
                const maxSold = Math.max(...bestSellingProducts.map(p => p.total_sold));
                const percentage = (record.total_sold / maxSold) * 100;
                return <Progress percent={percentage} size="small" showInfo={false} />;
              },
            },
          ]}
        />
      </Card>
    </div>
  );

  const renderSalesTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Doanh thu theo thời gian">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesData}>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip 
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Lợi nhuận" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Số đơn hàng theo ngày">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Bar dataKey="orders" fill="#ffc658" name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Thống kê khách hàng">
        <Row gutter={16}>
          {customerStats.map((stat, index) => (
            <Col span={8} key={index}>
              <Card size="small">
                <Statistic
                  title={stat.type}
                  value={stat.count}
                  suffix="khách"
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    Doanh thu: {stat.revenue.toLocaleString('vi-VN')} ₫
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );

  const renderInventoryTab = () => (
    <div>
      <Alert
        message="Báo cáo tồn kho"
        description="Theo dõi tình trạng tồn kho, sản phẩm bán chạy và sản phẩm ế ẩm"
        type="info"
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sản phẩm sắp hết"
              value={12}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sản phẩm ế ẩm"
              value={8}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={2500000000}
              suffix="₫"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Phân tích tồn kho theo danh mục">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryStats}>
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <CartesianGrid strokeDasharray="3 3" />
            <RechartsTooltip 
              formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Giá trị tồn kho']}
            />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderProfitTab = () => (
    <div>
      <Card title="Phân tích lợi nhuận 12 tháng">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={profitData}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <CartesianGrid strokeDasharray="3 3" />
            <RechartsTooltip 
              formatter={(value, name) => [
                `${value.toLocaleString('vi-VN')} ₫`,
                name === 'revenue' ? 'Doanh thu' : name === 'cost' ? 'Chi phí' : 'Lợi nhuận'
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="revenue" />
            <Bar dataKey="cost" fill="#ff7300" name="cost" />
            <Bar dataKey="profit" fill="#00c49f" name="profit" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Tỷ suất lợi nhuận">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress
                type="circle"
                percent={28.5}
                format={(percent) => `${percent}%`}
                strokeColor="#52c41a"
                width={120}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>Tỷ suất lợi nhuận trung bình</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Phân tích chi phí">
            <List
              size="small"
              dataSource={[
                { name: 'Chi phí hàng hóa', value: 70, color: '#ff4d4f' },
                { name: 'Chi phí vận hành', value: 15, color: '#faad14' },
                { name: 'Chi phí marketing', value: 8, color: '#1890ff' },
                { name: 'Chi phí khác', value: 7, color: '#52c41a' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <Progress percent={item.value} strokeColor={item.color} showInfo={false} />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Báo cáo & Thống kê</h1>
          <Text type="secondary">Theo dõi hiệu quả kinh doanh và phân tích dữ liệu</Text>
        </div>
        
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            ranges={{
              'Hôm nay': [moment(), moment()],
              '7 ngày qua': [moment().subtract(6, 'days'), moment()],
              '30 ngày qua': [moment().subtract(29, 'days'), moment()],
              'Tháng này': [moment().startOf('month'), moment().endOf('month')],
              'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            }}
          />
          <Button type="primary" icon={<DownloadOutlined />}>
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="overview"
        size="large"
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <BarChartOutlined />
                Tổng quan
              </span>
            ),
            children: renderOverviewTab()
          },
          {
            key: 'sales',
            label: (
              <span>
                <LineChartOutlined />
                Doanh số
              </span>
            ),
            children: renderSalesTab()
          },
          {
            key: 'inventory',
            label: (
              <span>
                <PieChartOutlined />
                Tồn kho
              </span>
            ),
            children: renderInventoryTab()
          },
          {
            key: 'profit',
            label: (
              <span>
                <DollarOutlined />
                Lợi nhuận
              </span>
            ),
            children: renderProfitTab()
          }
        ]}
      />
    </div>
  );
};

export default EnhancedReportsPage; 