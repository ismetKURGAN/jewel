import React, { useState, useEffect, useRef } from 'react';
import { marketApi } from '../services/marketApi';

const SOURCES = {
  truncgil: { id: 'truncgil', label: 'Truncgil', color: 'blue' },
  harem: { id: 'harem', label: 'Harem Altın', color: 'yellow' },
};

const MarketStatus = () => {
  const [source, setSource] = useState('truncgil');
  const [rates, setRates] = useState(null);
  const [haremRates, setHaremRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const socketRef = useRef(null);

  const fetchTruncgilRates = async () => {
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
    if (source === 'truncgil') {
      fetchTruncgilRates();
      const interval = setInterval(fetchTruncgilRates, 60000);
      return () => clearInterval(interval);
    }
  }, [source]);

  useEffect(() => {
    if (source === 'harem') {
      setLoading(true);
      setError(null);
      
      socketRef.current = marketApi.connectHaremSocket(
        (data) => {
          if (data && typeof data === 'object') {
            setHaremRates(prev => ({ ...prev, ...data }));
            setLastUpdate(new Date());
            setError(null);
            setLoading(false);
          }
        },
        (err) => {
          setError('Harem Altın bağlantı hatası');
          setLoading(false);
        }
      );

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [source]);

  const handleSourceChange = (newSource) => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setHaremRates({});
    setRates(null);
    setSource(newSource);
    setShowSourceMenu(false);
    setLoading(true);
    setError(null);
  };

  const truncgilItems = [
    { key: 'gram-altin', label: 'Gram Altın', icon: 'grade' },
    { key: 'ceyrek-altin', label: 'Çeyrek Altın', icon: 'monetization_on' },
    { key: 'USD', label: 'Dolar', icon: 'attach_money' },
    { key: 'EUR', label: 'Euro', icon: 'euro' },
    { key: 'ons', label: 'Ons Altın', icon: 'token' },
  ];

  const haremItems = [
    { key: 'ALTIN', label: 'Gram Altın', icon: 'grade' },
    { key: 'CEYREK_YENI', label: 'Çeyrek', icon: 'monetization_on' },
    { key: 'YARIM_YENI', label: 'Yarım', icon: 'monetization_on' },
    { key: 'TEK_YENI', label: 'Tam', icon: 'monetization_on' },
    { key: 'USDTRY', label: 'Dolar', icon: 'attach_money' },
    { key: 'EURTRY', label: 'Euro', icon: 'euro' },
    { key: 'ONS', label: 'Ons', icon: 'token' },
  ];

  const renderTruncgilData = () => {
    if (!rates) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {truncgilItems.map(item => {
          const rateData = rates[item.key] || rates[item.label];
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
    );
  };

  const formatHaremPrice = (val) => {
    if (!val) return '---';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderHaremData = () => {
    if (Object.keys(haremRates).length === 0) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {haremItems.map(item => {
          const rateData = haremRates[item.key];
          const buyPrice = rateData?.alis ? formatHaremPrice(rateData.alis) : '---';
          const sellPrice = rateData?.satis ? formatHaremPrice(rateData.satis) : '---';
          const dir = rateData?.dir;
          const alisDir = dir?.alis_dir;
          const satisDir = dir?.satis_dir;
          const changeColor = satisDir === 'up' ? 'text-green-400' : satisDir === 'down' ? 'text-red-400' : 'text-text-secondary-dark';

          return (
            <div key={item.key} className="bg-background-dark p-3 rounded-lg border border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg text-text-secondary-dark">{item.icon}</span>
                <span className="text-xs font-medium text-text-secondary-dark truncate">{item.label}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-text-primary-dark">{sellPrice}</span>
                  {satisDir && (
                    <span className={`material-symbols-outlined text-sm ${changeColor}`}>
                      {satisDir === 'up' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-text-secondary-dark">
                  <span>Alış: {buyPrice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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

  const currentSource = SOURCES[source];
  const sourceColorClass = source === 'harem' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400';

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">trending_up</span>
          Canlı Piyasa
          <span className={`text-xs px-2 py-1 rounded-full ${sourceColorClass}`}>
            {currentSource.label}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-text-secondary-dark">
              Son: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setShowSourceMenu(!showSourceMenu)}
              className="flex items-center gap-1 px-3 py-1.5 bg-background-dark border border-border-dark rounded-lg text-sm text-text-primary-dark hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              Kaynak
            </button>
            {showSourceMenu && (
              <div className="absolute right-0 top-full mt-1 bg-surface-dark border border-border-dark rounded-lg shadow-xl z-50 min-w-[150px]">
                {Object.values(SOURCES).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSourceChange(s.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                      source === s.id ? 'text-primary' : 'text-text-primary-dark'
                    }`}
                  >
                    {source === s.id && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                    <span className={source === s.id ? '' : 'ml-6'}>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 mb-4">{error}</div>
      )}

      {source === 'truncgil' && renderTruncgilData()}
      {source === 'harem' && renderHaremData()}

      {source === 'truncgil' && !rates && !error && (
        <div className="text-sm text-text-secondary-dark">Piyasa verisi yükleniyor...</div>
      )}
      {source === 'harem' && Object.keys(haremRates).length === 0 && !error && (
        <div className="text-sm text-text-secondary-dark">Harem Altın verisi bekleniyor...</div>
      )}
    </div>
  );
};

export default MarketStatus;
