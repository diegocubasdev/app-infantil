type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

const localStoryOpenings = [
  'Era uma vez uma turminha muito alegre que encontrou',
  'Num dia colorido, uma criança curiosa brincou com',
  'Perto de uma árvore fofinha, apareceram',
]

const localStoryEndings = [
  'Todo mundo respirou fundo, sorriu e aprendeu a dividir. Depois, fizeram uma roda de música bem calma.',
  'Eles contaram até três, deram risada e descobriram que aprender junto é mais gostoso.',
  'No final, cada amigo ganhou uma estrela de carinho e foi descansar feliz.',
]

export function generateOfflineKidStory(emojis: string[]) {
  const opening = localStoryOpenings[Math.floor(Math.random() * localStoryOpenings.length)]
  const ending = localStoryEndings[Math.floor(Math.random() * localStoryEndings.length)]
  const friends = emojis.join(' ')

  return `${opening} ${friends}. Eles foram passear devagar, olhando as cores, os sons e as formas pelo caminho.\n\n${ending}`
}

export async function generateKidStory(emojis: string[]) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || !navigator.onLine) {
    return generateOfflineKidStory(emojis)
  }

  const prompt = [
    'Crie uma historinha infantil em portugues do Brasil para uma crianca de 3 anos.',
    'Use frases curtas, tom carinhoso e final feliz.',
    'Escreva exatamente 2 paragrafos curtos.',
    `Inclua estes personagens ou ideias: ${emojis.join(' ')}`,
  ].join(' ')

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    throw new Error('Nao consegui criar a historia agora.')
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join(' ').trim()

  if (!text) {
    throw new Error('A historia veio vazia.')
  }

  return text
}
