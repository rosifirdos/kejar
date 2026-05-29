import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const ai = getAIClient();
    const { prompt, type } = await req.json();
    let systemInstruction = "";
    
    switch(type) {
        case 'architect':
            systemInstruction = "Kamu adalah Network Architect senior. Diberikan kebutuhan berikut, hasilkan tabel subnetting lengkap, berikan skrip VLAN dasar, dan WAJIB buatkan representasi topologi jaringannya menggunakan sintaks blok kode Mermaid.js.";
            break;
        case 'security':
            systemInstruction = "Kamu adalah Cybersecurity Engineer. Hasilkan skrip firewall iptables/MikroTik sesuai instruksi. Berikan output murni blok kode dan penjelasan singkat di bawahnya. Jangan berikan kalimat pengantar.";
            break;
        case 'doctor':
            systemInstruction = "Kamu adalah Sysadmin pakar troubleshooting. Analisis log error berikut, temukan Root Cause-nya, dan berikan perintah spesifik (bash/CLI) untuk menyelesaikannya secara langsung.";
            break;
        default:
            systemInstruction = "You are a helpful IT network assistant.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Error communicating with AI: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
