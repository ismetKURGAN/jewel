import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api, transactionApi, reportApi, financeApi } from '../services/api';

const ZIYNET_WEIGHTS = { quarter: 1.75, half: 3.50, full: 7.00 };
const ZIYNET_FINENESS = 0.916;

const ReportView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [cash, setCash] = useState({ tl: 0, usd: 0, eur: 0 });
  const [gold, setGold] = useState({ quarter: 0, half: 0, full: 0 });
  const [gramItems, setGramItems] = useState([]);
  const [finance, setFinance] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reportTime, setReportTime] = useState(null);
  const [form, setForm] = useState({
    type: 'cash_in',
    currency: 'tl',
    amount: '',
    goldType: 'quarter',
    goldCount: '',
    gramWeight: '',
    gramFineness: '916',
    description: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
    checkAutoReport();
    const interval = setInterval(checkAutoReport, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const checkAutoReport = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours === 20 && minutes === 0) {
      setReportTime(now.toLocaleTimeString('tr-TR'));
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [txData, cashData, goldData, gramData, financeData, reportsData] = await Promise.all([
        transactionApi.getAll(),
        api.getCash(),
        api.getGold(),
        api.getGramItems(),
        financeApi.getAll(),
        reportApi.getAll(),
      ]);
      
      const dayTx = (txData || []).filter(t => t.date && t.date.startsWith(selectedDate));
      setTransactions(dayTx);
      setCash(cashData || { tl: 0, usd: 0, eur: 0 });
      setGold(goldData || { quarter: 0, half: 0, full: 0 });
      setGramItems(gramData || []);
      setFinance(financeData || []);
      setSavedReports((reportsData || []).sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) {
      console.error('Error loading report data:', e);
    } finally {
      setLoading(false);
    }
  };

  const todayGramItems = useMemo(() => {
    return gramItems.filter(g => g.date && g.date.startsWith(selectedDate));
  }, [gramItems, selectedDate]);

  const cashInTx = useMemo(() => transactions.filter(t => t.type === 'cash_in'), [transactions]);
  const cashOutTx = useMemo(() => transactions.filter(t => t.type === 'cash_out'), [transactions]);
  const goldSaleTx = useMemo(() => transactions.filter(t => t.type === 'gold_sale'), [transactions]);
  const goldBuyTx = useMemo(() => transactions.filter(t => t.type === 'gold_buy'), [transactions]);

  const overdueReceivables = useMemo(() => {
    return finance.filter(f => {
      if (f.type !== 'receivable') return false;
      if (!f.date) return false;
      return f.date <= selectedDate;
    });
  }, [finance, selectedDate]);

  const savedReportForDate = useMemo(() => {
    return savedReports.find(r => r.date === selectedDate);
  }, [savedReports, selectedDate]);

  const formatCurrency = (val, cur = 'tl') => {
    if (cur === 'usd') return `$${Number(val || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
    if (cur === 'eur') return `€${Number(val || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const resetForm = () => {
    setForm({
      type: 'cash_in',
      currency: 'tl',
      amount: '',
      goldType: 'quarter',
      goldCount: '',
      gramWeight: '',
      gramFineness: '916',
      description: '',
    });
    setShowAddForm(false);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const tx = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: form.type,
      description: form.description,
    };

    if (form.type === 'cash_in' || form.type === 'cash_out') {
      tx.currency = form.currency;
      tx.amount = Number(String(form.amount).replace(',', '.')) || 0;
    } else if (form.type === 'gold_sale' || form.type === 'gold_buy') {
      tx.goldType = form.goldType;
      tx.goldCount = Number(form.goldCount) || 0;
    } else if (form.type === 'gram_in' || form.type === 'gram_out') {
      tx.gramWeight = Number(String(form.gramWeight).replace(',', '.')) || 0;
      tx.gramFineness = Number(form.gramFineness) || 916;
    }

    try {
      await transactionApi.add(tx);
      await loadData();
      resetForm();
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert('İşlem eklenemedi.');
    }
  };

  const generateReport = useCallback(() => {
    const reportData = {
      date: selectedDate,
      generatedAt: new Date().toISOString(),
      summary: {
        cashBalance: { ...cash },
        goldBalance: { ...gold },
        gramItems: todayGramItems.length,
      },
      transactions: transactions,
      overdueReceivables: overdueReceivables,
      warnings: [],
    };

    if (overdueReceivables.length > 0) {
      reportData.warnings.push(`${overdueReceivables.length} adet vadesi geçmiş alacak var.`);
    }
    if (todayGramItems.length === 0 && transactions.length === 0) {
      reportData.warnings.push('Bugün envanter girişi yapılmadı.');
    }

    return reportData;
  }, [selectedDate, cash, gold, todayGramItems, transactions, overdueReceivables]);

  const handleDownloadReport = () => {
    let content;
    if (savedReportForDate && savedReportForDate.reportText) {
      content = savedReportForDate.reportText;
    } else {
      const report = generateReport();
      content = generateReportText(report);
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor_${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportText = (report) => {
    let text = `═══════════════════════════════════════════════════════════════\n`;
    text += `                    GÜNLÜK RAPOR\n`;
    text += `                    ${formatDate(report.date)}\n`;
    text += `═══════════════════════════════════════════════════════════════\n\n`;

    text += `📅 Rapor Oluşturma: ${new Date(report.generatedAt).toLocaleString('tr-TR')}\n\n`;

    text += `───────────────────────────────────────────────────────────────\n`;
    text += `                    KASA DURUMU\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `TL:  ${formatCurrency(report.summary.cashBalance.tl, 'tl')}\n`;
    text += `USD: ${formatCurrency(report.summary.cashBalance.usd, 'usd')}\n`;
    text += `EUR: ${formatCurrency(report.summary.cashBalance.eur, 'eur')}\n\n`;

    text += `───────────────────────────────────────────────────────────────\n`;
    text += `                    ZİYNET ALTIN STOKU\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    const gb = report.summary.goldBalance;
    text += `Çeyrek: ${gb.quarter} adet (${(gb.quarter * ZIYNET_WEIGHTS.quarter).toFixed(2)} gr)\n`;
    text += `Yarım:  ${gb.half} adet (${(gb.half * ZIYNET_WEIGHTS.half).toFixed(2)} gr)\n`;
    text += `Tam:    ${gb.full} adet (${(gb.full * ZIYNET_WEIGHTS.full).toFixed(2)} gr)\n`;
    const totalZiynetWeight = (gb.quarter * ZIYNET_WEIGHTS.quarter) +
      (gb.half * ZIYNET_WEIGHTS.half) +
      (gb.full * ZIYNET_WEIGHTS.full);
    const totalZiynetHas = totalZiynetWeight * ZIYNET_FINENESS;
    text += `Toplam Brüt: ${totalZiynetWeight.toFixed(2)} gr\n`;
    text += `Toplam Has (916 milyem): ${totalZiynetHas.toFixed(2)} gr\n\n`;

    text += `───────────────────────────────────────────────────────────────\n`;
    text += `                    GÜNLÜK İŞLEMLER\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    
    if (report.transactions.length === 0) {
      text += `Bugün işlem yapılmadı.\n\n`;
    } else {
      report.transactions.forEach(tx => {
        const time = formatTime(tx.date);
        let detail = '';
        if (tx.type === 'cash_in') detail = `NAKİT GİRİŞ: ${formatCurrency(tx.amount, tx.currency)}`;
        else if (tx.type === 'cash_out') detail = `NAKİT ÇIKIŞ: ${formatCurrency(tx.amount, tx.currency)}`;
        else if (tx.type === 'gold_sale') detail = `ALTIN SATIŞ: ${tx.goldCount} ${tx.goldType === 'quarter' ? 'Çeyrek' : tx.goldType === 'half' ? 'Yarım' : 'Tam'}`;
        else if (tx.type === 'gold_buy') detail = `ALTIN ALIŞ: ${tx.goldCount} ${tx.goldType === 'quarter' ? 'Çeyrek' : tx.goldType === 'half' ? 'Yarım' : 'Tam'}`;
        else if (tx.type === 'gram_in') detail = `GRAM GİRİŞ: ${tx.gramWeight} gr (${tx.gramFineness} milyem) - Has: ${(tx.gramWeight * tx.gramFineness / 1000).toFixed(2)} gr`;
        else if (tx.type === 'gram_out') detail = `GRAM ÇIKIŞ: ${tx.gramWeight} gr (${tx.gramFineness} milyem) - Has: ${(tx.gramWeight * tx.gramFineness / 1000).toFixed(2)} gr`;
        text += `[${time}] ${detail}${tx.description ? ' - ' + tx.description : ''}\n`;
      });
      text += `\n`;
    }

    if (report.overdueReceivables.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `              ⚠️ VADESİ GEÇEN ALACAKLAR\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      report.overdueReceivables.forEach(r => {
        text += `• ${r.name}: ${formatCurrency(r.amount, r.currency || 'tl')} (Vade: ${r.date})\n`;
      });
      text += `\n`;
    }

    if (report.warnings.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `                    ⚠️ UYARILAR\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      report.warnings.forEach(w => {
        text += `• ${w}\n`;
      });
      text += `\n`;
    }

    text += `═══════════════════════════════════════════════════════════════\n`;
    text += `                    RAPOR SONU\n`;
    text += `═══════════════════════════════════════════════════════════════\n`;

    return text;
  };

  const handlePrint = () => {
    window.print();
  };

  const getTypeLabel = (type) => {
    const labels = {
      cash_in: 'Nakit Giriş',
      cash_out: 'Nakit Çıkış',
      gold_sale: 'Altın Satış',
      gold_buy: 'Altın Alış',
      gram_in: 'Gram Giriş',
      gram_out: 'Gram Çıkış',
    };
    return labels[type] || type;
  };

  const renderAmountInputs = () => {
    if (form.type === 'cash_in' || form.type === 'cash_out') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Para Birimi</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
            >
              <option value="tl">TL</option>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Tutar</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              required
            />
          </div>
        </div>
      );
    }

    if (form.type === 'gold_sale' || form.type === 'gold_buy') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Altın Cinsi</label>
            <select
              value={form.goldType}
              onChange={(e) => setForm({ ...form, goldType: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
            >
              <option value="quarter">Çeyrek</option>
              <option value="half">Yarım</option>
              <option value="full">Tam</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Adet</label>
            <input
              type="number"
              min="1"
              value={form.goldCount}
              onChange={(e) => setForm({ ...form, goldCount: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              required
            />
          </div>
        </div>
      );
    }

    if (form.type === 'gram_in' || form.type === 'gram_out') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Gram</label>
            <input
              type="number"
              step="0.01"
              value={form.gramWeight}
              onChange={(e) => setForm({ ...form, gramWeight: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary-dark mb-1">Milyem</label>
            <input
              type="number"
              min="0"
              max="999"
              value={form.gramFineness}
              onChange={(e) => setForm({ ...form, gramFineness: e.target.value })}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary-dark">Yükleniyor...</p>
      </div>
    );
  }

  const totalZiynetWeight = (gold.quarter * ZIYNET_WEIGHTS.quarter) +
    (gold.half * ZIYNET_WEIGHTS.half) +
    (gold.full * ZIYNET_WEIGHTS.full);
  const totalZiynetHas = totalZiynetWeight * ZIYNET_FINENESS;

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6 overflow-y-auto print:p-0 print:space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-dark">Günlük Rapor</h1>
          <p className="text-text-secondary-dark">
            Detaylı günlük işlem raporu
            {savedReportForDate && (
              <span className="ml-2 text-green-400 text-xs">
                (Otomatik rapor mevcut: {formatTime(savedReportForDate.generatedAt)})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
          />
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 ${showHistory ? 'bg-purple-600' : 'bg-purple-600/50'} text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors`}
          >
            <span className="material-symbols-outlined">history</span>
            Geçmiş ({savedReports.length})
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary text-background-dark font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            İşlem Ekle
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
            İndir
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
          >
            <span className="material-symbols-outlined">print</span>
            Yazdır
          </button>
        </div>
      </header>

      <div className="hidden print:block text-center mb-4">
        <h1 className="text-2xl font-bold">GÜNLÜK RAPOR</h1>
        <p>{new Date(selectedDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {reportTime && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 print:hidden">
          <p className="text-yellow-300 font-medium">
            <span className="material-symbols-outlined align-middle mr-2">schedule</span>
            Saat 20:00 - Günlük rapor otomatik olarak oluşturuldu ve kaydedildi!
          </p>
        </div>
      )}

      {showHistory && savedReports.length > 0 && (
        <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden print:hidden">
          <div className="p-4 border-b border-border-dark bg-white/5">
            <h2 className="font-bold text-lg text-text-primary-dark flex items-center gap-2">
              <span className="material-symbols-outlined">history</span>
              Kayıtlı Raporlar
            </h2>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => { setSelectedDate(report.date); setShowHistory(false); }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    report.date === selectedDate
                      ? 'bg-primary/20 border-primary'
                      : 'bg-background-dark border-border-dark hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium text-text-primary-dark">{formatDate(report.date)}</p>
                  <p className="text-xs text-text-secondary-dark">
                    Oluşturulma: {formatTime(report.generatedAt)}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-green-400">{report.transactionCount || 0} işlem</span>
                    {report.warnings && report.warnings.length > 0 && (
                      <span className="text-yellow-400">{report.warnings.length} uyarı</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-surface-dark p-6 rounded-xl border border-border-dark print:hidden">
          <h3 className="text-lg font-semibold text-text-primary-dark mb-4">Yeni İşlem Ekle</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-secondary-dark mb-1">İşlem Türü</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                >
                  <option value="cash_in">Nakit Giriş</option>
                  <option value="cash_out">Nakit Çıkış</option>
                  <option value="gold_sale">Altın Satış</option>
                  <option value="gold_buy">Altın Alış</option>
                  <option value="gram_in">Gram Altın Giriş</option>
                  <option value="gram_out">Gram Altın Çıkış</option>
                </select>
              </div>
              <div>
                {renderAmountInputs()}
              </div>
              <div>
                <label className="block text-xs text-text-secondary-dark mb-1">Açıklama</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary-dark"
                  placeholder="İsteğe bağlı"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Kasa TL</p>
          <p className="text-2xl font-bold text-green-400 font-mono">{formatCurrency(cash.tl, 'tl')}</p>
        </div>
        <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Kasa USD</p>
          <p className="text-2xl font-bold text-green-400 font-mono">{formatCurrency(cash.usd, 'usd')}</p>
        </div>
        <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Kasa EUR</p>
          <p className="text-2xl font-bold text-green-400 font-mono">{formatCurrency(cash.eur, 'eur')}</p>
        </div>
        <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
          <p className="text-text-secondary-dark text-sm">Ziynet Has Değeri</p>
          <p className="text-2xl font-bold text-yellow-400 font-mono">{totalZiynetHas.toFixed(2)} gr</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
          <div className="p-4 border-b border-border-dark bg-white/5">
            <h2 className="font-bold text-lg text-text-primary-dark flex items-center gap-2">
              <span className="material-symbols-outlined">monetization_on</span>
              Ziynet Altın Stoku
            </h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead className="text-text-secondary-dark">
                <tr className="border-b border-border-dark">
                  <th className="text-left pb-2">Cins</th>
                  <th className="text-right pb-2">Adet</th>
                  <th className="text-right pb-2">Brüt (gr)</th>
                  <th className="text-right pb-2">Has (gr)</th>
                </tr>
              </thead>
              <tbody className="text-text-primary-dark">
                <tr className="border-b border-border-dark/50">
                  <td className="py-2">Çeyrek (1.75gr)</td>
                  <td className="py-2 text-right font-mono">{gold.quarter}</td>
                  <td className="py-2 text-right font-mono">{(gold.quarter * ZIYNET_WEIGHTS.quarter).toFixed(2)}</td>
                  <td className="py-2 text-right font-mono text-yellow-400">{(gold.quarter * ZIYNET_WEIGHTS.quarter * ZIYNET_FINENESS).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border-dark/50">
                  <td className="py-2">Yarım (3.50gr)</td>
                  <td className="py-2 text-right font-mono">{gold.half}</td>
                  <td className="py-2 text-right font-mono">{(gold.half * ZIYNET_WEIGHTS.half).toFixed(2)}</td>
                  <td className="py-2 text-right font-mono text-yellow-400">{(gold.half * ZIYNET_WEIGHTS.half * ZIYNET_FINENESS).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border-dark/50">
                  <td className="py-2">Tam (7.00gr)</td>
                  <td className="py-2 text-right font-mono">{gold.full}</td>
                  <td className="py-2 text-right font-mono">{(gold.full * ZIYNET_WEIGHTS.full).toFixed(2)}</td>
                  <td className="py-2 text-right font-mono text-yellow-400">{(gold.full * ZIYNET_WEIGHTS.full * ZIYNET_FINENESS).toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">TOPLAM</td>
                  <td className="py-2 text-right font-mono">{gold.quarter + gold.half + gold.full}</td>
                  <td className="py-2 text-right font-mono">{totalZiynetWeight.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono text-yellow-400">{totalZiynetHas.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-text-secondary-dark mt-2">Milyem: 916 (22 Ayar)</p>
          </div>
        </div>

        <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
          <div className="p-4 border-b border-border-dark bg-white/5">
            <h2 className="font-bold text-lg text-text-primary-dark flex items-center gap-2">
              <span className="material-symbols-outlined">scale</span>
              Gram Altın Envanteri
            </h2>
          </div>
          <div className="p-4">
            {gramItems.length === 0 ? (
              <p className="text-text-secondary-dark text-center py-4">Gram altın kaydı yok</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-text-secondary-dark">
                  <tr className="border-b border-border-dark">
                    <th className="text-left pb-2">Tarih</th>
                    <th className="text-right pb-2">Gram</th>
                    <th className="text-right pb-2">Milyem</th>
                    <th className="text-right pb-2">Has (gr)</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary-dark">
                  {gramItems.map(item => (
                    <tr key={item.id} className="border-b border-border-dark/50">
                      <td className="py-2">{formatDate(item.date)}</td>
                      <td className="py-2 text-right font-mono">{item.weight}</td>
                      <td className="py-2 text-right font-mono">{item.fineness}</td>
                      <td className="py-2 text-right font-mono text-yellow-400">{(item.weight * item.fineness / 1000).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
        <div className="p-4 border-b border-border-dark bg-white/5">
          <h2 className="font-bold text-lg text-text-primary-dark flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span>
            Günlük İşlemler ({selectedDate})
          </h2>
        </div>
        <div className="p-4">
          {transactions.length === 0 ? (
            <p className="text-text-secondary-dark text-center py-4">Bu tarihte işlem kaydı yok</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-text-secondary-dark">
                <tr className="border-b border-border-dark">
                  <th className="text-left pb-2">Saat</th>
                  <th className="text-left pb-2">İşlem</th>
                  <th className="text-right pb-2">Detay</th>
                  <th className="text-left pb-2">Açıklama</th>
                </tr>
              </thead>
              <tbody className="text-text-primary-dark">
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-border-dark/50">
                    <td className="py-2">{formatTime(tx.date)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.type.includes('in') || tx.type === 'gold_buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono">
                      {tx.amount && formatCurrency(tx.amount, tx.currency)}
                      {tx.goldCount && `${tx.goldCount} ${tx.goldType === 'quarter' ? 'Çeyrek' : tx.goldType === 'half' ? 'Yarım' : 'Tam'}`}
                      {tx.gramWeight && `${tx.gramWeight} gr (${tx.gramFineness} milyem)`}
                    </td>
                    <td className="py-2 text-text-secondary-dark">{tx.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {overdueReceivables.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h3 className="font-bold text-red-400 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined">warning</span>
            Vadesi Geçen / Bugüne Kadar Olan Alacaklar
          </h3>
          <div className="space-y-2">
            {overdueReceivables.map(r => (
              <div key={r.id} className="flex justify-between items-center bg-background-dark/50 p-3 rounded-lg">
                <div>
                  <p className="text-text-primary-dark font-medium">{r.name}</p>
                  <p className="text-xs text-text-secondary-dark">Vade: {r.date}</p>
                </div>
                <p className="font-mono text-red-400">{formatCurrency(r.amount, r.currency || 'tl')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {transactions.length === 0 && todayGramItems.length === 0 && selectedDate === today && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h3 className="font-bold text-yellow-400 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Bugün envanter girişi veya işlem yapılmadı
          </h3>
          <p className="text-text-secondary-dark text-sm mt-1">
            Günlük işlemlerinizi kaydetmeyi unutmayın.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportView;
