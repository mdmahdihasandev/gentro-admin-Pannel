import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, LayoutGrid, List, AlertCircle, Check, X, Upload } from 'lucide-react';
import { colorNames } from '../mockData';
import { supabase } from '../lib/supabase';

export default function ProductManagement({ products, setProducts, currentUser, loading }) {
  const isModerator = currentUser?.role === 'Moderator';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    description: '',
    category: 'Round Neck',
    price: '',
    oldPrice: '',
    stock: '',
    image: '',
    rating: '4.5',
    reviewCount: '0',
    sizes: ['M', 'L'],
    colors: ['#000000'],
    isFeatured: false,
    isBestseller: false,
    isNew: false
  };
  const [form, setForm] = useState(initialFormState);

  // Available options
  const categories = ['Round Neck', 'V-Neck', 'Polo', 'Oversized'];
  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    { hex: '#000000', name: 'Black' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#0f172a', name: 'Navy' },
    { hex: '#b91c1c', name: 'Red' },
    { hex: '#1d4ed8', name: 'Blue' },
    { hex: '#15803d', name: 'Green' },
    { hex: '#eab308', name: 'Yellow' },
    { hex: '#4b5563', name: 'Gray' },
    { hex: '#7c2d12', name: 'Terracotta' },
    { hex: '#4338ca', name: 'Indigo' }
  ];

  // Placeholder images
  const defaultImages = {
    'Polo': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
    'Oversized': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    'Round Neck': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
    'V-Neck': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500'
  };

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      oldPrice: product.old_price ?? '',
      stock: product.stock,
      image: product.image,
      rating: product.rating ?? 4.5,
      reviewCount: product.review_count ?? 0,
      sizes: product.sizes,
      colors: product.colors,
      isFeatured: Boolean(product.is_featured),
      isBestseller: Boolean(product.is_bestseller),
      isNew: Boolean(product.is_new)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return alert(`Could not delete product: ${error.message}`);
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || form.stock === '') {
      alert('Please fill in name, price, and stock!');
      return;
    }

    const priceNum = parseFloat(form.price);
    const stockNum = parseInt(form.stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please provide a valid price!');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please provide a valid stock quantity!');
      return;
    }

    const imageUrl = form.image.trim() || defaultImages[form.category] || defaultImages['Round Neck'];

    const oldPriceNum = form.oldPrice === '' ? null : parseFloat(form.oldPrice);
    const ratingNum = parseFloat(form.rating);
    const reviewCountNum = parseInt(form.reviewCount, 10);
    if ((oldPriceNum !== null && (isNaN(oldPriceNum) || oldPriceNum < priceNum)) || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5 || isNaN(reviewCountNum) || reviewCountNum < 0) {
      alert('Please enter valid sale price, rating, and review count values!');
      return;
    }
    const payload = {
      name: form.name, description: form.description, category: form.category,
      price: priceNum, old_price: oldPriceNum, stock: stockNum, image: imageUrl,
      rating: ratingNum, review_count: reviewCountNum, sizes: form.sizes, colors: form.colors,
      is_featured: form.isFeatured, is_bestseller: form.isBestseller, is_new: form.isNew
    };
    const request = editingProduct
      ? supabase.from('products').update(payload).eq('id', editingProduct.id).select().single()
      : supabase.from('products').insert(payload).select().single();
    const { data, error } = await request;
    if (error) return alert(`Could not save product: ${error.message}`);
    setProducts(editingProduct ? products.map((p) => p.id === data.id ? data : p) : [data, ...products]);
    setIsModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Array Checkbox Handlers
  const handleSizeToggle = (size) => {
    if (form.sizes.includes(size)) {
      setForm({ ...form, sizes: form.sizes.filter(s => s !== size) });
    } else {
      setForm({ ...form, sizes: [...form.sizes, size] });
    }
  };

  const handleColorToggle = (colorHex) => {
    if (form.colors.includes(colorHex)) {
      setForm({ ...form, colors: form.colors.filter(c => c !== colorHex) });
    } else {
      setForm({ ...form, colors: [...form.colors, colorHex] });
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'InStock') matchesStock = p.stock > 10;
    else if (stockFilter === 'LowStock') matchesStock = p.stock > 0 && p.stock <= 10;
    else if (stockFilter === 'OutOfStock') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">T-Shirt Stock & Catalog 👕</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all your T-shirt collections here.</p>
        </div>
        {!isModerator && (
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 outline-none focus:border-blue-500 focus:bg-white transition-colors"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 outline-none focus:border-blue-500 focus:bg-white transition-colors"
          >
            <option value="All">All Stock Levels</option>
            <option value="InStock">In Stock ({'>'}10)</option>
            <option value="LowStock">Low Stock (1-10)</option>
            <option value="OutOfStock">Out of Stock (0)</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product List Grid/Table */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 text-gray-400">Loading products from Supabase...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-base font-medium">No products found!</p>
          <p className="text-xs mt-1">Please try with a different search keyword.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {/* Product Image & Badge */}
              <div className="relative pt-[100%] bg-gray-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                  {p.category}
                </span>

                {p.stock === 0 ? (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Sold Out
                  </span>
                ) : p.stock <= 10 ? (
                  <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    Low Stock ({p.stock})
                  </span>
                ) : null}
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">{p.id}</span>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1" title={p.name}>{p.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                  {/* Sizes & Colors */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-1">
                      {p.sizes.map(s => (
                        <span key={s} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">{s}</span>
                      ))}
                    </div>
                    {/* Tiny Color circles */}
                    <div className="flex -space-x-1">
                      {p.colors.map(col => (
                        <span
                          key={col}
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: col }}
                          title={colorNames[col] || col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-base font-black text-gray-900">৳{p.price}</p>
                    </div>
                    {!isModerator && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-100 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Image</th>
                  <th className="px-6 py-4 font-semibold">ID / Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Sizes / Colors</th>
                  {!isModerator && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">৳{p.price}</td>
                    <td className="px-6 py-4">
                      {p.stock === 0 ? (
                        <span className="text-red-600 font-bold text-xs">Sold Out</span>
                      ) : (
                        <span className={`font-semibold ${p.stock <= 10 ? 'text-amber-500' : 'text-gray-700'}`}>
                          {p.stock} Pcs {p.stock <= 10 && '⚠️'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <div className="flex gap-1">
                        {p.sizes.map(s => (
                          <span key={s} className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[10px] font-bold">{s}</span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        {p.colors.map(col => (
                          <span
                            key={col}
                            className="w-3.5 h-3.5 rounded-full border border-gray-200"
                            style={{ backgroundColor: col }}
                            title={colorNames[col] || col}
                          />
                        ))}
                      </div>
                    </td>
                    {!isModerator && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-50 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product 📝' : 'Add New Product 🆕'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Gentro Black Oversized Tee"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  placeholder="Write details about fabric, GSM, fitting, and design..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Grid (Category, Price, Sale Price, Stock) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Price (৳) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 750"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Regular Price (৳)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Rating (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Review Count</label>
                  <input type="number" min="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Homepage Placement</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ['isFeatured', 'Featured Collection', 'Show on the Featured Collection section'],
                    ['isBestseller', 'Best Sellers', 'Show on the Best Sellers section'],
                    ['isNew', 'New Arrivals', 'Show on the New Arrivals section']
                  ].map(([key, label, help]) => (
                    <label key={key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                      <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="mt-0.5 w-4 h-4 accent-blue-600" />
                      <span><span className="block text-sm font-bold text-gray-800">{label}</span><span className="block text-[10px] text-gray-400 mt-0.5">{help}</span></span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Available Sizes *</label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => {
                    const isSelected = form.sizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`px-4 py-1.5 rounded-lg border text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Colors *</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {availableColors.map(c => {
                    const isSelected = form.colors.includes(c.hex);
                    return (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => handleColorToggle(c.hex)}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-800'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-inner flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate">{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Product Image</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Selector */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-4 cursor-pointer transition-all bg-gray-50 hover:bg-blue-50/10 min-h-[90px]">
                    <Upload className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-blue-600">Select Image</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Device Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Image Preview & URL box */}
                  <div className="space-y-2 flex flex-col justify-between">
                    {form.image ? (
                      <div className="relative w-full h-[52px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: '' })}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-[52px] rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 font-semibold">
                        No image selected
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Or paste image URL here..."
                      value={form.image.startsWith('data:') ? '' : form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-colors"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
