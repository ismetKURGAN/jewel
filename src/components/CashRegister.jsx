import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CashRegister = () => {
  const [cash, setCash] = useState({
    tl: 0,
    usd: 0,
    eur: 0
  });

  useEffect(() => {
    loadCash();
  }, []);

  const loadCash = async () => {
    try {
      const data = await api.getCash();
      setCash(data);
    } catch (error) {
      console.error('Error loading cash:', error);
    }
  };

  const handleChange = async (currency, value) => {
    const newValue = parseFloat(value) || 0;
    const newCash = { ...cash, [currency]: newValue };
    setCash(newCash); // Optimistic update
    
    try {
      await api.updateCash(newCash);
    } catch (error) {
      console.error('Error updating cash:', error);
      // Revert on error could be implemented here
    }
  };

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
      <h2 className="text-xl font-bold text-text-primary-dark mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-green-400">payments</span>
        Kasa Durumu
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg border border-border-dark">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">₺</div>
            <span className="font-medium text-text-secondary-dark">Türk Lirası</span>
          </div>
          <input
            type="number"
            value={cash.tl}
            onChange={(e) => handleChange('tl', e.target.value)}
            className="bg-transparent text-text-primary-dark font-mono font-bold text-xl focus:outline-none text-right w-40"
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg border border-border-dark">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center font-bold">$</div>
            <span className="font-medium text-text-secondary-dark">USD</span>
          </div>
          <input
            type="number"
            value={cash.usd}
            onChange={(e) => handleChange('usd', e.target.value)}
            className="bg-transparent text-text-primary-dark font-mono font-bold text-xl focus:outline-none text-right w-40"
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg border border-border-dark">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">€</div>
            <span className="font-medium text-text-secondary-dark">Euro</span>
          </div>
          <input
            type="number"
            value={cash.eur}
            onChange={(e) => handleChange('eur', e.target.value)}
            className="bg-transparent text-text-primary-dark font-mono font-bold text-xl focus:outline-none text-right w-40"
          />
        </div>
      </div>
    </div>
  );
};

export default CashRegister;
