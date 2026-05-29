import React, { useState, useEffect } from 'react';
import { SettingsPanel, BubbleSettings } from './components/SettingsPanel';
import { Header } from './components/Header';
import { Buscador } from './components/Buscador';
import { Imagens } from './components/Imagens';
import { Jogos } from './components/Jogos';
import { Inicio } from './components/Inicio';
import { Professor } from './components/Professor';

type Tab = 'inicio' | 'buscador' | 'imagens' | 'jogos' | 'professor';

const DEFAULT_BUBBLE_SETTINGS: BubbleSettings = { duration: 15, size: 1.3 };

export default function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [bubbleSettings, setBubbleSettings] = useState<BubbleSettings>(DEFAULT_BUBBLE_SETTINGS);
  const [hasError, setHasError] = useState<boolean>(false);

  // Handle uncaught errors
  useEffect(() => {
    const handleError = () => {
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // Bubble settings effect
  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('bubbleSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (typeof parsedSettings.duration === 'number' && typeof parsedSettings.size === 'number') {
          setBubbleSettings(parsedSettings);
        }
      }
    } catch (e) {
      console.error("Failed to parse bubble settings from localStorage", e);
    }
  }, []);

  useEffect(() => {
    // Apply and save settings
    document.documentElement.style.setProperty('--bubble-anim-duration', `${bubbleSettings.duration}s`);
    document.documentElement.style.setProperty('--bubble-size-factor', String(bubbleSettings.size));
    try {
      localStorage.setItem('bubbleSettings', JSON.stringify(bubbleSettings));
    } catch (e) {
      console.error("Failed to save bubble settings to localStorage", e);
    }
  }, [bubbleSettings]);

  const renderContent = () => {
    switch (activeTab) {
      case 'buscador':
        return <Buscador />;
      case 'imagens':
        return <Imagens />;
      case 'jogos':
        return <Jogos />;
      case 'professor':
        return <Professor />;
      case 'inicio':
      default:
        return <Inicio setActiveTab={setActiveTab} />;
    }
  };
  
  return (
    <>
      <div aria-hidden="true" className="bubble b1 no-print"></div>
      <div aria-hidden="true" className="bubble b2 no-print"></div>
      <div aria-hidden="true" className="bubble b3 no-print"></div>
      
      {hasError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#e53e3e', marginBottom: '20px' }}>Oops! Algo deu errado 😞</h1>
          <p style={{ color: '#374151', marginBottom: '10px', fontSize: '16px' }}>
            A aplicação encontrou um erro e não consegue inicializar.
          </p>
          <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
            Possível causa: Variável de ambiente <strong>GEMINI_API_KEY</strong> não configurada.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#00b4d8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Recarregar Página
          </button>
        </div>
      )}
      
      {isSettingsOpen && (
        <SettingsPanel 
          settings={bubbleSettings} 
          onSettingsChange={setBubbleSettings} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <div className="no-print">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onSettingsClick={() => setIsSettingsOpen(!isSettingsOpen)}
        />
      </div>
      
      <main className="app-content">
        {renderContent()}
      </main>

      <footer className="footer no-print">
        © 2025 ProfGi.lab – Feito com amor e carinho para a aula da Prof Gi ❤️
      </footer>
    </>
  );
}
