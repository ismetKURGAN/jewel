import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const GoldInventory = () => {
  const [counts, setCounts] = useState({
    quarter: 0,
    half: 0,
    full: 0
  });

  useEffect(() => {
    loadGold();
  }, []);

  const loadGold = async () => {
    try {
      const data = await api.getGold();
      setCounts(data);
    } catch (error) {
      console.error('Error loading gold inventory:', error);
    }
  };

  const handleChange = async (type, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    const newCounts = { ...counts, [type]: newValue };
    setCounts(newCounts); // Optimistic update

    try {
      await api.updateGold(newCounts);
    } catch (error) {
      console.error('Error updating gold inventory:', error);
    }
  };

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
      <h2 className="text-xl font-bold text-text-primary-dark mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-yellow-400">monetization_on</span>
        Ziynet Altın Stok
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary-dark">Çeyrek</label>
          <div className="flex items-center gap-2 bg-background-dark rounded-lg p-2 border border-border-dark">
            <div className="size-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs border border-yellow-400/50">
              Ç
            </div>
            <input
              type="number"
              value={counts.quarter}
              onChange={(e) => handleChange('quarter', e.target.value)}
              className="w-full bg-transparent text-text-primary-dark font-bold text-lg focus:outline-none text-right"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary-dark">Yarım</label>
          <div className="flex items-center gap-2 bg-background-dark rounded-lg p-2 border border-border-dark">
            <div className="size-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs border border-yellow-400/50">
              Y
            </div>
            <input
              type="number"
              value={counts.half}
              onChange={(e) => handleChange('half', e.target.value)}
              className="w-full bg-transparent text-text-primary-dark font-bold text-lg focus:outline-none text-right"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary-dark">Tam</label>
          <div className="flex items-center gap-2 bg-background-dark rounded-lg p-2 border border-border-dark">
            <div className="size-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs border border-yellow-400/50">
              T
            </div>
            <input
              type="number"
              value={counts.full}
              onChange={(e) => handleChange('full', e.target.value)}
              className="w-full bg-transparent text-text-primary-dark font-bold text-lg focus:outline-none text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldInventory;
