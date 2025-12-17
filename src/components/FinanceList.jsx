import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FinanceList = ({ title, type }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadFinance();
  }, []);

  const loadFinance = async () => {
    try {
      const data = await api.getFinance();
      // Filter by type (receivable or debt)
      setItems(data.filter(item => item.type === type));
    } catch (error) {
      console.error('Error loading finance data:', error);
    }
  };

  const handleAdd = async () => {
    const name = prompt('İsim giriniz:');
    if (!name) return;
    const amountStr = prompt('Tutar giriniz:');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    const newItem = {
      type,
      name,
      amount,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const addedItem = await api.addFinance(newItem);
      setItems([...items, addedItem]);
    } catch (error) {
      console.error('Error adding finance item:', error);
    }
  };

  const total = items.reduce((acc, curr) => acc + curr.amount, 0);
  const colorClass = type === 'receivable' ? 'text-green-400' : 'text-red-400';
  const icon = type === 'receivable' ? 'arrow_downward' : 'arrow_upward';

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${colorClass === 'text-green-400' ? 'text-text-primary-dark' : 'text-text-primary-dark'}`}>
          <span className={`material-symbols-outlined ${colorClass}`}>{icon}</span>
          {title}
        </h2>
        <button 
          onClick={handleAdd}
          className={`text-sm bg-surface-dark border border-border-dark hover:bg-white/5 px-3 py-1 rounded-lg transition-colors text-text-secondary-dark`}
        >
          + Ekle
        </button>
      </div>
      
      <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors border-b border-border-dark/50 last:border-0">
            <div>
              <p className="font-medium text-text-primary-dark text-sm">{item.name}</p>
              <p className="text-xs text-text-secondary-dark">{item.date}</p>
            </div>
            <span className={`font-mono font-bold ${colorClass}`}>
              {item.amount.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border-dark flex justify-between items-center">
        <span className="text-sm font-medium text-text-secondary-dark">Toplam</span>
        <span className={`text-lg font-bold font-mono ${colorClass}`}>
          {total.toLocaleString('tr-TR')} ₺
        </span>
      </div>
    </div>
  );
};

export default FinanceList;
