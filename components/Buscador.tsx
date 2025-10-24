import React, { useState, useCallback } from 'react';
import { SearchBar } from './SearchBar';
import { ResultsDisplay } from './ResultsDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { fetchSafeSearchResult } from '../services/geminiService';
import { mascotBase64 } from '../assets/mascot';

export interface SearchResult {
  content: string;
  query: string;
}

export const Buscador: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setInputError('Por favor, digite algo para pesquisar!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInputError(null);
    setResult(null);
    setImageUrl(null);
    setImageCaption(null);

    try {
      const { content: aiResponse, imageUrl: fetchedImageUrl, imageCaption: fetchedImageCaption } = await fetchSafeSearchResult(query);
      setResult({ content: aiResponse, query: query });
      setImageUrl(fetchedImageUrl);
      setImageCaption(fetchedImageCaption);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Oops! Algo deu errado. Tente novamente!';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleBack = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setImageUrl(null);
    setImageCaption(null);
    setQuery(''); // Also clear the query on back
  };
  
  const hasContent = isLoading || result || error;

  if (hasContent) {
    return (
      <div className="results-page">
        <div className="result-card">
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && (
            <div className="answer-content">
              <p>{error}</p>
            </div>
          )}
          {result && !isLoading && (
             <ResultsDisplay 
                result={result} 
                imageUrl={imageUrl}
                imageCaption={imageCaption}
              />
          )}
        </div>
        {!isLoading && <button className="back-btn" onClick={handleBack}>Nova Pesquisa</button>}
      </div>
    );
  }

  return (
    <div className="main">
      <div className="logo-container">
        <img src={mascotBase64} alt="Mascote" className="mascote" />
        <h1 className="logo">Detetives do Conhecimento</h1>
      </div>
      <p className="tagline">Um lugar seguro para descobrir e aprender 💡</p>
      <SearchBar
        query={query}
        setQuery={(q) => {
          setQuery(q);
          if (inputError) setInputError(null);
        }}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      {inputError && <p className="error-message">{inputError}</p>}
    </div>
  );
};
