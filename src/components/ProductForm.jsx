import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 1,
    price: '',
    category: 'Alyans',
    image: ''
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary-dark">Ürün Adı</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="rounded-lg bg-background-dark border border-border-dark px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary transition-colors"
          placeholder="Örn: Pırlanta Alyans Seti"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-text-secondary-dark">Stok Kodu (SKU)</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            className="rounded-lg bg-background-dark border border-border-dark px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary transition-colors"
            placeholder="Örn: DWS-001"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-text-secondary-dark">Kategori</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="rounded-lg bg-background-dark border border-border-dark px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Alyans">Alyans</option>
            <option value="Kolye & Küpe">Kolye & Küpe</option>
            <option value="Bilezik">Bilezik</option>
            <option value="Yüzük">Yüzük</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-text-secondary-dark">Fiyat (TL)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="rounded-lg bg-background-dark border border-border-dark px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary transition-colors"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-text-secondary-dark">Miktar</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            className="rounded-lg bg-background-dark border border-border-dark px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary-dark">Görsel URL</label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="rounded-lg bg-background-dark border border-border-dark px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary transition-colors"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-surface-dark hover:bg-white/5 text-text-secondary-dark hover:text-text-primary-dark transition-colors font-medium"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-background-dark font-bold transition-colors"
        >
          {product ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
