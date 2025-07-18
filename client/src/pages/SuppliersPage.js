import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Popconfirm,
  Drawer
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CreditCardOutlined,
  EyeOutlined,
  BankOutlined
} from '@ant-design/icons';
import { suppliersAPI, formatCurrency, formatDate } from '../services/api';

const { Search } = Input;

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    totalDebt: 0,
    totalCreditLimit: 0
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, [searchText]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll({
        search: searchText
      });
      
      if (response.data.success) {
        setSuppliers(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhà cung cấp');
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (supplierData) => {
    const stats = {
      total: supplierData.length,
      totalDebt: supplierData.reduce((sum, s) => sum + (s.total_debt || 0), 0),
      totalCreditLimit: supplierData.reduce((sum, s) => sum + (s.credit_limit || 0), 0)
    };
    setStats(stats);
  };

  const showModal = (supplier = null) => {
    setEditingSupplier(supplier);
    setIsModalVisible(true);
    if (supplier) {
      form.setFieldsValue(supplier);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, values);
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        await suppliersAPI.create(values);
        message.success('Tạo nhà cung cấp thành công');
      }
      
      handleCancel();
      fetchSuppliers();
    } catch (error) {
      message.error(`Lỗi khi ${editingSupplier ? 'cập nhật' : 'tạo'} nhà cung cấp`);
      console.error('Error saving supplier:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await suppliersAPI.delete(id);
      message.success('Xóa nhà cung cấp thành công');
      fetchSuppliers();
    } catch (error) {
      message.error('Lỗi khi xóa nhà cung cấp');
      console.error('Error deleting supplier:', error);
    }
  };

  const showSupplierDetail = async (supplier) => {
    try {
      const response = await suppliersAPI.getById(supplier.id);
      if (response.data.success) {
        setSelectedSupplier(response.data.data);
        setIsDetailDrawerVisible(true);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin nhà cung cấp');
    }
  };

  const columns = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Thông tin nhà cung cấp',
      key: 'supplier_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            <ShopOutlined style={{ marginRight: 8 }} />
            {record.name}
          </div>
          {record.contact_person && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              Người liên hệ: {record.contact_person}
            </div>
          )}
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
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (address, record) => (
        <div>
          {address && <div>{address}</div>}
          {record.city && <div style={{ color: '#666', fontSize: '12px' }}>{record.city}</div>}
        </div>
      )
    },
    {
      title: 'Công nợ',
      dataIndex: 'total_debt',
      key: 'total_debt',
      width: 120,
      render: (debt) => (
        <span style={{ 
          color: debt > 0 ? '#ff4d4f' : '#52c41a', 
          fontWeight: 'bold' 
        }}>
          {formatCurrency(debt || 0)}
        </span>
      ),
      sorter: (a, b) => (a.total_debt || 0) - (b.total_debt || 0)
    },
    {
      title: 'Hạn mức tín dụng',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      width: 130,
      render: (limit) => (
        <span style={{ color: '#1890ff' }}>
          {formatCurrency(limit || 0)}
        </span>
      )
    },
    {
      title: 'Điều khoản TT',
      dataIndex: 'payment_terms',
      key: 'payment_terms',
      width: 120,
      render: (terms) => (
        <Tag color="blue">{terms || 'Không xác định'}</Tag>
      )
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
              onClick={() => showSupplierDetail(record)}
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
            title="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
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
      <h1>Quản lý Nhà cung cấp</h1>
      {/* Header với thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng nhà cung cấp"
              value={stats.total}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng công nợ"
              value={stats.totalDebt}
              formatter={value => formatCurrency(value)}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng hạn mức tín dụng"
              value={stats.totalCreditLimit}
              formatter={value => formatCurrency(value)}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Quản lý nhà cung cấp">
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Search
              placeholder="Tìm theo tên, mã NCC, người liên hệ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={fetchSuppliers}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              size="large"
            >
              Thêm nhà cung cấp
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: suppliers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} nhà cung cấp`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal thêm/sửa nhà cung cấp */}
      <Modal
        title={editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
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
                label="Tên nhà cung cấp"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
              >
                <Input prefix={<ShopOutlined />} placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Người liên hệ"
                name="contact_person"
              >
                <Input placeholder="Nhập tên người liên hệ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thành phố"
                name="city"
              >
                <Input placeholder="Nhập thành phố" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã số thuế"
                name="tax_code"
              >
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Điều khoản thanh toán"
                name="payment_terms"
                initialValue="30 ngày"
              >
                <Input placeholder="VD: 30 ngày, Thanh toán ngay..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Hạn mức tín dụng (VNĐ)"
                name="credit_limit"
                initialValue={0}
              >
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="0"
                  prefix={<CreditCardOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Công nợ hiện tại (VNĐ)"
                name="total_debt"
                initialValue={0}
              >
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="0"
                  prefix={<BankOutlined />}
                />
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
                {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer chi tiết nhà cung cấp */}
      <Drawer
        title="Thông tin chi tiết nhà cung cấp"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        visible={isDetailDrawerVisible}
        width={500}
      >
        {selectedSupplier && (
          <div>
            <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
              <p><strong>Mã nhà cung cấp:</strong> {selectedSupplier.code}</p>
              <p><strong>Tên:</strong> {selectedSupplier.name}</p>
              <p><strong>Người liên hệ:</strong> {selectedSupplier.contact_person || 'Chưa có'}</p>
              <p><strong>Điện thoại:</strong> {selectedSupplier.phone || 'Chưa có'}</p>
              <p><strong>Email:</strong> {selectedSupplier.email || 'Chưa có'}</p>
              <p><strong>Mã số thuế:</strong> {selectedSupplier.tax_code || 'Chưa có'}</p>
            </Card>

            <Card title="Thông tin tài chính" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Công nợ hiện tại"
                    value={selectedSupplier.total_debt || 0}
                    formatter={value => formatCurrency(value)}
                    valueStyle={{ color: selectedSupplier.total_debt > 0 ? '#ff4d4f' : '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Hạn mức tín dụng"
                    value={selectedSupplier.credit_limit || 0}
                    formatter={value => formatCurrency(value)}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
              <p style={{ marginTop: 16 }}>
                <strong>Điều khoản thanh toán:</strong> {selectedSupplier.payment_terms || 'Không xác định'}
              </p>
            </Card>

            {selectedSupplier.address && (
              <Card title="Địa chỉ" style={{ marginBottom: 16 }}>
                <p>{selectedSupplier.address}</p>
                {selectedSupplier.city && <p><strong>Thành phố:</strong> {selectedSupplier.city}</p>}
              </Card>
            )}

            {selectedSupplier.notes && (
              <Card title="Ghi chú">
                <p>{selectedSupplier.notes}</p>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SuppliersPage; 