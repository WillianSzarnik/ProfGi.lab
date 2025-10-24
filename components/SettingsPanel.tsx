import React from 'react';

export interface BubbleSettings {
  duration: number; // speed
  size: number; // size factor
}

interface SettingsPanelProps {
  settings: BubbleSettings;
  onSettingsChange: (newSettings: BubbleSettings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onClose }) => {
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Relação inversa: menor duração = maior velocidade. A UI deve refletir "Velocidade".
    const speed = parseFloat(e.target.value);
    const duration = 30 - speed; // Mapeia a velocidade (5-25) para a duração (25-5)
    onSettingsChange({ ...settings, duration });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, size: parseFloat(e.target.value) });
  };

  // Converte a duração de volta para um valor de "velocidade" para o controle deslizante
  const speedValue = 30 - settings.duration;

  return (
    <div className="settings-panel">
      <button className="close-btn" onClick={onClose} aria-label="Fechar configurações">&times;</button>
      <h3>Configurações</h3>
      <div className="settings-group">
        <label htmlFor="speed-slider">
          Velocidade das Bolhas <span>{Math.round(speedValue)}</span>
        </label>
        <input
          id="speed-slider"
          type="range"
          min="5" // Mais lento
          max="25" // Mais rápido
          step="1"
          value={speedValue}
          onChange={handleDurationChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="size-slider">
          Tamanho das Bolhas <span>{settings.size.toFixed(1)}</span>
        </label>
        <input
          id="size-slider"
          type="range"
          min="0.5" // Menor
          max="1.5" // Maior
          step="0.1"
          value={settings.size}
          onChange={handleSizeChange}
        />
      </div>
    </div>
  );
};
