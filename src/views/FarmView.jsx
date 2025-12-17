import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FarmView = () => {
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, debtsData] = await Promise.all([
        api.getFarmExpenses(),
        api.getFarmDebts()
      ]);
      setExpenses(expensesData);
      setDebts(debtsData);
    } catch (error) {
      console.error('Error loading farm data:', error);
    }
  };

  const handleAddExpense = async () => {
    const type = prompt('Gider Tipi (Örn: Yem):');
    if (!type) return;
    const amountStr = prompt('Tutar:');
    if (!amountStr) return;
    const description = prompt('Açıklama:');
    
    const newExpense = {
       type,
       amount: parseFloat(amountStr),
       description: description || '',
       date: new Date().toISOString().split('T')[0]
    };

    try {
       const added = await api.addFarmExpense(newExpense);
       setExpenses([...expenses, added]);
    } catch(e) { console.error(e); }
  };

  const handleAddDebt = async () => {
     const creditor = prompt('Alacaklı Adı:');
     if (!creditor) return;
     const amountStr = prompt('Tutar:');
     if (!amountStr) return;
     const dueDate = prompt('Vade Tarihi (YYYY-AA-GG):');

     const newDebt = {
       creditor,
       amount: parseFloat(amountStr),
       dueDate: dueDate || new Date().toISOString().split('T')[0],
       status: 'pending'
     };

     try {
       const added = await api.addFarmDebt(newDebt);
       setDebts([...debts, added]);
     } catch(e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6 overflow-y-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-dark">Çiftlik Yönetimi</h1>
          <p className="text-text-secondary-dark">Giderler ve Borç Takibi</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses Card */}
        <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">trending_down</span>
              Giderler
            </h2>
            <button 
              onClick={handleAddExpense}
              className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20 transition-colors"
            >
              + Gider Ekle
            </button>
          </div>
          <div className="space-y-3">
            {expenses.map(expense => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-background-dark rounded-lg border border-border-dark">
                <div>
                  <p className="font-medium text-text-primary-dark">{expense.type}</p>
                  <p className="text-xs text-text-secondary-dark">{expense.date} - {expense.description}</p>
                </div>
                <p className="font-bold text-red-400">-{expense.amount.toLocaleString('tr-TR')} ₺</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-border-dark flex justify-between items-center">
              <span className="text-text-secondary-dark">Toplam Gider</span>
              <span className="text-xl font-bold text-red-500">
                {expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
        </div>

        {/* Debts Card */}
        <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400">account_balance_wallet</span>
              Borçlar
            </h2>
            <button 
              onClick={handleAddDebt}
              className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20 transition-colors"
            >
              + Borç Ekle
            </button>
          </div>
          <div className="space-y-3">
            {debts.map(debt => (
              <div key={debt.id} className="flex justify-between items-center p-3 bg-background-dark rounded-lg border border-border-dark">
                <div>
                  <p className="font-medium text-text-primary-dark">{debt.creditor}</p>
                  <p className="text-xs text-text-secondary-dark">Vade: {debt.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-400">{debt.amount.toLocaleString('tr-TR')} ₺</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-400/10 text-orange-400">Bekliyor</span>
                </div>
              </div>
            ))}
             <div className="mt-4 pt-4 border-t border-border-dark flex justify-between items-center">
              <span className="text-text-secondary-dark">Toplam Borç</span>
              <span className="text-xl font-bold text-orange-500">
                {debts.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmView;
