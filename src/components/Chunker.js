export function estimateTokens(text) {
    return text.split(/\s+/).filter(Boolean).length;
  }
  
  
  export function splitTextPreservingStructure(text, maxTokens) {
    const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    const chunks = [];
    let currentChunk = "";
    let currentTokenCount = 0;
  
    paragraphs.forEach(paragraph => {
      const paragraphTokenCount = estimateTokens(paragraph);
  
      if (paragraphTokenCount > maxTokens) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = "";
          currentTokenCount = 0;
        }
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        let sentenceChunk = "";
        let sentenceTokenCount = 0;
        sentences.forEach(sentence => {
          const sentenceTokens = estimateTokens(sentence);
          if (sentenceTokenCount + sentenceTokens > maxTokens) {
            if (sentenceChunk.trim()) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
            sentenceTokenCount = sentenceTokens;
          } else {
            sentenceChunk += " " + sentence;
            sentenceTokenCount += sentenceTokens;
          }
        });
        if (sentenceChunk.trim()) {
          chunks.push(sentenceChunk.trim());
        }
      } else {
        if (currentTokenCount + paragraphTokenCount > maxTokens) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = paragraph;
          currentTokenCount = paragraphTokenCount;
        } else {
          currentChunk += (currentChunk ? "\n" : "") + paragraph;
          currentTokenCount += paragraphTokenCount;
        }
      }
    });
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    return chunks;
  }
  