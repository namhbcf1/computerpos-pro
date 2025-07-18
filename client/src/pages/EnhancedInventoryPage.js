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
  Tabs,
  List,
  Badge,
  Popconfirm,
  Drawer,
  Typography,
  Alert,
  Divider,
  InputNumber,
} from 'antd';
import {
  InboxOutlined,
  WarningOutlined,
  SettingOutlined,
  HistoryOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  BarChartOutlined,
  QrcodeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { inventoryAPI, productsAPI, serialsAPI, suppliersAPI, formatCurrency, formatDate } from '../services/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const EnhancedInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false);
  const [isSerialDrawerVisible, setIsSerialDrawerVisible] = useState(false);
  const [isAddSerialModalVisible, setIsAddSerialModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('stock');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    outOfStock: 0,
    totalSerials: 0,
    availableSerials: 0,
  });
  const [form] = Form.useForm();
  const [serialForm] = Form.useForm();

  const serialStatuses = [
    { value: 'available', label: 'Có sẵn', color: 'green' },
    { value: 'sold', label: 'Đã bán', color: 'red' },
    { value: 'reserved', label: 'Đã đặt', color: 'orange' },
    { value: 'defective', label: 'Lỗi', color: 'red' },
  ];

  const conditionGrades = [
    { value: 'new', label: 'Mới', color: 'green' },
    { value: 'used_like_new', label: 'Cũ như mới', color: 'blue' },
    { value: 'used_good', label: 'Cũ tốt', color: 'orange' },
    { value: 'used_fair', label: 'Cũ khá', color: 'yellow' },
    { value: 'refurbished', label: 'Tân trang', color: 'purple' },
    { value: 'damaged', label: 'Hư hỏng', color: 'red' },
  ];

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchProducts();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, searchText]);

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ search: searchText });
      
      if (response.data.success) {
        setProducts(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getTransactions({ limit: 100 });
      
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải lịch sử giao dịch');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSerials = async (productId) => {
    try {
      setLoading(true);
      const response = await serialsAPI.getProductSerials(productId, { status: 'all' });
      
      if (response.data.success) {
        setProductSerials(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách serial');
      console.error('Error fetching serials:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productData) => {
    const stats = {
      totalProducts: productData.length,
      lowStockProducts: productData.filter(p => p.quantity <= (p.min_stock || 10)).length,
      totalValue: productData.reduce((sum, p) => sum + (p.quantity * (p.cost_price || p.price)), 0),
      outOfStock: productData.filter(p => p.quantity === 0).length,
      totalSerials: productData.reduce((sum, p) => sum + (p.quantity || 0), 0),
      availableSerials: productData.reduce((sum, p) => sum + (p.quantity || 0), 0),
    };
    setStats(stats);
  };

  const showAdjustModal = (product) => {
    setSelectedProduct(product);
    setIsAdjustModalVisible(true);
    form.setFieldsValue({
      current_quantity: product.quantity,
      new_quantity: product.quantity,
      reason: ''
    });
  };

  const showSerialDrawer = async (product) => {
    setSelectedProduct(product);
    setIsSerialDrawerVisible(true);
    await fetchProductSerials(product.id);
  };

  const showAddSerialModal = (product) => {
    setSelectedProduct(product);
    setIsAddSerialModalVisible(true);
    serialForm.resetFields();
    serialForm.setFieldsValue({
      condition_grade: 'new',
      status: 'available',
      warranty_start_date: moment(),
      warranty_period: 12,
    });
  };

  const handleAdjustStock = async (values) => {
    try {
      await inventoryAPI.adjustStock({
        product_id: selectedProduct.id,
        new_quantity: values.new_quantity,
        reason: values.reason,
        user_id: 1
      });
      
      message.success('Điều chỉnh tồn kho thành công');
      setIsAdjustModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      message.error('Lỗi khi điều chỉnh tồn kho');
      console.error('Error adjusting stock:', error);
    }
  };

  const handleAddSerials = async (values) => {
    try {
      const serials = [];
      const { quantity, serial_prefix, ...serialData } = values;
      
      for (let i = 1; i <= quantity; i++) {
        const serialNumber = serial_prefix ? 
          `${serial_prefix}${Date.now()}${i.toString().padStart(3, '0')}` :
          values.serial_number || `${selectedProduct.sku || 'SN'}${Date.now()}${i.toString().padStart(3, '0')}`;
        
        serials.push({
          serial_number: serialNumber,
          ...serialData,
          warranty_end_date: values.warranty_start_date && values.warranty_period ?
            values.warranty_start_date.clone().add(values.warranty_period, 'months').format('YYYY-MM-DD') :
            null,
          warranty_start_date: values.warranty_start_date ? 
            values.warranty_start_date.format('YYYY-MM-DD') : null,
        });
      }

      const response = await serialsAPI.addProductSerials(selectedProduct.id, serials);
      if (response.data.success) {
        message.success(`Thêm ${response.data.data.length} serial thành công`);
        setIsAddSerialModalVisible(false);
        serialForm.resetFields();
        fetchProducts();
        if (isSerialDrawerVisible) {
          fetchProductSerials(selectedProduct.id);
        }
      }
    } catch (error) {
      message.error('Lỗi khi thêm serial');
      console.error('Error adding serials:', error);
    }
  };

  const handleUpdateSerial = async (serialId, data) => {
    try {
      const response = await serialsAPI.updateSerial(serialId, data);
      if (response.data.success) {
        message.success('Cập nhật serial thành công');
        fetchProductSerials(selectedProduct.id);
        fetchProducts();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật serial');
      console.error('Error updating serial:', error);
    }
  };

  const handleDeleteSerial = async (serialId) => {
    try {
      const response = await serialsAPI.removeSerial(serialId);
      if (response.data.success) {
        message.success('Xóa serial thành công');
        fetchProductSerials(selectedProduct.id);
        fetchProducts();
      }
    } catch (error) {
      message.error('Lỗi khi xóa serial');
      console.error('Error deleting serial:', error);
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return { status: 'Hết hàng', color: 'red' };
    } else if (quantity <= minStock) {
      return { status: 'Sắp hết', color: 'orange' };
    } else {
      return { status: 'Còn hàng', color: 'green' };
    }
  };

  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return { status: 'N/A', color: 'default' };
    
    const endDate = moment(warrantyEnd);
    const now = moment();
    const daysLeft = endDate.diff(now, 'days');
    
    if (daysLeft < 0) {
      return { status: 'Hết hạn', color: 'red' };
    } else if (daysLeft <= 30) {
      return { status: `${daysLeft} ngày`, color: 'orange' };
    } else {
      return { status: `${Math.floor(daysLeft / 30)} tháng`, color: 'green' };
    }
  };

  const stockColumns = [
    {
      title: 'Sản phẩm',
      key: 'product_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SKU: {record.sku || 'N/A'} | Barcode: {record.barcode || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
      render: (category) => category || 'Chưa phân loại'
    },
    {
      title: 'Tồn kho',
      key: 'stock_info',
      width: 150,
      render: (_, record) => {
        const stockStatus = getStockStatus(record.quantity, record.min_stock || 10);
        return (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {record.quantity} {record.unit || 'cái'}
            </div>
            <Tag color={stockStatus.color}>{stockStatus.status}</Tag>
            <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
              Min: {record.min_stock || 10}
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Serial Numbers',
      key: 'serials',
      width: 120,
      render: (_, record) => (
        <div>
          <Badge count={record.quantity} style={{ backgroundColor: '#52c41a' }}>
            <Button
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => showSerialDrawer(record)}
            >
              Xem Serial
            </Button>
          </Badge>
        </div>
      )
    },
    {
      title: 'Giá vốn/Bán',
      key: 'pricing',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(record.price)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Vốn: {formatCurrency(record.cost_price || 0)}
          </div>
        </div>
      )
    },
    {
      title: 'Giá trị tồn kho',
      key: 'stock_value',
      width: 150,
      render: (_, record) => {
        const value = record.quantity * (record.cost_price || record.price || 0);
        return <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {formatCurrency(value)}
        </span>;
      },
      sorter: (a, b) => {
        const valueA = a.quantity * (a.cost_price || a.price || 0);
        const valueB = b.quantity * (b.cost_price || b.price || 0);
        return valueA - valueB;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem Serial">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showSerialDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Thêm Serial">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => showAddSerialModal(record)}
            />
          </Tooltip>
          <Tooltip title="Điều chỉnh tồn kho">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => showAdjustModal(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const serialColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (serial) => (
        <Text code copyable style={{ fontWeight: 'bold' }}>
          {serial}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = serialStatuses.find(s => s.value === status);
        return (
          <Tag color={statusInfo?.color}>
            {statusInfo?.label || status}
          </Tag>
        );
      },
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition_grade',
      key: 'condition_grade',
      render: (condition) => {
        const conditionInfo = conditionGrades.find(c => c.value === condition);
        return (
          <Tag color={conditionInfo?.color}>
            {conditionInfo?.label || condition}
          </Tag>
        );
      },
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || 'N/A',
    },
    {
      title: 'Bảo hành',
      key: 'warranty',
      render: (_, record) => {
        const warranty = getWarrantyStatus(record.warranty_end_date);
        return (
          <div>
            <Tag color={warranty.color}>{warranty.status}</Tag>
            {record.warranty_end_date && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                Đến: {moment(record.warranty_end_date).format('DD/MM/YYYY')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              // TODO: Implement edit serial modal
            }}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa serial này?"
            onConfirm={() => handleDeleteSerial(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeConfig = {
          import: { label: 'Nhập kho', color: 'green', icon: <ImportOutlined /> },
          export: { label: 'Xuất kho', color: 'red', icon: <ExportOutlined /> },
          adjustment: { label: 'Điều chỉnh', color: 'blue', icon: <SettingOutlined /> },
          return: { label: 'Trả hàng', color: 'orange', icon: <HistoryOutlined /> }
        };
        const config = typeConfig[type] || { label: type, color: 'default' };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name'
    },
    {
      title: 'Số lượng trước',
      dataIndex: 'quantity_before',
      key: 'quantity_before',
      width: 120,
      render: (qty) => <span>{qty}</span>
    },
    {
      title: 'Thay đổi',
      dataIndex: 'quantity_change',
      key: 'quantity_change',
      width: 100,
      render: (change) => (
        <span style={{ 
          color: change > 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {change > 0 ? '+' : ''}{change}
        </span>
      )
    },
    {
      title: 'Số lượng sau',
      dataIndex: 'quantity_after',
      key: 'quantity_after',
      width: 120,
      render: (qty) => <strong>{qty}</strong>
    },
    {
      title: 'Nhân viên',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
      render: (name) => name || 'Hệ thống'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes'
    }
  ];

  const lowStockProducts = products.filter(p => p.quantity <= (p.min_stock || 10));

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Quản lý Tồn kho</h1>
        <Text type="secondary">
          Theo dõi chi tiết từng serial number và quản lý tồn kho thông minh
        </Text>
      </div>

      {/* Header với thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStockProducts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng Serial"
              value={stats.totalSerials}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Serial có sẵn"
              value={stats.availableSerials}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={stats.totalValue}
              formatter={value => formatCurrency(value)}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'stock',
              label: 'Tồn kho & Serial',
              children: (
                <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Search
                  placeholder="Tìm sản phẩm theo tên, SKU, barcode..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={fetchProducts}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col span={12}>
                <Space style={{ float: 'right' }}>
                  <Button icon={<ImportOutlined />}>
                    Import Serial
                  </Button>
                  <Button icon={<ExportOutlined />}>
                    Export Data
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              columns={stockColumns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{
                total: products.length,
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
              }}
              scroll={{ x: 1400 }}
            />
                </div>
              )
            },
            {
              key: 'transactions',
              label: 'Lịch sử giao dịch',
              children: (
                <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Search
                  placeholder="Tìm theo sản phẩm..."
                  onSearch={(value) => {
                    setSearchText(value);
                    fetchTransactions();
                  }}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Lọc theo loại giao dịch"
                  allowClear
                  onChange={(value) => {
                    // TODO: Filter transactions by type
                  }}
                >
                  <Option value="import">Nhập kho</Option>
                  <Option value="export">Xuất kho</Option>
                  <Option value="adjustment">Điều chỉnh</Option>
                  <Option value="return">Trả hàng</Option>
                </Select>
              </Col>
              <Col span={10}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  onChange={(dates) => {
                    // TODO: Filter transactions by date range
                  }}
                />
              </Col>
            </Row>

            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              loading={loading}
              pagination={{
                total: transactions.length,
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} giao dịch`
              }}
              scroll={{ x: 1200 }}
            />
                </div>
              )
            },
            {
              key: 'alerts',
              label: 'Cảnh báo tồn kho',
              children: (
                <div>
            <Card title="Sản phẩm sắp hết hàng" style={{ marginBottom: 16 }}>
              <Alert
                message="Cảnh báo tồn kho"
                description={`Có ${lowStockProducts.length} sản phẩm sắp hết hàng. Hãy liên hệ nhà cung cấp để nhập thêm.`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={stockColumns.filter(col => 
                  ['product_info', 'stock_info', 'serials', 'actions'].includes(col.key)
                )}
                dataSource={lowStockProducts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Serial Number Drawer */}
      <Drawer
        title={`Serial Numbers - ${selectedProduct?.name}`}
        width={800}
        visible={isSerialDrawerVisible}
        onClose={() => setIsSerialDrawerVisible(false)}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showAddSerialModal(selectedProduct)}
            >
              Thêm Serial
            </Button>
            <Button icon={<ExportOutlined />}>
              Export
            </Button>
          </Space>
        }
      >
        {selectedProduct && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Sản phẩm: </Text>{selectedProduct.name}
                </Col>
                <Col span={12}>
                  <Text strong>SKU: </Text>{selectedProduct.sku || 'N/A'}
                </Col>
                <Col span={12}>
                  <Text strong>Tồn kho: </Text>{selectedProduct.quantity} cái
                </Col>
                <Col span={12}>
                  <Text strong>Serial có sẵn: </Text>
                  {productSerials.filter(s => s.status === 'available').length} cái
                </Col>
              </Row>
            </Card>

            <Table
              columns={serialColumns}
              dataSource={productSerials}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} serial`
              }}
              scroll={{ x: 600 }}
            />
          </div>
        )}
      </Drawer>

      {/* Add Serial Modal */}
      <Modal
        title={`Thêm Serial cho ${selectedProduct?.name}`}
        visible={isAddSerialModalVisible}
        onCancel={() => setIsAddSerialModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={serialForm}
          layout="vertical"
          onFinish={handleAddSerials}
        >
          <Alert
            message="Thêm Serial Numbers"
            description="Bạn có thể thêm một hoặc nhiều serial numbers cùng lúc"
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                initialValue={1}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  {serialStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tình trạng"
                name="condition_grade"
                rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
              >
                <Select>
                  {conditionGrades.map(condition => (
                    <Option key={condition.value} value={condition.value}>
                      <Tag color={condition.color}>{condition.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Prefix Serial (tùy chọn)"
                name="serial_prefix"
                tooltip="Nếu có, hệ thống sẽ tự động tạo serial theo format: PREFIX + timestamp + số thứ tự"
              >
                <Input placeholder="VD: CPU2024, GPU2024" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Serial Number cụ thể" name="serial_number">
                <Input placeholder="Chỉ áp dụng khi thêm 1 serial" disabled={serialForm.getFieldValue('quantity') > 1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Giá nhập" name="purchase_price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Vị trí kho" name="location">
                <Input placeholder="VD: A1-01, B2-05" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Nhà cung cấp" name="supplier_id">
                <Select placeholder="Chọn nhà cung cấp" allowClear>
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Ngày bắt đầu BH" name="warranty_start_date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Thời hạn BH (tháng)" name="warranty_period">
                <InputNumber min={0} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item shouldUpdate={(prevValues, currentValues) => 
                prevValues.warranty_start_date !== currentValues.warranty_start_date ||
                prevValues.warranty_period !== currentValues.warranty_period
              }>
                {({ getFieldValue }) => {
                  const startDate = getFieldValue('warranty_start_date');
                  const period = getFieldValue('warranty_period');
                  const endDate = startDate && period ? 
                    startDate.clone().add(period, 'months') : null;
                  return (
                    <div>
                      <Text type="secondary">Ngày kết thúc BH:</Text>
                      <div style={{ fontWeight: 'bold' }}>
                        {endDate ? endDate.format('DD/MM/YYYY') : 'N/A'}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm về serial..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddSerialModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm Serial
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        title="Điều chỉnh tồn kho"
        visible={isAdjustModalVisible}
        onCancel={() => setIsAdjustModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedProduct && (
          <div>
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
              <div><strong>Sản phẩm:</strong> {selectedProduct.name}</div>
              <div><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</div>
              <div><strong>Tồn kho hiện tại:</strong> {selectedProduct.quantity} {selectedProduct.unit || 'cái'}</div>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleAdjustStock}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số lượng hiện tại"
                    name="current_quantity"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số lượng mới"
                    name="new_quantity"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số lượng mới' },
                      { type: 'number', min: 0, message: 'Số lượng phải >= 0' }
                    ]}
                  >
                    <Input type="number" min={0} placeholder="Nhập số lượng mới" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Lý do điều chỉnh"
                name="reason"
                rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập lý do điều chỉnh tồn kho..."
                />
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setIsAdjustModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Xác nhận điều chỉnh
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnhancedInventoryPage; 