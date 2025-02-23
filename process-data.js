import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import GPT3Tokenizer from 'gpt3-tokenizer';
import fs from 'fs';

const pinecone = new Pinecone({
  apiKey: "",
});
const openai = new OpenAI({
  apiKey: ""
});

const tokenizer = new GPT3Tokenizer.default({ type: 'gpt3' });

const MAX_TOKENS = 3000;
const INDEX_NAME = 'gfgtesting';
const EMBEDDING_MODEL = 'text-embedding-ada-002';

async function processData() {
  try {
    const rawData = fs.readFileSync('results5.json');
    const entries = JSON.parse(rawData);

    const index = pinecone.index(INDEX_NAME);

    for (const entry of entries) {
      const { id, url, data } = entry;
      const markdown = data.markdown;
      const metadata = data.metadata;

      const chunks = chunkContent(markdown);

      const vectors = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        const embedding = await generateEmbedding(chunk);
        
        vectors.push({
          id: `${id}-${i}`,
          values: embedding,
          metadata: {
            text: chunk,
            url: url,
            title: metadata.title,
            chunkId: i,
            parentId: id.toString(),
            keywords: metadata.keywords
          }
        });
      }


      if (vectors.length > 0) {
        await index.upsert(vectors);
        console.log(`Upserted ${vectors.length} chunks for entry ${id}`);
      }
    }

    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

function chunkContent(text) {
  const chunks = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = [];
  let currentTokenCount = 0;

  for (const paragraph of paragraphs) {
    const encoded = tokenizer.encode(paragraph);
    const paragraphTokens = encoded.bpe.length;

    if (currentTokenCount + paragraphTokens > MAX_TOKENS) {
      chunks.push(currentChunk.join('\n\n'));
      currentChunk = [paragraph];
      currentTokenCount = paragraphTokens;
    } else {
      currentChunk.push(paragraph);
      currentTokenCount += paragraphTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks;
}

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Start processing
processData();