const API_URL = '/api';

export const api = {
  // Products
  getProducts: () => fetch(`${API_URL}/products`).then(res => res.json()),
  addProduct: (product) => fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(res => res.json()),
  updateProduct: (product) => fetch(`${API_URL}/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(res => res.json()),
  deleteProduct: (id) => fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Gold
  getGold: () => fetch(`${API_URL}/gold`).then(res => res.json()),
  updateGold: (gold) => fetch(`${API_URL}/gold`, {
    method: 'PUT', // json-server treats object root as resource sometimes, but we might need to patch/put
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gold)
  }).then(res => res.json()),

  // Gram Gold
  getGramItems: () => fetch(`${API_URL}/gramItems`).then(res => res.json()),
  addGramItem: (item) => fetch(`${API_URL}/gramItems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).then(res => res.json()),
  deleteGramItem: (id) => fetch(`${API_URL}/gramItems/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Cash
  getCash: () => fetch(`${API_URL}/cash`).then(res => res.json()),
  updateCash: (cash) => fetch(`${API_URL}/cash`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cash)
  }).then(res => res.json()),

  // Finance
  getFinance: () => fetch(`${API_URL}/finance`).then(res => res.json()),
  addFinance: (item) => fetch(`${API_URL}/finance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).then(res => res.json()),

  // Farm
  getFarmExpenses: () => fetch(`${API_URL}/farmExpenses`).then(res => res.json()),
  addFarmExpense: (expense) => fetch(`${API_URL}/farmExpenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense)
  }).then(res => res.json()),
  
  getFarmDebts: () => fetch(`${API_URL}/farmDebts`).then(res => res.json()),
  addFarmDebt: (debt) => fetch(`${API_URL}/farmDebts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(debt)
  }).then(res => res.json()),
};

export const transactionApi = {
  getAll: () => fetch(`${API_URL}/transactions`).then(res => res.json()),
  add: (item) => fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).then(res => res.json()),
  delete: (id) => fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),
};

export const reportApi = {
  getAll: () => fetch(`${API_URL}/dailyReports`).then(res => res.json()),
  add: (report) => fetch(`${API_URL}/dailyReports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  }).then(res => res.json()),
  getByDate: (date) => fetch(`${API_URL}/dailyReports?date=${date}`).then(res => res.json()),
};

export const financeApi = {
  getAll: () => fetch(`${API_URL}/finance`).then(res => res.json()),
  add: (item) => fetch(`${API_URL}/finance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).then(res => res.json()),
  update: (item) => fetch(`${API_URL}/finance/${item.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).then(res => res.json()),
  delete: (id) => fetch(`${API_URL}/finance/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),
};
