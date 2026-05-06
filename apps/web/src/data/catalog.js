export const categories = ['Tất cả', 'Nữ', 'Nam', 'Trẻ em', 'Phụ kiện'];

export const paymentMethods = [
  { code: 'COD', label: 'COD', description: 'Thanh toán khi nhận hàng' },
  { code: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', description: 'Quét QR hoặc chuyển khoản trước' },
  { code: 'EWALLET', label: 'Ví điện tử', description: 'Momo / ZaloPay' },
  { code: 'CREDIT_CARD', label: 'Thẻ tín dụng', description: 'Visa / MasterCard / JCB' }
];

export const fallbackProducts = [
  {
    sku: 'YDY-M-POLO-001',
    name: 'Áo Polo Nam Piqué Mắt Chim',
    category: 'Nam',
    tag: 'Bán chạy',
    priceCents: 399000,
    featured: true,
    ratingCount: 312,
    shortDescription: 'Form dễ mặc, chất liệu thoáng mát, phù hợp công sở và đi chơi.',
    description: 'Áo polo tối giản với bề mặt pique mắt chim, giữ form tốt và dễ phối cùng quần jeans hoặc kaki.',
    sizes: ['M', 'L', 'XL'],
    colors: ['Navy', 'Trắng', 'Đen'],
    stock: 42
  },
  {
    sku: 'YDY-W-DRESS-001',
    name: 'Váy Hoa Nhí Nữ',
    category: 'Nữ',
    tag: 'Mới',
    priceCents: 450000,
    featured: true,
    isNew: true,
    ratingCount: 187,
    shortDescription: 'Dáng bay nhẹ, phù hợp hẹn hò và dạo phố cuối tuần.',
    description: 'Thiết kế nữ tính, chất vải mềm rũ, tôn dáng vừa đủ cho nhiều hoàn cảnh sử dụng.',
    sizes: ['S', 'M', 'L'],
    colors: ['Kem', 'Hồng', 'Xanh'],
    stock: 29
  },
  {
    sku: 'YDY-KID-TSHIRT-001',
    name: 'Áo Thun Trẻ Em In Hình',
    category: 'Trẻ em',
    tag: 'Kids',
    priceCents: 189000,
    featured: false,
    ratingCount: 94,
    shortDescription: 'Mềm, nhẹ và an toàn cho làn da nhạy cảm của trẻ.',
    description: 'Áo thun in hình vui nhộn, form thoải mái giúp bé vận động cả ngày mà vẫn dễ chịu.',
    sizes: ['100', '110', '120', '130'],
    colors: ['Xanh', 'Vàng', 'Trắng'],
    stock: 51
  },
  {
    sku: 'YDY-ACC-BAG-001',
    name: 'Túi Xách Canvas Phụ Kiện',
    category: 'Phụ kiện',
    tag: 'Hot',
    priceCents: 229000,
    featured: true,
    ratingCount: 256,
    shortDescription: 'Canvas chắc chắn, đựng được laptop nhỏ và đồ dùng hằng ngày.',
    description: 'Túi canvas gọn nhẹ, phối đồ linh hoạt và phù hợp cho đi học, đi làm hoặc du lịch ngắn ngày.',
    sizes: ['One size'],
    colors: ['Be', 'Đen', 'Xanh rêu'],
    stock: 18
  },
  {
    sku: 'YDY-W-SHOES-001',
    name: 'Giày High Heels Nữ',
    category: 'Nữ',
    tag: 'Mới',
    priceCents: 699000,
    featured: false,
    isNew: true,
    ratingCount: 143,
    shortDescription: 'Gót cao thanh lịch, tôn dáng chân và tăng chiều cao.',
    description: 'Giày high heels kinh điển với thiết kế tinh tế, phù hợp cho các buổi dự tiệc hoặc hẹn hò.',
    sizes: ['35', '36', '37', '38'],
    colors: ['Đen', 'Trắng', 'Đỏ'],
    stock: 22
  },
  {
    sku: 'YDY-ACC-SUNGLASSES-001',
    name: 'Kính Mắt Trời Thời Trang',
    category: 'Phụ kiện',
    tag: 'Mới',
    priceCents: 299000,
    featured: false,
    isNew: true,
    ratingCount: 78,
    shortDescription: 'Kinh tế, chống nắng hiệu quả và kiểu dáng trendy.',
    description: 'Kính mặt trời với tròng kính chống tia UV, phù hợp cho cả nam lẫn nữ.',
    sizes: ['One size'],
    colors: ['Đen', 'Nâu', 'Xanh'],
    stock: 35
  },
  {
    sku: 'YDY-W-CARDIGAN-001',
    name: 'Áo Khoác Cardigan Nữ',
    category: 'Nữ',
    tag: 'Mới',
    priceCents: 449000,
    featured: false,
    isNew: true,
    ratingCount: 165,
    shortDescription: 'Mềm mại, ấm áp và dễ phối với nhiều trang phục.',
    description: 'Cardigan nữ thiết kế tối giản, chất liệu cotton thô thoáng mát, phù hợp cho mọi mùa.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Kem', 'Xám', 'Hồng nhạt'],
    stock: 28
  }
];

export function getProductBySku(sku) {
  return fallbackProducts.find((product) => product.sku === sku);
}

export function fallbackSummary() {
  return { revenue_cents: 1547000, orders: 12, customers: 8 };
}
