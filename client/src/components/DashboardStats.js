import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, DatabaseOutlined } from '@ant-design/icons';

const DashboardStats = ({ stats = {} }) => {
  // Default values if no stats provided
  const {
    totalSales = 0,
    customers = 0,
    revenue = 0,
    products = 0
  } = stats;
  
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng đơn hàng"
            value={totalSales}
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Khách hàng"
            value={customers}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Doanh thu"
            value={revenue}
            precision={0}
            prefix={<DollarOutlined />}
            suffix="₫"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Sản phẩm"
            value={products}
            prefix={<DatabaseOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;