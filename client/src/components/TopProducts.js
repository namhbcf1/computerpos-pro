import React from 'react';
import { Card, Table, Progress } from 'antd';

const TopProducts = ({ products = [] }) => {
  // Default data if none provided
  const defaultProducts = [
    { id: 1, name: 'Intel Core i5-13400F', quantity: 0, percentage: 0 },
    { id: 2, name: 'RAM DDR4 16GB 3200MHz', quantity: 0, percentage: 0 },
    { id: 3, name: 'RTX 4060 8GB', quantity: 0, percentage: 0 },
    { id: 4, name: 'SSD NVMe 500GB', quantity: 0, percentage: 0 },
    { id: 5, name: 'Mainboard B760M', quantity: 0, percentage: 0 }
  ];
  
  const data = products.length > 0 ? products : defaultProducts;
  
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SL đã bán',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: percentage => <Progress percent={percentage} size="small" />
    }
  ];
  
  return (
    <Card title="Sản phẩm bán chạy">
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={false} 
      />
    </Card>
  );
};

export default TopProducts;