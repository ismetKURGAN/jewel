import React, { useState, useEffect } from 'react';
import { marketApi } from '../services/marketApi';

const MarketStatus = () => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const fetchRates = async () => {
    try {
      const data = await marketApi.getRates();
      if (data) {
        setRates(data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError('Piyasa verisi alınamadı');
      }
    } catch (e) {
      setError(e?.message || 'Piyasa verisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh every 60 seconds
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-dark rounded-xl p-4 border border-border-dark animate-pulse">
        <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!rates) {
    return (
      <div className="bg-surface-dark rounded-xl p-6 border border-border-dark mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-text-primary-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">trending_up</span>
            Canlı Piyasa
          </h2>
          {lastUpdate && (
            <span className="text-xs text-text-secondary-dark">
              Son Güncelleme: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="text-sm text-text-secondary-dark">
          {error || 'Piyasa verisi yükleniyor...'}
        </div>
      </div>
    );
  }

  const items = [
    { key: 'gram-altin', label: 'Gram Altın', icon: 'grade' },
    { key: 'ceyrek-altin', label: 'Çeyrek Altın', icon: 'monetization_on' },
    { key: 'USD', label: 'Dolar', icon: 'attach_money' },
    { key: 'EUR', label: 'Euro', icon: 'euro' },
    { key: 'ons', label: 'Ons Altın', icon: 'token' },
  ];

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">trending_up</span>
          Canlı Piyasa
        </h2>
        {lastUpdate && (
          <span className="text-xs text-text-secondary-dark">
            Son Güncelleme: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map(item => {
          const rateData = rates[item.key] || rates[item.label]; // truncgil keys can vary
          
          // Truncgil usually returns objects like { "Alış": "3.000,00", "Satış": "3.100,00", ... }
          // We need to parse safely
          const buyPrice = rateData?.Alış || '---';
          const sellPrice = rateData?.Satış || '---';
          const change = rateData?.['Değişim'] || '';

          const isUp = change && change.includes('%') && !change.startsWith('-');
          const changeColor = isUp ? 'text-green-400' : (change && change.startsWith('-') ? 'text-red-400' : 'text-text-secondary-dark');

          return (
            <div key={item.key} className="bg-background-dark p-3 rounded-lg border border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg text-text-secondary-dark">{item.icon}</span>
                <span className="text-sm font-medium text-text-secondary-dark">{item.label}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-text-primary-dark">{sellPrice}</span>
                  <span className={`text-xs font-medium ${changeColor}`}>{change}</span>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-text-secondary-dark">
                  <span>Alış: {buyPrice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketStatus;
