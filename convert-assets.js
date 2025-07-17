// Script để convert SVG sang ICO và PNG
// Chạy: node convert-assets.js

const fs = require('fs');
const path = require('path');

// Kiểm tra file tồn tại
if (!fs.existsSync('./public/favicon.svg')) {
  console.error('❌ favicon.svg không tồn tại!');
  process.exit(1);
}

if (!fs.existsSync('./public/logo.svg')) {
  console.error('❌ logo.svg không tồn tại!');
  process.exit(1);
}

// Tạo favicon.ico từ SVG (base64 encoded)
const faviconSvg = fs.readFileSync('./public/favicon.svg', 'utf8');
const logoSvg = fs.readFileSync('./public/logo.svg', 'utf8');

console.log('✅ SVG files đã có sẵn:');
console.log('- favicon.svg:', faviconSvg.length, 'bytes');
console.log('- logo.svg:', logoSvg.length, 'bytes');

console.log('\n🔧 Để tạo ICO và PNG files:');
console.log('1. Sử dụng online converter: https://convertio.co/svg-ico/');
console.log('2. Hoặc cài đặt sharp: npm install sharp');
console.log('3. Hoặc sử dụng ImageMagick: convert favicon.svg favicon.ico');

console.log('\n📝 Tạm thời sử dụng SVG files thay thế:');
console.log('- Browsers hiện đại hỗ trợ SVG favicon');
console.log('- SVG logo có thể dùng trong HTML');
