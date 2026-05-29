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