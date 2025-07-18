import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Divider,
  Upload,
  QRCode
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  QrcodeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  PrinterOutlined,
  ScanOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { serialsAPI, productsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SerialManagementPage = () => {
  const [serials, setSerials] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSerial, setEditingSerial] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    warranty: 0,
    defective: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchSerials();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    }
  };

  const fetchSerials = async () => {
    setLoading(true);
    try {
      // Fetch serials for all products or specific product
      let allSerials = [];
      if (selectedProduct) {
        const response = await serialsAPI.getProductSerials(selectedProduct, { status: statusFilter });
        if (response.data.success) {
          allSerials = response.data.data;
        }
      } else {
        const response = await serialsAPI.searchSerials({ q: searchText || '', status: statusFilter });
        if (response.data.success) {
          allSerials = response.data.data;
        }
      }
      
      setSerials(allSerials);
      
      // Calculate stats
      const newStats = {
        total: allSerials.length,
        available: allSerials.filter(s => s.status === 'available').length,
        sold: allSerials.filter(s => s.status === 'sold').length,
        warranty: allSerials.filter(s => s.status === 'warranty').length,
        defective: allSerials.filter(s => s.status === 'defective').length
      };
      setStats(newStats);
      
    } catch (error) {
      message.error('Lỗi khi tải danh sách serial');
      // Mock data for testing
      const mockSerials = [
        { id: 1, serialNumber: 'SN001', productName: 'CPU Intel i7', status: 'available' },
        { id: 2, serialNumber: 'SN002', productName: 'GPU RTX 4080', status: 'sold' },
        { id: 3, serialNumber: 'SN003', productName: 'RAM 16GB', status: 'warranty' }
      ];
      setSerials(mockSerials);
      setFilteredSerials(mockSerials);

      const mockStats = {
        total: 3,
        available: 1,
        sold: 1,
        warranty: 1,
        defective: 0
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSerial = () => {
    setEditingSerial(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSerial = (record) => {
    setEditingSerial(record);
    form.setFieldsValue({
      ...record,
      warranty_start_date: record.warranty_start_date ? dayjs(record.warranty_start_date) : null,
      warranty_end_date: record.warranty_end_date ? dayjs(record.warranty_end_date) : null
    });
    setModalVisible(true);
  };

  const handleDeleteSerial = async (id) => {
    try {
      await serialsAPI.removeSerial(id);
      message.success('Xóa serial thành công');
      fetchSerials();
    } catch (error) {
      message.error('Lỗi khi xóa serial');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        warranty_start_date: values.warranty_start_date?.format('YYYY-MM-DD'),
        warranty_end_date: values.warranty_end_date?.format('YYYY-MM-DD')
      };

      if (editingSerial) {
        await serialsAPI.updateSerial(editingSerial.id, formattedValues);
        message.success('Cập nhật serial thành công');
      } else {
        if (!selectedProduct) {
          message.error('Vui lòng chọn sản phẩm');
          return;
        }
        await serialsAPI.addProductSerials(selectedProduct, [formattedValues]);
        message.success('Thêm serial thành công');
      }
      
      setModalVisible(false);
      fetchSerials();
    } catch (error) {
      message.error('Lỗi khi lưu serial');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      sold: 'blue',
      warranty: 'orange',
      defective: 'red',
      reserved: 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      available: 'Có sẵn',
      sold: 'Đã bán',
      warranty: 'Bảo hành',
      defective: 'Lỗi',
      reserved: 'Đặt trước'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text) => (
        <Space>
          <Text code strong>{text}</Text>
          <Tooltip title="Tạo QR Code">
            <Button 
              type="text" 
              icon={<QrcodeOutlined />} 
              size="small"
              onClick={() => showQRCode(text)}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition_grade',
      key: 'condition_grade',
      render: (grade) => {
        const gradeColors = {
          new: 'green',
          good: 'blue',
          fair: 'orange',
          poor: 'red'
        };
        return <Tag color={gradeColors[grade]}>{grade?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Giá mua',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (price) => price ? `${price.toLocaleString()} VND` : '-'
    },
    {
      title: 'Bảo hành',
      key: 'warranty',
      render: (_, record) => {
        if (record.warranty_start_date && record.warranty_end_date) {
          const isExpired = dayjs().isAfter(dayjs(record.warranty_end_date));
          return (
            <Space direction="vertical" size="small">
              <Text type={isExpired ? 'danger' : 'success'}>
                {isExpired ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                {isExpired ? ' Hết hạn' : ' Còn hạn'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {dayjs(record.warranty_end_date).format('DD/MM/YYYY')}
              </Text>
            </Space>
          );
        }
        return <Text type="secondary">Chưa có</Text>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditSerial(record)}
            />
          </Tooltip>
          <Tooltip title="In nhãn">
            <Button 
              type="text" 
              icon={<PrinterOutlined />} 
              onClick={() => printLabel(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteSerial(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const showQRCode = (serialNumber) => {
    Modal.info({
      title: 'QR Code',
      content: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <QRCode value={serialNumber} size={200} />
          <div style={{ marginTop: '16px' }}>
            <Text code>{serialNumber}</Text>
          </div>
        </div>
      ),
      width: 300
    });
  };

  const printLabel = (record) => {
    // TODO: Implement label printing
    message.info('Tính năng in nhãn đang được phát triển');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <h1>
            <QrcodeOutlined /> Quản lý Serial Number
          </h1>
        </Col>
        
        {/* Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={5}>
              <Card>
                <Statistic 
                  title="Tổng số" 
                  value={stats.total} 
                  prefix={<QrcodeOutlined />}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card>
                <Statistic 
                  title="Có sẵn" 
                  value={stats.available} 
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card>
                <Statistic 
                  title="Đã bán" 
                  value={stats.sold} 
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<SafetyOutlined />}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card>
                <Statistic 
                  title="Bảo hành" 
                  value={stats.warranty} 
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Lỗi" 
                  value={stats.defective} 
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Serial Numbers Table */}
        <Col span={24} style={{ marginTop: 24 }}>
          <Card title="Danh sách Serial Number">
            <Table
              dataSource={filteredSerials}
              columns={[
                {
                  title: 'Serial Number',
                  dataIndex: 'serialNumber',
                  key: 'serialNumber',
                },
                {
                  title: 'Sản phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'available' ? 'green' : status === 'sold' ? 'blue' : 'orange'}>
                      {status === 'available' ? 'Có sẵn' : status === 'sold' ? 'Đã bán' : 'Bảo hành'}
                    </Tag>
                  ),
                },
              ]}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SerialManagementPage;
