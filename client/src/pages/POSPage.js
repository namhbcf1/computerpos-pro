import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Button, 
  List, 
  Typography, 
  message, 
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Divider,
  Spin,
  Table
} from 'antd';
import { 
  PlusOutlined, 
  MinusOutlined, 
  DeleteOutlined,
  ShoppingCartOutlined,
  PrinterOutlined,
  SearchOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { productsAPI, ordersAPI, customersAPI } from '../services/api';
import { formatCurrency } from '../utils/format';

const { Title, Text } = Typography;
const { Search } = Input;

const orderSchema = z.object({
  customer_id: z.number().int().positive().optional().nullable(),
  customer_name: z.string().min(1, 'Vui lòng chọn hoặc nhập tên khách hàng.').optional(),
  customer_phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ.').optional().or(z.literal('')),
  notes: z.string().optional(),
});

function POSPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: null,
      customer_name: '',
      customer_phone: '',
      notes: '',
    }
  });

  const customerPhoneWatch = watch('customer_phone');

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      setValue('customer_id', selectedCustomer.id);
      setValue('customer_name', selectedCustomer.name);
      setValue('customer_phone', selectedCustomer.phone);
    } else {
      setValue('customer_id', null);
    }
  }, [selectedCustomer, setValue]);

  const fetchCustomers = async (searchQuery = '') => {
    try {
      const response = await customersAPI.getAll({ phone: searchQuery, name: searchQuery });
      if (response.data.success) {
        setCustomers(response.data.data || []);
        setFilteredCustomers(response.data.data || []);
      } else {
        setCustomers([]);
        toast.error('Lỗi khi lấy danh sách khách hàng: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      toast.error('Lỗi kết nối khi lấy danh sách khách hàng.');
    }
  };

  const handleCustomerSearch = (value) => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(value.toLowerCase()) ||
      customer.phone?.includes(value)
    );
    setFilteredCustomers(filtered);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModalVisible(false);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setValue('customer_id', null);
    setValue('customer_name', '');
    setValue('customer_phone', '');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      } else {
        setProducts([]);
        console.error('API returned error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      // Don't show error message to user, just silently handle it
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(value.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.warning('Sản phẩm đã hết hàng');
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.warning('Không thể thêm, vượt quá số lượng tồn kho');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        max_quantity: product.quantity
      }]);
    }
  };

  const updateCartQuantity = (product_id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(product_id);
      return;
    }

    const product = products.find(p => p.id === product_id);
    if (newQuantity > product.quantity) {
      toast.warning('Vượt quá số lượng tồn kho');
      return;
    }

    setCart(cart.map(item =>
      item.product_id === product_id
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (product_id) => {
    setCart(cart.filter(item => item.product_id !== product_id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warning('Giỏ hàng trống');
      return;
    }
    setOrderModalVisible(true);
  };

  const submitOrder = async (values) => {
    try {
      setLoading(true);
      
      const orderData = {
        customer_id: values.customer_id,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        total: getTotalAmount(),
        notes: values.notes,
      };

      const response = await ordersAPI.create(orderData);
      
      if (response.data.success) {
        toast.success('Tạo đơn hàng thành công!');
        
        reset();
        setSelectedCustomer(null);
        clearCart();
        setOrderModalVisible(false);
        
        fetchProducts();
        
        showPrintModal(response.data.data);
      } else {
        toast.error(response.data.message || 'Lỗi khi tạo đơn hàng');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi kết nối khi tạo đơn hàng.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showPrintModal = (order) => {
    Modal.info({
      title: 'Hóa đơn bán hàng',
      width: 500,
      content: (
        <div style={{ padding: '20px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={4}>HÓA ĐƠN BÁN HÀNG</Title>
            <Text>Số hóa đơn: {order.order_number}</Text><br/>
            <Text type="secondary">
              {new Date(order.created_at).toLocaleString('vi-VN')}
            </Text>
          </div>
          
          <Divider />
          
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Khách hàng: </Text>
            <Text>{order.customer?.name || order.customer_name}</Text><br/>
            {(order.customer?.phone || order.customer_phone) && (
              <>
                <Text strong>Số điện thoại: </Text>
                <Text>{order.customer?.phone || order.customer_phone}</Text>
              </>
            )}
          </div>
          
          <Divider />
          
          <List
            size="small"
            dataSource={order.items}
            renderItem={item => (
              <List.Item style={{ padding: '8px 0' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text>{item.product_name}</Text><br/>
                    <Text type="secondary">{item.quantity} x {formatCurrency(item.price)}</Text>
                  </div>
                  <Text strong>{formatCurrency(item.subtotal)}</Text>
                </div>
              </List.Item>
            )}
          />
          
          <Divider />
          
          <div style={{ textAlign: 'right' }}>
            <Title level={4} style={{ margin: 0 }}>
              Tổng cộng: {formatCurrency(order.total_amount)}
            </Title>
          </div>
        </div>
      ),
      footer: (
        <Button 
          type="primary" 
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        >
          In hóa đơn
        </Button>
      )
    });
  };

  const customerColumns = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => selectCustomer(record)}>Chọn</Button>
      ),
    },
  ];

  return (
    <div className="pos-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Danh sách sản phẩm"
            extra={
              <Search
                placeholder="Tìm sản phẩm..."
                onSearch={handleSearch}
                style={{ width: 200 }}
                loading={loading}
              />
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
                dataSource={filteredProducts}
                renderItem={product => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={<img alt={product.name} src={product.image_url || 'https://via.placeholder.com/150'} />}
                      onClick={() => addToCart(product)}
                      style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <Card.Meta 
                        title={product.name}
                        description={formatCurrency(product.price)}
                      />
                      <div style={{ marginTop: '10px' }}>
                        <Text type="secondary">Tồn kho: {product.quantity}</Text>
                        {product.quantity <= 10 && product.quantity > 0 && (
                          <Tag color="warning" style={{ marginLeft: '8px' }}>Sắp hết</Tag>
                        )}
                        {product.quantity === 0 && (
                          <Tag color="error" style={{ marginLeft: '8px' }}>Hết hàng</Tag>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Giỏ hàng"
            actions={[
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Thanh toán ({getTotalItems()})
              </Button>,
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Xóa giỏ hàng
              </Button>,
            ]}
          >
            <List
              itemLayout="horizontal"
              dataSource={cart}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.max_quantity}
                    />,
                    <InputNumber
                      min={1}
                      max={item.max_quantity}
                      value={item.quantity}
                      onChange={(value) => updateCartQuantity(item.product_id, value)}
                      style={{ width: 60 }}
                    />,
                    <Button 
                      icon={<MinusOutlined />} 
                      onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                    />,
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined style={{ color: 'red' }} />} 
                      onClick={() => removeFromCart(item.product_id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={formatCurrency(item.price)}
                  />
                  <div>
                    <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                  </div>
                </List.Item>
              )}
            />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Title level={3}>Tổng cộng: {formatCurrency(getTotalAmount())}</Title>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Tạo đơn hàng"
        visible={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={handleSubmit(submitOrder)}>
          <Form.Item label="Khách hàng">
            {selectedCustomer ? (
              <Space>
                <Text strong>{selectedCustomer.name}</Text>
                <Text type="secondary">({selectedCustomer.phone})</Text>
                <Button size="small" onClick={clearSelectedCustomer}>Xóa</Button>
              </Space>
            ) : (
              <Button 
                icon={<UserOutlined />} 
                onClick={() => setCustomerModalVisible(true)}
              >
                Chọn khách hàng
              </Button>
            )}
          </Form.Item>

          {!selectedCustomer && (
            <Controller
              name="customer_phone"
              control={control}
              render={({ field }) => (
                <Form.Item label="Số điện thoại khách hàng" help={errors.customer_phone?.message} validateStatus={errors.customer_phone ? 'error' : ''}>
                  <Search
                    {...field}
                    placeholder="Tìm khách hàng theo SĐT hoặc nhập mới"
                    onSearch={(value) => {
                      const foundCustomer = customers.find(c => c.phone === value);
                      if (foundCustomer) {
                        selectCustomer(foundCustomer);
                        toast.success(`Đã tìm thấy khách hàng: ${foundCustomer.name}`);
                      } else if (value) {
                        toast.info('Không tìm thấy khách hàng với SĐT này. Vui lòng nhập tên mới.');
                        setValue('customer_name', '');
                      }
                      field.onChange(value);
                    }}
                    enterButton={<SearchOutlined />}
                  />
                </Form.Item>
              )}
            />
          )}

          {!selectedCustomer && !customerPhoneWatch && (
            <Controller
              name="customer_name"
              control={control}
              render={({ field }) => (
                <Form.Item label="Tên khách hàng (Nếu không có SĐT)" help={errors.customer_name?.message} validateStatus={errors.customer_name ? 'error' : ''}>
                  <Input {...field} placeholder="Nhập tên khách hàng" />
                </Form.Item>
              )}
            />
          )}

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Form.Item label="Ghi chú">
                <Input.TextArea {...field} rows={3} placeholder="Ghi chú về đơn hàng" />
              </Form.Item>
            )}
          />

          <Divider />

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Title level={4}>Tổng tiền: {formatCurrency(getTotalAmount())}</Title>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Hoàn tất đơn hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chọn khách hàng"
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        footer={null}
        width={800}
      >
        <Search
          placeholder="Tìm khách hàng theo tên hoặc số điện thoại..."
          onSearch={handleCustomerSearch}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={filteredCustomers}
          columns={customerColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      </Modal>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default POSPage; 