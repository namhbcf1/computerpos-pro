// ComputerPOS Pro - AI-Powered Compatibility API
// Cloudflare Functions với AI integration

import { Ai } from '@cloudflare/ai';
import { CompatibilityEngine, Component, VIETNAMESE_HARDWARE_DB } from '../../../lib/compatibility/engine';

export interface Env {
  AI: any;
  COMPATIBILITY_KV: KVNamespace;
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { components, buildType, budget } = await request.json();
    
    // Validate input
    if (!components || !Array.isArray(components)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid components data'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Initialize AI
    const ai = new Ai(env.AI);
    
    // 1. Basic compatibility check
    const compatibilityEngine = new CompatibilityEngine(VIETNAMESE_HARDWARE_DB);
    const basicCompatibility = await compatibilityEngine.checkBuildCompatibility(components);
    
    // 2. AI-enhanced analysis
    const aiAnalysis = await performAIAnalysis(ai, components, buildType, budget);
    
    // 3. Cache results
    const cacheKey = `compatibility:${generateCacheKey(components)}`;
    await env.COMPATIBILITY_KV.put(cacheKey, JSON.stringify({
      basicCompatibility,
      aiAnalysis,
      timestamp: Date.now()
    }), { expirationTtl: 3600 }); // Cache for 1 hour
    
    // 4. Combine results
    const enhancedResult = {
      ...basicCompatibility,
      aiInsights: aiAnalysis.insights,
      buildOptimization: aiAnalysis.optimization,
      marketAnalysis: aiAnalysis.marketAnalysis,
      vietnameseRecommendations: aiAnalysis.vietnameseRecommendations
    };

    return new Response(JSON.stringify({
      success: true,
      data: enhancedResult,
      processingTime: aiAnalysis.processingTime
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Compatibility API Error:', error);
    
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

async function performAIAnalysis(ai: Ai, components: Component[], buildType?: string, budget?: number) {
  const startTime = Date.now();
  
  // Prepare AI prompt
  const prompt = createCompatibilityPrompt(components, buildType, budget);
  
  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `Bạn là chuyên gia phần cứng máy tính tại Việt Nam với 15 năm kinh nghiệm. 
          Nhiệm vụ: Phân tích tương thích và hiệu suất của build PC, đưa ra khuyến nghị cụ thể cho thị trường Việt Nam.
          
          Quy tắc:
          - Trả lời bằng tiếng Việt
          - Focus vào thị trường Việt Nam (giá cả, availability, warranty)
          - Đưa ra khuyến nghị cụ thể và thực tế
          - Xem xét budget và use case
          - Highlight potential issues và solutions`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000
    });

    // Parse AI response
    const aiText = response.response || '';
    
    return {
      insights: extractInsights(aiText),
      optimization: extractOptimization(aiText),
      marketAnalysis: extractMarketAnalysis(aiText),
      vietnameseRecommendations: extractVietnameseRecommendations(aiText),
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Fallback analysis
    return {
      insights: ['AI analysis temporarily unavailable'],
      optimization: 'Sử dụng compatibility engine cơ bản',
      marketAnalysis: 'Market analysis không khả dụng',
      vietnameseRecommendations: ['Liên hệ nhân viên tư vấn để được hỗ trợ'],
      processingTime: Date.now() - startTime
    };
  }
}

function createCompatibilityPrompt(components: Component[], buildType?: string, budget?: number): string {
  const componentsList = components.map(c => 
    `- ${c.name} (${c.category}): ${formatVNDPrice(c.price)}`
  ).join('\n');
  
  return `
Phân tích build PC sau đây:

COMPONENTS:
${componentsList}

BUILD TYPE: ${buildType || 'Không xác định'}
BUDGET: ${budget ? formatVNDPrice(budget) : 'Không giới hạn'}

Hãy phân tích:
1. COMPATIBILITY: Tương thích giữa các linh kiện
2. PERFORMANCE: Hiệu suất tổng thể và bottlenecks
3. VALUE: Tỷ lệ giá/hiệu suất
4. VIETNAMESE MARKET: Phù hợp với thị trường VN
5. RECOMMENDATIONS: Khuyến nghị cải thiện

Format trả lời:
[INSIGHTS] Những điểm quan trọng
[OPTIMIZATION] Cách tối ưu build
[MARKET] Phân tích thị trường VN
[RECOMMENDATIONS] Khuyến nghị cụ thể
`;
}

function extractInsights(aiText: string): string[] {
  const insightsMatch = aiText.match(/\[INSIGHTS\](.*?)(?=\[|$)/s);
  if (!insightsMatch) return ['Không có insights từ AI'];
  
  return insightsMatch[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 5); // Limit to 5 insights
}

function extractOptimization(aiText: string): string {
  const optimizationMatch = aiText.match(/\[OPTIMIZATION\](.*?)(?=\[|$)/s);
  return optimizationMatch ? optimizationMatch[1].trim() : 'Không có khuyến nghị tối ưu';
}

function extractMarketAnalysis(aiText: string): string {
  const marketMatch = aiText.match(/\[MARKET\](.*?)(?=\[|$)/s);
  return marketMatch ? marketMatch[1].trim() : 'Không có phân tích thị trường';
}

function extractVietnameseRecommendations(aiText: string): string[] {
  const recommendationsMatch = aiText.match(/\[RECOMMENDATIONS\](.*?)(?=\[|$)/s);
  if (!recommendationsMatch) return ['Liên hệ nhân viên để được tư vấn'];
  
  return recommendationsMatch[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 3); // Limit to 3 recommendations
}

function generateCacheKey(components: Component[]): string {
  const componentIds = components
    .map(c => c.id)
    .sort()
    .join('-');
  
  // Create hash-like key
  return btoa(componentIds).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

function formatVNDPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// Enhanced compatibility rules for Vietnamese market
export const VIETNAMESE_COMPATIBILITY_RULES = {
  // Popular CPU-Motherboard combinations in Vietnam
  popularCombos: [
    { cpu: 'Intel i5-13400F', motherboard: 'B760M', reason: 'Tỷ lệ giá/hiệu suất tốt' },
    { cpu: 'AMD Ryzen 5 7600X', motherboard: 'B650', reason: 'Gaming performance ổn định' },
    { cpu: 'Intel i7-13700K', motherboard: 'Z790', reason: 'High-end gaming/workstation' }
  ],
  
  // Common issues in Vietnamese market
  commonIssues: [
    {
      issue: 'DDR5 pricing',
      description: 'DDR5 còn đắt tại VN, cân nhắc DDR4 cho budget builds',
      impact: 'medium'
    },
    {
      issue: 'GPU availability',
      description: 'RTX 4090 khan hàng, cân nhắc RTX 4080 hoặc đợi restock',
      impact: 'high'
    },
    {
      issue: 'PSU quality',
      description: 'Chọn PSU có warranty tại VN, tránh hàng xách tay',
      impact: 'high'
    }
  ],
  
  // Vietnamese market preferences
  marketPreferences: {
    brands: {
      popular: ['ASUS', 'MSI', 'Gigabyte', 'Corsair'],
      trusted: ['Intel', 'AMD', 'NVIDIA'],
      local_warranty: ['ASUS Vietnam', 'MSI Vietnam', 'Gigabyte Vietnam']
    },
    price_ranges: {
      budget: { min: 10000000, max: 20000000 }, // 10-20 triệu
      mid_range: { min: 20000000, max: 40000000 }, // 20-40 triệu
      high_end: { min: 40000000, max: 80000000 }, // 40-80 triệu
      enthusiast: { min: 80000000, max: 150000000 } // 80-150 triệu
    }
  }
};
