import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { StockManager } from './components/StockManager';
import { ProductForm } from './components/ProductForm';
import { BillingSystem } from './components/BillingSystem';
import { Package, Plus, Receipt, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  price: number;
  notes: string;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('stock');

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('grocery-products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('grocery-products', JSON.stringify(products));
  }, [products]);

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...productData, id: editingProduct.id }
          : p
      ));
      setEditingProduct(null);
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString()
      };
      setProducts([...products, newProduct]);
    }
    setActiveTab('stock');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveTab('add');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setActiveTab('stock');
  };

  const handleUpdateStock = (productId: string, newQty: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, qty: newQty } : p
    ));
  };

  const lowStockCount = products.filter(p => p.qty <= 5).length;
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.qty), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Grocery Inventory & Billing
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                Streamline your business with our advanced management system
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto p-6 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                <Package className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold">{totalProducts}</p>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold">₹{totalValue.toLocaleString()}</p>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden relative">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                <div className="h-8 w-8 flex items-center justify-center">
                  <span className="text-2xl font-bold">!</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-orange-100 text-sm font-medium">Low Stock Alerts</p>
                <p className="text-3xl font-bold">{lowStockCount}</p>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                <div className="h-8 w-8 flex items-center justify-center">
                  <span className="text-2xl font-bold">#</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-purple-100 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <TabsTrigger value="stock" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Package className="h-4 w-4" />
              Stock Management
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Plus className="h-4 w-4" />
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Receipt className="h-4 w-4" />
              Billing System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="mt-6">
            <StockManager
              products={products}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <ProductForm
              editingProduct={editingProduct}
              categories={categories.length > 0 ? categories : ['Fruits', 'Vegetables', 'Dairy', 'Grains']}
              onSaveProduct={handleSaveProduct}
              onCancelEdit={handleCancelEdit}
            />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingSystem
              products={products}
              onUpdateStock={handleUpdateStock}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}