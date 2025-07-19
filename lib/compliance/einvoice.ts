// ComputerPOS Pro - Vietnamese E-Invoice Compliance System
// Tuân thủ Thông tư 78/2021/TT-BTC về hóa đơn điện tử

export interface EInvoiceData {
  invoiceNumber: string;
  invoiceSeries: string;
  invoiceDate: string;
  seller: SellerInfo;
  buyer: BuyerInfo;
  items: InvoiceItem[];
  totalAmount: number;
  vatAmount: number;
  totalPayment: number;
  paymentMethod: string;
  currency: string;
}

export interface SellerInfo {
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  bankAccount?: string;
  bankName?: string;
}

export interface BuyerInfo {
  name: string;
  taxCode?: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface InvoiceItem {
  lineNumber: number;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalPayment: number;
}

export interface EInvoiceXML {
  xmlData: string;
  digitalSignature?: string;
  cqtCode?: string;
  status: 'draft' | 'signed' | 'sent' | 'cancelled';
}

export class VietnameseEInvoiceGenerator {
  private sellerInfo: SellerInfo;
  private invoiceTemplate: string;

  constructor(sellerInfo: SellerInfo) {
    this.sellerInfo = sellerInfo;
    this.invoiceTemplate = this.getInvoiceTemplate();
  }

  /**
   * Tạo hóa đơn điện tử theo chuẩn Việt Nam
   */
  generateEInvoice(invoiceData: EInvoiceData): EInvoiceXML {
    // Validate dữ liệu đầu vào
    this.validateInvoiceData(invoiceData);

    // Tạo XML theo chuẩn Thông tư 78/2021/TT-BTC
    const xmlData = this.generateXML(invoiceData);

    // Tạo chữ ký số (trong production cần HSM/USB Token)
    const digitalSignature = this.generateDigitalSignature(xmlData);

    return {
      xmlData,
      digitalSignature,
      status: 'draft'
    };
  }

  /**
   * Validate dữ liệu hóa đơn theo quy định Việt Nam
   */
  private validateInvoiceData(data: EInvoiceData): void {
    // Kiểm tra thông tin bắt buộc
    if (!data.invoiceNumber || !data.invoiceSeries) {
      throw new Error('Số và ký hiệu hóa đơn là bắt buộc');
    }

    if (!data.invoiceDate) {
      throw new Error('Ngày hóa đơn là bắt buộc');
    }

    // Kiểm tra mã số thuế người bán (bắt buộc)
    if (!this.sellerInfo.taxCode || !this.isValidTaxCode(this.sellerInfo.taxCode)) {
      throw new Error('Mã số thuế người bán không hợp lệ');
    }

    // Kiểm tra mã số thuế người mua (nếu có)
    if (data.buyer.taxCode && !this.isValidTaxCode(data.buyer.taxCode)) {
      throw new Error('Mã số thuế người mua không hợp lệ');
    }

    // Kiểm tra tổng tiền
    const calculatedTotal = data.items.reduce((sum, item) => sum + item.totalPayment, 0);
    if (Math.abs(calculatedTotal - data.totalPayment) > 1) {
      throw new Error('Tổng tiền không khớp với chi tiết hàng hóa');
    }

    // Kiểm tra VAT
    const calculatedVAT = data.items.reduce((sum, item) => sum + item.vatAmount, 0);
    if (Math.abs(calculatedVAT - data.vatAmount) > 1) {
      throw new Error('Tổng VAT không khớp với chi tiết hàng hóa');
    }
  }

  /**
   * Kiểm tra mã số thuế hợp lệ
   */
  private isValidTaxCode(taxCode: string): boolean {
    // Mã số thuế Việt Nam: 10 hoặc 13 số
    const taxCodeRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    return taxCodeRegex.test(taxCode);
  }

