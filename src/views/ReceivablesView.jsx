import React, { useState, useEffect, useMemo } from 'react';
import { financeApi } from '../services/api';

const ReceivablesView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', date: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await financeApi.getAll();
      setItems((data || []).filter(i => i.type === 'receivable'));
    } catch (e) {
      console.error('Error loading receivables:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalReceivables = useMemo(() => items.reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [items]);

  const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);

  const resetForm = () => {
    setForm({ name: '', amount: '', date: '', description: '' });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: 'receivable',
      name: form.name,
      amount: Number(String(form.amount).replace(',', '.')),
      date: form.date || new Date().toISOString().split('T')[0],
      description: form.description,
    };

    try {
      if (editItem) {
        await financeApi.update({ ...payload, id: editItem.id });
      } else {
        await financeApi.add({ ...payload, id: Date.now().toString() });
      }
      await loadData();
      resetForm();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Kayıt başarısız.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await financeApi.delete(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || '',
      amount: item.amount || '',
      date: item.date || '',
      description: item.description || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleMarkPaid = async (item) => {
    if (!confirm(`${item.name} alacağını tahsil edildi olarak işaretlemek istiyor musunuz?`)) return;
    try {
      await financeApi.delete(item.id);
      await loadData();
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary-dark">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6 overflow-y-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-dark">Alacaklar</h1>
          <p className="text-text-secondary-dark">Tahsil edilecek alacaklar</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-background-dark font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Alacak
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-dark p-5 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Toplam Alacak</p>
          <p className="text-2xl font-bold text-green-400 mt-1 font-mono">{formatCurrency(totalReceivables)}</p>
        </div>
        <div className="bg-surface-dark p-5 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Alacak Sayısı</p>
          <p className="text-2xl font-bold text-text-primary-dark mt-1 font-mono">{items.length}</p>
        </div>
        <div className="bg-surface-dark p-5 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Ortalama Alacak</p>
          <p className="text-2xl font-bold text-text-primary-dark mt-1 font-mono">
            {formatCurrency(items.length > 0 ? totalReceivables / items.length : 0)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-surface-dark p-6 rounded-xl border border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
            {editItem ? 'Alacağı Düzenle' : 'Yeni Alacak Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-text-secondary-dark mb-1">Kişi/Firma</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                placeholder="Müşteri adı"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary-dark mb-1">Tutar (TL)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary-dark mb-1">Tarih</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary-dark mb-1">Açıklama</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                placeholder="İsteğe bağlı"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <button
                type="submit"
                className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {editItem ? 'Güncelle' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
        <div className="p-4 border-b border-border-dark">
          <h3 className="font-semibold text-green-400">Alacak Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background-dark text-text-secondary-dark">
              <tr>
                <th className="text-left p-3">Kişi/Firma</th>
                <th className="text-right p-3">Tutar</th>
                <th className="text-center p-3">Tarih</th>
                <th className="text-left p-3">Açıklama</th>
                <th className="text-center p-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-text-secondary-dark">Alacak kaydı yok</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-border-dark hover:bg-background-dark/50">
                    <td className="p-3 text-text-primary-dark font-medium">{item.name}</td>
                    <td className="p-3 text-right font-mono text-green-400">{formatCurrency(item.amount)}</td>
                    <td className="p-3 text-center text-text-secondary-dark">{item.date}</td>
                    <td className="p-3 text-text-secondary-dark">{item.description || '-'}</td>
                    <td className="p-3 text-center flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMarkPaid(item)}
                        title="Tahsil Edildi"
                        className="text-green-400 hover:text-green-300 p-1"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        title="Düzenle"
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Sil"
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceivablesView;
