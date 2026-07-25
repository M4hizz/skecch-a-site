import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

const SYSTEM_INSTRUCTION = `You are an elite frontend engineer. Convert this hand-drawn wireframe sketch into a production-ready, fully responsive HTML web application using Tailwind CSS.
Requirements:
1. Include working JavaScript interactivity for all buttons, inputs, tabs, or forms depicted.
2. Use modern styling via standard Tailwind CDN (<script src='https://cdn.tailwindcss.com'></script>).
3. Output ONLY valid HTML inside a single raw code block without markdown tags. Do not wrap it in \`\`\`html. Just return the raw HTML string starting with <!DOCTYPE html>.
4. ANIMATION HIGHLIGHTS: The sketch may contain semi-transparent colored overlay strokes/highlights drawn over specific components. These highlights are user-applied animation markers. For every UI element that appears to have a semi-transparent highlight overlay drawn on top of it:
   - Add smooth CSS entrance animations (fade-in, slide-up, scale-in) using @keyframes or Tailwind animation classes.
   - Add engaging hover effects such as scale transforms, glow box-shadows, or color transitions.
   - Add subtle pulse or bounce animations where appropriate (e.g., badges, buttons, cards).
   - Use CSS transitions with 'transition: all 0.3s ease' for interactive elements.
   The highlighted areas should feel alive and dynamic in the final app.
5. Even for non-highlighted components, use modern micro-animations: smooth hover transitions, subtle shadows, and responsive feel.`;

export async function POST(req: Request) {
  try {
    const { image, textPrompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const promptText = textPrompt
      ? `Additional instructions: ${textPrompt}`
      : "Convert this sketch into a working app.";

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_INSTRUCTION },
            { text: promptText },
            { inlineData: { data: base64Data, mimeType: 'image/png' } }
          ],
        }
      ]
    });

    let html = response.text || '';
    html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error generating app:', error);
    return NextResponse.json({ error: 'Failed to generate app' }, { status: 500 });
  }
}
