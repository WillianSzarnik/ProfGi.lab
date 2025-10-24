import React from 'react';
// FIX: The SearchResult type is exported from Buscador.tsx, not App.tsx. Updated the import path.
import type { SearchResult } from './Buscador';

interface ResultsDisplayProps {
  result: SearchResult;
  imageUrl: string | null;
  imageCaption: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, imageUrl, imageCaption }) => {

  // Analisa markdown simples (negrito) e cria parágrafos a partir de novas linhas
  const formatTextWithParagraphs = (text: string) => {
    return text
      .split('\n')
      .filter(line => line.trim() !== '')
      .map((line, index) => (
        <p key={index}>
          {line.split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
        </p>
      ));
  };
    
  return (
    <div className="result-content-wrapper">
      {imageUrl && (
        <figure className="result-image-container">
            <img 
                src={imageUrl} 
                alt={`Uma imagem sobre: ${result.query}`} 
                className="result-image"
            />
            {imageCaption && <figcaption className="result-image-caption">{imageCaption}</figcaption>}
        </figure>
      )}
      
      <div className="answer-content">
        {formatTextWithParagraphs(result.content)}
      </div>
    </div>
  );
};