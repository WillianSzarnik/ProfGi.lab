import React, { useState, useEffect } from 'react';
import { 
  generateLessonPlan, 
  generateActivityQuiz, 
  generateKidsStory, 
  generateMathEnigma 
} from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type SubTab = 'enigmas';

interface EnigmaCardData {
  id: string;
  numero: string;
  p1: string; // Pista A
  p2: string; // Pista B
  p3: string; // Pista C
  n1: string; // Numero 1 no grid
  n2: string; // Numero 2 no grid
  n3: string; // Numero 3 no grid
  n4: string; // Numero 4 no grid
}

export const Professor: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('enigmas');
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // States for Enigma Card Generator
  const [enigmaCards, setEnigmaCards] = useState<EnigmaCardData[]>([
    {
      id: '1',
      numero: '1',
      p1: 'Sou o resultado da multiplicação de 3 por 4.',
      p2: 'Sou um número par e menor que 15.',
      p3: 'Se você somar 2 a mim, eu viro 14.',
      n1: '8',
      n2: '12',
      n3: '14',
      n4: '10'
    },
    {
      id: '2',
      numero: '2',
      p1: 'Sou uma dezena cheia e menor que 40.',
      p2: 'Não sou o número 10.',
      p3: 'Se você me dividir por 2, o resultado é 15.',
      n1: '20',
      n2: '30',
      n3: '10',
      n4: '50'
    },
    {
      id: '3',
      numero: '3',
      p1: 'Sou um número ímpar e estou entre 15 e 20.',
      p2: 'Se você somar meus algarismos, o resultado é 8.',
      p3: 'Sou o resultado de 9 + 8.',
      n1: '15',
      n2: '17',
      n3: '19',
      n4: '21'
    }
  ]);

  const [isEnigmaModalOpen, setIsEnigmaModalOpen] = useState(false);
  const [editingEnigmaCard, setEditingEnigmaCard] = useState<EnigmaCardData | null>(null);
  const [deleteConfirms, setDeleteConfirms] = useState<Record<string, boolean>>({});

  // Form Fields for Enigma Modal
  const [fieldNumero, setFieldNumero] = useState('');
  const [fieldP1, setFieldP1] = useState('');
  const [fieldP2, setFieldP2] = useState('');
  const [fieldP3, setFieldP3] = useState('');
  const [fieldN1, setFieldN1] = useState('');
  const [fieldN2, setFieldN2] = useState('');
  const [fieldN3, setFieldN3] = useState('');
  const [fieldN4, setFieldN4] = useState('');

  // AI Generation Fields inside Enigma Tool Workspace
  const [aiEnigmaTopic, setAiEnigmaTopic] = useState('');
  const [aiEnigmaGrade, setAiEnigmaGrade] = useState('3º Ano (Ensino Fundamental I)');
  const [isAiEnigmaLoading, setIsAiEnigmaLoading] = useState(false);
  const [aiEnigmaError, setAiEnigmaError] = useState('');

  // Handlers for Enigmas
  const handleOpenEnigmaCardModal = (card: EnigmaCardData | null = null) => {
    if (card) {
      setEditingEnigmaCard(card);
      setFieldNumero(card.numero);
      setFieldP1(card.p1);
      setFieldP2(card.p2);
      setFieldP3(card.p3);
      setFieldN1(card.n1);
      setFieldN2(card.n2);
      setFieldN3(card.n3);
      setFieldN4(card.n4);
    } else {
      setEditingEnigmaCard(null);
      setFieldNumero((enigmaCards.length + 1).toString());
      setFieldP1('');
      setFieldP2('');
      setFieldP3('');
      setFieldN1('');
      setFieldN2('');
      setFieldN3('');
      setFieldN4('');
    }
    setIsEnigmaModalOpen(true);
  };

  const handleSaveEnigmaCard = () => {
    if (!fieldP1 || !fieldP2 || !fieldP3 || !fieldN1 || !fieldN2 || !fieldN3 || !fieldN4) {
      alert("Por favor, preencha as pistas e os 4 números do grid!");
      return;
    }

    if (editingEnigmaCard) {
      // Edit existing state
      setEnigmaCards(prev => prev.map(c => c.id === editingEnigmaCard.id ? {
        ...c,
        numero: fieldNumero,
        p1: fieldP1,
        p2: fieldP2,
        p3: fieldP3,
        n1: fieldN1,
        n2: fieldN2,
        n3: fieldN3,
        n4: fieldN4
      } : c));
    } else {
      // Add new card
      const newCard: EnigmaCardData = {
        id: Date.now().toString(),
        numero: fieldNumero || (enigmaCards.length + 1).toString(),
        p1: fieldP1,
        p2: fieldP2,
        p3: fieldP3,
        n1: fieldN1,
        n2: fieldN2,
        n3: fieldN3,
        n4: fieldN4
      };
      setEnigmaCards(prev => [...prev, newCard]);
    }
    setIsEnigmaModalOpen(false);
  };

  const handleDeleteEnigmaCard = (id: string) => {
    if (deleteConfirms[id]) {
      setEnigmaCards(prev => prev.filter(c => c.id !== id));
      setDeleteConfirms(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setDeleteConfirms(prev => ({ ...prev, [id]: true }));
      // Automatically reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirms(prev => ({ ...prev, [id]: false }));
      }, 3000);
    }
  };

  const handleGenerateEnigmaWithAi = async () => {
    setIsAiEnigmaLoading(true);
    setAiEnigmaError('');
    try {
      const generated = await generateMathEnigma(aiEnigmaTopic, aiEnigmaGrade);
      // Auto-populate or create directly
      const newCard: EnigmaCardData = {
        id: Date.now().toString(),
        numero: (enigmaCards.length + 1).toString(),
        p1: generated.p1,
        p2: generated.p2,
        p3: generated.p3,
        n1: generated.n1,
        n2: generated.n2,
        n3: generated.n3,
        n4: generated.n4
      };
      setEnigmaCards(prev => [...prev, newCard]);
      setAiEnigmaTopic(''); // Clear topic on success
    } catch (err) {
      setAiEnigmaError(err instanceof Error ? err.message : "Erro ao gerar enigma com IA.");
    } finally {
      setIsAiEnigmaLoading(false);
    }
  };

  const handleGenerateSuggestForModalWithAi = async () => {
    setIsAiEnigmaLoading(true);
    try {
      const generated = await generateMathEnigma("Desafio Divertido", "3º Ano");
      setFieldNumero((enigmaCards.length + 1).toString());
      setFieldP1(generated.p1);
      setFieldP2(generated.p2);
      setFieldP3(generated.p3);
      setFieldN1(generated.n1);
      setFieldN2(generated.n2);
      setFieldN3(generated.n3);
      setFieldN4(generated.n4);
    } catch (err) {
      alert("Erro ao pedir sugestão para a IA.");
    } finally {
      setIsAiEnigmaLoading(false);
    }
  };

  const handleDownloadCardPNG = async (id: string) => {
    const element = document.getElementById(`enigma-card-body-${id}`);
    if (!element) return;
    try {
      setIsExporting(true);
      await new Promise(r => setTimeout(r, 100)); // allow VDOM update

      const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `enigma-card-${id}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNGAllEnigmas = async () => {
    const element = document.getElementById('enigma-workspace-grid');
    if (!element) return;
    try {
      setIsExporting(true);
      await new Promise(r => setTimeout(r, 100)); // allow VDOM update

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `todos-os-enigmas.png`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDFAllEnigmas = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const cards = document.querySelectorAll('.enigma-card-print-target');
      if (cards.length === 0) {
        alert("Crie pelo menos um enigma matemático primeiro!");
        return;
      }

      setIsExporting(true);
      await new Promise(r => setTimeout(r, 100)); // allow VDOM update

      let x = 10;
      let y = 10;
      let col = 0;
      let row = 0;

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i] as HTMLElement;
        const canvas = await html2canvas(c, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const img = canvas.toDataURL('image/png');
        
        doc.addImage(img, 'PNG', x, y, 60, 68);
        col++;
        x += 65;
        
        if (col === 3) {
          col = 0;
          x = 10;
          row++;
          y += 75;
        }
        
        if (row === 3 && i < cards.length - 1) {
          doc.addPage();
          row = 0;
          y = 10;
          x = 10;
        }
      }
      
      doc.save('enigmas-matematicos.pdf');
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="teacher-panel-container" style={{
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      animation: 'fadeIn 0.6s ease'
    }}>
      <style>{`
        @media print {
          body, html, #root, .teacher-panel-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print, .card-action-overlay, .settings-icon-btn, .toolbar-row, .back-btn-row {
            display: none !important;
          }
          #enigma-workspace-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
            justify-content: center !important;
            background: white !important;
            padding: 10px !important;
          }
          .enigma-card-print-target {
            width: 290px !important;
            height: 330px !important;
            page-break-inside: avoid !important;
            break-inside: avoid-column !important;
            border: 3px solid #000 !important;
            border-radius: 12px !important;
            background: white !important;
            position: relative !important;
          }
          /* Preserve matrix grid lines for printing */
          .enigma-card-print-target > div > div:last-child > div:last-child > div {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            width: 100% !important;
            height: 100% !important;
            border: 3px solid #000000 !important;
            background-color: #000000 !important;
            gap: 2px !important;
            box-sizing: border-box !important;
          }
          .enigma-card-print-target > div > div:last-child > div:last-child > div > div {
            background-color: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: 800 !important;
            font-size: 16px !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Page Title & Intro */}
      <div className="no-print" style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '24px',
        borderRadius: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        border: '3px solid rgba(0, 180, 216, 0.2)'
      }}>
        <h2 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '8px', fontWeight: 700 }}>
          🎓 Espaço do Educador
        </h2>
        <p style={{ color: '#475569', fontSize: '18px', maxWidth: '750px', margin: '0 auto', lineHeight: '1.5' }}>
          Bem-vindo, professor(a)! Aqui você encontra ferramentas inteligentes apoiadas por Inteligência Artificial (Gemini) para elaborar seus materiais e enriquecer suas aulas.
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* TAB 1 REMOVED */}

        {/* TAB 2 REMOVED */}

        {/* TAB 3 REMOVED */}

        {/* TAB 4 REMOVED */}

        {/* TAB 5: GERADOR DE ENIGMAS MATEMÁTICOS */}
        {activeSubTab === 'enigmas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s ease' }}>
            <div className="no-print">
              <h3 style={{ fontSize: '24px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>
                🧩 Gerador de Enigmas Matemáticos do Detetive
              </h3>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Gere e imprima lindos cards de raciocínio lógico e habilidades numéricas para seus pequenos detetives resolverem de forma divertida!
              </p>
            </div>

            {/* AI Assistant Generator Section */}
            <div className="no-print" style={{
              background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
              border: '2px solid #f59e0b',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px', color: '#b45309', margin: 0 }}>
                ✨ Criar com Inteligência Artificial
              </h4>
              <p style={{ fontSize: '14px', color: '#78350f', margin: 0 }}>
                Escolha o tema ou assunto da matemática e a IA formulará 3 pistas lógicas engenhosas e 4 opções de respostas para você instantaneamente.
              </p>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 280px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#78350f' }}>Assunto Matemático:</label>
                  <input
                    type="text"
                    value={aiEnigmaTopic}
                    onChange={(e) => setAiEnigmaTopic(e.target.value)}
                    placeholder="Ex: Tabuada do 8, Subtração até 50, Números Pares..."
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #f59e0b',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: 'white'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#78350f' }}>Ano Escolar:</label>
                  <select
                    value={aiEnigmaGrade}
                    onChange={(e) => setAiEnigmaGrade(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #f59e0b',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="1º Ano (Ensino Fundamental I)">1º Ano (Fund. I)</option>
                    <option value="2º Ano (Ensino Fundamental I)">2º Ano (Fund. I)</option>
                    <option value="3º Ano (Ensino Fundamental I)">3º Ano (Fund. I)</option>
                    <option value="4º Ano (Ensino Fundamental I)">4º Ano (Fund. I)</option>
                    <option value="5º Ano (Ensino Fundamental I)">5º Ano (Fund. I)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateEnigmaWithAi}
                  disabled={isAiEnigmaLoading}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                    opacity: isAiEnigmaLoading ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!isAiEnigmaLoading) e.currentTarget.style.background = '#d97706';
                  }}
                  onMouseOut={(e) => {
                    if (!isAiEnigmaLoading) e.currentTarget.style.background = '#f59e0b';
                  }}
                >
                  {isAiEnigmaLoading ? "Gerando Pistas... 🕵️‍♂️" : "Gerar com IA ✨"}
                </button>
              </div>
              {aiEnigmaError && (
                <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                  ⚠️ {aiEnigmaError}
                </span>
              )}
            </div>

            {/* Action Toolbar */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '20px'
            }}>
              <div>
                <button
                  onClick={() => handleOpenEnigmaCardModal(null)}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 10px rgba(0, 180, 216, 0.2)'
                  }}
                >
                  ➕ Novo Card Manual
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleExportPNGAllEnigmas}
                  style={{
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'inherit'
                  }}
                >
                  📷 Baixar PNG Completo
                </button>
                <button
                  onClick={handleExportPDFAllEnigmas}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'inherit'
                  }}
                >
                  📄 Exportar PDF
                </button>
              </div>
            </div>

            {/* THE WORKSPACE CONTAINER FOR CARDS */}
            <div 
              id="enigma-workspace-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '24px',
                justifyContent: 'center',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '20px',
                border: '1.5px dashed #cbd5e1'
              }}
            >
              {enigmaCards.map((card) => (
                <div
                  key={card.id}
                  className="enigma-card-print-target group"
                  style={{
                    width: '100%',
                    maxWidth: '310px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    border: '3px solid #f59e0b',
                    padding: '16px',
                    position: 'relative',
                    aspectRatio: '1 / 1.15',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Decorative internal dashed border to make it look like a real printed card */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    right: '4px',
                    bottom: '4px',
                    border: '2px dashed #fcd34d',
                    borderRadius: '12px',
                    pointerEvents: 'none'
                  }} />

                  {/* Wrapper target for single card html2canvas */}
                  <div 
                    id={`enigma-card-body-${card.id}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      background: 'white'
                    }}
                  >
                    {/* Header Banner */}
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #f59e0b', paddingBottom: '6px' }}>
                      <h5 style={{
                        fontSize: '13px',
                        color: '#1e293b',
                        fontWeight: 800,
                        lineHeight: '1.2',
                        marginTop: '2px',
                        marginBottom: '2px',
                        textAlign: 'center'
                      }}>
                        🔍 SIGA AS PISTAS E DESCUBRA O NÚMERO SECRETO!
                      </h5>
                    </div>

                    {/* Clues layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '13px', color: '#334155', lineHeight: '1.3' }}>
                        <strong style={{ color: '#d97706' }}>a)</strong> <span>{card.p1}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '13px', color: '#334155', lineHeight: '1.3' }}>
                        <strong style={{ color: '#d97706' }}>b)</strong> <span>{card.p2}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '13px', color: '#334155', lineHeight: '1.3' }}>
                        <strong style={{ color: '#d97706' }}>c)</strong> <span>{card.p3}</span>
                      </div>
                    </div>

                    {/* Bottom Row Layout: Left (Quem sou eu? + Line) | Right (2x2 Matrix Grid with Mascot peaking above) */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginTop: 'auto',
                      gap: '12px',
                      paddingTop: '10px'
                    }}>
                      {/* Left Column: Quem sou eu? and the response line */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '90px',
                        flex: 1
                      }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: '#000000',
                          textAlign: 'left'
                        }}>
                          Quem sou eu?
                        </span>
                        <div style={{
                          borderBottom: '3px solid #000000',
                          width: '100%',
                          marginBottom: '6px'
                        }} />
                      </div>

                      {/* Right Column: 2x2 Matrix with Mascot peaking above */}
                      <div style={{
                        position: 'relative',
                        width: '90px',
                        height: '90px',
                        flexShrink: 0
                      }}>
                        {/* Mascot peaking above the grid */}
                        <div style={{
                          position: 'absolute',
                          top: '-52px',
                          right: '0px',
                          width: '55px',
                          height: '55px',
                          zIndex: 10
                        }}>
                          <img
                            src="https://i.ibb.co/d03RRKkB/Chat-GPT-Image-29-de-mai-de-2026-11-48-11-removebg-preview-1.png"
                            alt="Detetive Sabe Tudo"
                            referrerPolicy="no-referrer"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </div>

                        {/* 2x2 Grid of Candidates (The Matrix Square) */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          width: '100%',
                          height: '100%',
                          border: '3px solid #000000',
                          backgroundColor: '#000000',
                          gap: '2px',
                          boxSizing: 'border-box'
                        }}>
                          {[card.n1, card.n2, card.n3, card.n4].map((num, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '16px',
                                color: '#000000'
                              }}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Absolute Position Action Overlay (Visible on Hover in web client) */}
                  {!isExporting && (
                    <div
                      className="card-action-overlay no-print"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(30, 41, 59, 0.85)',
                        borderRadius: '16px',
                        display: 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        zIndex: 10,
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <button
                        onClick={() => handleOpenEnigmaCardModal(card)}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDownloadCardPNG(card.id)}
                        style={{
                          background: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ⬇️ PNG
                      </button>
                      <button
                        onClick={() => handleDeleteEnigmaCard(card.id)}
                        style={{
                          background: deleteConfirms[card.id] ? '#dc2626' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {deleteConfirms[card.id] ? '⚠️ Confirmar?' : '❌ Apagar'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {enigmaCards.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '48px' }}>🦉🕵️‍♂️</span>
                  <p style={{ color: '#94a3b8', fontSize: '16px', margin: '8px 0 0 0' }}>
                    Nenhum card matemático criado ainda. Adicione manualmente ou peça ideias para a IA acima!
                  </p>
                </div>
              )}
            </div>

            {/* Custom group-hover stylesheet since inline styles cannot natively handle hovering */}
            <style dangerouslySetInnerHTML={{ __html: `
              .card-action-overlay {
                display: none !important;
              }
              .enigma-card-print-target:hover .card-action-overlay {
                display: flex !important;
              }
            ` }} />
          </div>)}
        </div>

      {/* MODAL POP-UP FOR ADDING/EDITING ENIGMAS (No-print) */}
      {isEnigmaModalOpen && (
        <div className="no-print" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            border: '3px solid #f59e0b',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            position: 'relative',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 800, color: '#b45309', margin: '0 0 16px 0' }}>
              {editingEnigmaCard ? '✏️ Editar Card de Enigma' : '🧩 Criar Novo Enigma Matemático'}
            </h3>

            {/* AI Generator Help Button within Modal! */}
            {!editingEnigmaCard && (
              <div style={{
                background: '#fffbeb',
                border: '1.5px dashed #fcd34d',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#b45309' }}>Quer ajuda da IA?</span>
                  <span style={{ fontSize: '11px', color: '#78350f' }}>Preencha este formulário sozinho ou use um rascunho rápido.</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSuggestForModalWithAi}
                  disabled={isAiEnigmaLoading}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {isAiEnigmaLoading ? "Escrevendo..." : "Sugerir com IA ✨"}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Card Nº:</label>
                  <input
                    type="text"
                    value={fieldNumero}
                    onChange={(e) => setFieldNumero(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Pista A:</label>
                <input
                  type="text"
                  value={fieldP1}
                  onChange={(e) => setFieldP1(e.target.value)}
                  placeholder="Ex: Sou um número par."
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Pista B:</label>
                <input
                  type="text"
                  value={fieldP2}
                  onChange={(e) => setFieldP2(e.target.value)}
                  placeholder="Ex: Sou maior que 10 e menor que 20."
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Pista C:</label>
                <input
                  type="text"
                  value={fieldP3}
                  onChange={(e) => setFieldP3(e.target.value)}
                  placeholder="Ex: Estou na tabuada do 3 (12, 15, ou 18?)"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Grid Number Candidates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Opções do Grid candidatos (4 números):</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Num 1</span>
                    <input
                      type="text"
                      value={fieldN1}
                      onChange={(e) => setFieldN1(e.target.value)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Num 2</span>
                    <input
                      type="text"
                      value={fieldN2}
                      onChange={(e) => setFieldN2(e.target.value)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Num 3</span>
                    <input
                      type="text"
                      value={fieldN3}
                      onChange={(e) => setFieldN3(e.target.value)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Num 4 (Segredo)</span>
                    <input
                      type="text"
                      value={fieldN4}
                      onChange={(e) => setFieldN4(e.target.value)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '24px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px'
            }}>
              <button
                type="button"
                onClick={() => setIsEnigmaModalOpen(false)}
                style={{
                  background: 'none',
                  border: '1.5px solid #cbd5e1',
                  color: '#64748b',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEnigmaCard}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 20px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)'
                }}
              >
                Salvar Card
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
