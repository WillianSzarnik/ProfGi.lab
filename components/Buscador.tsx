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

  const appendSearchLog = useCallback((term: string, status: 'approved' | 'blocked', reason?: string) => {
    try {
      const savedLogs = localStorage.getItem('searchLogs');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('pt-BR'),
        term,
        status,
        reason: reason || ''
      };
      localStorage.setItem('searchLogs', JSON.stringify([newLog, ...logs].slice(0, 50)));
    } catch (e) {
      console.error("Failed to append search log", e);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setInputError('Por favor, digite algo para pesquisar!');
      return;
    }

    // Check custom blocked terms (Teacher list)
    let blockedList: string[] = ['violência', 'arma', 'morte', 'guerra', 'sangue', 'batalha', 'fogo'];
    try {
      const savedBlocked = localStorage.getItem('blockedTerms');
      if (savedBlocked) {
        blockedList = JSON.parse(savedBlocked);
      }
    } catch (e) {
      console.error("Failed to load blocked terms from localStorage", e);
    }

    const lowercaseQuery = query.toLowerCase();
    const matchedTerm = blockedList.find(term => lowercaseQuery.includes(term.toLowerCase()));

    if (matchedTerm) {
      appendSearchLog(query, 'blocked', matchedTerm);
      setInputError(`Ops! Assuntos contendo "${matchedTerm}" são bloqueados pela Prof Gi para mantermos nosso ambiente divertido e amigável. Pesquise outros temas legais, como estrelas, plantas ou fósseis! 🌟`);
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
      appendSearchLog(query, 'approved');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Oops! Algo deu errado. Tente novamente!';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, appendSearchLog]);

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
