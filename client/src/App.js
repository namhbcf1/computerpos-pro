import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Badge, Card, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  WalletOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SafetyOutlined,
  QrcodeOutlined,
  ToolOutlined
} from '@ant-design/icons';

// Import all pages
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import EnhancedInventoryPage from './pages/EnhancedInventoryPage';
import FinancialPage from './pages/FinancialPage';
import DebtPage from './pages/DebtPage';
import UsersPage from './pages/UsersPage';
import EnhancedReportsPage from './pages/EnhancedReportsPage';
import WarrantyPage from './pages/WarrantyPage';
import SerialManagementPage from './pages/SerialManagementPage';

import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['pos']);

  // Mock user data - TODO: Get from authentication context
  const currentUser = {
    name: 'Admin User',
    role: 'admin',
    avatar: null
  };

  // Mock notification count
  const notificationCount = 3;

  const menuItems = [
    {
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: 'Bán hàng (POS)',
      path: '/pos'
    },
    {
      key: 'products',
      icon: <InboxOutlined />,
      label: 'Sản phẩm',
      path: '/products'
    },
    {
      key: 'serials',
      icon: <QrcodeOutlined />,
      label: 'Quản lý Serial',
      path: '/serials'
    },
    {
      key: 'warranty',
      icon: <SafetyOutlined />,
      label: 'Bảo hành',
      path: '/warranty'
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: 'Đơn hàng',
      path: '/orders'
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
      path: '/customers'
    },
    {
      key: 'inventory',
      icon: <ToolOutlined />,
      label: 'Tồn kho',
      path: '/inventory'
    },
    {
      key: 'suppliers',
      icon: <SafetyOutlined />,
      label: 'Nhà cung cấp',
      path: '/suppliers'
    },
    {
      key: 'financial',
      icon: <WalletOutlined />,
      label: 'Thu chi',
      path: '/financial'
    },
    {
      key: 'debt',
      icon: <DashboardOutlined />,
      label: 'Công nợ',
      path: '/debt'
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      path: '/reports'
    },
    {
      key: 'users',
      icon: <SettingOutlined />,
      label: 'Nhân viên',
      path: '/users'
    }
  ];

  const getCurrentPath = () => {
    return window.location.pathname;
  };

  const getCurrentPageTitle = () => {
    const path = getCurrentPath();
    const titleMap = {
      '/pos': 'Bán hàng (POS)',
      '/products': 'Quản lý sản phẩm',
      '/serials': 'Quản lý Serial Number',
      '/warranty': 'Quản lý bảo hành',
      '/orders': 'Quản lý đơn hàng',
      '/customers': 'Quản lý khách hàng',
      '/inventory': 'Quản lý tồn kho',
      '/suppliers': 'Quản lý nhà cung cấp',
      '/financial': 'Quản lý thu chi',
      '/debt': 'Quản lý công nợ',
      '/reports': 'Báo cáo thống kê',
      '/users': 'Quản lý nhân viên'
    };
    return titleMap[path] || 'POS System';
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logout clicked');
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          data-testid="sidebar"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{
            height: '80px',
            margin: '20px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '18px' : '24px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {collapsed ? '🏪' : '🏪 Smart POS'}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            style={{
              borderRight: 0,
              background: 'transparent',
              fontSize: '16px'
            }}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: <a href={item.path} style={{ color: 'inherit', textDecoration: 'none' }}>{item.label}</a>
            }))}
          />
        </Sider>

        {/* Main Layout */}
        <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.3s ease' }}>
          {/* Header */}
          <Header style={{
            padding: '0 32px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '80px'
          }}>
            <Space size="large">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                data-testid="mobile-menu-button"
                style={{
                  fontSize: '18px',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              />

              <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
                {getCurrentPageTitle()}
              </Title>
            </Space>

            <Space size="large">
              {/* Notifications */}
              <Badge count={notificationCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  size="large"
                  style={{
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
              </Badge>

              {/* User Info */}
              <Card
                size="small"
                style={{
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                <Space>
                  <Avatar
                    size="default"
                    icon={<UserOutlined />}
                    src={currentUser.avatar}
                    style={{ background: '#667eea' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {currentUser.role}
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ color: '#ff4d4f' }}
                  />
                </Space>
              </Card>
            </Space>
          </Header>

          {/* Content */}
          <Content style={{
            margin: '24px',
            minHeight: 'calc(100vh - 128px)',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              minHeight: '100%',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Routes>
                <Route path="/" element={<Navigate to="/pos" replace />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/serials" element={<SerialManagementPage />} />
                <Route path="/warranty" element={<WarrantyPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/reports" element={<EnhancedReportsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/inventory" element={<EnhancedInventoryPage />} />
                <Route path="/financial" element={<FinancialPage />} />
                <Route path="/debt" element={<DebtPage />} />
                <Route path="/users" element={<UsersPage />} />

                {/* 404 Page */}
                <Route path="*" element={
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <Title level={2}>404 - Trang không tìm thấy</Title>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                      Trang bạn tìm kiếm không tồn tại
                    </p>
                    <Button type="primary" size="large" href="/pos">
                      Quay về trang chính
                    </Button>
                  </div>
                } />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App; 