import { GoogleGenAI } from '@google/genai';
import { Format, Framework, Persona, Producer } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are Ghostwriter, a Suno AI song engineering expert. Generate complete Suno-ready songs.
The output must include the following sections clearly labelled:
PROJECT TITLE: (The name of the Album, EP, Mixtape, or Single)
TITLE: (The name of this specific track)
STYLE TAG: (The Suno style tag)
LYRICS: (The lyrics of the song)

STYLE TAG RULES:
Order is non-negotiable: vocals first, cadence second, production last
Format: [STYLE: {vocal block}, {cadence}, {producer tags}, clean studio mix, high fidelity, crisp vocals, polished production, no background noise, no vinyl crackle, wide stereo, {tempo and instrumentation}]
No character limit on the style tag
Make it as specific and detailed as possible

LYRICS RULES:
Every section uses bracket format: [SECTION NAME — emotion, delivery style, energy level, optional production cue]
Songs must feel human — dynamics, contrast, emotional progression
Hook must be memorable, simple, and chantable in one listen
Emotion must hit in the first 5 seconds
Include at least one surprise — flow switch, beat drop, or melody flip
Lyrics must stay under 5000 characters
Dray uses Usher vocal DNA only — no other R&B references
Return ONLY the requested sections. No explanation before or after. No markdown fences.

SONG LAWS — apply to every track:
Hook that won't let go — melody first, chant potential, one listen memory
Simple hits harder than smart — clear message, no mental gymnastics
Emotion in the first 5 seconds — if they have to wait they already left
A moment people can live in — scene, feeling, specific world
Rhythm the body decides — the bounce is non-negotiable
One surprise — flow switch, melody flip, beat drop, something unexpected
Identity — sounds like nothing else in the room
Repeat value — gets better on the third listen`;

export async function generateTrack(
  format: Format,
  persona: Persona,
  producer: Producer,
  framework: Framework,
  concept: string,
  trackNumber: number,
  totalTracks: number,
  refinement?: string,
  projectTitle?: string
): Promise<{ title: string; projectTitle: string; styleTag: string; lyrics: string }> {
  let positionInstruction = '';
  if (totalTracks > 1) {
    if (trackNumber === 1) {
      positionInstruction = 'This is the opening track. Set the emotional tone for the whole project. Generate a fitting PROJECT TITLE.';
    } else if (trackNumber === totalTracks) {
      positionInstruction = `This is the closing track of the project "${projectTitle}". Bring the project to a powerful and memorable end. Use the same PROJECT TITLE.`;
    } else {
      positionInstruction = `Continue and deepen the world of the project "${projectTitle}". Track ${trackNumber} of ${totalTracks}. Use the same PROJECT TITLE.`;
    }
  } else {
    positionInstruction = 'This is a standalone track. Generate a fitting PROJECT TITLE and TITLE.';
  }

  let prompt = `
Format: ${format}
Persona Vocal Block: ${persona.vocalBlock}
Producer Tags: ${producer.tags}
Framework Cadence: ${framework.cadence}
Concept: ${concept}
${positionInstruction}
`;

  if (refinement) {
    prompt += `\nRefinement Instructions: ${refinement}`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  const text = response.text || '';
  
  // Parse the output to extract sections
  let generatedProjectTitle = projectTitle || '';
  let title = `Track ${trackNumber}`;
  let styleTag = '';
  let lyrics = '';

  const projectTitleMatch = text.match(/PROJECT TITLE:?\s*([^\n]+)/i);
  const titleMatch = text.match(/TITLE:?\s*([^\n]+)/i);
  const styleMatch = text.match(/STYLE TAG:?\s*([\s\S]*?)(?=LYRICS:?|$)/i);
  const lyricsMatch = text.match(/LYRICS:?\s*([\s\S]*)$/i);

  if (projectTitleMatch && projectTitleMatch[1]) {
    generatedProjectTitle = projectTitleMatch[1].trim();
  }
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }
  if (styleMatch && styleMatch[1]) {
    styleTag = styleMatch[1].trim();
  }
  if (lyricsMatch && lyricsMatch[1]) {
    lyrics = lyricsMatch[1].trim();
  }

  if (!styleTag && !lyrics) {
    // Fallback if the model didn't use the exact labels
    lyrics = text;
  }

  return { title, projectTitle: generatedProjectTitle, styleTag, lyrics };
}
