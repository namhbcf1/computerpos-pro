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
  Alert,
  Badge,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { customersAPI, suppliersAPI, financialAPI } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

// Zod schema for debt payment validation
const debtPaymentSchema = z.object({
  entity_id: z.number().min(1, 'Vui lòng chọn khách hàng/nhà cung cấp'),
  amount: z.number().min(1, 'Số tiền phải lớn hơn 0'),
  description: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'transfer', 'ewallet'], {
    errorMap: () => ({ message: 'Vui lòng chọn phương thức thanh toán' })
  }),
  transaction_date: z.any().optional(),
});

const DebtPage = () => {
  const [customerDebts, setCustomerDebts] = useState([]);
  const [supplierDebts, setSupplierDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const [modalType, setModalType] = useState('payment'); // 'payment' or 'debt'
  const [debtStats, setDebtStats] = useState({
    totalCustomerDebt: 0,
    totalSupplierDebt: 0,
    overduCustomerDebt: 0,
    overdueSupplierDebt: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(debtPaymentSchema),
    defaultValues: {
      payment_method: 'cash',
      transaction_date: dayjs(),
    },
  });

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt', icon: <DollarOutlined /> },
    { value: 'card', label: 'Thẻ', icon: <CreditCardOutlined /> },
    { value: 'transfer', label: 'Chuyển khoản', icon: <WalletOutlined /> },
    { value: 'ewallet', label: 'Ví điện tử', icon: <WalletOutlined /> },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCustomerDebts(),
        fetchSupplierDebts(),
        fetchCustomers(),
        fetchSuppliers(),
      ]);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDebts = async () => {
    try {
      const response = await customersAPI.getAll();
      if (response.data.success) {
        const customers = response.data.data.filter(c => c.current_debt > 0);
        setCustomerDebts(customers);
        
        // Calculate debt stats
        const totalDebt = customers.reduce((sum, c) => sum + (c.current_debt || 0), 0);
        setDebtStats(prev => ({ ...prev, totalCustomerDebt: totalDebt }));
      }
    } catch (error) {
      console.error('Error fetching customer debts:', error);
    }
  };

  const fetchSupplierDebts = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.data.success) {
        const suppliers = response.data.data.filter(s => s.current_debt > 0);
        setSupplierDebts(suppliers);
        
        // Calculate debt stats
        const totalDebt = suppliers.reduce((sum, s) => sum + (s.current_debt || 0), 0);
        setDebtStats(prev => ({ ...prev, totalSupplierDebt: totalDebt }));
      }
    } catch (error) {
      console.error('Error fetching supplier debts:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handlePayDebt = async (data) => {
    try {
      const transactionData = {
        type: activeTab === 'customers' ? 'income' : 'expense',
        category: activeTab === 'customers' ? 'Thu nợ khách hàng' : 'Trả nợ nhà cung cấp',
        amount: data.amount,
        description: data.description,
        customer_id: activeTab === 'customers' ? data.entity_id : null,
        supplier_id: activeTab === 'suppliers' ? data.entity_id : null,
        payment_method: data.payment_method,
        transaction_date: data.transaction_date?.toISOString() || new Date().toISOString(),
        user_id: 1,
      };

      const response = await financialAPI.create(transactionData);
      if (response.data.success) {
        toast.success('Ghi nhận thanh toán thành công');
        setModalVisible(false);
        reset();
        fetchData();
      }
    } catch (error) {
      toast.error('Lỗi khi ghi nhận thanh toán');
    }
  };

  const customerColumns = [
    {
      title: 'Mã KH',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          {record.phone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.phone}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Loại KH',
      dataIndex: 'customer_type',
      key: 'customer_type',
      render: (type) => {
        const colors = {
          regular: 'default',
          vip: 'gold',
          wholesale: 'blue',
        };
        const labels = {
          regular: 'Thường',
          vip: 'VIP',
          wholesale: 'Sỉ',
        };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
    },
    {
      title: 'Số nợ',
      dataIndex: 'current_debt',
      key: 'current_debt',
      render: (debt) => (
        <Text strong style={{ color: debt > 0 ? '#ff4d4f' : '#52c41a' }}>
          {debt.toLocaleString('vi-VN')} ₫
        </Text>
      ),
      sorter: (a, b) => a.current_debt - b.current_debt,
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (spent) => (
        <Text type="secondary">
          {spent ? spent.toLocaleString('vi-VN') : 0} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const debt = record.current_debt || 0;
        if (debt === 0) {
          return <Badge status="success" text="Đã thanh toán" />;
        } else if (debt > 1000000) {
          return <Badge status="error" text="Nợ lớn" />;
        } else {
          return <Badge status="warning" text="Có nợ" />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => {
              setModalType('payment');
              setActiveTab('customers');
              setModalVisible(true);
              reset({
                entity_id: record.id,
                payment_method: 'cash',
                transaction_date: dayjs(),
              });
            }}
          >
            Thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  const supplierColumns = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          {record.phone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.phone}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Số nợ',
      dataIndex: 'current_debt',
      key: 'current_debt',
      render: (debt) => (
        <Text strong style={{ color: debt > 0 ? '#ff4d4f' : '#52c41a' }}>
          {debt.toLocaleString('vi-VN')} ₫
        </Text>
      ),
      sorter: (a, b) => a.current_debt - b.current_debt,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const debt = record.current_debt || 0;
        if (debt === 0) {
          return <Badge status="success" text="Đã thanh toán" />;
        } else if (debt > 5000000) {
          return <Badge status="error" text="Nợ lớn" />;
        } else {
          return <Badge status="warning" text="Có nợ" />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => {
              setModalType('payment');
              setActiveTab('suppliers');
              setModalVisible(true);
              reset({
                entity_id: record.id,
                payment_method: 'cash',
                transaction_date: dayjs(),
              });
            }}
          >
            Thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  const renderDebtSummary = () => {
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nợ khách hàng"
              value={debtStats.totalCustomerDebt}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<UserOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nợ nhà cung cấp"
              value={debtStats.totalSupplierDebt}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ShopOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nợ phải thu"
              value={debtStats.totalCustomerDebt + debtStats.totalSupplierDebt}
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
              title="Số khách hàng có nợ"
              value={customerDebts.length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {renderDebtSummary()}

      <Alert
        message="Quản lý nợ"
        description="Theo dõi và quản lý các khoản nợ của khách hàng và nhà cung cấp. Hệ thống sẽ tự động cập nhật số dư nợ khi có giao dịch thanh toán."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={
            <span>
              <UserOutlined />
              Nợ khách hàng ({customerDebts.length})
            </span>
          }
          key="customers"
        >
          <Card
            title="Danh sách khách hàng có nợ"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalType('payment');
                  setActiveTab('customers');
                  setModalVisible(true);
                  reset({
                    payment_method: 'cash',
                    transaction_date: dayjs(),
                  });
                }}
              >
                Ghi nhận thanh toán
              </Button>
            }
          >
            <Table
              columns={customerColumns}
              dataSource={customerDebts}
              loading={loading}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} khách hàng`,
              }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <ShopOutlined />
              Nợ nhà cung cấp ({supplierDebts.length})
            </span>
          }
          key="suppliers"
        >
          <Card
            title="Danh sách nhà cung cấp có nợ"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalType('payment');
                  setActiveTab('suppliers');
                  setModalVisible(true);
                  reset({
                    payment_method: 'cash',
                    transaction_date: dayjs(),
                  });
                }}
              >
                Ghi nhận thanh toán
              </Button>
            }
          >
            <Table
              columns={supplierColumns}
              dataSource={supplierDebts}
              loading={loading}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
              }}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={`Ghi nhận thanh toán ${activeTab === 'customers' ? 'nợ khách hàng' : 'nợ nhà cung cấp'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <form onSubmit={handleSubmit(handlePayDebt)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              {activeTab === 'customers' ? 'Khách hàng' : 'Nhà cung cấp'} <span style={{ color: 'red' }}>*</span>
            </label>
            <Select
              placeholder={`Chọn ${activeTab === 'customers' ? 'khách hàng' : 'nhà cung cấp'}`}
              style={{ width: '100%' }}
              onChange={(value) => setValue('entity_id', value)}
              value={watch('entity_id')}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {(activeTab === 'customers' ? customers : suppliers)
                .filter(entity => entity.current_debt > 0)
                .map((entity) => (
                  <Option key={entity.id} value={entity.id}>
                    <div>
                      <div>{entity.name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Nợ: {entity.current_debt?.toLocaleString('vi-VN')} ₫
                      </Text>
                    </div>
                  </Option>
                ))}
            </Select>
            {errors.entity_id && (
              <div style={{ color: 'red', fontSize: 12 }}>
                {errors.entity_id.message}
              </div>
            )}
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Số tiền thanh toán <span style={{ color: 'red' }}>*</span>
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
                      <Space>
                        {method.icon}
                        {method.label}
                      </Space>
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
              placeholder="Nhập mô tả thanh toán"
              rows={3}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              Ngày thanh toán
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
                icon={<DollarOutlined />}
              >
                Ghi nhận thanh toán
              </Button>
            </Space>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DebtPage; 