import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Breadcrumb, Dropdown, Avatar, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  ShopOutlined,
  CreditCardOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  WalletOutlined,
  WarningOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  TruckOutlined
} from '@ant-design/icons';

// Import all pages
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import EnhancedInventoryPage from './pages/EnhancedInventoryPage';
import FinancialPage from './pages/FinancialPage';
import DebtPage from './pages/DebtPage';
import UsersPage from './pages/UsersPage';
import EnhancedReportsPage from './pages/EnhancedReportsPage';
// TODO: Create these pages
// import SettingsPage from './pages/SettingsPage';

import './App.css';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['dashboard']);

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
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      path: '/'
    },
    {
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: 'Bán hàng (POS)',
      path: '/pos'
    },
    {
      key: 'sales',
      label: 'Quản lý bán hàng',
      icon: <FileTextOutlined />,
      children: [
        {
          key: 'orders',
          label: 'Đơn hàng',
          path: '/orders'
        },
        {
          key: 'customers',
          label: 'Khách hàng',
          path: '/customers'
        }
      ]
    },
    {
      key: 'inventory',
      label: 'Quản lý kho',
      icon: <InboxOutlined />,
      children: [
        {
          key: 'products',
          label: 'Sản phẩm',
          path: '/products'
        },
        {
          key: 'stock',
          label: 'Tồn kho',
          path: '/inventory'
        },
        {
          key: 'suppliers',
          label: 'Nhà cung cấp',
          path: '/suppliers'
        }
      ]
    },
    {
      key: 'finance',
      label: 'Tài chính',
      icon: <WalletOutlined />,
      children: [
        {
          key: 'financial',
          label: 'Thu chi',
          path: '/financial'
        },
        {
          key: 'debt',
          label: 'Công nợ',
          path: '/debt'
        }
      ]
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      path: '/reports'
    },
    {
      key: 'system',
      label: 'Hệ thống',
      icon: <SettingOutlined />,
      children: [
        {
          key: 'users',
          label: 'Nhân viên',
          path: '/users'
        },
        {
          key: 'settings',
          label: 'Cài đặt',
          path: '/settings'
        }
      ]
    }
  ];

  const getCurrentPath = () => {
    return window.location.pathname;
  };

  const getCurrentBreadcrumb = () => {
    const path = getCurrentPath();
    const breadcrumbMap = {
      '/': ['Tổng quan'],
      '/pos': ['Bán hàng (POS)'],
      '/orders': ['Quản lý bán hàng', 'Đơn hàng'],
      '/customers': ['Quản lý bán hàng', 'Khách hàng'],
      '/products': ['Quản lý kho', 'Sản phẩm'],
      '/inventory': ['Quản lý kho', 'Tồn kho'],
      '/suppliers': ['Quản lý kho', 'Nhà cung cấp'],
      '/financial': ['Tài chính', 'Thu chi'],
      '/debt': ['Tài chính', 'Công nợ'],
      '/reports': ['Báo cáo'],
      '/users': ['Hệ thống', 'Nhân viên'],
      '/settings': ['Hệ thống', 'Cài đặt']
    };
    return breadcrumbMap[path] || ['Trang không xác định'];
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt tài khoản'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true
    }
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      // TODO: Implement logout
      console.log('Logout clicked');
    }
  };

  const renderMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {item.children.map(child => (
              <Menu.Item key={child.key}>
                <a href={child.path}>{child.label}</a>
              </Menu.Item>
            ))}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          <a href={item.path}>{item.label}</a>
        </Menu.Item>
      );
    });
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{
            height: '64px',
            margin: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '16px' : '20px',
            fontWeight: 'bold'
          }}>
            {collapsed ? 'POS' : '🏪 POS System'}
          </div>
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            style={{ borderRight: 0 }}
          >
            {renderMenuItems(menuItems)}
          </Menu>
        </Sider>

        {/* Main Layout */}
        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
          {/* Header */}
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}>
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              
              <Breadcrumb>
                {getCurrentBreadcrumb().map((item, index) => (
                  <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </Space>

            <Space size="middle">
              {/* Notifications */}
              <Badge count={notificationCount} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  size="large"
                />
              </Badge>

              {/* User Menu */}
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick
                }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
                  <Space>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      src={currentUser.avatar}
                    />
                    <span style={{ fontWeight: 500 }}>
                      {currentUser.name}
                    </span>
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </Header>

          {/* Content */}
          <Content style={{
            margin: 0,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5'
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/pos" replace />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reports" element={<EnhancedReportsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/inventory" element={<EnhancedInventoryPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/debt" element={<DebtPage />} />
              <Route path="/users" element={<UsersPage />} />
              
              {/* TODO: Add this route when page is created */}
              <Route path="/settings" element={
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <h2>Trang Cài đặt đang được phát triển</h2>
                  <p>Tính năng này sẽ sớm có trong phiên bản tiếp theo</p>
                </div>
              } />
              
              {/* 404 Page */}
              <Route path="*" element={
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <h2>404 - Trang không tìm thấy</h2>
                  <p>Trang bạn tìm kiếm không tồn tại</p>
                  <Button type="primary" href="/pos">
                    Quay về trang chính
                  </Button>
                </div>
              } />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App; 