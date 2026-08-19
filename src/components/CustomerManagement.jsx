import React, { useState } from 'react';
import { Search, Users, ExternalLink, Calendar, Mail, Phone, ShoppingCart } from 'lucide-react';

export default function CustomerManagement({ customers, setActiveTab, setOrderSearch }) {
  const [search, setSearch] = useState('');

  // Filter Customers
  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(search.toLowerCase()) || 
           (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
           c.phone.includes(search) ||
           c.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleViewOrders = (customerName) => {
    setOrderSearch(customerName);
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Registered Customer List 👥</h2>
          <p className="text-sm text-gray-500 mt-1">Details and total shopping amounts of all customers who ordered from Gentro store.</p>
        </div>
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-gray-400">
          Total Customers: {filteredCustomers.length}
        </div>
      </div>

      {/* Customer Directory Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 text-gray-400">
          <p className="text-base font-medium">No customers found!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Customer ID</th>
                  <th className="px-6 py-4 font-semibold">Name & Contact</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold">Total Orders</th>
                  <th className="px-6 py-4 font-semibold">Total Spent</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-950 font-mono text-xs">{c.id}</td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" /> {c.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" /> {c.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {c.joinDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-semibold">
                        <ShoppingCart className="w-3 h-3 text-gray-500" />
                        {c.totalOrders} Orders
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-blue-600">৳{c.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewOrders(c.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors"
                      >
                        View Orders <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
