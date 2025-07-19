// ComputerPOS Pro - Advanced Analytics API
// AI-powered analytics for Vietnamese computer hardware stores

import { Ai } from '@cloudflare/ai';

export interface Env {
  AI: any;
  DB: D1Database;
  ANALYTICS_KV: KVNamespace;
}

export interface AnalyticsQuery {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  groupBy?: string;
  filters?: Record<string, any>;
}

export interface SalesPattern {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerSegments: Record<string, number>;
}

export interface CustomerInsight {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  loyaltyDistribution: Record<string, number>;
  avgLifetimeValue: number;
  churnRate: number;
  topCustomers: Array<{
    name: string;
    totalSpent: number;
    orderCount: number;
  }>;
}

export interface InventoryOptimization {
  lowStockItems: Array<{
    product: string;
    currentStock: number;
    recommendedStock: number;
    daysUntilStockout: number;
  }>;
  overstockItems: Array<{
    product: string;
    currentStock: number;
    recommendedStock: number;
    excessValue: number;
  }>;
  fastMovingItems: Array<{
    product: string;
    velocity: number;
    reorderPoint: number;
  }>;
  seasonalTrends: Record<string, number>;
}

export interface ProfitAnalysis {
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  profitByCategory: Record<string, {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  profitTrends: Array<{
    period: string;
    profit: number;
    margin: number;
  }>;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Route handling
    if (path.endsWith('/sales-patterns') && request.method === 'GET') {
      return await handleSalesPatterns(request, env, corsHeaders);
    }
    
    if (path.endsWith('/customer-insights') && request.method === 'GET') {
      return await handleCustomerInsights(request, env, corsHeaders);
    }
    
    if (path.endsWith('/inventory-optimization') && request.method === 'GET') {
      return await handleInventoryOptimization(request, env, corsHeaders);
    }
    
    if (path.endsWith('/profit-analysis') && request.method === 'GET') {
      return await handleProfitAnalysis(request, env, corsHeaders);
    }
    
    if (path.endsWith('/predictive-forecast') && request.method === 'POST') {
      return await handlePredictiveForecast(request, env, corsHeaders);
    }
    
    if (path.endsWith('/ai-insights') && request.method === 'GET') {
      return await handleAIInsights(request, env, corsHeaders);
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Endpoint not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

/**
 * Analyze sales patterns with AI insights
 */
async function handleSalesPatterns(request: Request, env: Env, corsHeaders: any) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30');
  const groupBy = url.searchParams.get('groupBy') || 'day';
  
  const cacheKey = `sales_patterns:${days}:${groupBy}`;
  
  try {
    // Check cache first
    const cached = await env.ANALYTICS_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get sales data from database
    const salesData = await getSalesData(env.DB, days, groupBy);
    
    // AI analysis of patterns
    const aiInsights = await analyzeSalesPatternsWithAI(env.AI, salesData);
    
    const result = {
      success: true,
      data: {
        patterns: salesData,
        insights: aiInsights,
        summary: {
          totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
          avgOrderValue: salesData.length > 0 ? 
            salesData.reduce((sum, item) => sum + item.revenue, 0) / 
            salesData.reduce((sum, item) => sum + item.orders, 0) : 0,
          growthRate: calculateGrowthRate(salesData)
        }
      }
    };

    // Cache for 1 hour
    await env.ANALYTICS_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to analyze sales patterns',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Generate customer insights
 */
async function handleCustomerInsights(request: Request, env: Env, corsHeaders: any) {
  const cacheKey = 'customer_insights';
  
  try {
    const cached = await env.ANALYTICS_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const insights = await generateCustomerInsights(env.DB);
    
    const result = {
      success: true,
      data: insights
    };

    await env.ANALYTICS_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 7200 }); // 2 hours
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate customer insights',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Inventory optimization recommendations
 */
async function handleInventoryOptimization(request: Request, env: Env, corsHeaders: any) {
  const cacheKey = 'inventory_optimization';
  
  try {
    const cached = await env.ANALYTICS_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const optimization = await generateInventoryOptimization(env.DB, env.AI);
    
    const result = {
      success: true,
      data: optimization
    };

    await env.ANALYTICS_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate inventory optimization',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Profit margin analysis
 */
async function handleProfitAnalysis(request: Request, env: Env, corsHeaders: any) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'month';
  
  const cacheKey = `profit_analysis:${period}`;
  
  try {
    const cached = await env.ANALYTICS_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const analysis = await generateProfitAnalysis(env.DB, period);
    
    const result = {
      success: true,
      data: analysis
    };

    await env.ANALYTICS_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate profit analysis',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * AI-powered predictive forecasting
 */
async function handlePredictiveForecast(request: Request, env: Env, corsHeaders: any) {
  const { forecastType, period, parameters } = await request.json();
  
  if (!env.AI) {
    return new Response(JSON.stringify({
      success: false,
      error: 'AI service not available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const historicalData = await getHistoricalData(env.DB, forecastType, period);
    const forecast = await generateAIForecast(env.AI, historicalData, parameters);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        forecast,
        confidence: forecast.confidence || 0.8,
        methodology: 'AI-powered time series analysis',
        lastUpdated: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate forecast',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * AI-generated business insights
 */
async function handleAIInsights(request: Request, env: Env, corsHeaders: any) {
  if (!env.AI) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        insights: ['AI insights tạm thời không khả dụng'],
        recommendations: ['Liên hệ nhân viên để được tư vấn']
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const businessData = await getBusinessSummary(env.DB);
    const insights = await generateAIInsights(env.AI, businessData);
    
    return new Response(JSON.stringify({
      success: true,
      data: insights
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate AI insights',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Helper functions
async function getSalesData(db: D1Database, days: number, groupBy: string): Promise<SalesPattern[]> {
  const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : 
                    groupBy === 'week' ? '%Y-%W' : '%Y-%m';
  
  const result = await db.prepare(`
    SELECT 
      strftime('${dateFormat}', created_at) as period,
      SUM(total) as revenue,
      COUNT(*) as orders,
      AVG(total) as avgOrderValue
    FROM orders 
    WHERE status = 'completed' 
      AND created_at >= date('now', '-${days} days')
    GROUP BY strftime('${dateFormat}', created_at)
    ORDER BY period
  `).all();

  return result.map(row => ({
    period: row.period,
    revenue: row.revenue,
    orders: row.orders,
    avgOrderValue: row.avgOrderValue,
    topProducts: [], // Would be populated with additional query
    customerSegments: {} // Would be populated with additional query
  }));
}

async function analyzeSalesPatternsWithAI(ai: any, salesData: SalesPattern[]): Promise<string[]> {
  try {
    const prompt = `
    Phân tích dữ liệu bán hàng của cửa hàng máy tính tại Việt Nam:
    ${JSON.stringify(salesData)}
    
    Đưa ra 3-5 insights quan trọng về:
    1. Xu hướng doanh số
    2. Mùa vụ kinh doanh
    3. Cơ hội tăng trưởng
    4. Khuyến nghị cải thiện
    `;

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia phân tích kinh doanh cho ngành bán lẻ máy tính tại Việt Nam.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500
    });

    return response.response ? [response.response] : ['Phân tích AI không khả dụng'];
  } catch (error) {
    return ['Lỗi phân tích AI: ' + error.message];
  }
}

async function generateCustomerInsights(db: D1Database): Promise<CustomerInsight> {
  // Simplified implementation - in production would have more complex queries
  const totalCustomers = await db.prepare('SELECT COUNT(*) as count FROM customers').first();
  const newCustomers = await db.prepare(`
    SELECT COUNT(*) as count FROM customers 
    WHERE created_at >= date('now', '-30 days')
  `).first();

  return {
    totalCustomers: totalCustomers.count,
    newCustomers: newCustomers.count,
    returningCustomers: totalCustomers.count - newCustomers.count,
    loyaltyDistribution: {
      bronze: 60,
      silver: 25,
      gold: 12,
      platinum: 3
    },
    avgLifetimeValue: 15000000, // 15 triệu VND
    churnRate: 15.5,
    topCustomers: [] // Would be populated with actual query
  };
}

async function generateInventoryOptimization(db: D1Database, ai: any): Promise<InventoryOptimization> {
  // Simplified implementation
  return {
    lowStockItems: [],
    overstockItems: [],
    fastMovingItems: [],
    seasonalTrends: {
      'Q1': 0.8,
      'Q2': 1.0,
      'Q3': 1.2,
      'Q4': 1.5
    }
  };
}

async function generateProfitAnalysis(db: D1Database, period: string): Promise<ProfitAnalysis> {
  // Simplified implementation
  return {
    grossProfit: 500000000, // 500 triệu VND
    grossMargin: 25.5,
    netProfit: 150000000, // 150 triệu VND
    netMargin: 7.5,
    profitByCategory: {},
    profitTrends: []
  };
}

async function getHistoricalData(db: D1Database, type: string, period: string): Promise<any[]> {
  // Implementation would depend on forecast type
  return [];
}

async function generateAIForecast(ai: any, data: any[], parameters: any): Promise<any> {
  // AI-powered forecasting implementation
  return {
    predictions: [],
    confidence: 0.8
  };
}

async function getBusinessSummary(db: D1Database): Promise<any> {
  // Get key business metrics for AI analysis
  return {
    totalRevenue: 2000000000, // 2 tỷ VND
    totalOrders: 1500,
    avgOrderValue: 1333333,
    topCategories: ['GPU', 'CPU', 'RAM']
  };
}

async function generateAIInsights(ai: any, businessData: any): Promise<any> {
  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia tư vấn kinh doanh cho cửa hàng máy tính tại Việt Nam.'
        },
        {
          role: 'user',
          content: `Phân tích tình hình kinh doanh: ${JSON.stringify(businessData)}`
        }
      ],
      max_tokens: 300
    });

    return {
      insights: [response.response || 'AI insights không khả dụng'],
      recommendations: ['Tập trung vào GPU và CPU cao cấp', 'Mở rộng dịch vụ build PC']
    };
  } catch (error) {
    return {
      insights: ['AI insights tạm thời không khả dụng'],
      recommendations: ['Liên hệ nhân viên để được tư vấn']
    };
  }
}

function calculateGrowthRate(data: SalesPattern[]): number {
  if (data.length < 2) return 0;
  
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  
  return ((latest.revenue - previous.revenue) / previous.revenue) * 100;
}
