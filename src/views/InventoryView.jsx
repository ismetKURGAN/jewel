import React, { useEffect, useMemo, useState } from 'react';
import CashRegister from '../components/CashRegister';
import GoldInventory from '../components/GoldInventory';
import { api } from '../services/api';
import { marketApi } from '../services/marketApi';

const CACHE_KEY = 'goldPriceCache';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 saat (günde 4 kez)

const InventoryView = () => {
  const [cash, setCash] = useState({ tl: 0, usd: 0, eur: 0 });
  const [goldCounts, setGoldCounts] = useState({ quarter: 0, half: 0, full: 0 });
  const [gramItems, setGramItems] = useState([]);
  const [goldPrice, setGoldPrice] = useState(null);
  const [priceLastUpdate, setPriceLastUpdate] = useState(null);

  const ZIYNET_FINENESS = 916;
  const ZIYNET_WEIGHTS = {
    quarter: 1.75,
    half: 3.5,
    full: 7.0,
  };

  useEffect(() => {
    loadData();
    loadGoldPrice();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [cashData, goldData, gramData] = await Promise.all([
        api.getCash(),
        api.getGold(),
        api.getGramItems(),
      ]);
      setCash(cashData || { tl: 0, usd: 0, eur: 0 });
      setGoldCounts(goldData || { quarter: 0, half: 0, full: 0 });
      setGramItems(Array.isArray(gramData) ? gramData : []);
    } catch (e) {
      console.error('Error loading inventory data:', e);
    }
  };

  const loadGoldPrice = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { price, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_DURATION && price) {
          setGoldPrice(price);
          setPriceLastUpdate(new Date(timestamp));
          return;
        }
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }

    fetchGoldPrice();
  };

  const fetchGoldPrice = () => {
    const socket = marketApi.connectHaremSocket(
      (data) => {
        if (data && data.ALTIN && data.ALTIN.satis) {
          const price = parseFloat(data.ALTIN.satis);
          if (!isNaN(price)) {
            setGoldPrice(price);
            setPriceLastUpdate(new Date());
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify({
                price,
                timestamp: Date.now()
              }));
            } catch (e) {
              console.error('Error saving cache:', e);
            }
            socket.close();
          }
        }
      },
      (err) => {
        console.error('Error fetching gold price:', err);
      }
    );

    setTimeout(() => {
      socket.close();
    }, 10000);
  };

  const gramSummary = useMemo(() => {
    const totalWeight = gramItems.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
    const totalHas24k = gramItems.reduce(
      (acc, curr) => acc + ((Number(curr.weight) || 0) * ((Number(curr.fineness) || 0) / 1000)),
      0
    );
    return { totalWeight, totalHas24k, count: gramItems.length };
  }, [gramItems]);

  const ziynetRows = useMemo(() => {
    return [
      { key: 'quarter', label: 'Çeyrek', qty: Number(goldCounts?.quarter) || 0, weight: ZIYNET_WEIGHTS.quarter },
      { key: 'half', label: 'Yarım', qty: Number(goldCounts?.half) || 0, weight: ZIYNET_WEIGHTS.half },
      { key: 'full', label: 'Tam', qty: Number(goldCounts?.full) || 0, weight: ZIYNET_WEIGHTS.full },
    ].map((r) => {
      const totalWeight = r.qty * r.weight;
      const has24k = totalWeight * (ZIYNET_FINENESS / 1000);
      return {
        ...r,
        fineness: ZIYNET_FINENESS,
        totalWeight,
        has24k,
      };
    });
  }, [goldCounts]);

  const totals = useMemo(() => {
    const ziynetTotalWeight = ziynetRows.reduce((acc, r) => acc + r.totalWeight, 0);
    const ziynetHas24k = ziynetRows.reduce((acc, r) => acc + r.has24k, 0);
    const grandHas24k = ziynetHas24k + gramSummary.totalHas24k;
    return { ziynetTotalWeight, ziynetHas24k, grandHas24k };
  }, [ziynetRows, gramSummary.totalHas24k]);

  const estimatedValue = useMemo(() => {
    if (!goldPrice || !totals.grandHas24k) return null;
    return totals.grandHas24k * goldPrice;
  }, [goldPrice, totals.grandHas24k]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      maximumFractionDigits: 0 
    }).format(val || 0);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="p-6 border-b border-border-dark">
        <h1 className="text-3xl font-bold text-text-primary-dark">Envanter</h1>
        <p className="text-text-secondary-dark">Ziynet, Gram ve Kasa Özeti</p>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Toplam Değer Kartı */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-text-secondary-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">diamond</span>
                Toplam Altın Değeri
              </h2>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-yellow-400">{totals.grandHas24k.toFixed(2)}</span>
                <span className="text-xl text-text-secondary-dark">gr has (24K)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary-dark">Güncel Tahmini Değer</p>
              {estimatedValue ? (
                <p className="text-3xl font-bold text-green-400">{formatCurrency(estimatedValue)}</p>
              ) : (
                <p className="text-xl text-text-secondary-dark">Hesaplanıyor...</p>
              )}
              {goldPrice && (
                <p className="text-xs text-text-secondary-dark mt-1">
                  Gram Altın: {goldPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  {priceLastUpdate && (
                    <span className="ml-2">
                      ({priceLastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CashRegister />
          <GoldInventory />
          <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
            <h2 className="text-xl font-bold text-text-primary-dark mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400">scale</span>
              Gram Altın Özeti
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg border border-border-dark">
                <span className="text-sm text-text-secondary-dark">Kayıt</span>
                <span className="font-mono font-bold text-text-primary-dark">{gramSummary.count}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg border border-border-dark">
                <span className="text-sm text-text-secondary-dark">Toplam Gram</span>
                <span className="font-mono font-bold text-text-primary-dark">{gramSummary.totalWeight.toFixed(2)} gr</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg border border-border-dark">
                <span className="text-sm text-text-secondary-dark">Toplam Has (24K)</span>
                <span className="font-mono font-bold text-yellow-400">{gramSummary.totalHas24k.toFixed(2)} gr</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
          <h2 className="text-xl font-bold text-text-primary-dark mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">inventory_2</span>
            Envanter Detayı
          </h2>

          <div className="overflow-x-auto rounded-lg border border-border-dark bg-background-dark">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-surface-dark text-text-secondary-dark text-xs">
                <tr>
                  <th className="px-4 py-3">Tür</th>
                  <th className="px-4 py-3">Adet</th>
                  <th className="px-4 py-3">Ağırlık (gr)</th>
                  <th className="px-4 py-3">Milyem</th>
                  <th className="px-4 py-3">Toplam Ağırlık (gr)</th>
                  <th className="px-4 py-3">Has (24K) (gr)</th>
                  <th className="px-4 py-3">Tip</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {ziynetRows.map((r) => (
                  <tr key={r.key} className="border-t border-border-dark/60">
                    <td className="px-4 py-3 text-text-primary-dark font-medium">{r.label}</td>
                    <td className="px-4 py-3 text-text-primary-dark font-mono">{r.qty}</td>
                    <td className="px-4 py-3 text-text-secondary-dark font-mono">{r.weight.toFixed(2)}</td>
                    <td className="px-4 py-3 text-text-secondary-dark font-mono">{r.fineness}</td>
                    <td className="px-4 py-3 text-text-primary-dark font-mono">{r.totalWeight.toFixed(2)}</td>
                    <td className="px-4 py-3 text-yellow-400 font-mono">{r.has24k.toFixed(2)}</td>
                    <td className="px-4 py-3 text-text-secondary-dark">Ziynet</td>
                  </tr>
                ))}

                {gramItems.map((item) => {
                  const weight = Number(item.weight) || 0;
                  const fineness = Number(item.fineness) || 0;
                  const has24k = weight * (fineness / 1000);
                  const id = item.id ?? `${item.date ?? ''}-${weight}-${fineness}`;

                  return (
                    <tr key={id} className="border-t border-border-dark/60">
                      <td className="px-4 py-3 text-text-primary-dark font-medium">Gram</td>
                      <td className="px-4 py-3 text-text-primary-dark font-mono">1</td>
                      <td className="px-4 py-3 text-text-secondary-dark font-mono">{weight.toFixed(2)}</td>
                      <td className="px-4 py-3 text-text-secondary-dark font-mono">{fineness}</td>
                      <td className="px-4 py-3 text-text-primary-dark font-mono">{weight.toFixed(2)}</td>
                      <td className="px-4 py-3 text-yellow-400 font-mono">{has24k.toFixed(2)}</td>
                      <td className="px-4 py-3 text-text-secondary-dark">Gram</td>
                    </tr>
                  );
                })}

                {([
                  { key: 'tl', label: 'TL', value: Number(cash?.tl) || 0 },
                  { key: 'usd', label: 'USD', value: Number(cash?.usd) || 0 },
                  { key: 'eur', label: 'EUR', value: Number(cash?.eur) || 0 },
                ]).map((c) => (
                  <tr key={c.key} className="border-t border-border-dark/60">
                    <td className="px-4 py-3 text-text-primary-dark font-medium">{c.label}</td>
                    <td className="px-4 py-3 text-text-primary-dark font-mono">{c.value.toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-text-secondary-dark font-mono">-</td>
                    <td className="px-4 py-3 text-text-secondary-dark font-mono">-</td>
                    <td className="px-4 py-3 text-text-primary-dark font-mono">-</td>
                    <td className="px-4 py-3 text-text-secondary-dark font-mono">-</td>
                    <td className="px-4 py-3 text-text-secondary-dark">Kasa</td>
                  </tr>
                ))}

                {ziynetRows.every(r => r.qty === 0) && gramItems.length === 0 && (
                  <tr className="border-t border-border-dark/60">
                    <td colSpan="7" className="px-4 py-6 text-center text-text-secondary-dark">Henüz envanter kaydı yok.</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t border-border-dark bg-surface-dark/40">
                <tr>
                  <td className="px-4 py-3 text-text-secondary-dark text-xs" colSpan="4">Toplam</td>
                  <td className="px-4 py-3 text-text-primary-dark font-mono text-sm">{(totals.ziynetTotalWeight + gramSummary.totalWeight).toFixed(2)}</td>
                  <td className="px-4 py-3 text-yellow-400 font-mono text-sm">{totals.grandHas24k.toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InventoryView;
