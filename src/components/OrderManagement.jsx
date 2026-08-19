import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, X, ShieldAlert, CheckCircle2, Truck, HelpCircle, Ban } from 'lucide-react';
import { colorNames } from '../mockData';
import { supabase } from '../lib/supabase';

export default function OrderManagement({ orders, setOrders, products, selectedOrder, setSelectedOrder }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // If a selectedOrder is passed from the dashboard, open the details modal automatically
  useEffect(() => {
    if (selectedOrder) {
      setIsDetailsOpen(true);
    }
  }, [selectedOrder]);

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null); // Reset global selection
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let paymentStatus = order.paymentStatus;
    if (newStatus === 'Delivered') paymentStatus = 'Paid';
    const { error } = await supabase.from('orders').update({ status: newStatus, payment_status: paymentStatus }).eq('id', order.databaseId);
    if (error) {
      console.error('Unable to update order:', error.message);
      return;
    }
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus, paymentStatus };
      }
      return o;
    });
    setOrders(updated);
    // Sync active modal state
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus, paymentStatus: newStatus === 'Delivered' ? 'Paid' : selectedOrder.paymentStatus });
    }
  };

  const handleTogglePayment = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const paymentStatus = order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', order.databaseId);
    if (error) {
      console.error('Unable to update payment status:', error.message);
      return;
    }
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, paymentStatus };
      }
      return o;
    });
    setOrders(updated);
    // Sync active modal state
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <HelpCircle className="w-4 h-4 text-yellow-600" />;
      case 'Processing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'Shipped': return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Cancelled': return <Ban className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 border border-yellow-200 text-yellow-700';
      case 'Processing': return 'bg-blue-50 border border-blue-200 text-blue-700';
      case 'Shipped': return 'bg-indigo-50 border border-indigo-200 text-indigo-700';
      case 'Delivered': return 'bg-green-50 border border-green-200 text-green-700';
      case 'Cancelled': return 'bg-red-50 border border-red-200 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase()) ||
                          o.phone.includes(search) ||
                          o.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Order Tracking & Management 📦</h2>
        <p className="text-sm text-gray-500 mt-1">Update customer order statuses and verify invoice details from here.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Tab Status Filter */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 w-full sm:w-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 text-gray-400">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-base font-medium">No orders found!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Total Price</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-950">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{o.customer}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{o.phone}</div>
                    </td>
                    <td className="px-6 py-4">{o.date}</td>
                    <td className="px-6 py-4 font-extrabold text-gray-950">৳{o.total}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePayment(o.id)}
                        className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          o.paymentStatus === 'Paid'
                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        }`}
                        title="Click to toggle"
                      >
                        {o.paymentStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(o.status)}`}>
                        {getStatusIcon(o.status)}
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsDetailsOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Invoice & Details 🧾</h3>
                <p className="text-xs text-gray-400 mt-0.5">ID: {selectedOrder.id} • {selectedOrder.date}</p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer and Order Status Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-5">
                {/* Customer Details */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Details</h4>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.customer}</p>
                  <p className="text-xs text-gray-500">Email: {selectedOrder.email}</p>
                  <p className="text-xs text-gray-500">Phone: {selectedOrder.phone}</p>
                  <p className="text-xs text-gray-500">Address: {selectedOrder.address}</p>
                </div>

                {/* Status Update Control */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Status & Controls</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold bg-white text-gray-800 outline-none focus:border-blue-500"
                      >
                        <option value="Pending">Pending ⏳</option>
                        <option value="Processing">Processing ⚙️</option>
                        <option value="Shipped">Shipped 🚚</option>
                        <option value="Delivered">Delivered ✅</option>
                        <option value="Cancelled">Cancelled ❌</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-500">Payment Status:</span>
                      <button
                        onClick={() => handleTogglePayment(selectedOrder.id)}
                        className={`px-2 py-0.5 rounded font-bold ${
                          selectedOrder.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedOrder.paymentStatus} (Toggle)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Products</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => {
                    const prodInfo = products.find(p => p.id === item.productId);
                    const image = prodInfo ? prodInfo.image : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
                    return (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <img
                          src={image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-gray-850 truncate">{item.name}</h5>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Size: <span className="font-bold text-gray-600">{item.size}</span> | 
                            Color: <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 align-middle ml-1" style={{ backgroundColor: item.color }} title={colorNames[item.color] || item.color} />
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-900">৳{item.price} x {item.qty}</p>
                          <p className="text-xs font-extrabold text-blue-600 mt-0.5">৳{item.price * item.qty}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">৳{selectedOrder.total}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Shipping Fee (Home Delivery)</span>
                  <span>৳0 (Free Delivery)</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Estimated Tax (0% VAT)</span>
                  <span>৳0</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-950 pt-2 border-t border-dashed border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-blue-600">৳{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-colors"
              >
                Back to Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
