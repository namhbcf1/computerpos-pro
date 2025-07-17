# 🔌 ComputerPOS Pro API Documentation

## Base URL
```
https://your-workers-domain.workers.dev/api/v1
```

## Authentication

All API requests require authentication using JWT tokens:

```http
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Endpoints

### 🔐 Authentication

#### POST /auth/login
Đăng nhập hệ thống

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "permissions": ["read", "write", "delete"]
    }
  }
}
```

#### POST /auth/logout
Đăng xuất hệ thống

#### GET /auth/me
Lấy thông tin user hiện tại

### 💻 Products API

#### GET /products
Lấy danh sách sản phẩm

**Query Parameters:**
- `page` (number): Trang hiện tại (default: 1)
- `limit` (number): Số sản phẩm mỗi trang (default: 20)
- `category` (string): Lọc theo danh mục
- `brand` (string): Lọc theo thương hiệu
- `search` (string): Tìm kiếm theo tên
- `min_price` (number): Giá tối thiểu
- `max_price` (number): Giá tối đa
- `in_stock` (boolean): Chỉ sản phẩm còn hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Intel Core i7-13700K",
        "category": "CPU",
        "brand": "Intel",
        "price": 10500000,
        "stock_quantity": 15,
        "specifications": {
          "socket": "LGA1700",
          "cores": 16,
          "threads": 24,
          "base_clock": "3.4GHz",
          "boost_clock": "5.4GHz"
        },
        "images": ["/images/products/i7-13700k.jpg"],
        "warranty_months": 36,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "per_page": 20
    }
  }
}
```

#### GET /products/:id
Lấy chi tiết sản phẩm

#### POST /products
Tạo sản phẩm mới

**Request:**
```json
{
  "name": "AMD Ryzen 7 7700X",
  "category": "CPU",
  "brand": "AMD",
  "price": 8500000,
  "cost_price": 7500000,
  "stock_quantity": 10,
  "specifications": {
    "socket": "AM5",
    "cores": 8,
    "threads": 16,
    "base_clock": "4.5GHz",
    "boost_clock": "5.4GHz"
  },
  "warranty_months": 36,
  "supplier_id": 1
}
```

#### PUT /products/:id
Cập nhật sản phẩm

#### DELETE /products/:id
Xóa sản phẩm

#### POST /products/:id/compatibility
Kiểm tra tương thích sản phẩm

**Request:**
```json
{
  "components": [
    {"type": "CPU", "id": 1},
    {"type": "Mainboard", "id": 5},
    {"type": "RAM", "id": 10}
  ]
}
```

### 🛒 Orders API

#### GET /orders
Lấy danh sách đơn hàng

#### GET /orders/:id
Lấy chi tiết đơn hàng

#### POST /orders
Tạo đơn hàng mới

**Request:**
```json
{
  "customer_id": 123,
  "items": [
    {
      "product_id": 1,
      "quantity": 1,
      "price": 10500000
    },
    {
      "product_id": 5,
      "quantity": 1,
      "price": 3500000
    }
  ],
  "payment_method": "cash",
  "discount_amount": 0,
  "notes": "Khách hàng VIP"
}
```

#### PUT /orders/:id/status
Cập nhật trạng thái đơn hàng

### 👥 Customers API

#### GET /customers
Lấy danh sách khách hàng

#### GET /customers/:id
Lấy thông tin khách hàng

#### POST /customers
Tạo khách hàng mới

#### PUT /customers/:id
Cập nhật thông tin khách hàng

#### GET /customers/:id/orders
Lấy lịch sử đơn hàng của khách hàng

#### GET /customers/:id/builds
Lấy lịch sử build PC của khách hàng

### 📦 Inventory API

#### GET /inventory
Lấy thông tin tồn kho

#### POST /inventory/adjustment
Điều chỉnh tồn kho

#### GET /inventory/movements
Lấy lịch sử xuất nhập kho

#### POST /inventory/stocktake
Kiểm kê tồn kho

### 🔧 Build Configuration API

#### POST /build/validate
Kiểm tra tính hợp lệ của build PC

#### POST /build/calculate
Tính toán giá và công suất build PC

#### GET /build/templates
Lấy danh sách template build PC

#### POST /build/quotation
Tạo báo giá build PC

### 📊 Reports API

#### GET /reports/sales
Báo cáo doanh số bán hàng

#### GET /reports/inventory
Báo cáo tồn kho

#### GET /reports/customers
Báo cáo khách hàng

#### GET /reports/products
Báo cáo sản phẩm

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Yêu cầu xác thực |
| `INVALID_TOKEN` | Token không hợp lệ |
| `PERMISSION_DENIED` | Không có quyền truy cập |
| `PRODUCT_NOT_FOUND` | Không tìm thấy sản phẩm |
| `INSUFFICIENT_STOCK` | Không đủ hàng trong kho |
| `INVALID_BUILD_CONFIG` | Cấu hình build không hợp lệ |
| `PAYMENT_FAILED` | Thanh toán thất bại |
| `VALIDATION_ERROR` | Lỗi validation dữ liệu |
| `INTERNAL_ERROR` | Lỗi hệ thống |

## Rate Limiting

- **General API**: 1000 requests/hour per IP
- **Authentication**: 10 requests/minute per IP
- **Search**: 100 requests/minute per user

## Webhooks

### Order Events
```
POST /webhooks/order-created
POST /webhooks/order-updated
POST /webhooks/order-completed
```

### Inventory Events
```
POST /webhooks/stock-low
POST /webhooks/stock-out
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ComputerPOSAPI } from 'computerpos-api';

const api = new ComputerPOSAPI({
  baseURL: 'https://your-workers-domain.workers.dev/api/v1',
  token: 'your-jwt-token'
});

// Lấy danh sách sản phẩm
const products = await api.products.list({
  category: 'CPU',
  brand: 'Intel',
  page: 1,
  limit: 20
});

// Tạo đơn hàng
const order = await api.orders.create({
  customer_id: 123,
  items: [
    { product_id: 1, quantity: 1, price: 10500000 }
  ],
  payment_method: 'cash'
});
```

### cURL Examples
```bash
# Đăng nhập
curl -X POST https://your-workers-domain.workers.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Lấy danh sách sản phẩm
curl -X GET https://your-workers-domain.workers.dev/api/v1/products \
  -H "Authorization: Bearer <jwt_token>" \
  -G -d "category=CPU" -d "brand=Intel"

# Tạo sản phẩm mới
curl -X POST https://your-workers-domain.workers.dev/api/v1/products \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Intel Core i5-13600K","category":"CPU","brand":"Intel","price":7500000}'
```

## Support

Nếu bạn gặp vấn đề với API, vui lòng liên hệ:
- Email: api-support@computerpos.com
- GitHub Issues: [API Issues](https://github.com/your-repo/issues)
- Documentation: [API Wiki](https://github.com/your-repo/wiki)
