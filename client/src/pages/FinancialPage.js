import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  InputNumber,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { financialAPI, reportsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Zod schema for financial transaction validation
const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Vui lòng chọn loại giao dịch' })
  }),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  amount: z.number().min(1, 'Số tiền phải lớn hơn 0'),
  description: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'transfer', 'ewallet'], {
    errorMap: () => ({ message: 'Vui lòng chọn phương thức thanh toán' })
  }),
  transaction_date: z.any().optional(),
  customer_id: z.number().optional(),
  supplier_id: z.number().optional(),
});

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    todayIncome: 0,
    monthIncome: 0,
  });
  const [activeTab, setActiveTab] = useState('transactions');
  const [chartData, setChartData] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      payment_method: 'cash',
      transaction_date: dayjs(),
    },
  });

  const categories = {
    income: [
      'Bán hàng',
      'Dịch vụ',
      'Thu khác',
      'Lãi ngân hàng',
      'Hoàn tiền',
      'Thu nợ khách hàng',
    ],
    expense: [
      'Nhập hàng',
      'Tiền thuê',
      'Điện nước',
      'Lương nhân viên',
      'Marketing',
      'Vận chuyển',
      'Bảo trì sửa chữa',
      'Chi phí khác',
      'Trả nợ nhà cung cấp',
    ],
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'transfer', label: 'Chuyển khoản' },
    { value: 'ewallet', label: 'Ví điện tử' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      generateChartData();
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await financialAPI.getTransactions();
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu thu chi');
      // Mock data for demo
      const mockTransactions = [
        {
          id: 1,
          type: 'income',
          category: 'Bán hàng',
          amount: 1500000,
          description: 'Doanh thu bán hàng ngày',
          payment_method: 'cash',
          transaction_date: dayjs().subtract(1, 'day').toISOString(),
          user_name: 'Admin',
        },
        {
          id: 2,
          type: 'income',
          category: 'Dịch vụ',
          amount: 500000,
          description: 'Phí dịch vụ tư vấn',
          payment_method: 'transfer',
          transaction_date: dayjs().subtract(2, 'day').toISOString(),
          user_name: 'Admin',
        },
        {
          id: 3,
          type: 'expense',
          category: 'Nhập hàng',
          amount: 800000,
          description: 'Nhập hàng từ nhà cung cấp',
          payment_method: 'transfer',
          transaction_date: dayjs().subtract(3, 'day').toISOString(),
          user_name: 'Admin',
        },
      ];
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reportsAPI.getFinancialSummary();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock stats
      setStats({
        total_income: 2500000,
        total_expense: 1200000,
        net_profit: 1300000,
        today_income: 500000,
        today_expense: 200000,
        today_profit: 300000,
        month_income: 15000000,
        month_expense: 8000000,
        month_profit: 7000000,
      });
    }
  };

  const generateChartData = () => {
    // Monthly data for line chart
    const monthlyData = [];
    const currentMonth = dayjs();
    
    for (let i = 5; i >= 0; i--) {
      const month = currentMonth.subtract(i, 'month');
      const monthTransactions = transactions.filter(t => {
        const transactionDate = dayjs(t.transaction_date);
        return transactionDate.month() === month.month() && 
               transactionDate.year() === month.year();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.push({
        month: month.format('MM/YYYY'),
        income,
        expense,
        profit: income - expense,
      });
    }
    
    setChartData(monthlyData);
  };

  const handleAddTransaction = async (data) => {
    try {
      const transactionData = {
        ...data,
        transaction_date: data.transaction_date?.toISOString() || new Date().toISOString(),
        user_id: 1, // Current user ID
      };

      const response = await financialAPI.create(transactionData);
      if (response.data.success) {
        toast.success('Thêm giao dịch thành công');
        setModalVisible(false);
        reset();
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      toast.error('Lỗi khi thêm giao dịch');
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.transaction_date).unix() - dayjs(b.transaction_date).unix(),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? 'Thu' : 'Chi'}
        </Tag>
      ),
      filters: [
        { text: 'Thu', value: 'income' },
        { text: 'Chi', value: 'expense' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'income' ? '+' : '-'}{amount.toLocaleString('vi-VN')} ₫
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Phương thức TT',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => {
        const methodMap = {
          cash: 'Tiền mặt',
          card: 'Thẻ',
          transfer: 'Chuyển khoản',
          ewallet: 'Ví điện tử',
        };
        return methodMap[method] || method;
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name) => name || 'Chưa xác định',
    },
  ];

  const renderTransactionsTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng thu"
              value={stats.total_income || stats.totalIncome}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng chi"
              value={stats.total_expense || stats.totalExpense}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lợi nhuận"
              value={stats.net_profit || stats.netProfit}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thu hôm nay"
              value={stats.today_income || stats.todayIncome}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Giao dịch tài chính"
        extra={
          <Space>
            <Button icon={<FilterOutlined />}>
              Lọc
            </Button>
            <Button icon={<DownloadOutlined />}>
              Xuất báo cáo
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Thêm giao dịch
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
        />
      </Card>
    </div>
  );

  const renderChartsTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Biểu đồ doanh thu theo tháng" icon={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                <Legend />
                <Bar dataKey="income" fill="#52c41a" name="Thu" />
                <Bar dataKey="expense" fill="#ff4d4f" name="Chi" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ lợi nhuận theo tháng" icon={<LineChart />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Lợi nhuận"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="Phân tích chi tiết" icon={<PieChartOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <h4>Phân bổ thu nhập theo danh mục</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(categories.income).map(([key, value]) => ({
                        name: value,
                        value: Math.random() * 1000000, // Mock data
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(categories.income).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <h4>Phân bổ chi phí theo danh mục</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(categories.expense).map(([key, value]) => ({
                        name: value,
                        value: Math.random() * 500000, // Mock data
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(categories.expense).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Quản lý Thu Chi</h1>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'transactions',
            label: 'Giao dịch',
            children: renderTransactionsTab()
          },
          {
            key: 'charts',
            label: 'Biểu đồ',
            children: renderChartsTab()
          }
        ]}
      />

      <Modal
        title="Thêm giao dịch tài chính"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <form onSubmit={handleSubmit(handleAddTransaction)}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Loại giao dịch <span style={{ color: 'red' }}>*</span>
                </label>
                <Radio.Group
                  {...register('type')}
                  onChange={(e) => setValue('type', e.target.value)}
                  value={watch('type')}
                >
                  <Radio value="income">Thu</Radio>
                  <Radio value="expense">Chi</Radio>
                </Radio.Group>
                {errors.type && (
                  <div style={{ color: 'red', fontSize: 12 }}>
                    {errors.type.message}
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Danh mục <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  placeholder="Chọn danh mục"
                  style={{ width: '100%' }}
                  onChange={(value) => setValue('category', value)}
                  value={watch('category')}
                >
                  {categories[watch('type') || 'income']?.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
                {errors.category && (
                  <div style={{ color: 'red', fontSize: 12 }}>
                    {errors.category.message}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Số tiền <span style={{ color: 'red' }}>*</span>
                </label>
                <InputNumber
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="Nhập số tiền"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
                {errors.amount && (
                  <div style={{ color: 'red', fontSize: 12 }}>
                    {errors.amount.message}
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Phương thức thanh toán <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  placeholder="Chọn phương thức"
                  style={{ width: '100%' }}
                  onChange={(value) => setValue('payment_method', value)}
                  value={watch('payment_method')}
                >
                  {paymentMethods.map((method) => (
                    <Option key={method.value} value={method.value}>
                      {method.label}
                    </Option>
                  ))}
                </Select>
                {errors.payment_method && (
                  <div style={{ color: 'red', fontSize: 12 }}>
                    {errors.payment_method.message}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              Mô tả
            </label>
            <Input.TextArea
              {...register('description')}
              placeholder="Nhập mô tả giao dịch"
              rows={3}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              Ngày giao dịch
            </label>
            <DatePicker
              {...register('transaction_date')}
              style={{ width: '100%' }}
              onChange={(date) => setValue('transaction_date', date)}
              value={watch('transaction_date')}
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                icon={<PlusOutlined />}
              >
                Thêm giao dịch
              </Button>
            </Space>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancialPage; 