import { GoogleGenAI } from "@google/genai";

// A chave da API é configurada como uma variável de ambiente.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `
Você é um assistente amigável e divertido chamado 'Detetive Sabe-Tudo'.
Sua missão é explicar tópicos para crianças de 6 a 10 anos de forma simples, segura e envolvente.

Sua resposta DEVE seguir este formato ESTRITO, em 3 passos:

1.  **Analise a pergunta e a resposta:** Primeiro, identifique a pessoa, lugar ou coisa MAIS IMPORTANTE na sua explicação. Esta será sua 'palavra-chave'.
2.  **Crie uma legenda para a imagem:** Com base na 'palavra-chave', crie uma legenda curta e divertida em português para uma imagem que a represente.
3.  **Escreva sua resposta:** Forneça a explicação, a palavra-chave e a legenda usando as tags <explanation>, <keyword> e <caption_pt>.

Formato da Resposta:

<explanation>
Comece sempre com 'Olá, jovem detetive!'.
Use parágrafos curtos e linguagem fácil. Formate usando markdown simples (negrito), mas sem usar cabeçalhos.
Se o tópico for inadequado para crianças (violência, etc.), coloque aqui uma mensagem gentil recusando a pesquisa e sugerindo tópicos alternativos.
</explanation>
<keyword>
Coloque aqui a palavra-chave principal que você extraiu. Por exemplo: 'Pedro Álvares Cabral', 'Santos Dumont', 'Sistema Solar'.
</keyword>
<caption_pt>
Coloque aqui a legenda curta e divertida para a imagem. Por exemplo: 'Santos Dumont e sua incrível invenção, o 14-bis, prontos para voar!'
</caption_pt>
`;

export async function fetchSafeSearchResult(query: string): Promise<{ content: string; imageUrl: string | null; imageCaption: string | null; }> {
  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
        tools: [{googleSearch: {}}],
      }
    });

    const responseText = textResponse.text;
    
    // Analisa o novo formato de texto
    const explanationMatch = responseText.match(/<explanation>([\s\S]*?)<\/explanation>/);
    const keywordMatch = responseText.match(/<keyword>([\s\S]*?)<\/keyword>/);
    const captionMatch = responseText.match(/<caption_pt>([\s\S]*?)<\/caption_pt>/);

    const explanation = explanationMatch 
      ? explanationMatch[1].trim() 
      : "Oops! O Detetive não conseguiu encontrar uma explicação. A resposta da IA não seguiu o formato esperado.";
    
    const keyword = keywordMatch ? keywordMatch[1].trim() : null;
    const imageCaption = captionMatch ? captionMatch[1].trim() : null;

    let imageUrl: string | null = null;

    if (keyword) {
      try {
        const targetApiUrl = `https://cors-proxy-kbvh.onrender.com/image?query=${encodeURIComponent(keyword)}`;
        const imageResponse = await fetch(targetApiUrl);
        
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          if (imageBlob.size > 0 && imageBlob.type.startsWith('image/')) {
            imageUrl = URL.createObjectURL(imageBlob);
          } else {
            console.warn(`API retornou uma resposta OK, mas não é uma imagem válida. Tipo: ${imageBlob.type}, Tamanho: ${imageBlob.size}`);
          }
        } else {
          console.warn(`A API de imagens falhou com o status: ${imageResponse.status}`);
        }
      } catch (imageError) {
        console.error("Erro ao buscar da API de imagens:", imageError);
        // Continua sem imagem em caso de erro, não quebra a aplicação
      }
    }
    
    return { 
      content: explanation, 
      imageUrl: imageUrl,
      imageCaption: imageCaption
    };

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    throw new Error("Falha ao comunicar com a IA. Verifique sua conexão ou a chave da API.");
  }
}

export async function generateLessonPlan(
  topic: string,
  grade: string,
  subject: string,
  duration: string,
  customText: string
): Promise<string> {
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
    const prompt = `Gere um Plano de Aula completo, criativo e motivador alinhado com a BNCC (Brasil):
- Tema da Aula: ${topic}
- Ano Escolar/Série: ${grade}
- Matéria/Componente Curricular: ${subject}
- Duração das Atividades: ${duration}
${customText ? `- Observações/Orientações adicionais do professor: ${customText}` : ''}

Forneça a resposta em um formato bem estruturado com divisões claras e amigáveis, usando parágrafos curtos e marcadores. Use categorias como:
1. **OBJETIVOS DE APRENDIZAGEM (BNCC)** - cite os códigos de habilidades relacionados
2. **MATERIAIS NECESSÁRIOS**
3. **METODOLOGIA PASSO A PASSO** (introdução, desenvolvimento lúdico e encerramento)
4. **ATIVIDADE PRÁTICA SUGERIDA**
5. **AVALIAÇÃO E FIXAÇÃO**`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor pedagógico especialista em Ensino Fundamental I (Brasil). Suas sugestões são sempre criativas, lúdicas, dinâmicas e baseadas em metodologias ativas alinhadas à BNCC.",
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar o plano de aula.";
  } catch (error) {
    console.error("Erro no gerador de plano de aula:", error);
    throw new Error("Erro ao gerar plano de aula com a IA. Verifique as configurações.");
  }
}

