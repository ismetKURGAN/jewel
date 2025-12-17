import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import InventoryView from './views/InventoryView';
import DebtsView from './views/DebtsView';
import ReceivablesView from './views/ReceivablesView';
import ShopView from './views/ShopView';
import FarmView from './views/FarmView';
import ReportView from './views/ReportView';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark font-display text-text-primary-dark">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {renderView()}
      </div>
    </div>
  )
}

export default App;
