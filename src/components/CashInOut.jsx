import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const CashInOut = () => {
  const [cash, setCash] = useState({ tl: 0, usd: 0, eur: 0 });
  const [currency, setCurrency] = useState('tl');
  const [direction, setDirection] = useState('in');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCash();
  }, []);

  const loadCash = async () => {
    try {
      const data = await api.getCash();
      setCash(data || { tl: 0, usd: 0, eur: 0 });
    } catch (e) {
      console.error('Error loading cash:', e);
    }
  };

  const formatterTL = useMemo(() => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
  }, []);

  const formatValue = (key, value) => {
    if (key === 'tl') return formatterTL.format(value || 0);
    return `${Number(value || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${key.toUpperCase()}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const parsed = Number(String(amount).replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    const delta = direction === 'in' ? parsed : -parsed;
    const newValue = (Number(cash?.[currency]) || 0) + delta;
    const newCash = {
      ...cash,
      [currency]: newValue,
    };

    setSaving(true);
    try {
      await api.updateCash(newCash);
      setCash(newCash);
      setAmount('');
    } catch (err) {
      console.error('Error updating cash:', err);
      alert('Kasa güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-dark p-6 rounded-xl border border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-secondary-dark font-medium">Nakit Giriş / Çıkış</p>
        <span className="material-symbols-outlined text-green-400">swap_horiz</span>
      </div>

      <div className="space-y-2 mb-4 text-xs text-text-secondary-dark">
        <div className="flex justify-between">
          <span>TL</span>
          <span className="font-mono text-text-primary-dark">{formatValue('tl', cash.tl)}</span>
        </div>
        <div className="flex justify-between">
          <span>USD</span>
          <span className="font-mono text-text-primary-dark">{formatValue('usd', cash.usd)}</span>
        </div>
        <div className="flex justify-between">
          <span>EUR</span>
          <span className="font-mono text-text-primary-dark">{formatValue('eur', cash.eur)}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Para Birimi</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark focus:outline-none"
            >
              <option value="tl">TL</option>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">İşlem</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark focus:outline-none"
            >
              <option value="in">Giriş (+)</option>
              <option value="out">Çıkış (-)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-secondary-dark mb-1">Tutar</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark focus:outline-none"
            placeholder="0"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-background-dark font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default CashInOut;
