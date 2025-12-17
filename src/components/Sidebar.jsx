import React from 'react';

const Sidebar = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Ana Panel' },
    { id: 'inventory', icon: 'inventory_2', label: 'Envanter' },
    { id: 'debts', icon: 'account_balance', label: 'Borçlar / Alacaklar' },
    { id: 'farm', icon: 'agriculture', label: 'Çiftlik' },
    { id: 'report', icon: 'assessment', label: 'Günlük Rapor' },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-surface-dark border-r border-border-dark">
      <div className="flex items-center justify-center h-16 border-b border-border-dark">
        <h1 className="text-xl font-bold text-primary tracking-wider">MÜCEVHERAT</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-primary text-background-dark'
                    : 'text-text-secondary-dark hover:bg-white/5 hover:text-text-primary-dark'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border-dark p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary-dark">Admin</p>
            <p className="text-xs text-text-secondary-dark">Yönetici</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
