import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const GramGoldSection = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    weight: '',
    fineness: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.getGramItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading gram items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weight || !formData.fineness) return;

    const newItem = {
      weight: parseFloat(formData.weight),
      fineness: parseInt(formData.fineness),
      date: new Date().toISOString()
    };

    try {
      const added = await api.addGramItem(newItem);
      setItems([...items, added]);
      setFormData({ weight: '', fineness: '' });
    } catch (error) {
      console.error('Error adding gram item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteGramItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting gram item:', error);
    }
  };

  const totalWeight = items.reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
      <h2 className="text-xl font-bold text-text-primary-dark mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-yellow-400">scale</span>
        Gram Altın Takibi
      </h2>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6 items-end bg-background-dark p-4 rounded-lg border border-border-dark">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-secondary-dark mb-1">Ağırlık (Gram)</label>
          <input
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={e => setFormData({...formData, weight: e.target.value})}
            className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary"
            placeholder="0.00"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-secondary-dark mb-1">Milyem</label>
          <input
            type="number"
            step="1"
            value={formData.fineness}
            onChange={e => setFormData({...formData, fineness: e.target.value})}
            className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark focus:outline-none focus:border-primary"
            placeholder="Örn: 995"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors h-[42px]"
        >
          Ekle
        </button>
      </form>

      {/* List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-secondary-dark border-b border-border-dark">
            <tr>
              <th className="pb-2 pl-2">Ağırlık</th>
              <th className="pb-2">Milyem</th>
              <th className="pb-2">Has Değer (24K)</th>
              <th className="pb-2 text-right pr-2">İşlem</th>
            </tr>
          </thead>
          <tbody className="text-text-primary-dark">
            {items.map(item => {
              const hasValue = (item.weight * item.fineness) / 1000;
              return (
                <tr key={item.id} className="border-b border-border-dark/50 hover:bg-white/5 transition-colors">
                  <td className="py-2 pl-2 font-medium">{item.weight.toFixed(2)} gr</td>
                  <td className="py-2 text-text-secondary-dark">{item.fineness}</td>
                  <td className="py-2 text-yellow-400 font-mono">{hasValue.toFixed(2)} gr</td>
                  <td className="py-2 text-right pr-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-text-secondary-dark">Henüz kayıt yok.</td>
              </tr>
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot className="border-t border-border-dark font-bold">
              <tr>
                <td className="py-3 pl-2 text-text-primary-dark">{totalWeight.toFixed(2)} gr</td>
                <td></td>
                <td className="py-3 text-yellow-400 font-mono">
                  {items.reduce((acc, curr) => acc + (curr.weight * curr.fineness) / 1000, 0).toFixed(2)} gr
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default GramGoldSection;
