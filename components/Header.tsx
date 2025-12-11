import React from 'react';

type Tab = 'inicio' | 'buscador' | 'imagens' | 'jogos';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onSettingsClick }) => {
  const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  return (
    <header className="app-header">
      <h1 className="header-title">ProfGi.lab</h1>
      <nav className="tabs">
        <button
          className={`tab-button ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          Início
        </button>
        <button
          className={`tab-button ${activeTab === 'jogos' ? 'active' : ''}`}
          onClick={() => setActiveTab('jogos')}
        >
          Jogos
        </button>
        <button
          className={`tab-button ${activeTab === 'imagens' ? 'active' : ''}`}
          onClick={() => setActiveTab('imagens')}
        >
          Imagens
        </button>
        <button
          className={`tab-button ${activeTab === 'buscador' ? 'active' : ''}`}
          onClick={() => setActiveTab('buscador')}
        >
          Buscador
        </button>
        <button className="settings-icon-btn" onClick={onSettingsClick} aria-label="Abrir configurações">
          <SettingsIcon />
        </button>
      </nav>
    </header>
  );
};