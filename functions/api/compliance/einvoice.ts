// ComputerPOS Pro - E-Invoice API Endpoint
// Vietnamese compliance API for e-invoice generation and management

import { 
  VietnameseEInvoiceGenerator, 
  VietnamVATCalculator, 
  ComplianceAuditTrail,
  VietnameseComplianceHelpers,
  EInvoiceData,
  SellerInfo 
} from '../../../lib/compliance/einvoice';

export interface Env {
  DB: D1Database;
  EINVOICE_KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Route handling
    if (path.endsWith('/generate') && request.method === 'POST') {
      return await handleGenerateEInvoice(request, env, corsHeaders);
    }
    
    if (path.endsWith('/validate') && request.method === 'POST') {
      return await handleValidateInvoiceData(request, env, corsHeaders);
    }
    
    if (path.includes('/status/') && request.method === 'GET') {
      return await handleGetInvoiceStatus(request, env, corsHeaders);
    }
    
    if (path.endsWith('/cancel') && request.method === 'POST') {
      return await handleCancelInvoice(request, env, corsHeaders);
    }
    
    if (path.endsWith('/audit') && request.method === 'GET') {
      return await handleGetAuditTrail(request, env, corsHeaders);
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Endpoint not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('E-Invoice API Error:', error);
    
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
 * Generate e-invoice from order data
 */
async function handleGenerateEInvoice(request: Request, env: Env, corsHeaders: any) {
  const { orderId, customerInfo, overrides } = await request.json();
  
  if (!orderId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Order ID is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // Get order data from database
    const order = await getOrderData(env.DB, orderId);
    if (!order) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get seller info (company info)
    const sellerInfo = await getSellerInfo(env.DB);
    
    // Generate invoice number
    const invoiceNumber = await generateNextInvoiceNumber(env.DB);
    
    // Prepare invoice data
    const invoiceData: EInvoiceData = {
      invoiceNumber: invoiceNumber.number,
      invoiceSeries: invoiceNumber.series,
      invoiceDate: new Date().toISOString(),
      seller: sellerInfo,
      buyer: {
        name: customerInfo?.name || order.customer_name || 'Khách hàng',
        taxCode: customerInfo?.taxCode,
        address: customerInfo?.address || 'Không có địa chỉ',
        phone: customerInfo?.phone || order.customer_phone,
        email: customerInfo?.email
      },
      items: order.items.map((item: any, index: number) => {
        const vatRate = VietnamVATCalculator.getVATRateByCategory(item.category);
        const vatCalc = VietnamVATCalculator.calculateVAT(item.total_price, vatRate);
        
        return {
          lineNumber: index + 1,
          productCode: item.sku,
          productName: item.product_name,
          unit: 'Cái',
          quantity: item.quantity,
          unitPrice: vatCalc.amountExcludingVAT / item.quantity,
          totalAmount: vatCalc.amountExcludingVAT,
          vatRate: vatRate * 100, // Convert to percentage
          vatAmount: vatCalc.vatAmount,
          totalPayment: vatCalc.amountIncludingVAT
        };
      }),
      totalAmount: 0, // Will be calculated
      vatAmount: 0,   // Will be calculated
      totalPayment: order.total,
      paymentMethod: order.payment_method || 'Tiền mặt',
      currency: 'VND'
    };

    // Calculate totals
    invoiceData.totalAmount = invoiceData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    invoiceData.vatAmount = invoiceData.items.reduce((sum, item) => sum + item.vatAmount, 0);

    // Apply overrides if provided
    if (overrides) {
      Object.assign(invoiceData, overrides);
    }

    // Generate e-invoice
    const generator = new VietnameseEInvoiceGenerator(sellerInfo);
    const eInvoice = generator.generateEInvoice(invoiceData);

    // Save to database
    const invoiceId = await saveEInvoice(env.DB, {
      orderId,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceSeries: invoiceData.invoiceSeries,
      invoiceDate: invoiceData.invoiceDate,
      customerTaxCode: invoiceData.buyer.taxCode,
      xmlData: eInvoice.xmlData,
      digitalSignature: eInvoice.digitalSignature,
      status: eInvoice.status
    });

    // Cache for quick access
    await env.EINVOICE_KV.put(
      `invoice:${invoiceData.invoiceNumber}`,
      JSON.stringify({
        ...eInvoice,
        invoiceData,
        createdAt: new Date().toISOString()
      }),
      { expirationTtl: 86400 * 30 } // 30 days
    );

    // Log audit event
    const auditTrail = new ComplianceAuditTrail(env.DB);
    await auditTrail.logAuditEvent({
      eventType: 'invoice_created',
      userId: 'system', // In production, get from auth
      orderId,
      details: {
        invoiceNumber: invoiceData.invoiceNumber,
        totalAmount: invoiceData.totalPayment
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        invoiceId,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceSeries: invoiceData.invoiceSeries,
        xmlData: eInvoice.xmlData,
        digitalSignature: eInvoice.digitalSignature,
        status: eInvoice.status,
        downloadUrl: `/api/compliance/einvoice/download/${invoiceData.invoiceNumber}`,
        printUrl: `/api/compliance/einvoice/print/${invoiceData.invoiceNumber}`
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate e-invoice',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Validate invoice data before generation
 */
async function handleValidateInvoiceData(request: Request, env: Env, corsHeaders: any) {
  const invoiceData = await request.json();
  
  try {
    // Get seller info for validation
    const sellerInfo = await getSellerInfo(env.DB);
    const generator = new VietnameseEInvoiceGenerator(sellerInfo);
    
    // This will throw if validation fails
    generator.generateEInvoice(invoiceData);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Invoice data is valid',
      data: {
        totalAmount: invoiceData.totalAmount,
        vatAmount: invoiceData.vatAmount,
        totalPayment: invoiceData.totalPayment,
        formattedAmount: VietnameseComplianceHelpers.formatVNDCurrency(invoiceData.totalPayment),
        amountInWords: VietnameseComplianceHelpers.numberToVietnameseWords(invoiceData.totalPayment)
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Validation failed',
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Get invoice status
 */
async function handleGetInvoiceStatus(request: Request, env: Env, corsHeaders: any) {
  const url = new URL(request.url);
  const invoiceNumber = url.pathname.split('/').pop();
  
  if (!invoiceNumber) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invoice number is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // Check cache first
    const cached = await env.EINVOICE_KV.get(`invoice:${invoiceNumber}`);
    if (cached) {
      const invoiceInfo = JSON.parse(cached);
      return new Response(JSON.stringify({
        success: true,
        data: {
          invoiceNumber,
          status: invoiceInfo.status,
          createdAt: invoiceInfo.createdAt,
          hasDigitalSignature: !!invoiceInfo.digitalSignature
        }
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check database
    const invoice = await env.DB.prepare(`
      SELECT invoice_number, status, created_at, digital_signature
      FROM einvoices 
      WHERE invoice_number = ?
    `).bind(invoiceNumber).first();

    if (!invoice) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invoice not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        createdAt: invoice.created_at,
        hasDigitalSignature: !!invoice.digital_signature
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get invoice status',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Cancel invoice
 */
async function handleCancelInvoice(request: Request, env: Env, corsHeaders: any) {
  const { invoiceNumber, reason } = await request.json();
  
  if (!invoiceNumber || !reason) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invoice number and reason are required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // Update invoice status
    await env.DB.prepare(`
      UPDATE einvoices 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE invoice_number = ?
    `).bind(invoiceNumber).run();

    // Log audit event
    const auditTrail = new ComplianceAuditTrail(env.DB);
    await auditTrail.logAuditEvent({
      eventType: 'invoice_cancelled',
      userId: 'system', // In production, get from auth
      orderId: '', // Get from invoice data
      details: {
        invoiceNumber,
        reason
      }
    });

    // Update cache
    const cached = await env.EINVOICE_KV.get(`invoice:${invoiceNumber}`);
    if (cached) {
      const invoiceInfo = JSON.parse(cached);
      invoiceInfo.status = 'cancelled';
      await env.EINVOICE_KV.put(`invoice:${invoiceNumber}`, JSON.stringify(invoiceInfo));
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Invoice cancelled successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to cancel invoice',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Get audit trail
 */
async function handleGetAuditTrail(request: Request, env: Env, corsHeaders: any) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  
  if (!orderId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Order ID is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const auditTrail = new ComplianceAuditTrail(env.DB);
    const trail = await auditTrail.getAuditTrail(orderId);

    return new Response(JSON.stringify({
      success: true,
      data: trail
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get audit trail',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Helper functions
async function getOrderData(db: D1Database, orderId: string) {
  const order = await db.prepare(`
    SELECT o.*, c.name as customer_name, c.phone as customer_phone
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).bind(orderId).first();

  if (!order) return null;

  const items = await db.prepare(`
    SELECT oi.*, p.category, p.sku
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).bind(orderId).all();

  return { ...order, items };
}

async function getSellerInfo(db: D1Database): Promise<SellerInfo> {
  // In production, this would come from company settings
  return {
    name: 'Công ty TNHH ComputerPOS Pro',
    taxCode: '0123456789',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '028-1234-5678',
    email: 'info@computerpos.vn',
    bankAccount: '1234567890',
    bankName: 'Ngân hàng TMCP Á Châu (ACB)'
  };
}

async function generateNextInvoiceNumber(db: D1Database) {
  const currentYear = new Date().getFullYear();
  const series = `${currentYear}/HD`;
  
  const lastInvoice = await db.prepare(`
    SELECT invoice_number FROM einvoices 
    WHERE invoice_series = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `).bind(series).first();

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoice_number.split('/').pop() || '0');
    nextNumber = lastNumber + 1;
  }

  return {
    series,
    number: VietnameseComplianceHelpers.generateInvoiceNumber(series, nextNumber)
  };
}

async function saveEInvoice(db: D1Database, invoiceData: any) {
  const result = await db.prepare(`
    INSERT INTO einvoices 
    (order_id, invoice_number, invoice_series, invoice_date, customer_tax_code, xml_data, digital_signature, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    invoiceData.orderId,
    invoiceData.invoiceNumber,
    invoiceData.invoiceSeries,
    invoiceData.invoiceDate,
    invoiceData.customerTaxCode,
    invoiceData.xmlData,
    invoiceData.digitalSignature,
    invoiceData.status
  ).run();

  return result.meta.last_row_id;
}
