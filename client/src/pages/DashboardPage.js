import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Typography, Alert } from 'antd';
import DashboardStats from '../components/DashboardStats';
import RecentOrders from '../components/RecentOrders';
import SalesChart from '../components/SalesChart';
import TopProducts from '../components/TopProducts';
import { ordersAPI, reportsAPI } from '../services/api';

const { Title } = Typography;

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data, but provide fallbacks if API fails
      try {
        const [statsResponse, ordersResponse] = await Promise.all([
          ordersAPI.getStats(),
          ordersAPI.getAll({ limit: 5 })
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        if (ordersResponse.data.success) {
          setRecentOrders(ordersResponse.data.data || []);
        }
      } catch (apiError) {
        console.error('API calls failed, using fallback data:', apiError);
        // Set fallback data when API is not available
        setStats({
          totalSales: 0,
          customers: 0,
          revenue: 0,
          products: 0
        });
        setRecentOrders([]);
      }

      // Set default chart data
      setSalesData([
        { date: '2024-01-01', sales: 0 },
        { date: '2024-01-02', sales: 0 },
        { date: '2024-01-03', sales: 0 },
        { date: '2024-01-04', sales: 0 },
        { date: '2024-01-05', sales: 0 },
        { date: '2024-01-06', sales: 0 },
        { date: '2024-01-07', sales: 0 },
      ]);

      setTopProducts([
        { id: 1, name: 'Intel Core i5-13400F', quantity: 0, percentage: 0 },
        { id: 2, name: 'RAM DDR4 16GB 3200MHz', quantity: 0, percentage: 0 },
        { id: 3, name: 'RTX 4060 8GB', quantity: 0, percentage: 0 },
        { id: 4, name: 'SSD NVMe 500GB', quantity: 0, percentage: 0 },
        { id: 5, name: 'Mainboard B760M', quantity: 0, percentage: 0 }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={fetchDashboardData}>Thử lại</button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard - Tổng quan</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Stats Cards */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Charts and Tables */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <SalesChart salesData={salesData} loading={loading} />
          </Col>
          <Col xs={24} lg={12}>
            <TopProducts products={topProducts} loading={loading} />
          </Col>
        </Row>

        {/* Recent Orders */}
        <Card title="Đơn hàng gần đây" loading={loading}>
          {recentOrders.length > 0 ? (
            <RecentOrders orders={recentOrders} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default DashboardPage;