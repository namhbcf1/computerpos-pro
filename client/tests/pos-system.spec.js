const { test, expect } = require('@playwright/test');

test.describe('POS System - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app with mock API enabled
    await page.goto('http://localhost:3000?mock=true');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage and display main navigation', async ({ page }) => {
    // Check if the main navigation is visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check for main menu items in sidebar
    await expect(page.locator('[data-testid="sidebar"] a:has-text("Bán hàng")')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"] a:has-text("Sản phẩm")')).toBeVisible();
    await expect(page.locator('text=Quản lý Serial')).toBeVisible();
    await expect(page.locator('text=Bảo hành')).toBeVisible();
    await expect(page.locator('text=Đơn hàng')).toBeVisible();
    await expect(page.locator('text=Khách hàng')).toBeVisible();
    await expect(page.locator('text=Tồn kho')).toBeVisible();
    await expect(page.locator('text=Nhà cung cấp')).toBeVisible();
    await expect(page.locator('text=Thu chi')).toBeVisible();
    await expect(page.locator('text=Báo cáo')).toBeVisible();
    await expect(page.locator('text=Nhân viên')).toBeVisible();
  });

  test('should navigate to Products page and display products', async ({ page }) => {
    // Click on Products menu
    await page.click('text=Sản phẩm');
    await page.waitForLoadState('networkidle');
    
    // Check if products page is loaded
    await expect(page.locator('h1:has-text("Quản lý Sản phẩm")')).toBeVisible();
    
    // Check if products are displayed (from mock data)
    await expect(page.locator('text=Intel Core i5-13400F')).toBeVisible();
    await expect(page.locator('text=Intel Core i7-13700K')).toBeVisible();
    await expect(page.locator('text=AMD Ryzen 5 7600X')).toBeVisible();
    
    // Check if action buttons are present
    await expect(page.locator('button:has-text("Thêm sản phẩm")')).toBeVisible();
  });

  test('should navigate to Customers page and display customers', async ({ page }) => {
    // Click on Customers menu
    await page.click('text=Khách hàng');
    await page.waitForLoadState('networkidle');
    
    // Check if customers page is loaded
    await expect(page.locator('h1:has-text("Quản lý Khách hàng")')).toBeVisible();
    
    // Check if customers are displayed (from mock data)
    await expect(page.locator('text=Nguyễn Văn A')).toBeVisible();
    await expect(page.locator('text=Trần Thị B')).toBeVisible();
    await expect(page.locator('text=Lê Văn C')).toBeVisible();
    
    // Check if action buttons are present
    await expect(page.locator('button:has-text("Thêm khách hàng")')).toBeVisible();
  });

  test('should navigate to Suppliers page and display suppliers', async ({ page }) => {
    // Click on Suppliers menu
    await page.click('text=Nhà cung cấp');
    await page.waitForLoadState('networkidle');
    
    // Check if suppliers page is loaded
    await expect(page.locator('h1:has-text("Quản lý Nhà cung cấp")')).toBeVisible();
    
    // Check if suppliers are displayed (from mock data)
    await expect(page.locator('text=Công ty TNHH ABC')).toBeVisible();
    await expect(page.locator('text=Nhà phân phối XYZ')).toBeVisible();
    await expect(page.locator('text=Công ty Điện tử DEF')).toBeVisible();
    
    // Check if action buttons are present
    await expect(page.locator('button:has-text("Thêm nhà cung cấp")')).toBeVisible();
  });

  test('should navigate to Orders page and display orders', async ({ page }) => {
    // Click on Orders menu
    await page.click('text=Đơn hàng');
    await page.waitForLoadState('networkidle');
    
    // Check if orders page is loaded
    await expect(page.locator('h1:has-text("Quản lý Đơn hàng")')).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check if orders are displayed (from mock data)
    await expect(page.locator('text=DH001')).toBeVisible();
    await expect(page.locator('text=DH002')).toBeVisible();
    await expect(page.locator('text=DH003')).toBeVisible();
  });

  test('should navigate to Serial Management page', async ({ page }) => {
    // Click on Serial Management menu
    await page.click('text=Quản lý Serial');
    await page.waitForLoadState('networkidle');
    
    // Check if serial management page is loaded
    await expect(page.locator('h1:has-text("Quản lý Serial Number")')).toBeVisible();
    
    // Check for statistics cards
    await expect(page.locator('text=Tổng số')).toBeVisible();
    await expect(page.locator('text=Có sẵn')).toBeVisible();
    await expect(page.locator('text=Đã bán')).toBeVisible();
    await expect(page.locator('.ant-statistic-title:has-text("Bảo hành")')).toBeVisible();
  });

  test('should navigate to Warranty page', async ({ page }) => {
    // Click on Warranty menu
    await page.click('text=Bảo hành');
    await page.waitForLoadState('networkidle');
    
    // Check if warranty page is loaded
    await expect(page.locator('h1:has-text("Quản lý Bảo hành")')).toBeVisible();
    
    // Check for warranty statistics
    await expect(page.locator('text=Tổng bảo hành')).toBeVisible();
    await expect(page.locator('text=Còn hiệu lực')).toBeVisible();
    await expect(page.locator('text=Hết hạn')).toBeVisible();
    await expect(page.locator('text=Chờ duyệt')).toBeVisible();
  });

  test('should navigate to Financial page and display transactions', async ({ page }) => {
    // Click on Financial menu
    await page.click('text=Thu chi');
    await page.waitForLoadState('networkidle');
    
    // Check if financial page is loaded
    await expect(page.locator('h1:has-text("Quản lý Thu Chi")')).toBeVisible();
    
    // Check for financial summary cards
    await expect(page.locator('text=Tổng thu')).toBeVisible();
    await expect(page.locator('text=Tổng chi')).toBeVisible();
    await expect(page.locator('text=Lợi nhuận')).toBeVisible();

    // Click on Charts tab to see the chart
    await page.click('text=Biểu đồ');
    await expect(page.locator('text=Biểu đồ lợi nhuận theo tháng')).toBeVisible();
  });

  test('should navigate to Reports page', async ({ page }) => {
    // Click on Reports menu
    await page.click('text=Báo cáo');
    await page.waitForLoadState('networkidle');
    
    // Check if reports page is loaded
    await expect(page.locator('h1:has-text("Báo cáo & Thống kê")')).toBeVisible();
    
    // Check for report sections
    await expect(page.locator('text=Tổng quan')).toBeVisible();
    await expect(page.locator('text=Xuất báo cáo')).toBeVisible();
    await expect(page.locator('text=Theo dõi hiệu quả kinh doanh')).toBeVisible();
  });

  test('should navigate to Staff Management page', async ({ page }) => {
    // Click on Staff menu
    await page.click('text=Nhân viên');
    await page.waitForLoadState('networkidle');
    
    // Check if staff page is loaded
    await expect(page.locator('h1:has-text("Quản lý Nhân viên")')).toBeVisible();
    
    // Check if staff members are displayed (from mock data)
    await expect(page.locator('text=Administrator')).toBeVisible();
    await expect(page.locator('text=Nhân viên 1')).toBeVisible();
    await expect(page.locator('text=Nhân viên 2')).toBeVisible();
  });

  test('should navigate to Inventory page', async ({ page }) => {
    // Click on Inventory menu
    await page.click('text=Tồn kho');
    await page.waitForLoadState('networkidle');
    
    // Check if inventory page is loaded
    await expect(page.locator('h1:has-text("Quản lý Tồn kho")')).toBeVisible();
    
    // Check for inventory statistics
    await expect(page.locator('text=Tổng sản phẩm')).toBeVisible();
    await expect(page.locator('text=Sắp hết hàng')).toBeVisible();
    await expect(page.locator('.ant-statistic-title:has-text("Hết hàng"):not(:has-text("Sắp"))')).toBeVisible();
  });

  test('should test POS functionality', async ({ page }) => {
    // Click on POS menu (should be the first item or default page)
    await page.click('[data-testid="sidebar"] a:has-text("Bán hàng")');
    await page.waitForLoadState('networkidle');
    
    // Check if POS page is loaded
    await expect(page.locator('h1:has-text("Bán hàng")')).toBeVisible();
    
    // Check for POS components
    await expect(page.locator('.ant-card-head-title:has-text("Giỏ hàng")')).toBeVisible();
    await expect(page.locator('text=Danh sách sản phẩm')).toBeVisible();
    await expect(page.locator('input[placeholder="Tìm sản phẩm..."]')).toBeVisible();
  });

  test('should test responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile navigation works
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Click mobile menu button
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check if sidebar is visible after clicking mobile menu button
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    // Go to products page
    await page.click('text=Sản phẩm');
    await page.waitForLoadState('networkidle');
    
    // Find search input and search for a product
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Intel');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Check if search results are displayed
      await expect(page.locator('text=Intel Core i5-13400F')).toBeVisible();
      await expect(page.locator('text=Intel Core i7-13700K')).toBeVisible();
    }
  });

  test('should test form validation', async ({ page }) => {
    // Go to products page
    await page.click('text=Sản phẩm');
    await page.waitForLoadState('networkidle');
    
    // Click add product button
    const addButton = page.locator('button:has-text("Thêm sản phẩm")');
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Try to submit empty form
      const submitButton = page.locator('button:has-text("Lưu")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for validation messages
        await expect(page.locator('text=Tên sản phẩm là bắt buộc')).toBeVisible();
      }
    }
  });
});
