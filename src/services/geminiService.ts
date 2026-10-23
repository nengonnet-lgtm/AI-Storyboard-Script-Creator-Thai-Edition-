import { GoogleGenAI, Type } from "@google/genai";
import { AppState, ScenePrompt, CaptionOption } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateInitialContent(storySynopsis: string, images: string[]) {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: `คุณคือผู้เชี่ยวชาญด้าน Personal Brand และ Storytelling
          วิเคราะห์ข้อมูลจากหัวข้อ: "${storySynopsis}" 
          และรูปภาพที่อัปโหลด (ถ้ามี)
          สร้างหัวข้อคอนเทนต์ที่น่าสนใจ 7 รายการ สำหรับวิดีโอสั้น (TikTok/Reels)
          เน้นความต่อเนื่องของตัวละคร (Face-Lock) และเสียง (Voice DNA)
          ตอบกลับเป็น JSON array ของ string เท่านั้น` }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]") as string[];
}

export async function generateFullPrompts(state: AppState) {
  const {
    selectedContent,
    location,
    customLocation,
    languageStyle,
    storytellingStyle,
    cta,
    artStyle,
    storyboardType,
    customStoryboardFrames,
    images
  } = state;

  const frameCount = storyboardType === 'custom' ? customStoryboardFrames : storyboardType;
  const finalLocation = location === 'พิมพ์ระบุเอง' ? customLocation : location;

  const prompt = `คุณคือ Professional Storyboard Director และ AI Video Director
  ภารกิจ: สร้าง Storyboard และ Script สำหรับวิดีโอสั้น
  
  รายละเอียด:
  - หัวข้อ: ${selectedContent}
  - สถานที่: ${finalLocation}
  - รูปแบบภาษา: ${languageStyle}
  - รูปแบบการเล่าเรื่อง: ${storytellingStyle}
  - CTA: ${cta}
  - สไตล์ภาพ: ${artStyle}
  - จำนวนฉาก: ${frameCount} ฉาก
  
  กฎเหล็ก (Hard Rules):
  - Face-Lock Consistency [VISUAL DNA] 100%
  - Voice Profile [Voice DNA] 100%
  - บทพูดภาษาไทย ไม่เกิน 20 คำต่อฉาก
  - ห้ามใช้คำต้องห้าม (ดีที่สุด, อันดับ 1, เห็นผลทันที, ขาวไว, ลดน้ำหนัก, รวย, ราคาถูก)
  - ตรวจสอบความปลอดภัยตามกฎชุมชน TikTok 2026
  
  รูปแบบการตอบกลับ: JSON object ที่มีโครงสร้างดังนี้:
  {
    "scenes": [
      {
        "sceneNumber": number,
        "imagePrompt": "English prompt for image generation starting with [VISUAL DNA]",
        "videoPrompt": "English prompt for video generation starting with [VISUAL DNA] and including Voice DNA",
        "dialogue": "บทพูดภาษาไทยพร้อม Tone markers เช่น [laugh]"
      }
    ],
    "captions": [
      { "type": "Views Focus", "content": "..." },
      { "type": "Sales Focus", "content": "..." },
      { "type": "Storytelling", "content": "..." }
    ]
  }`;

  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          ...images.map(img => ({
            inlineData: {
              mimeType: "image/jpeg",
              data: img.split(',')[1]
            }
          }))
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                imagePrompt: { type: Type.STRING },
                videoPrompt: { type: Type.STRING },
                dialogue: { type: Type.STRING }
              }
            }
          },
          captions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
}
