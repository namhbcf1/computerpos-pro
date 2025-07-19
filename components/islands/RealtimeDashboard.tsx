// ComputerPOS Pro - Real-time Analytics Dashboard
// Advanced analytics với AI insights cho Vietnamese computer stores

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  currentSales: {
    today: number;
    thisHour: number;
    revenue: number;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
    totalProducts: number;
  };
  customers: {
    online: number;
    inStore: number;
    totalToday: number;
  };
  popularProducts: Array<{
    name: string;
    sales: number;
  }>;
  timestamp: string;
}

interface SalesData {
  time: string;
  sales: number;
  revenue: number;
}

interface InventoryAlert {
  id: string;
  product: string;
  stock: number;
  threshold: number;
  severity: 'low' | 'critical';
}

export function RealtimeDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesHistory, setSalesHistory] = useState<SalesData[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/analytics/realtime');
        const result = await response.json();
        
        if (result.success) {
          setDashboardData(result.data);
          
          // Update sales history
          const newSalesPoint: SalesData = {
            time: new Date().toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            sales: result.data.currentSales.thisHour,
            revenue: result.data.currentSales.revenue
          };
          
          setSalesHistory(prev => [...prev.slice(-11), newSalesPoint]);
        } else {
          setError('Không thể tải dữ liệu dashboard');
        }
      } catch (err) {
        setError('Lỗi kết nối API');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchDashboardData();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch inventory alerts
  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      try {
        const response = await fetch('/api/inventory/alerts');
        const result = await response.json();
        
        if (result.success) {
          setInventoryAlerts(result.data);
        }
      } catch (err) {
        console.error('Inventory alerts fetch error:', err);
      }
    };

    fetchInventoryAlerts();
    const interval = setInterval(fetchInventoryAlerts, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi Dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const formatVNDPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Thời Gian Thực</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            Cập nhật: {new Date(dashboardData.timestamp).toLocaleTimeString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Doanh Thu Hôm Nay"
          value={formatVNDPrice(dashboardData.currentSales.revenue)}
          change="+12.5%"
          changeType="positive"
          icon="💰"
        />
        <MetricCard
          title="Đơn Hàng Hôm Nay"
          value={dashboardData.currentSales.today.toString()}
          change="+8.3%"
          changeType="positive"
          icon="📦"
        />
        <MetricCard
          title="Khách Hàng Online"
          value={dashboardData.customers.online.toString()}
          change="-2.1%"
          changeType="negative"
          icon="👥"
        />
        <MetricCard
          title="Sản Phẩm Sắp Hết"
          value={dashboardData.inventory.lowStock.toString()}
          change="+3"
          changeType="warning"
          icon="⚠️"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh Số Theo Giờ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'sales' ? `${value} đơn` : formatVNDPrice(Number(value)),
                  name === 'sales' ? 'Đơn hàng' : 'Doanh thu'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản Phẩm Bán Chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.popularProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Đã bán']} />
              <Bar dataKey="sales" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cảnh Báo Tồn Kho</h3>
          <div className="space-y-3">
            {inventoryAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    alert.severity === 'critical' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.product}</p>
                    <p className="text-sm text-gray-600">
                      Còn lại: {alert.stock} | Ngưỡng: {alert.threshold}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Đặt Hàng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <AIInsightsPanel />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning';
  icon: string;
}

function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    warning: 'text-yellow-600'
  }[changeType];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="mt-2">
        <span className={`text-sm font-medium ${changeColor}`}>
          {change}
        </span>
        <span className="text-sm text-gray-600 ml-1">so với hôm qua</span>
      </div>
    </div>
  );
}

function AIInsightsPanel() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const response = await fetch('/api/ai/insights');
        const result = await response.json();
        
        if (result.success) {
          setInsights(result.data.insights);
        }
      } catch (err) {
        console.error('AI insights fetch error:', err);
        setInsights(['AI insights tạm thời không khả dụng']);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Insights Thông Minh</h3>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
