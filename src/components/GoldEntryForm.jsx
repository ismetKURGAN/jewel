import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const GoldSection = ({ mode, title, totals, amounts, onUpdate, onTransaction }) => {
  const isBuy = mode === 'buy';
  
  // Theme configurations: Sell=Green, Buy=Blue
  const borderColor = isBuy ? 'border-blue-500/50' : 'border-green-500/50';
  const titleColor = isBuy ? 'text-blue-400' : 'text-green-400';
  const symbolBg = isBuy 
    ? 'bg-blue-400/10 border-blue-400/30 text-blue-400' 
    : 'bg-green-400/10 border-green-400/30 text-green-400';
    
  const btnColor = isBuy 
    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
    : 'bg-green-600 hover:bg-green-500 text-white';
    
  const iconName = isBuy ? 'add_circle' : 'remove_circle';
  const sign = isBuy ? '+' : '-';
  const actionText = isBuy ? 'Ekle' : 'Sat';

  const renderInput = (type, label, symbol) => {
    const handleIncrement = () => {
      const currentVal = parseInt(amounts[type]) || 0;
      onUpdate(type, (currentVal + 1).toString());
    };

    const handleDecrement = () => {
      const currentVal = parseInt(amounts[type]) || 0;
      if (currentVal > 0) {
        onUpdate(type, (currentVal - 1).toString());
      }
    };

    return (
      <div className="flex flex-col gap-1.5" key={type}>
        <label className="text-xs font-medium text-text-secondary-dark uppercase tracking-wider pl-1">{label}</label>
        <div className="bg-background-dark rounded-lg p-2 border border-border-dark flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {/* Symbol */}
            <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${symbolBg}`}>
              {symbol}
            </div>
            
            {/* Stepper Input */}
            <div className="flex flex-1 items-center bg-surface-dark rounded-lg border border-border-dark h-9 overflow-hidden">
              <button 
                onClick={handleDecrement}
                className="w-7 h-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 text-text-secondary-dark transition-colors border-r border-border-dark"
                type="button"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <input
                type="number"
                value={amounts[type]}
                onChange={(e) => onUpdate(type, e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-text-primary-dark font-bold text-base text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                min="0"
              />
              <button 
                onClick={handleIncrement}
                className="w-7 h-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 text-text-primary-dark transition-colors border-l border-border-dark"
                type="button"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          </div>
          
          {/* Action Button */}
          {parseInt(amounts[type]) > 0 && (
            <button
              onClick={() => onTransaction(type)}
              className={`w-full font-bold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200 ${btnColor}`}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">{iconName}</span>
              {actionText} ({sign}{amounts[type]})
            </button>
          )}

          {/* Total Display */}
          <div className="flex justify-between items-center pt-1.5 border-t border-border-dark/50">
            <span className="text-[10px] uppercase font-medium text-text-secondary-dark">Stok</span>
            <span className="text-xs font-mono font-bold text-text-primary-dark bg-surface-dark px-1.5 py-0.5 rounded border border-border-dark min-w-[30px] text-center">
              {totals[type]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-surface-dark rounded-xl p-6 border ${borderColor}`}>
      <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${titleColor}`}>
        <span className="material-symbols-outlined">monetization_on</span>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3 gap-4">
        {renderInput('quarter', 'Çeyrek', 'Ç')}
        {renderInput('half', 'Yarım', 'Y')}
        {renderInput('full', 'Tam', 'T')}
      </div>
    </div>
  );
};

const GoldEntryForm = () => {
  const [totals, setTotals] = useState({ quarter: 0, half: 0, full: 0 });
  const [buyAmounts, setBuyAmounts] = useState({ quarter: '', half: '', full: '' });
  const [sellAmounts, setSellAmounts] = useState({ quarter: '', half: '', full: '' });

  useEffect(() => {
    loadGold();
  }, []);

  const loadGold = async () => {
    try {
      const data = await api.getGold();
      setTotals(data);
    } catch (error) {
      console.error('Error loading gold:', error);
    }
  };

  const handleTransaction = async (type, mode) => {
    const isBuy = mode === 'buy';
    const amounts = isBuy ? buyAmounts : sellAmounts;
    const amount = parseInt(amounts[type]) || 0;
    
    if (amount <= 0) return;

    let newTotal;
    if (isBuy) {
      newTotal = totals[type] + amount;
    } else {
      if (amount > totals[type]) {
        alert(`Yetersiz stok! Mevcut: ${totals[type]}`);
        return;
      }
      newTotal = totals[type] - amount;
    }

    const newCounts = { ...totals, [type]: newTotal };

    try {
      await api.updateGold(newCounts);
      setTotals(newCounts);
      if (isBuy) {
        setBuyAmounts(prev => ({ ...prev, [type]: '' }));
      } else {
        setSellAmounts(prev => ({ ...prev, [type]: '' }));
      }
    } catch (error) {
      console.error('Error updating gold:', error);
    }
  };

  const updateAmount = (mode, type, value) => {
    if (mode === 'buy') {
      setBuyAmounts(prev => ({ ...prev, [type]: value }));
    } else {
      setSellAmounts(prev => ({ ...prev, [type]: value }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sell Section (Top, Green) */}
      <GoldSection 
        mode="sell" 
        title="Ziynet Satış" 
        totals={totals}
        amounts={sellAmounts}
        onUpdate={(type, val) => updateAmount('sell', type, val)}
        onTransaction={(type) => handleTransaction(type, 'sell')}
      />
      
      {/* Buy Section (Bottom, Blue) */}
      <GoldSection 
        mode="buy" 
        title="Ziynet Alış" 
        totals={totals}
        amounts={buyAmounts}
        onUpdate={(type, val) => updateAmount('buy', type, val)}
        onTransaction={(type) => handleTransaction(type, 'buy')}
      />
    </div>
  );
};

export default GoldEntryForm;
