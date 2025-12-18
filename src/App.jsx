import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import DashboardView from './views/DashboardView';
import InventoryView from './views/InventoryView';
import DebtsView from './views/DebtsView';
import ReceivablesView from './views/ReceivablesView';
import ShopView from './views/ShopView';
import FarmView from './views/FarmView';
import ReportView from './views/ReportView';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('jewl_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData);
      } catch (e) {
        localStorage.removeItem('jewl_auth');
      }
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (userData) => {
    setUser({ username: userData.username, role: userData.role });
  };

  const handleLogout = () => {
    localStorage.removeItem('jewl_auth');
    setUser(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryView />;
      case 'debts':
        return <DebtsView />;
      case 'receivables':
        return <ReceivablesView />;
      case 'shop':
        return <ShopView />;
      case 'farm':
        return <FarmView />;
      case 'report':
        return <ReportView />;
      default:
        return <ShopView />;
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-yellow-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark font-display text-text-primary-dark">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {renderView()}
      </div>
    </div>
  )
}

export default App;
