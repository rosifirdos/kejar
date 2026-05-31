import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
  architect: `Anda adalah Senior Network Architect.
Berikan data berupa teks markdown yang menjelaskan:
1. Tabel Subnet (Network, IP Range, Broadcast, Mask).
2. Skrip konfigurasi VLAN dasar.
3. String diagram topologi jaringan menggunakan syntax Mermaid.js di dalam block code \`\`\`mermaid\n...\n\`\`\`.
Fokus pada kejelasan dan kemudahan penerapan untuk Network Engineer.`,
  security: `Anda adalah Cybersecurity Engineer.
Pengguna akan meminta skrip keamanan.
Berikan murni skrip CLI (seperti iptables atau MikroTik) di dalam block code, diikuti dengan penjelasan ringkas di bawahnya bagaimana skrip tersebut bekerja dan cara menerapkannya.`,
  doctor: `Anda adalah Sysadmin pakar troubleshooting.
Pengguna akan memberikan raw log atau pesan error.
Sortir noise log dari teks tersebut, rangkum Root Cause Analysis (RCA), dan berikan perintah mitigasi/solusi langsung yang ringkas dan jelas.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type } = body;

    const systemInstruction = SYSTEM_PROMPTS[type] || "Anda adalah asisten AI.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
