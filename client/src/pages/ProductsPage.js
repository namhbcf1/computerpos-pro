import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';

import { productsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

const { Search } = Input;
const { Option } = Select;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(value.toLowerCase()) ||
      product.category?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const showModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
    
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  };

  const hideModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (editingProduct) {
        // Cập nhật sản phẩm
        const response = await productsAPI.update(editingProduct.id, values);
        if (response.data.success) {
          message.success('Cập nhật sản phẩm thành công');
        }
      } else {
        // Tạo sản phẩm mới
        const response = await productsAPI.create(values);
        if (response.data.success) {
          message.success('Tạo sản phẩm thành công');
        }
      }
      
      hideModal();
      loadProducts();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await productsAPI.delete(id);
      if (response.data.success) {
        message.success('Xóa sản phẩm thành công');
        loadProducts();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  };

  const getStats = () => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    return { totalProducts, inStock, outOfStock, totalValue };
  };

  const stats = getStats();

  const columns = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (sku) => sku || '-'
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => category || 'Chưa phân loại'
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => formatCurrency(price),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => (
        <Tag color={quantity > 0 ? 'green' : 'red'}>
          {quantity}
        </Tag>
      ),
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
      render: (barcode) => barcode || '-'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
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
      )
    }
  ];

  return (
    <div>
      <h1>Quản lý Sản phẩm</h1>
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Còn hàng"
              value={stats.inStock}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={stats.totalValue}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng sản phẩm */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={e => handleSearch(e.target.value)}
          />
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm sản phẩm
          </Button>
        </div>

        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={hideModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mã sản phẩm (SKU)"
                name="sku"
              >
                <Input placeholder="Nhập mã sản phẩm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá bán"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              >
                <InputNumber
                  placeholder="Nhập giá bán"
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber
                  placeholder="Nhập số lượng"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
              >
                <Select placeholder="Chọn danh mục" allowClear>
                  {getCategories().map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                  <Option value="General">General</Option>
                  <Option value="Nước uống">Nước uống</Option>
                  <Option value="Thực phẩm">Thực phẩm</Option>
                  <Option value="Bánh kẹo">Bánh kẹo</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Barcode"
                name="barcode"
              >
                <Input placeholder="Nhập barcode" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={hideModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductsPage; 