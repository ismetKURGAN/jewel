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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark font-display text-text-primary-dark">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          user={user} 
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border-dark bg-surface-dark">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-lg font-bold text-primary">MÜCEVHERAT</h1>
        </div>
        {renderView()}
      </div>
    </div>
  )
}

export default App;
