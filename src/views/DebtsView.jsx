import React, { useState, useEffect, useMemo } from 'react';
import { financeApi } from '../services/api';

const CURRENCY_OPTIONS = [
  { value: 'tl', label: 'TL' },
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
  { value: 'ziynet', label: 'Ziynet Altın' },
  { value: 'gram', label: 'Gram Altın' },
];

const DebtsView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    type: 'debt',
    name: '',
    currency: 'tl',
    amount: '',
    quarter: '',
    half: '',
    full: '',
    weight: '',
    fineness: '916',
    date: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await financeApi.getAll();
      setItems(data || []);
    } catch (e) {
      console.error('Error loading finance data:', e);
    } finally {
      setLoading(false);
    }
  };

  const debts = useMemo(() => items.filter(i => i.type === 'debt'), [items]);
  const receivables = useMemo(() => items.filter(i => i.type === 'receivable'), [items]);

  const formatAmount = (item) => {
    const cur = item.currency || 'tl';
    if (cur === 'ziynet') {
      const parts = [];
      if (item.quarter) parts.push(`${item.quarter} Çeyrek`);
      if (item.half) parts.push(`${item.half} Yarım`);
      if (item.full) parts.push(`${item.full} Tam`);
      return parts.length > 0 ? parts.join(', ') : '-';
    }
    if (cur === 'gram') {
      return `${item.weight || 0} gr (${item.fineness || 916} milyem)`;
    }
    if (cur === 'usd') {
      return `$${Number(item.amount || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
    }
    if (cur === 'eur') {
      return `€${Number(item.amount || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.amount || 0);
  };

  const getCurrencyLabel = (cur) => {
    const opt = CURRENCY_OPTIONS.find(o => o.value === cur);
    return opt ? opt.label : 'TL';
  };

  const resetForm = () => {
    setForm({
      type: 'debt',
      name: '',
      currency: 'tl',
      amount: '',
      quarter: '',
      half: '',
      full: '',
      weight: '',
      fineness: '916',
      date: '',
      description: '',
    });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      name: form.name,
      currency: form.currency,
      date: form.date || new Date().toISOString().split('T')[0],
      description: form.description,
    };

    if (form.currency === 'ziynet') {
      payload.quarter = Number(form.quarter) || 0;
      payload.half = Number(form.half) || 0;
      payload.full = Number(form.full) || 0;
    } else if (form.currency === 'gram') {
      payload.weight = Number(String(form.weight).replace(',', '.')) || 0;
      payload.fineness = Number(form.fineness) || 916;
    } else {
      payload.amount = Number(String(form.amount).replace(',', '.')) || 0;
    }

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
      type: item.type || 'debt',
      name: item.name || '',
      currency: item.currency || 'tl',
      amount: item.amount || '',
      quarter: item.quarter || '',
      half: item.half || '',
      full: item.full || '',
      weight: item.weight || '',
      fineness: item.fineness || '916',
      date: item.date || '',
      description: item.description || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const renderAmountInputs = () => {
    if (form.currency === 'ziynet') {
      return (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Çeyrek</label>
            <input
              type="number"
              min="0"
              value={form.quarter}
              onChange={(e) => setForm({ ...form, quarter: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Yarım</label>
            <input
              type="number"
              min="0"
              value={form.half}
              onChange={(e) => setForm({ ...form, half: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Tam</label>
            <input
              type="number"
              min="0"
              value={form.full}
              onChange={(e) => setForm({ ...form, full: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              placeholder="0"
            />
          </div>
        </div>
      );
    }

    if (form.currency === 'gram') {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Gram</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Milyem</label>
            <input
              type="number"
              min="0"
              max="999"
              value={form.fineness}
              onChange={(e) => setForm({ ...form, fineness: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              placeholder="916"
            />
          </div>
        </div>
      );
    }

    const label = form.currency === 'usd' ? 'Tutar (USD)' : form.currency === 'eur' ? 'Tutar (EUR)' : 'Tutar (TL)';
    return (
      <div>
        <label className="block text-xs text-text-secondary-dark mb-1">{label}</label>
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
    );
  };

  const renderTable = (data, title, colorClass) => (
    <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
      <div className="p-4 border-b border-border-dark">
        <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-dark text-text-secondary-dark">
            <tr>
              <th className="text-left p-3">Kişi/Firma</th>
              <th className="text-center p-3">Birim</th>
              <th className="text-right p-3">Tutar/Miktar</th>
              <th className="text-center p-3">Tarih</th>
              <th className="text-left p-3">Açıklama</th>
              <th className="text-center p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-text-secondary-dark">Kayıt yok</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-t border-border-dark hover:bg-background-dark/50">
                  <td className="p-3 text-text-primary-dark">{item.name}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded text-xs bg-background-dark text-text-secondary-dark">
                      {getCurrencyLabel(item.currency)}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-text-primary-dark">{formatAmount(item)}</td>
                  <td className="p-3 text-center text-text-secondary-dark">{item.date}</td>
                  <td className="p-3 text-text-secondary-dark">{item.description || '-'}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 mr-2">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">
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
  );

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
          <h1 className="text-3xl font-bold text-text-primary-dark">Borçlar & Alacaklar</h1>
          <p className="text-text-secondary-dark">Finansal takip</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-background-dark font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Kayıt
        </button>
      </header>

      {showForm && (
        <div className="bg-surface-dark p-6 rounded-xl border border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
            {editItem ? 'Kaydı Düzenle' : 'Yeni Kayıt'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-text-secondary-dark mb-1">Tür</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                >
                  <option value="debt">Borç</option>
                  <option value="receivable">Alacak</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary-dark mb-1">Kişi/Firma</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary-dark mb-1">Para Birimi</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                >
                  {CURRENCY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {renderAmountInputs()}
              </div>
              <div>
                <label className="block text-xs text-text-secondary-dark mb-1">Açıklama</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                />
              </div>
            </div>

            <div className="flex gap-2">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {renderTable(debts, 'Borçlar', 'text-red-400')}
        {renderTable(receivables, 'Alacaklar', 'text-green-400')}
      </div>
    </div>
  );
};

export default DebtsView;