  /**
   * Tạo XML hóa đơn theo chuẩn Thông tư 78/2021/TT-BTC
   */
  private generateXML(data: EInvoiceData): string {
    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="http://kekhaithue.gdt.gov.vn/TKhai/TDTu/2021/XMLSchema">
  <InvoiceHeader>
    <InvoiceNumber>${data.invoiceNumber}</InvoiceNumber>
    <InvoiceSeries>${data.invoiceSeries}</InvoiceSeries>
    <InvoiceDate>${this.formatDate(data.invoiceDate)}</InvoiceDate>
    <InvoiceType>01</InvoiceType>
    <Currency>${data.currency}</Currency>
    <ExchangeRate>1</ExchangeRate>
  </InvoiceHeader>
  
  <SellerInfo>
    <SellerName>${this.escapeXML(this.sellerInfo.name)}</SellerName>
    <SellerTaxCode>${this.sellerInfo.taxCode}</SellerTaxCode>
    <SellerAddress>${this.escapeXML(this.sellerInfo.address)}</SellerAddress>
    <SellerPhone>${this.sellerInfo.phone}</SellerPhone>
    <SellerEmail>${this.sellerInfo.email}</SellerEmail>
    ${this.sellerInfo.bankAccount ? `<SellerBankAccount>${this.sellerInfo.bankAccount}</SellerBankAccount>` : ''}
    ${this.sellerInfo.bankName ? `<SellerBankName>${this.escapeXML(this.sellerInfo.bankName)}</SellerBankName>` : ''}
  </SellerInfo>
  
  <BuyerInfo>
    <BuyerName>${this.escapeXML(data.buyer.name)}</BuyerName>
    ${data.buyer.taxCode ? `<BuyerTaxCode>${data.buyer.taxCode}</BuyerTaxCode>` : ''}
    <BuyerAddress>${this.escapeXML(data.buyer.address)}</BuyerAddress>
    ${data.buyer.phone ? `<BuyerPhone>${data.buyer.phone}</BuyerPhone>` : ''}
    ${data.buyer.email ? `<BuyerEmail>${data.buyer.email}</BuyerEmail>` : ''}
  </BuyerInfo>
  
  <InvoiceItems>
    ${data.items.map(item => this.generateItemXML(item)).join('\n    ')}
  </InvoiceItems>
  
  <InvoiceSummary>
    <TotalAmount>${data.totalAmount}</TotalAmount>
    <VATAmount>${data.vatAmount}</VATAmount>
    <TotalPayment>${data.totalPayment}</TotalPayment>
    <PaymentMethod>${data.paymentMethod}</PaymentMethod>
  </InvoiceSummary>
  
  <AdditionalInfo>
    <CreatedBy>ComputerPOS Pro</CreatedBy>
    <CreatedDate>${this.formatDateTime(new Date())}</CreatedDate>
  </AdditionalInfo>
</Invoice>`;

    return xmlTemplate;
  }

  /**
   * Tạo XML cho từng item
   */
  private generateItemXML(item: InvoiceItem): string {
    return `<InvoiceItem>
      <LineNumber>${item.lineNumber}</LineNumber>
      <ProductCode>${this.escapeXML(item.productCode)}</ProductCode>
      <ProductName>${this.escapeXML(item.productName)}</ProductName>
      <Unit>${this.escapeXML(item.unit)}</Unit>
      <Quantity>${item.quantity}</Quantity>
      <UnitPrice>${item.unitPrice}</UnitPrice>
      <TotalAmount>${item.totalAmount}</TotalAmount>
      <VATRate>${item.vatRate}</VATRate>
      <VATAmount>${item.vatAmount}</VATAmount>
      <TotalPayment>${item.totalPayment}</TotalPayment>
    </InvoiceItem>`;
  }

  /**
   * Tạo chữ ký số (simplified - trong production cần HSM)
   */
  private generateDigitalSignature(xmlData: string): string {
    // Trong production, sử dụng HSM hoặc USB Token để ký
    // Đây là implementation đơn giản cho demo
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(xmlData).digest('hex');
    return `DEMO_SIGNATURE_${hash.substring(0, 32)}`;
  }

  /**
   * Format ngày theo chuẩn Việt Nam
   */
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Format ngày giờ
   */
  private formatDateTime(date: Date): string {
    return date.toISOString();
  }

  /**
   * Escape XML characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Template hóa đơn mặc định
   */
  private getInvoiceTemplate(): string {
    return 'STANDARD_INVOICE_TEMPLATE';
  }
}

/**
 * VAT Calculator cho thị trường Việt Nam
 */
export class VietnamVATCalculator {
  private static readonly VAT_RATES = {
    STANDARD: 0.10, // 10% VAT chuẩn
    REDUCED: 0.05,  // 5% VAT giảm
    ZERO: 0.00,     // 0% VAT (xuất khẩu, một số hàng hóa đặc biệt)
    EXEMPT: -1      // Không chịu VAT
  };

  /**
   * Tính VAT cho sản phẩm
   */
  static calculateVAT(amount: number, vatRate: number = VietnamVATCalculator.VAT_RATES.STANDARD): {
    amountExcludingVAT: number;
    vatAmount: number;
    amountIncludingVAT: number;
  } {
    if (vatRate === VietnamVATCalculator.VAT_RATES.EXEMPT) {
      return {
        amountExcludingVAT: amount,
        vatAmount: 0,
        amountIncludingVAT: amount
      };
    }

    const amountExcludingVAT = Math.round(amount / (1 + vatRate));
    const vatAmount = Math.round(amount - amountExcludingVAT);
    const amountIncludingVAT = amountExcludingVAT + vatAmount;

    return {
      amountExcludingVAT,
      vatAmount,
      amountIncludingVAT
    };
  }

  /**
   * Lấy mức VAT theo loại sản phẩm
   */
  static getVATRateByCategory(category: string): number {
    const categoryVATMap: Record<string, number> = {
      'CPU': VietnamVATCalculator.VAT_RATES.STANDARD,
      'GPU': VietnamVATCalculator.VAT_RATES.STANDARD,
      'Motherboard': VietnamVATCalculator.VAT_RATES.STANDARD,
      'RAM': VietnamVATCalculator.VAT_RATES.STANDARD,
      'Storage': VietnamVATCalculator.VAT_RATES.STANDARD,
      'PSU': VietnamVATCalculator.VAT_RATES.STANDARD,
      'Cooling': VietnamVATCalculator.VAT_RATES.STANDARD,
      'Case': VietnamVATCalculator.VAT_RATES.STANDARD,
      'Peripherals': VietnamVATCalculator.VAT_RATES.STANDARD
    };

    return categoryVATMap[category] || VietnamVATCalculator.VAT_RATES.STANDARD;
  }
}

/**
 * Audit Trail System cho compliance
 */
export class ComplianceAuditTrail {
  private db: any;

  constructor(database: any) {
    this.db = database;
  }

  /**
   * Ghi log audit cho các thao tác quan trọng
   */
  async logAuditEvent(event: {
    eventType: 'invoice_created' | 'invoice_cancelled' | 'payment_received' | 'refund_issued';
    userId: string;
    orderId: string;
    details: any;
    ipAddress?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO audit_logs 
      (event_type, user_id, order_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      event.eventType,
      event.userId,
      event.orderId,
      JSON.stringify(event.details),
      event.ipAddress || 'unknown',
      new Date().toISOString()
    ).run();
  }

  /**
   * Lấy audit trail cho một đơn hàng
   */
  async getAuditTrail(orderId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM audit_logs 
      WHERE order_id = ? 
      ORDER BY created_at DESC
    `).bind(orderId).all();

    return result.map(row => ({
      ...row,
      details: JSON.parse(row.details)
    }));
  }
}

/**
 * Helper functions cho Vietnamese compliance
 */
export const VietnameseComplianceHelpers = {
  /**
   * Format số tiền theo chuẩn Việt Nam
   */
  formatVNDCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  /**
   * Chuyển số thành chữ (cho hóa đơn)
   */
  numberToVietnameseWords(amount: number): string {
    // Implementation đơn giản - trong production cần thư viện chuyên dụng
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    // Simplified implementation
    return `${amount.toLocaleString('vi-VN')} đồng`;
  },

  /**
   * Validate định dạng ngày Việt Nam
   */
  isValidVietnameseDate(dateString: string): boolean {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(dateString);
  },

  /**
   * Generate invoice number theo quy định
   */
  generateInvoiceNumber(series: string, sequence: number): string {
    return `${series}${sequence.toString().padStart(8, '0')}`;
  }
};
