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
  Steps,
  Timeline,
  Progress,
  Alert
} from 'antd';
import {
  SafetyOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  SwapOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const WarrantyPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('warranties');
  const [modalVisible, setModalVisible] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();
  const [claimForm] = Form.useForm();
  
  const [stats, setStats] = useState({
    totalWarranties: 0,
    activeWarranties: 0,
    expiredWarranties: 0,
    pendingClaims: 0,
    processingClaims: 0,
    completedClaims: 0
  });

  useEffect(() => {
    fetchWarranties();
    fetchClaims();
  }, []);

  const fetchWarranties = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockWarranties = [
        {
          id: 1,
          warranty_code: 'WR20250718-000001',
          product_name: 'Laptop Dell Inspiron 15',
          serial_number: 'DL123456789',
          customer_name: 'Nguyễn Văn A',
          warranty_type: 'manufacturer',
          warranty_period_months: 24,
          start_date: '2024-01-15',
          end_date: '2026-01-15',
          status: 'active'
        },
        {
          id: 2,
          warranty_code: 'WR20250718-000002',
          product_name: 'iPhone 15 Pro',
          serial_number: 'IP987654321',
          customer_name: 'Trần Thị B',
          warranty_type: 'store',
          warranty_period_months: 12,
          start_date: '2024-06-01',
          end_date: '2025-06-01',
          status: 'active'
        }
      ];
      
      setWarranties(mockWarranties);
      
      // Calculate stats
      const now = dayjs();
      const newStats = {
        totalWarranties: mockWarranties.length,
        activeWarranties: mockWarranties.filter(w => 
          w.status === 'active' && dayjs(w.end_date).isAfter(now)
        ).length,
        expiredWarranties: mockWarranties.filter(w => 
          dayjs(w.end_date).isBefore(now)
        ).length,
        pendingClaims: 0,
        processingClaims: 0,
        completedClaims: 0
      };
      setStats(newStats);
      
    } catch (error) {
      message.error('Lỗi khi tải danh sách bảo hành');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      // Mock data - replace with actual API call
      const mockClaims = [
        {
          id: 1,
          claim_number: 'CL20250718-001',
          warranty_code: 'WR20250718-000001',
          customer_name: 'Nguyễn Văn A',
          product_name: 'Laptop Dell Inspiron 15',
          claim_type: 'repair',
          issue_description: 'Màn hình bị sọc',
          claim_date: '2025-01-15',
          status: 'pending'
        }
      ];
      setClaims(mockClaims);
    } catch (error) {
      message.error('Lỗi khi tải danh sách yêu cầu bảo hành');
    }
  };

  const getWarrantyStatusColor = (warranty) => {
    const now = dayjs();
    const endDate = dayjs(warranty.end_date);
    
    if (warranty.status === 'void') return 'red';
    if (warranty.status === 'claimed') return 'orange';
    if (endDate.isBefore(now)) return 'red';
    if (endDate.diff(now, 'month') <= 1) return 'orange';
    return 'green';
  };

  const getWarrantyStatusText = (warranty) => {
    const now = dayjs();
    const endDate = dayjs(warranty.end_date);
    
    if (warranty.status === 'void') return 'Đã hủy';
    if (warranty.status === 'claimed') return 'Đã sử dụng';
    if (endDate.isBefore(now)) return 'Hết hạn';
    if (endDate.diff(now, 'month') <= 1) return 'Sắp hết hạn';
    return 'Còn hiệu lực';
  };

  const getClaimStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      rejected: 'red',
      processing: 'purple',
      completed: 'green'
    };
    return colors[status] || 'default';
  };

  const getClaimStatusText = (status) => {
    const texts = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành'
    };
    return texts[status] || status;
  };

  const warrantyColumns = [
    {
      title: 'Mã bảo hành',
      dataIndex: 'warranty_code',
      key: 'warranty_code',
      render: (text) => <Text code strong>{text}</Text>
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name'
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name'
    },
    {
      title: 'Loại bảo hành',
      dataIndex: 'warranty_type',
      key: 'warranty_type',
      render: (type) => {
        const typeTexts = {
          manufacturer: 'Nhà sản xuất',
          store: 'Cửa hàng',
          extended: 'Mở rộng'
        };
        return <Tag>{typeTexts[type] || type}</Tag>;
      }
    },
    {
      title: 'Thời hạn',
      key: 'warranty_period',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>{record.warranty_period_months} tháng</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(record.start_date).format('DD/MM/YYYY')} - {dayjs(record.end_date).format('DD/MM/YYYY')}
          </Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={getWarrantyStatusColor(record)}>
          {getWarrantyStatusText(record)}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Tạo yêu cầu bảo hành">
            <Button 
              type="text" 
              icon={<FileTextOutlined />} 
              onClick={() => createClaim(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditWarranty(record)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              onClick={() => viewWarrantyDetails(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const claimColumns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'claim_number',
      key: 'claim_number',
      render: (text) => <Text code strong>{text}</Text>
    },
    {
      title: 'Mã bảo hành',
      dataIndex: 'warranty_code',
      key: 'warranty_code',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name'
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name'
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'claim_type',
      key: 'claim_type',
      render: (type) => {
        const typeTexts = {
          repair: 'Sửa chữa',
          replace: 'Thay thế',
          refund: 'Hoàn tiền'
        };
        const typeColors = {
          repair: 'blue',
          replace: 'orange',
          refund: 'red'
        };
        return <Tag color={typeColors[type]}>{typeTexts[type] || type}</Tag>;
      }
    },
    {
      title: 'Mô tả vấn đề',
      dataIndex: 'issue_description',
      key: 'issue_description',
      ellipsis: true
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'claim_date',
      key: 'claim_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getClaimStatusColor(status)}>
          {getClaimStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xử lý">
            <Button 
              type="text" 
              icon={<ToolOutlined />} 
              onClick={() => processClaim(record)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              onClick={() => viewClaimDetails(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const createClaim = (warranty) => {
    claimForm.resetFields();
    claimForm.setFieldsValue({
      warranty_id: warranty.id,
      warranty_code: warranty.warranty_code,
      customer_name: warranty.customer_name,
      product_name: warranty.product_name
    });
    setClaimModalVisible(true);
  };

  const handleEditWarranty = (record) => {
    // TODO: Implement warranty editing
    message.info('Tính năng chỉnh sửa bảo hành đang được phát triển');
  };

  const viewWarrantyDetails = (record) => {
    // TODO: Implement warranty details view
    message.info('Tính năng xem chi tiết bảo hành đang được phát triển');
  };

  const processClaim = (record) => {
    // TODO: Implement claim processing
    message.info('Tính năng xử lý yêu cầu bảo hành đang được phát triển');
  };

  const viewClaimDetails = (record) => {
    // TODO: Implement claim details view
    message.info('Tính năng xem chi tiết yêu cầu đang được phát triển');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <h1>
            <SafetyOutlined /> Quản lý Bảo hành
          </h1>
        </Col>
        
        {/* Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Tổng bảo hành" 
                  value={stats.totalWarranties} 
                  prefix={<SafetyOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Còn hiệu lực" 
                  value={stats.activeWarranties} 
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Hết hạn" 
                  value={stats.expiredWarranties} 
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Chờ duyệt" 
                  value={stats.pendingClaims} 
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Đang xử lý" 
                  value={stats.processingClaims} 
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Hoàn thành" 
                  value={stats.completedClaims} 
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default WarrantyPage;