export async function generateActivityQuiz(
  topic: string,
  numQuestions: number,
  questionType: 'multiple' | 'open',
  grade: string
): Promise<string> {
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
    const prompt = `Gere uma atividade escolar divertida (quiz ou perguntas de fixação) sobre:
- Tema da Atividade: ${topic}
- Série recomendada: ${grade}
- Quantidade de Questões: ${numQuestions}
- Tipo de Questão: ${questionType === 'multiple' ? 'Múltipla Escolha (com opções A, B, C, D)' : 'Questões Dissertativas/Abertas'}

Inclua o cabeçalho lúdico "Atividade Investigativa: Detetives do Conhecimento 🕵️‍♂️" no início do texto.
Gere as questões com muito carinho para crianças.
E ao FINAL de todo o texto, inclua uma seção "GABARITO COMENTADO" com as respostas corretas e explicações pedagógicas curtas e acolhedoras para o professor. Use formatação limpa com markdown.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um produtor de avaliações lúdicas e materiais pedagógicos informais de alta aderência para crianças de 6 a 12 anos.",
        temperature: 0.6,
      }
    });

    return response.text || "Não foi possível gerar a atividade.";
  } catch (error) {
    console.error("Erro no gerador de atividade:", error);
    throw new Error("Erro ao gerar a atividade com a IA. Verifique as configurações.");
  }
}

export async function generateKidsStory(
  character: string,
  theme: string,
  moral: string
): Promise<string> {
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
    const prompt = `Crie uma história infantil lúdica e cativante para contar em sala de aula de Ensino Fundamental:
- Nome/Tipo do Personagem Principal: ${character}
- Tópico Educativo ou Científico: ${theme}
- Lição de Moral / Valor Humano ou Aprendizado principal: ${moral}

Requisitos:
1. Crie um título muito carismático e divertido.
2. Escreva uma história charmosa e fluida, com começo, meio e fim e diálogos amigáveis para leitura compartilhada.
3. No final da história, dê sugestões de 2 a 3 perguntas rápidas para o professor sugerir uma conversa em roda (debate lúdico) com os alunos.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um escritor de ficção infanto-juvenil premiado da literatura brasileira, excelente em aproximar a imaginação e a ciência.",
        temperature: 0.8,
      }
    });

    return response.text || "Não foi possível gerar a história.";
  } catch (error) {
    console.error("Erro no gerador de história:", error);
    throw new Error("Erro ao gerar a história com a IA. Verifique as configurações.");
  }
}

export async function generateMathEnigma(
  topic: string,
  grade: string
): Promise<{ numero: string; p1: string; p2: string; p3: string; n1: string; n2: string; n3: string; n4: string }> {
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
    const prompt = `Gere um enigma matemático carismático para crianças de Ensino Fundamental:
- Tema/Assunto matemático: ${topic || 'Qualquer desafio lúdico de números'}
- Série recomendada: ${grade}

O enigma consiste em 3 pistas curtas que levam a um número secreto. Além disso, forneça 4 números candidatos que aparecerão em uma matriz 2x2 (grid), onde APENAS UM deles atende perfeitamente a TODAS as pistas.

Retorne APENAS um objeto JSON válido (sem markdown extra, sem explicações adicionais) contendo EXATAMENTE estas chaves:
{
  "numero": "um número identificador de card sequencial rápido (ex: 1)",
  "p1": "Pista A: curta e lúdica",
  "p2": "Pista B: curta e lúdica",
  "p3": "Pista C: curta e lúdica e de fixação numérica",
  "n1": "número candidato 1 no grid",
  "n2": "número candidato 2 no grid",
  "n3": "número candidato 3 no grid",
  "n4": "número candidato 4 no grid"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um gerador de materiais pedagógicos especialista em matemática divertida e lúdica para o Ensino Fundamental (Brasil). Você retorna apenas objetos JSON válidos conforme solicitado.",
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);
    return {
      numero: String(data.numero || "1"),
      p1: String(data.p1 || ""),
      p2: String(data.p2 || ""),
      p3: String(data.p3 || ""),
      n1: String(data.n1 || ""),
      n2: String(data.n2 || ""),
      n3: String(data.n3 || ""),
      n4: String(data.n4 || "")
    };
  } catch (error) {
    console.error("Erro ao gerar enigma matemático:", error);
    throw new Error("Erro ao gerar enigma matemático lúdico com a IA.");
  }
}