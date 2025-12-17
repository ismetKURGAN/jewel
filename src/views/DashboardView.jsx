import React, { useState, useEffect } from 'react';
import GoldEntryForm from '../components/GoldEntryForm';
import GramGoldSection from '../components/GramGoldSection';
import MarketStatus from '../components/MarketStatus';
import CashInOut from '../components/CashInOut';
import { api } from '../services/api';

const DashboardView = () => {
  const [goldCounts, setGoldCounts] = useState({ quarter: 0, half: 0, full: 0 });
  const [gramItems, setGramItems] = useState([]);

  const ZIYNET_WEIGHTS = { quarter: 1.75, half: 3.50, full: 7.00 };
  const ZIYNET_FINENESS = 0.916;

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [goldData, gramData] = await Promise.all([
        api.getGold(),
        api.getGramItems()
      ]);
      setGoldCounts(goldData);
      setGramItems(gramData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const totalZiynetWeight24k = goldCounts ? (
    ((goldCounts.quarter || 0) * ZIYNET_WEIGHTS.quarter * ZIYNET_FINENESS) +
    ((goldCounts.half || 0) * ZIYNET_WEIGHTS.half * ZIYNET_FINENESS) +
    ((goldCounts.full || 0) * ZIYNET_WEIGHTS.full * ZIYNET_FINENESS)
  ) : 0;

  const totalGramWeight24k = Array.isArray(gramItems) 
    ? gramItems.reduce((acc, curr) => acc + (curr.weight * (curr.fineness / 1000)), 0)
    : 0;
  
  const grandTotal24k = totalZiynetWeight24k + totalGramWeight24k;

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6 overflow-y-auto">
      <header>
        <h1 className="text-3xl font-bold text-text-primary-dark">Ana Panel</h1>
        <p className="text-text-secondary-dark">Altın Varlık Yönetimi</p>
      </header>

      <MarketStatus />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-dark p-5 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm font-medium">Toplam Has Altın (24K)</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1 font-mono">
            {grandTotal24k.toFixed(2)} <span className="text-sm text-yellow-400/70">gr</span>
          </p>
        </div>
        <div className="bg-surface-dark p-5 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm font-medium">Ziynet Has</p>
          <p className="text-2xl font-bold text-text-primary-dark mt-1 font-mono">
            {totalZiynetWeight24k.toFixed(2)} <span className="text-sm text-text-secondary-dark">gr</span>
          </p>
        </div>
        <div className="bg-surface-dark p-5 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm font-medium">Gram Has</p>
          <p className="text-2xl font-bold text-text-primary-dark mt-1 font-mono">
            {totalGramWeight24k.toFixed(2)} <span className="text-sm text-text-secondary-dark">gr</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <GoldEntryForm />
        </div>
        <div className="xl:col-span-1">
          <GramGoldSection />
        </div>
        <div className="xl:col-span-1">
          <CashInOut />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
