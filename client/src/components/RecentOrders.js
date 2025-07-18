import React from 'react';
import { Table, Tag, Space } from 'antd';
import dayjs from 'dayjs';

const RecentOrders = ({ orders = [] }) => {
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: id => `#${id}`
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: customer => customer?.name || 'Khách lẻ'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'blue';
        if (status === 'completed') color = 'green';
        if (status === 'cancelled') color = 'red';
        
        const statusText = {
          'pending': 'Đang xử lý',
          'processing': 'Đang xử lý',
          'completed': 'Hoàn thành',
          'cancelled': 'Đã hủy'
        };
        
        return <Tag color={color}>{statusText[status] || status}</Tag>;
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: total => `${new Intl.NumberFormat('vi-VN').format(total)}₫`
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  ];
  
  return (
    <Table 
      columns={columns} 
      dataSource={orders} 
      rowKey="id" 
      pagination={false} 
    />
  );
};

export default RecentOrders;