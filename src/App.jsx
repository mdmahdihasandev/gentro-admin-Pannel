import React, { useState, useEffect } from 'react';
import sidebarlogo from './assets/images/G.png'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  LogOut,
  Shirt,
  Shield
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import CustomerManagement from './components/CustomerManagement';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import Login from './components/Login';

import { supabase } from './lib/supabase';

export default function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [orders, setOrders] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gentro_settings');
    return saved ? JSON.parse(saved) : {
      storeName: 'Gentro Store',
      storeEmail: 'info@gentro.com',
      currency: '৳',
      taxRate: 0,
      shippingFee: 0,
      adminName: 'Gentro Admin',
      adminEmail: 'admin@gentro.com',
      theme: 'light'
    };
  });

  // Logged-in User State
  const [currentUser, setCurrentUser] = useState(null);

  // UI Navigation states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) console.error('Unable to load catalog from Supabase:', error.message);
      else setProducts(data || []);
      setProductsLoading(false);
    };
    loadProducts();
    const channel = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadProducts)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const toAdminOrder = (order) => ({
      id: order.order_number,
      databaseId: order.id,
      customer: order.customer_name,
      email: order.email || '',
      phone: order.phone,
      address: [order.address, order.area, order.city, order.postal_code].filter(Boolean).join(', '),
      date: new Date(order.created_at).toISOString().slice(0, 10),
      items: Array.isArray(order.items) ? order.items : [],
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.payment_status
    });
    const loadOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) console.error('Unable to load orders from Supabase:', error.message);
      else setOrders((data || []).map(toAdminOrder));
    };
    loadOrders();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadOrders)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*').order('last_order_at', { ascending: false });
      if (!active) return;
      if (error) console.error('Unable to load customers from Supabase:', error.message);
      else setCustomers((data || []).map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        joinDate: new Date(customer.first_order_at).toISOString().slice(0, 10),
        totalOrders: Number(customer.total_orders),
        totalSpent: Number(customer.total_spent)
      })));
    };
    loadCustomers();
    const channel = supabase
      .channel('admin-customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, loadCustomers)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gentro_settings', JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings to localStorage:", e);
    }
  }, [settings]);

  useEffect(() => {
    const setSessionUser = async (session) => {
      const user = session?.user;
      if (!user) { setCurrentUser(null); return; }
      const { data: role, error } = await supabase.rpc('get_my_admin_role');
      setCurrentUser(!error && role ? { id: user.id, name: user.user_metadata?.name || user.email, email: user.email, role, avatar: user.user_metadata?.avatar_url } : null);
    };
    supabase.auth.getSession().then(({ data }) => setSessionUser(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSessionUser(session));
    return () => subscription.unsubscribe();
  }, []);

  // Handle cross-tab interaction filters
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Reset secondary states if moving away from search
    if (tabName !== 'orders') {
      setOrderSearch('');
    }
  };

  // Mock Notifications based on Processing orders
  const notifications = orders
    .filter(o => o.status === 'Pending' || o.status === 'Processing')
    .slice(0, 3)
    .map(o => ({
      id: o.id,
      text: `New order from ${o.customer} (${o.id})`,
      time: o.date === '2026-08-19' ? 'Today' : 'Yesterday'
    }));  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className={`flex min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r ${
        settings.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } flex flex-col justify-between hidden md:flex`}>
        <div>
          {/* Logo Brand */}
          <div className={`p-6 border-b flex items-center gap-3 ${settings.theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="  p-2.5 rounded-[40px] shadow-md">
             <img  className='w-[50px] h-[50px]' src={sidebarlogo} alt="" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase text-blue-600">Gentro</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">T-Shirt Admin</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : settings.theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => handleTabChange('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-md'
                  : settings.theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Shirt className="w-5 h-5" />
              Products
            </button>

            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md'
                  : settings.theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Orders
              {orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'customers'
                  ? 'bg-blue-600 text-white shadow-md'
                  : settings.theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              Customers
            </button>

            {currentUser.role === 'Super Admin' && (
              <button
                onClick={() => handleTabChange('staff')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'staff'
                    ? 'bg-blue-600 text-white shadow-md'
                    : settings.theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Shield className="w-5 h-5" />
                Staff Control
              </button>
            )}

            <button
              onClick={() => handleTabChange('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : settings.theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Account */}
        <div className={`p-4 border-t ${settings.theme === 'dark' ? 'border-gray-800' : 'border-gray-105'}`}>
          <div className="flex items-center gap-3 p-2">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Profile Avatar"
                className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {currentUser.name}
              </p>
              <p className="text-[9px] text-gray-400 font-semibold truncate flex flex-col gap-0.5">
                <span className="truncate">{currentUser.email}</span>
                <span className="bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-blue-400 text-[8px] font-bold px-1 py-0.2 rounded w-fit uppercase tracking-wider">{currentUser.role}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                supabase.auth.signOut();
                setCurrentUser(null);
                setActiveTab('dashboard');
              }
            }}
            className={`w-full mt-3 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              settings.theme === 'dark' 
                ? 'border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-red-400' 
                : 'border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP HEADER */}
        <header className={`sticky top-0 z-30 h-16 border-b flex justify-between items-center px-6 backdrop-blur-md ${
          settings.theme === 'dark' ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'
        }`}>
          {/* Header Mobile Brand and Page Title */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center bg-blue-600 text-white p-2 rounded-xl">
              <Shirt className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black capitalize tracking-tight text-gray-850 hidden md:block">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'staff' ? 'Staff' : activeTab} Panel
            </h2>
            <h2 className="text-base font-black text-gray-800 md:hidden uppercase tracking-wider">Gentro</h2>
          </div>

          {/* Header Icons Area */}
          <div className="flex items-center gap-4">
            {/* Notification Drawer Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl border relative transition-colors cursor-pointer ${
                  settings.theme === 'dark' 
                    ? 'border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white' 
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-850'
                }`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Box */}
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-xl p-4 space-y-3 z-50 ${
                  settings.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-150 text-gray-800'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold">Notifications ({notifications.length})</span>
                    <button onClick={() => setShowNotifications(false)} className="text-[10px] text-blue-500 font-semibold hover:underline">Close</button>
                  </div>
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-2">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors text-left space-y-1">
                          <p className="text-xs font-semibold leading-relaxed">{n.text}</p>
                          <span className="text-[9px] text-gray-400 font-bold block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2 border-l pl-4 border-gray-200 dark:border-gray-800">
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                alt="Profile Avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-750 hidden sm:block">
                  {currentUser.name}
                </span>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out?')) {
                      supabase.auth.signOut();
                      setCurrentUser(null);
                      setActiveTab('dashboard');
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold ml-1 hidden sm:block cursor-pointer"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* MIDDLE CONTENT SCREEN CONTAINER */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              orders={orders} 
              customers={customers} 
              setActiveTab={handleTabChange}
              setSelectedOrder={setSelectedOrder}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagement 
              products={products} 
              setProducts={setProducts} 
              currentUser={currentUser}
              loading={productsLoading}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagement 
              orders={orders} 
              setOrders={setOrders} 
              products={products}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement 
              customers={customers} 
              setActiveTab={handleTabChange}
              setOrderSearch={setOrderSearch}
            />
          )}

          {activeTab === 'settings' && (
            <Settings 
              key={currentUser?.id}
              settings={settings} 
              setSettings={setSettings} 
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}

          {activeTab === 'staff' && currentUser.role === 'Super Admin' && (
            <UserManagement 
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex justify-around items-center px-2 z-40 backdrop-blur-md ${
        settings.theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
      }`}>
        <button 
          onClick={() => handleTabChange('dashboard')} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Dashboard</span>
        </button>

        <button 
          onClick={() => handleTabChange('products')} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'products' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Shirt className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Products</span>
        </button>

        <button 
          onClick={() => handleTabChange('orders')} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl relative ${activeTab === 'orders' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Orders</span>
          {orders.filter(o => o.status === 'Pending').length > 0 && (
            <span className="absolute top-1 right-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full">
              {orders.filter(o => o.status === 'Pending').length}
            </span>
          )}
        </button>

        {currentUser.role === 'Super Admin' ? (
          <button 
            onClick={() => handleTabChange('staff')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'staff' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Staff</span>
          </button>
        ) : (
          <button 
            onClick={() => handleTabChange('customers')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'customers' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Customers</span>
          </button>
        )}

        <button 
          onClick={() => handleTabChange('settings')} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Settings</span>
        </button>
      </div>

    </div>
  );
}
