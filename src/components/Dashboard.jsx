import React from 'react';
import { DollarSign, ShoppingBag, Users, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Dashboard({ products, orders, customers, setActiveTab, setSelectedOrder }) {
  // Calculations
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const lowStockItems = products.filter(p => p.stock <= 10).length;

  // Simple hardcoded sales trend for the chart
  const salesData = [
    { day: 'Sat', sales: 4200 },
    { day: 'Sun', sales: 3800 },
    { day: 'Mon', sales: 5100 },
    { day: 'Tue', sales: 6200 },
    { day: 'Wed', sales: 7500 },
    { day: 'Thu', sales: 8900 },
    { day: 'Fri', sales: 11200 },
  ];

  // SVG Chart config
  const chartHeight = 150;
  const chartWidth = 500;
  const maxSales = Math.max(...salesData.map(d => d.sales));
  const points = salesData.map((d, index) => {
    const x = (index / (salesData.length - 1)) * chartWidth;
    const y = chartHeight - (d.sales / maxSales) * chartHeight * 0.8 - 15; // 80% height + offset
    return `${x},${y}`;
  }).join(' ');

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Top selling mock
  const topProducts = [...products]
    .sort((a, b) => b.price - a.price) // Mock top selling as premium ones or just high stock/sales
    .slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Gentro Admin! 👋</h1>
          <p className="text-gray-500 mt-1">Here is the update report of your store sales and orders today.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Live Tracking Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">৳{totalRevenue.toLocaleString()}</h3>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              +12.5% <span className="text-gray-400">last week</span>
            </span>
          </div>
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
            <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
              +8.2% <span className="text-gray-400">last week</span>
            </span>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCustomers}</h3>
            <span className="text-xs font-medium text-purple-600 flex items-center gap-1">
              +15.3% <span className="text-gray-400">all time</span>
            </span>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Low Stock Shirts</p>
            <h3 className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{lowStockItems}</h3>
            <span className="text-xs font-medium text-amber-600">
              {lowStockItems > 0 ? 'Refill product stock!' : 'Stock is sufficient'}
            </span>
          </div>
          <div className={`p-4 rounded-2xl ${lowStockItems > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-gray-900">Weekly Sales Chart (৳)</h4>
              <p className="text-xs text-gray-400">Graph of total sales in the last 7 days</p>
            </div>
            <select className="bg-gray-50 text-xs font-semibold text-gray-600 px-3 py-2 border border-gray-200 rounded-lg outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-[180px] mt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              {/* Grids */}
              <line x1="0" y1={chartHeight * 0.2} x2={chartWidth} y2={chartHeight * 0.2} stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1={chartHeight * 0.8} x2={chartWidth} y2={chartHeight * 0.8} stroke="#f3f4f6" strokeWidth="1" />

              {/* Area under line */}
              <path
                d={`M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`}
                fill="url(#salesAreaGrad)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Chart Points */}
              {salesData.map((d, i) => {
                const x = (i / (salesData.length - 1)) * chartWidth;
                const y = chartHeight - (d.sales / maxSales) * chartHeight * 0.8 - 15;
                return (
                  <g key={i} className="group/dot">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-200 hover:r-7"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-gray-800 opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 bg-white"
                    >
                      ৳{d.sales}
                    </text>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between mt-2 px-1 text-[11px] font-semibold text-gray-400">
              {salesData.map((d, i) => (
                <span key={i}>{d.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Best Selling Products</h4>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category} • {p.stock} in stock</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">৳{p.price}</p>
                  <p className="text-[10px] text-green-500 font-semibold">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-gray-900">Recent Orders List</h4>
            <p className="text-xs text-gray-400">Overview of the most recent orders</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Orders <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-950">{o.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{o.customer}</td>
                  <td className="px-6 py-4">{o.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-950">৳{o.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-[11px] font-bold rounded-md ${o.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {o.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setActiveTab('orders');
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
