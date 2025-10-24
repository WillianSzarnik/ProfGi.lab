import React from 'react';

type Tab = 'inicio' | 'buscador' | 'imagens' | 'jogos';

interface InicioProps {
  setActiveTab: (tab: Tab) => void;
}

export const Inicio: React.FC<InicioProps> = ({ setActiveTab }) => {
  return (
    <div className="main inicio-page">
      <div className="logo-container">
        <h1 className="logo">Bem-vindo ao ProfGi.lab!</h1>
      </div>
      <p className="tagline">Seu portal para um universo de descobertas divertidas! ✨</p>
    </div>
  );
};