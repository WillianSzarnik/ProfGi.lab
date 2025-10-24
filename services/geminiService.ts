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