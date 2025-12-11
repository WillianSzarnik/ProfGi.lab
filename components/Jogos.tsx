import React from 'react';

const games = [
  { 
    icon: '🧩', 
    title: 'Quebra-Cabeça Animal', 
    description: 'Monte quebra-cabeças divertidos com animais da floresta e da fazenda!' 
  },
  { 
    icon: '🎨', 
    title: 'Cores Mágicas', 
    description: 'Aprenda as cores de uma forma mágica pintando desenhos incríveis.' 
  },
  { 
    icon: '🔢', 
    title: 'Aventura dos Números', 
    description: 'Explore uma ilha cheia de desafios matemáticos e mistérios para resolver.' 
  },
  { 
    icon: '🔤', 
    title: 'Caça-Palavras', 
    description: 'Encontre as palavras escondidas e expanda seu vocabulário a cada fase.' 
  },
  { 
    icon: '🎵', 
    title: 'Ritmo Divertido', 
    description: 'Crie suas próprias músicas, aprenda sobre os sons e os instrumentos.' 
  },
  { 
    icon: '🌍', 
    title: 'Explorador do Mundo', 
    description: 'Viaje pelo globo e descubra fatos curiosos sobre diferentes países e culturas.' 
  },
];

export const Jogos: React.FC = () => {
  return (
    <div className="games-page">
      <h2>🎮 Central de Jogos</h2>
      <p>Escolha um jogo abaixo e prepare-se para a diversão e o aprendizado!</p>
      <div className="games-grid">
        {games.map((game, index) => (
          <div key={index} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h3 className="game-title">{game.title}</h3>
            <p className="game-description">{game.description}</p>
            <button className="play-button" disabled>Em Breve</button>
          </div>
        ))}
      </div>
    </div>
  );
};