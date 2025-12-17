import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import InventoryTable from '../components/InventoryTable';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import CashRegister from '../components/CashRegister';
import GoldInventory from '../components/GoldInventory';
import FinanceList from '../components/FinanceList';
import { api } from '../services/api';

const ShopView = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct = await api.updateProduct({ ...productData, id: editingProduct.id });
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        // Add new product
        // Exclude id to let json-server generate it
        const { id, ...newProductData } = productData;
        const addedProduct = await api.addProduct(newProductData);
        setProducts([...products, addedProduct]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full">
      <Header onSearch={handleSearch} onAdd={handleAdd} />

      <main className="flex-1 px-4 pb-6 overflow-y-auto">
        <div className="flex flex-col gap-6 mt-6">
          {/* Top Section: Financials & Gold */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CashRegister />
            <GoldInventory />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              <FinanceList title="Alacaklar" type="receivable" />
              <FinanceList title="Borçlar" type="debt" />
            </div>
          </div>

          {/* Bottom Section: Inventory */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text-primary-dark">Vitrin Envanteri</h2>
            <InventoryTable 
              items={filteredProducts} 
              onDelete={handleDelete} 
              onEdit={handleEdit}
            />
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ShopView;
