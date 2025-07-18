import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  DatePicker,
  Popconfirm,
  Drawer
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CrownOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { customersAPI, formatCurrency, formatDate } from '../services/api';

const { Search } = Input;
const { Option } = Select;

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    regular: 0,
    vip: 0,
    wholesale: 0
  });
  const [form] = Form.useForm();

  const customerTypes = [
    { value: 'regular', label: 'Khách thường', color: 'default' },
    { value: 'vip', label: 'VIP', color: 'gold' },
    { value: 'wholesale', label: 'Bán sỉ', color: 'purple' }
  ];

  useEffect(() => {
    fetchCustomers();
  }, [searchText, filterType]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll({
        search: searchText,
        type: filterType
      });
      
      if (response.data.success) {
        setCustomers(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customerData) => {
    const stats = {
      total: customerData.length,
      regular: customerData.filter(c => c.customer_type === 'regular').length,
      vip: customerData.filter(c => c.customer_type === 'vip').length,
      wholesale: customerData.filter(c => c.customer_type === 'wholesale').length
    };
    setStats(stats);
  };

  const showModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalVisible(true);
    if (customer) {
      form.setFieldsValue({
        ...customer,
      });
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      // Remove unwanted fields from values before sending
      const { gender, birthday, city, ...customerData } = values; 

      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, customerData);
        message.success('Cập nhật khách hàng thành công');
      } else {
        await customersAPI.create(customerData);
        message.success('Tạo khách hàng thành công');
      }
      
      handleCancel();
      fetchCustomers();
    } catch (error) {
      message.error(`Lỗi khi ${editingCustomer ? 'cập nhật' : 'tạo'} khách hàng: ` + (error.response?.data?.message || error.message));
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersAPI.delete(id);
      message.success('Xóa khách hàng thành công');
      fetchCustomers();
    } catch (error) {
      message.error('Lỗi khi xóa khách hàng');
      console.error('Error deleting customer:', error);
    }
  };

  const showCustomerDetail = async (customer) => {
    try {
      const response = await customersAPI.getById(customer.id);
      if (response.data.success) {
        setSelectedCustomer(response.data.data);
        setIsDetailDrawerVisible(true);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin khách hàng');
    }
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Thông tin khách hàng',
      key: 'customer_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            {record.name}
          </div>
          {record.phone && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {record.phone}
            </div>
          )}
          {record.email && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Loại KH',
      dataIndex: 'customer_type',
      key: 'customer_type',
      width: 120,
      render: (type) => {
        const typeConfig = customerTypes.find(t => t.value === type);
        return (
          <Tag color={typeConfig?.color} icon={type === 'vip' ? <CrownOutlined /> : null}>
            {typeConfig?.label}
          </Tag>
        );
      }
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      width: 120,
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {formatCurrency(amount || 0)}
        </span>
      ),
      sorter: (a, b) => (a.total_spent || 0) - (b.total_spent || 0)
    },
    {
      title: 'Số lần mua',
      dataIndex: 'visit_count',
      key: 'visit_count',
      width: 100,
      render: (count) => (
        <span>
          <ShoppingCartOutlined style={{ marginRight: 4 }} />
          {count || 0}
        </span>
      ),
      sorter: (a, b) => (a.visit_count || 0) - (b.visit_count || 0)
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'discount_rate',
      key: 'discount_rate',
      width: 100,
      render: (rate) => (
        <span style={{ color: '#fa8c16' }}>
          {rate || 0}%
        </span>
      )
    },
    {
      title: 'Lần cuối mua',
      dataIndex: 'last_visit',
      key: 'last_visit',
      width: 130,
      render: (date) => date ? formatDate(date) : 'Chưa mua'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showCustomerDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="default"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Quản lý Khách hàng</h1>
      {/* Header với thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách thường"
              value={stats.regular}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách VIP"
              value={stats.vip}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách bán sỉ"
              value={stats.wholesale}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Quản lý khách hàng">
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="Tìm theo tên, SĐT, mã KH..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={fetchCustomers}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo loại khách hàng"
              value={filterType}
              onChange={setFilterType}
            >
              <Option value="all">Tất cả</Option>
              {customerTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              size="large"
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: customers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} khách hàng`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal thêm/sửa khách hàng */}
      <Modal
        title={editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên khách hàng"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại khách hàng"
                name="customer_type"
                initialValue="regular"
              >
                <Select>
                  {customerTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chiết khấu (%)"
                name="discount_rate"
                initialValue={0}
              >
                <Input type="number" min={0} max={100} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer chi tiết khách hàng */}
      <Drawer
        title="Thông tin chi tiết khách hàng"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        visible={isDetailDrawerVisible}
        width={500}
      >
        {selectedCustomer && (
          <div>
            <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
              <p><strong>Mã khách hàng:</strong> {selectedCustomer.code}</p>
              <p><strong>Tên:</strong> {selectedCustomer.name}</p>
              <p><strong>Điện thoại:</strong> {selectedCustomer.phone || 'Chưa có'}</p>
              <p><strong>Email:</strong> {selectedCustomer.email || 'Chưa có'}</p>
              <p><strong>Loại khách hàng:</strong> 
                <Tag color={customerTypes.find(t => t.value === selectedCustomer.customer_type)?.color}>
                  {customerTypes.find(t => t.value === selectedCustomer.customer_type)?.label}
                </Tag>
              </p>
              <p><strong>Chiết khấu:</strong> {selectedCustomer.discount_rate || 0}%</p>
            </Card>

            <Card title="Thống kê mua hàng" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng chi tiêu"
                    value={selectedCustomer.total_spent || 0}
                    formatter={value => formatCurrency(value)}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Số lần mua"
                    value={selectedCustomer.visit_count || 0}
                    suffix="lần"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
              <p style={{ marginTop: 16 }}>
                <strong>Lần cuối mua:</strong> {selectedCustomer.last_visit ? formatDate(selectedCustomer.last_visit) : 'Chưa mua'}
              </p>
            </Card>

            {selectedCustomer.address && (
              <Card title="Địa chỉ" style={{ marginBottom: 16 }}>
                <p>{selectedCustomer.address}</p>
              </Card>
            )}

            {selectedCustomer.notes && (
              <Card title="Ghi chú">
                <p>{selectedCustomer.notes}</p>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomersPage; 