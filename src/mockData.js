// Mock Data for Gentro Admin Panel

export const defaultProducts = [
  {
    id: 'GENT-PROD-001',
    name: 'Gentro Classic Polo Shirt',
    description: 'Premium quality polo shirt made of 100% combed cotton. Breathable fabric, perfect for smart-casual wear. Features double-needle stitching and classic collar.',
    category: 'Polo',
    price: 1250,
    stock: 45,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['#0f172a', '#b91c1c', '#1d4ed8', '#15803d'], // Navy, Red, Blue, Green
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'GENT-PROD-002',
    name: 'Gentro Premium Oversized Tee',
    description: 'Heavyweight 240 GSM oversized t-shirt. Drop shoulder design with high-quality neckline. Extremely comfortable and trendy.',
    category: 'Oversized',
    price: 950,
    stock: 12,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#f3f4f6', '#78350f'], // Black, Light Gray, Brown
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'GENT-PROD-003',
    name: 'Gentro Solid Round Neck',
    description: 'Regular fit basic round neck t-shirt. 180 GSM pre-shrunk cotton. Ideal for daily casual wear.',
    category: 'Round Neck',
    price: 650,
    stock: 120,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#ffffff', '#1e293b', '#dc2626', '#eab308'], // White, Slate, Red, Yellow
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'GENT-PROD-004',
    name: 'Gentro V-Neck Slim Fit',
    description: 'Elegant V-neck cotton blend t-shirt. Hugs the body nicely and offers a sleek silhouette.',
    category: 'V-Neck',
    price: 750,
    stock: 8, // Low Stock Alert test
    sizes: ['M', 'L', 'XL'],
    colors: ['#111827', '#4b5563', '#4338ca'], // Black, Gray, Indigo
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'GENT-PROD-005',
    name: 'Gentro Vintage Graphic Tee',
    description: 'Eco-friendly screen-printed graphic t-shirt. Features retro artwork on front. 190 GSM washed cotton for a vintage feel.',
    category: 'Oversized',
    price: 1100,
    stock: 32,
    sizes: ['M', 'L', 'XL'],
    colors: ['#374151', '#7c2d12'], // Charcoal, Terracotta
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

export const defaultOrders = [
  {
    id: 'GENT-ORD-1001',
    customer: 'Mahdi Hasan',
    email: 'mahdi@example.com',
    phone: '01712345678',
    date: '2026-08-19',
    items: [
      { productId: 'GENT-PROD-001', name: 'Gentro Classic Polo Shirt', qty: 2, price: 1250, size: 'L', color: '#0f172a' },
      { productId: 'GENT-PROD-003', name: 'Gentro Solid Round Neck', qty: 1, price: 650, size: 'M', color: '#ffffff' }
    ],
    total: 3150,
    status: 'Delivered',
    paymentStatus: 'Paid',
    address: 'House 12, Road 4, Dhanmondi, Dhaka'
  },
  {
    id: 'GENT-ORD-1002',
    customer: 'Rahat Khan',
    email: 'rahat@example.com',
    phone: '01887654321',
    date: '2026-08-19',
    items: [
      { productId: 'GENT-PROD-002', name: 'Gentro Premium Oversized Tee', qty: 1, price: 950, size: 'XL', color: '#000000' }
    ],
    total: 950,
    status: 'Processing',
    paymentStatus: 'Paid',
    address: 'Sector 4, Uttara, Dhaka'
  },
  {
    id: 'GENT-ORD-1003',
    customer: 'Sanjida Akter',
    email: 'sanjida@example.com',
    phone: '01911223344',
    date: '2026-08-18',
    items: [
      { productId: 'GENT-PROD-004', name: 'Gentro V-Neck Slim Fit', qty: 3, price: 750, size: 'M', color: '#4338ca' }
    ],
    total: 2250,
    status: 'Pending',
    paymentStatus: 'Unpaid',
    address: 'Halishahar, Chittagong'
  },
  {
    id: 'GENT-ORD-1004',
    customer: 'Tanvir Rahman',
    email: 'tanvir@example.com',
    phone: '01555667788',
    date: '2026-08-17',
    items: [
      { productId: 'GENT-PROD-001', name: 'Gentro Classic Polo Shirt', qty: 1, price: 1250, size: 'XXL', color: '#b91c1c' },
      { productId: 'GENT-PROD-005', name: 'Gentro Vintage Graphic Tee', qty: 1, price: 1100, size: 'L', color: '#374151' }
    ],
    total: 2350,
    status: 'Shipped',
    paymentStatus: 'Paid',
    address: 'Zindabazar, Sylhet'
  },
  {
    id: 'GENT-ORD-1005',
    customer: 'Fahim Ahmed',
    email: 'fahim@example.com',
    phone: '01300998877',
    date: '2026-08-15',
    items: [
      { productId: 'GENT-PROD-003', name: 'Gentro Solid Round Neck', qty: 2, price: 650, size: 'S', color: '#dc2626' }
    ],
    total: 1300,
    status: 'Cancelled',
    paymentStatus: 'Unpaid',
    address: 'Sonadanga, Khulna'
  }
];

export const defaultCustomers = [
  {
    id: 'GENT-CUST-201',
    name: 'Mahdi Hasan',
    email: 'mahdi@example.com',
    phone: '01712345678',
    totalOrders: 4,
    totalSpent: 8700,
    joinDate: '2026-01-15'
  },
  {
    id: 'GENT-CUST-202',
    name: 'Rahat Khan',
    email: 'rahat@example.com',
    phone: '01887654321',
    totalOrders: 1,
    totalSpent: 950,
    joinDate: '2026-06-10'
  },
  {
    id: 'GENT-CUST-203',
    name: 'Sanjida Akter',
    email: 'sanjida@example.com',
    phone: '01911223344',
    totalOrders: 2,
    totalSpent: 3500,
    joinDate: '2026-03-22'
  },
  {
    id: 'GENT-CUST-204',
    name: 'Tanvir Rahman',
    email: 'tanvir@example.com',
    phone: '01555667788',
    totalOrders: 3,
    totalSpent: 4800,
    joinDate: '2026-02-05'
  },
  {
    id: 'GENT-CUST-205',
    name: 'Fahim Ahmed',
    email: 'fahim@example.com',
    phone: '01300998877',
    totalOrders: 1,
    totalSpent: 1300,
    joinDate: '2026-08-10'
  }
];

export const colorNames = {
  '#0f172a': 'Navy Blue',
  '#b91c1c': 'Crimson Red',
  '#1d4ed8': 'Royal Blue',
  '#15803d': 'Forest Green',
  '#000000': 'Jet Black',
  '#f3f4f6': 'Light Gray',
  '#78350f': 'Amber Brown',
  '#ffffff': 'Pure White',
  '#1e293b': 'Slate Gray',
  '#dc2626': 'Classic Red',
  '#eab308': 'Sunny Yellow',
  '#111827': 'Dark Charcoal',
  '#4b5563': 'Medium Gray',
  '#4338ca': 'Indigo Purple',
  '#374151': 'Dark Gray',
  '#7c2d12': 'Terracotta Red'
};
